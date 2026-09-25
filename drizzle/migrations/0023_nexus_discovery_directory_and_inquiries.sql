-- 1. Close direct signed-out reads of partner listing rows. Directory data is served only through an authenticated projection.
DROP POLICY IF EXISTS "Public can read published partner profiles" ON public.partner_profiles;
DROP POLICY IF EXISTS "Public reads publicly listed types" ON public.partner_listing_types;
REVOKE SELECT ON public.partner_profiles FROM anon;
REVOKE SELECT ON public.partner_listing_types FROM anon;

CREATE OR REPLACE FUNCTION public.nexus_member_directory()
RETURNS TABLE (profile_id uuid, display_name text, organization_name text, city text, state_region text, service_areas text[], professional_summary text, category_ids text[], category_labels text[])
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Sign in required' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
  SELECT p.id, p.display_name, p.organization_name, p.city, p.state_region, p.service_areas, p.professional_summary,
    array_agg(t.id ORDER BY t.display_order), array_agg(t.label ORDER BY t.display_order)
  FROM public.partner_profiles p
  JOIN public.partner_listing_types lt ON lt.user_id = p.user_id
  JOIN public.service_partner_types t ON t.id = lt.partner_type_id
  WHERE public.profile_is_public(p.user_id)
    AND public.listing_type_is_public(p.user_id, lt.partner_type_id)
    AND t.is_active AND t.is_open_for_registration
  GROUP BY p.id;
END $$;
REVOKE ALL ON FUNCTION public.nexus_member_directory() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.nexus_member_directory() TO authenticated, service_role;

-- 2. Nexus public inquiries: separate from founder intake, discovery calls and company records.
CREATE TABLE public.nexus_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 5 AND 255),
  phone text CHECK (phone IS NULL OR char_length(phone) BETWEEN 6 AND 40),
  category_id text NOT NULL REFERENCES public.service_partner_types(id),
  location text CHECK (location IS NULL OR char_length(location) <= 160),
  description text NOT NULL CHECK (char_length(description) BETWEEN 20 AND 1000),
  disclosure_version text NOT NULL,
  acknowledged_at timestamptz NOT NULL,
  contact_consent_at timestamptz NOT NULL,
  source text NOT NULL DEFAULT 'nexus_help_form',
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received','under_review','consent_requested','introduced','closed')),
  triage_role text NOT NULL DEFAULT 'operations_lead' CHECK (triage_role = 'operations_lead'),
  is_test boolean NOT NULL DEFAULT false,
  email_hash text NOT NULL,
  client_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.nexus_inquiries TO authenticated;
GRANT ALL ON public.nexus_inquiries TO service_role;
ALTER TABLE public.nexus_inquiries ENABLE ROW LEVEL SECURITY;
CREATE INDEX nexus_inquiries_email_rate_idx ON public.nexus_inquiries(email_hash, created_at DESC);
CREATE INDEX nexus_inquiries_client_rate_idx ON public.nexus_inquiries(client_hash, created_at DESC);
COMMENT ON TABLE public.nexus_inquiries IS 'Public Nexus help requests. No attachments. Never disclosed to partners; introduction disclosure is disabled until recipient-specific consent, retention rules and reviewed wording are approved.';

CREATE TABLE public.nexus_inquiry_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid NOT NULL REFERENCES public.nexus_inquiries(id) ON DELETE CASCADE,
  assignee_id uuid NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('triage','review_task')),
  assigned_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  revoked_by uuid
);
CREATE UNIQUE INDEX nexus_inquiry_assignment_active_idx ON public.nexus_inquiry_assignments(inquiry_id, assignee_id, purpose) WHERE revoked_at IS NULL;
GRANT SELECT ON public.nexus_inquiry_assignments TO authenticated;
GRANT ALL ON public.nexus_inquiry_assignments TO service_role;
ALTER TABLE public.nexus_inquiry_assignments ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_view_nexus_inquiry(_user uuid, _inquiry uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user, 'admin')
    OR EXISTS (
      SELECT 1 FROM public.nexus_inquiry_assignments a
      WHERE a.inquiry_id = _inquiry AND a.assignee_id = _user AND a.revoked_at IS NULL
        AND ((a.purpose = 'triage' AND public.has_role(_user, 'operations_lead'))
          OR (a.purpose = 'review_task' AND public.has_role(_user, 'compliance_coordinator')))
    )
$$;
GRANT EXECUTE ON FUNCTION public.can_view_nexus_inquiry(uuid, uuid) TO authenticated, service_role;

CREATE POLICY "Admin or assigned staff read inquiries" ON public.nexus_inquiries FOR SELECT TO authenticated
  USING (public.can_view_nexus_inquiry(auth.uid(), id));
CREATE POLICY "Admin or assignee read assignments" ON public.nexus_inquiry_assignments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR assignee_id = auth.uid());

-- Submission: only the server (service role) may call it, after validation, so rate limits cannot be bypassed.
CREATE OR REPLACE FUNCTION public.submit_nexus_inquiry(_full_name text, _email text, _phone text, _category text, _location text, _description text, _disclosure_version text, _client_hash text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid; v_hash text := encode(sha256(convert_to(lower(trim(_email)), 'UTF8')), 'hex');
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.service_partner_types WHERE id = _category AND is_active AND is_open_for_registration) THEN
    RAISE EXCEPTION 'category_unavailable' USING ERRCODE = 'check_violation';
  END IF;
  IF (SELECT count(*) FROM public.nexus_inquiries WHERE email_hash = v_hash AND created_at > now() - interval '1 hour') >= 3
     OR (_client_hash IS NOT NULL AND (SELECT count(*) FROM public.nexus_inquiries WHERE client_hash = _client_hash AND created_at > now() - interval '1 hour') >= 5) THEN
    RAISE EXCEPTION 'rate_limited' USING ERRCODE = 'check_violation';
  END IF;
  INSERT INTO public.nexus_inquiries (full_name, email, phone, category_id, location, description, disclosure_version, acknowledged_at, contact_consent_at, is_test, email_hash, client_hash)
  VALUES (trim(_full_name), lower(trim(_email)), nullif(trim(_phone), ''), _category, nullif(trim(_location), ''), trim(_description), _disclosure_version, now(), now(), lower(trim(_email)) LIKE '%@example.test', v_hash, _client_hash)
  RETURNING id INTO v_id;
  INSERT INTO public.audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary, metadata)
  VALUES (NULL, '00000000-0000-0000-0000-000000000000', 'nexus_inquiry.received', 'nexus_inquiry', v_id::text, 'Nexus inquiry received for review.', jsonb_build_object('category', _category, 'triage_role', 'operations_lead'));
  RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION public.submit_nexus_inquiry(text,text,text,text,text,text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_nexus_inquiry(text,text,text,text,text,text,text,text) TO service_role;

-- Assignment: Admin/CEO assigns triage to an Operations Lead or a review task to a Compliance Coordinator.
-- An assigned Operations Lead may request a Compliance review task on that inquiry.
CREATE OR REPLACE FUNCTION public.assign_nexus_inquiry(_inquiry uuid, _assignee_email text, _purpose text, _enabled boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor uuid := auth.uid(); v_assignee uuid; v_allowed boolean;
BEGIN
  IF v_actor IS NULL THEN RAISE EXCEPTION 'Sign in required' USING ERRCODE = '42501'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.nexus_inquiries WHERE id = _inquiry) THEN RAISE EXCEPTION 'Inquiry not found'; END IF;
  v_allowed := public.has_role(v_actor, 'admin')
    OR (_purpose = 'review_task' AND EXISTS (SELECT 1 FROM public.nexus_inquiry_assignments a WHERE a.inquiry_id = _inquiry AND a.assignee_id = v_actor AND a.purpose = 'triage' AND a.revoked_at IS NULL) AND public.has_role(v_actor, 'operations_lead'));
  IF NOT v_allowed THEN
    INSERT INTO public.audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary, metadata)
    VALUES (NULL, v_actor, 'nexus_inquiry.assignment_denied', 'nexus_inquiry', _inquiry::text, 'Inquiry assignment refused.', jsonb_build_object('purpose', _purpose));
    RETURN;
  END IF;
  SELECT id INTO v_assignee FROM public.profiles WHERE lower(email) = lower(trim(_assignee_email));
  IF v_assignee IS NULL THEN RAISE EXCEPTION 'No account matches that email.'; END IF;
  IF _purpose = 'triage' AND NOT public.has_role(v_assignee, 'operations_lead') THEN RAISE EXCEPTION 'Triage can only be assigned to an Operations Lead.'; END IF;
  IF _purpose = 'review_task' AND NOT public.has_role(v_assignee, 'compliance_coordinator') THEN RAISE EXCEPTION 'Review tasks can only be assigned to a Compliance Coordinator.'; END IF;
  IF _enabled THEN
    INSERT INTO public.nexus_inquiry_assignments (inquiry_id, assignee_id, purpose, assigned_by)
    VALUES (_inquiry, v_assignee, _purpose, v_actor) ON CONFLICT DO NOTHING;
  ELSE
    UPDATE public.nexus_inquiry_assignments SET revoked_at = now(), revoked_by = v_actor
    WHERE inquiry_id = _inquiry AND assignee_id = v_assignee AND purpose = _purpose AND revoked_at IS NULL;
  END IF;
  INSERT INTO public.audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary, metadata)
  VALUES (NULL, v_actor, CASE WHEN _enabled THEN 'nexus_inquiry.assigned' ELSE 'nexus_inquiry.unassigned' END, 'nexus_inquiry', _inquiry::text,
    CASE WHEN _enabled THEN 'Inquiry assigned.' ELSE 'Inquiry assignment removed.' END, jsonb_build_object('purpose', _purpose, 'assignee', v_assignee));
END $$;
REVOKE ALL ON FUNCTION public.assign_nexus_inquiry(uuid,text,text,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.assign_nexus_inquiry(uuid,text,text,boolean) TO authenticated;

-- Opening one inquiry records the access decision without copying inquiry text into audit history.
CREATE OR REPLACE FUNCTION public.open_nexus_inquiry(_inquiry uuid)
RETURNS SETOF public.nexus_inquiries LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor uuid := auth.uid(); v_ok boolean;
BEGIN
  IF v_actor IS NULL THEN RAISE EXCEPTION 'Sign in required' USING ERRCODE = '42501'; END IF;
  v_ok := public.can_view_nexus_inquiry(v_actor, _inquiry);
  INSERT INTO public.audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary)
  VALUES (NULL, v_actor, CASE WHEN v_ok THEN 'nexus_inquiry.opened' ELSE 'nexus_inquiry.access_denied' END, 'nexus_inquiry', _inquiry::text,
    CASE WHEN v_ok THEN 'Inquiry opened.' ELSE 'Inquiry access refused.' END);
  IF v_ok THEN RETURN QUERY SELECT * FROM public.nexus_inquiries WHERE id = _inquiry; END IF;
END $$;
REVOKE ALL ON FUNCTION public.open_nexus_inquiry(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.open_nexus_inquiry(uuid) TO authenticated;

-- Status changes. Disclosure statuses stay disabled until the consent flow is approved.
CREATE OR REPLACE FUNCTION public.set_nexus_inquiry_status(_inquiry uuid, _status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor uuid := auth.uid();
BEGIN
  IF _status NOT IN ('under_review','closed') THEN
    RAISE EXCEPTION 'Introduction disclosure is disabled.' USING ERRCODE = 'check_violation';
  END IF;
  IF NOT (public.has_role(v_actor, 'admin') OR EXISTS (SELECT 1 FROM public.nexus_inquiry_assignments a WHERE a.inquiry_id = _inquiry AND a.assignee_id = v_actor AND a.purpose = 'triage' AND a.revoked_at IS NULL AND public.has_role(v_actor, 'operations_lead'))) THEN
    INSERT INTO public.audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary)
    VALUES (NULL, coalesce(v_actor, '00000000-0000-0000-0000-000000000000'), 'nexus_inquiry.status_denied', 'nexus_inquiry', _inquiry::text, 'Inquiry status change refused.');
    RETURN;
  END IF;
  UPDATE public.nexus_inquiries SET status = _status, updated_at = now() WHERE id = _inquiry;
  INSERT INTO public.audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary, metadata)
  VALUES (NULL, v_actor, 'nexus_inquiry.status_changed', 'nexus_inquiry', _inquiry::text, 'Inquiry status updated.', jsonb_build_object('status', _status));
END $$;
REVOKE ALL ON FUNCTION public.set_nexus_inquiry_status(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_nexus_inquiry_status(uuid,text) TO authenticated;