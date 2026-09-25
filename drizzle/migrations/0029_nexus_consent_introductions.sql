
CREATE TABLE public.nexus_consent_versions (
  version text PRIMARY KEY,
  consent_template text NOT NULL,
  category_lines jsonb NOT NULL,
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.nexus_consent_versions TO authenticated, anon;
GRANT ALL ON public.nexus_consent_versions TO service_role;
ALTER TABLE public.nexus_consent_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Consent wording is readable" ON public.nexus_consent_versions FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.nexus_consent_versions (version, consent_template, category_lines, is_current) VALUES (
 'nexus-intro-consent-2026-09-25-v1',
 'I authorize Opsirix to share only the items I selected with {partner}, for this introduction only. Opsirix staff will review the final details before anything is sent. I can withdraw this authorization until the introduction has been sent. After that, {partner} already has the items I chose to share. This is not an endorsement or a promise of a response, eligibility, quote, coverage, admission or outcome. Opsirix does not give legal, tax, banking, insurance or immigration advice. {category_line}',
 jsonb_build_object(
   'university','Opsirix cannot speak for the university on admissions, enrollment or eligibility.',
   'banking','The bank alone decides account approval and eligibility.',
   'insurance','The broker is licensed state by state. Opsirix does not provide quotes or coverage advice.',
   'attorney','The attorney decides whether to take on your matter under their own engagement terms. Opsirix does not provide legal advice.',
   'cpa','The firm decides whether to take on the work under its own engagement terms. Opsirix does not provide tax or accounting advice.',
   'it_services','The firm decides scope, price and whether to take on the work under its own terms.'),
 true);

CREATE TABLE public.nexus_introductions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid NOT NULL REFERENCES public.nexus_inquiries(id),
  partner_profile_id uuid NOT NULL REFERENCES public.partner_profiles(id),
  partner_user_id uuid NOT NULL,
  partner_name text NOT NULL,
  category_id text NOT NULL,
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','authorized','declined','withdrawn','cancelled','sent','reconsent_required')),
  proposed_by uuid NOT NULL,
  proposed_at timestamptz NOT NULL DEFAULT now(),
  consent_version text REFERENCES public.nexus_consent_versions(version),
  consent_text text,
  selected_fields text[] NOT NULL DEFAULT '{}',
  consent_payload jsonb,
  consent_payload_hash text,
  authorized_at timestamptz,
  decided_at timestamptz,
  sent_by uuid,
  sent_at timestamptz,
  sent_payload jsonb,
  send_attempts integer NOT NULL DEFAULT 0,
  last_send_error text,
  partner_notice_status text,
  partner_notice_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX nexus_intro_one_active ON public.nexus_introductions (inquiry_id, partner_profile_id) WHERE status IN ('proposed','authorized','reconsent_required');
GRANT SELECT ON public.nexus_introductions TO authenticated;
GRANT ALL ON public.nexus_introductions TO service_role;
ALTER TABLE public.nexus_introductions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.nexus_introduction_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  introduction_id uuid NOT NULL REFERENCES public.nexus_introductions(id),
  event text NOT NULL,
  actor_id uuid,
  detail jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.nexus_introduction_events TO authenticated;
GRANT ALL ON public.nexus_introduction_events TO service_role;
ALTER TABLE public.nexus_introduction_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.nexus_can_manage_inquiry(_user uuid, _inquiry uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user,'admin') OR EXISTS (
    SELECT 1 FROM public.nexus_inquiry_assignments a
    WHERE a.inquiry_id=_inquiry AND a.assignee_id=_user AND a.revoked_at IS NULL AND a.purpose='triage'
      AND public.has_role(_user,'operations_lead'))
$$;

CREATE OR REPLACE FUNCTION public.nexus_is_test_email(_email text)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT lower(coalesce(_email,'')) LIKE '%@example.test' OR lower(coalesce(_email,'')) LIKE 'opsirix+test-%@gmail.com'
$$;

CREATE OR REPLACE FUNCTION public.nexus_partner_eligible(_profile uuid, _category text, _is_test boolean)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.partner_profiles p
    JOIN auth.users u ON u.id = p.user_id
    WHERE p.id=_profile AND p.profile_review_status='approved' AND NOT p.is_suspended
      AND public.partner_type_is_open(_category)
      AND EXISTS (SELECT 1 FROM public.partner_listing_types lt WHERE lt.user_id=p.user_id AND lt.partner_type_id=_category AND lt.review_status='approved')
      AND CASE WHEN _is_test THEN public.nexus_is_test_email(u.email)
               ELSE NOT public.nexus_is_test_email(u.email) AND public.profile_is_public(p.user_id) END)
$$;

CREATE OR REPLACE FUNCTION public.nexus_founder_email()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT lower(email) FROM auth.users WHERE id = auth.uid() AND email_confirmed_at IS NOT NULL
$$;

CREATE OR REPLACE FUNCTION public.nexus_build_payload(_inquiry uuid, _partner_name text, _fields text[])
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE q public.nexus_inquiries; f jsonb := '{}';
BEGIN
  SELECT * INTO q FROM public.nexus_inquiries WHERE id=_inquiry;
  IF 'name' = ANY(_fields) THEN f := f || jsonb_build_object('name', q.full_name); END IF;
  IF 'email' = ANY(_fields) THEN f := f || jsonb_build_object('email', q.email); END IF;
  IF 'phone' = ANY(_fields) AND q.phone IS NOT NULL THEN f := f || jsonb_build_object('phone', q.phone); END IF;
  IF 'location' = ANY(_fields) AND nullif(q.location,'') IS NOT NULL THEN f := f || jsonb_build_object('location', q.location); END IF;
  IF 'description' = ANY(_fields) THEN f := f || jsonb_build_object('description', q.description); END IF;
  RETURN jsonb_build_object('partner', _partner_name, 'category', q.category_id, 'fields', f);
END $$;

CREATE OR REPLACE FUNCTION public.nexus_intro_event(_intro uuid, _event text, _detail jsonb DEFAULT '{}')
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.nexus_introduction_events (introduction_id, event, actor_id, detail) VALUES (_intro, _event, auth.uid(), _detail);
  INSERT INTO public.audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary, metadata)
  VALUES (NULL, coalesce(auth.uid(),'00000000-0000-0000-0000-000000000000'), 'nexus_introduction.'||_event, 'nexus_introduction', _intro::text, 'Nexus introduction '||replace(_event,'_',' ')||'.', _detail);
$$;

CREATE OR REPLACE FUNCTION public.nexus_intro_candidates(_inquiry uuid)
RETURNS TABLE(profile_id uuid, organization_name text) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE q public.nexus_inquiries;
BEGIN
  IF NOT public.nexus_can_manage_inquiry(auth.uid(), _inquiry) THEN RETURN; END IF;
  SELECT * INTO q FROM public.nexus_inquiries WHERE id=_inquiry;
  RETURN QUERY SELECT p.id, p.organization_name FROM public.partner_profiles p
    WHERE public.nexus_partner_eligible(p.id, q.category_id, q.is_test) ORDER BY p.organization_name;
END $$;

CREATE OR REPLACE FUNCTION public.propose_nexus_introduction(_inquiry uuid, _profile uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE q public.nexus_inquiries; p public.partner_profiles; v_id uuid;
BEGIN
  IF NOT public.nexus_can_manage_inquiry(auth.uid(), _inquiry) THEN RAISE EXCEPTION 'not_permitted'; END IF;
  SELECT * INTO q FROM public.nexus_inquiries WHERE id=_inquiry FOR UPDATE;
  IF q.status = 'closed' THEN RAISE EXCEPTION 'inquiry_closed'; END IF;
  IF NOT public.nexus_partner_eligible(_profile, q.category_id, q.is_test) THEN RAISE EXCEPTION 'partner_not_eligible'; END IF;
  SELECT * INTO p FROM public.partner_profiles WHERE id=_profile;
  INSERT INTO public.nexus_introductions (inquiry_id, partner_profile_id, partner_user_id, partner_name, category_id, proposed_by)
  VALUES (_inquiry, _profile, p.user_id, p.organization_name, q.category_id, auth.uid()) RETURNING id INTO v_id;
  UPDATE public.nexus_inquiries SET status='consent_requested', updated_at=now() WHERE id=_inquiry AND status<>'introduced';
  PERFORM public.nexus_intro_event(v_id, 'proposed', jsonb_build_object('partner_profile_id', _profile));
  RETURN v_id;
EXCEPTION WHEN unique_violation THEN RAISE EXCEPTION 'already_proposed';
END $$;

CREATE OR REPLACE FUNCTION public.staff_nexus_introductions(_inquiry uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.can_view_nexus_inquiry(auth.uid(), _inquiry) THEN RETURN '[]'::jsonb; END IF;
  RETURN coalesce((SELECT jsonb_agg(jsonb_build_object(
    'id', i.id, 'partner_name', i.partner_name, 'status', i.status, 'proposed_at', i.proposed_at,
    'selected_fields', i.selected_fields, 'consent_version', i.consent_version, 'authorized_at', i.authorized_at,
    'sent_at', i.sent_at, 'send_attempts', i.send_attempts, 'last_send_error', i.last_send_error,
    'partner_notice_status', i.partner_notice_status,
    'events', (SELECT jsonb_agg(jsonb_build_object('event', e.event, 'at', e.created_at) ORDER BY e.created_at) FROM public.nexus_introduction_events e WHERE e.introduction_id=i.id)
  ) ORDER BY i.created_at DESC) FROM public.nexus_introductions i WHERE i.inquiry_id=_inquiry), '[]'::jsonb);
END $$;

CREATE OR REPLACE FUNCTION public.preview_nexus_send(_intro uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE i public.nexus_introductions; q public.nexus_inquiries; cur_name text; fresh jsonb;
BEGIN
  SELECT * INTO i FROM public.nexus_introductions WHERE id=_intro;
  IF i.id IS NULL OR NOT public.nexus_can_manage_inquiry(auth.uid(), i.inquiry_id) THEN RAISE EXCEPTION 'not_permitted'; END IF;
  SELECT * INTO q FROM public.nexus_inquiries WHERE id=i.inquiry_id;
  SELECT organization_name INTO cur_name FROM public.partner_profiles WHERE id=i.partner_profile_id;
  fresh := CASE WHEN i.consent_payload IS NULL THEN NULL ELSE public.nexus_build_payload(i.inquiry_id, cur_name, i.selected_fields) END;
  RETURN jsonb_build_object('status', i.status, 'partner_name', i.partner_name, 'payload', i.consent_payload, 'hash', i.consent_payload_hash,
    'unchanged', fresh IS NOT NULL AND fresh = i.consent_payload,
    'eligible', public.nexus_partner_eligible(i.partner_profile_id, i.category_id, q.is_test));
END $$;

CREATE OR REPLACE FUNCTION public.send_nexus_introduction(_intro uuid, _hash text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE i public.nexus_introductions; q public.nexus_inquiries; cur_name text; fresh jsonb;
BEGIN
  SELECT * INTO i FROM public.nexus_introductions WHERE id=_intro FOR UPDATE;
  IF i.id IS NULL OR NOT public.nexus_can_manage_inquiry(auth.uid(), i.inquiry_id) THEN RAISE EXCEPTION 'not_permitted'; END IF;
  IF i.status = 'sent' THEN RETURN jsonb_build_object('result','already_sent','sent_at',i.sent_at); END IF;
  IF i.status <> 'authorized' THEN RETURN jsonb_build_object('result','not_authorized','status',i.status); END IF;
  SELECT * INTO q FROM public.nexus_inquiries WHERE id=i.inquiry_id;
  SELECT organization_name INTO cur_name FROM public.partner_profiles WHERE id=i.partner_profile_id;
  fresh := public.nexus_build_payload(i.inquiry_id, cur_name, i.selected_fields);
  IF fresh IS DISTINCT FROM i.consent_payload THEN
    UPDATE public.nexus_introductions SET status='reconsent_required', updated_at=now() WHERE id=_intro;
    PERFORM public.nexus_intro_event(_intro, 'reconsent_required', '{}'::jsonb);
    RETURN jsonb_build_object('result','reconsent_required');
  END IF;
  IF _hash IS DISTINCT FROM i.consent_payload_hash THEN
    RETURN jsonb_build_object('result','payload_mismatch');
  END IF;
  IF NOT public.nexus_partner_eligible(i.partner_profile_id, i.category_id, q.is_test) THEN
    UPDATE public.nexus_introductions SET send_attempts=send_attempts+1, last_send_error='Partner is no longer eligible.', updated_at=now() WHERE id=_intro;
    PERFORM public.nexus_intro_event(_intro, 'send_failed', jsonb_build_object('reason','partner_not_eligible'));
    RETURN jsonb_build_object('result','failed','error','Partner is no longer eligible.');
  END IF;
  UPDATE public.nexus_introductions SET status='sent', sent_by=auth.uid(), sent_at=now(), sent_payload=i.consent_payload,
    send_attempts=send_attempts+1, last_send_error=NULL, updated_at=now() WHERE id=_intro;
  UPDATE public.nexus_inquiries SET status='introduced', updated_at=now() WHERE id=i.inquiry_id;
  PERFORM public.nexus_intro_event(_intro, 'sent', jsonb_build_object('fields', i.selected_fields));
  RETURN jsonb_build_object('result','sent','partner_user_id', i.partner_user_id);
END $$;

CREATE OR REPLACE FUNCTION public.cancel_nexus_introduction(_intro uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE i public.nexus_introductions;
BEGIN
  SELECT * INTO i FROM public.nexus_introductions WHERE id=_intro FOR UPDATE;
  IF i.id IS NULL OR NOT public.nexus_can_manage_inquiry(auth.uid(), i.inquiry_id) THEN RAISE EXCEPTION 'not_permitted'; END IF;
  IF i.status NOT IN ('proposed','authorized','reconsent_required') THEN RAISE EXCEPTION 'not_cancellable'; END IF;
  UPDATE public.nexus_introductions SET status='cancelled', decided_at=now(), updated_at=now() WHERE id=_intro;
  PERFORM public.nexus_intro_event(_intro, 'cancelled', '{}'::jsonb);
END $$;

CREATE OR REPLACE FUNCTION public.record_nexus_partner_notice(_intro uuid, _status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE i public.nexus_introductions;
BEGIN
  SELECT * INTO i FROM public.nexus_introductions WHERE id=_intro;
  IF i.id IS NULL OR i.status <> 'sent' OR NOT public.nexus_can_manage_inquiry(auth.uid(), i.inquiry_id) THEN RAISE EXCEPTION 'not_permitted'; END IF;
  IF _status NOT IN ('emailed','email_failed','email_skipped') THEN RAISE EXCEPTION 'bad_status'; END IF;
  UPDATE public.nexus_introductions SET partner_notice_status=_status, partner_notice_at=now() WHERE id=_intro;
  PERFORM public.nexus_intro_event(_intro, 'partner_'||_status, '{}'::jsonb);
END $$;

CREATE OR REPLACE FUNCTION public.founder_nexus_requests()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_email text := public.nexus_founder_email();
BEGIN
  IF v_email IS NULL THEN RETURN '[]'::jsonb; END IF;
  RETURN coalesce((SELECT jsonb_agg(jsonb_build_object(
    'id', q.id, 'category_id', q.category_id, 'status', q.status, 'created_at', q.created_at,
    'full_name', q.full_name, 'email', q.email, 'phone', q.phone, 'location', q.location, 'description', q.description,
    'introductions', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'id', i.id, 'partner_name', i.partner_name, 'status', i.status, 'selected_fields', i.selected_fields,
        'consent_version', i.consent_version, 'authorized_at', i.authorized_at, 'sent_at', i.sent_at,
        'events', (SELECT jsonb_agg(jsonb_build_object('event', e.event, 'at', e.created_at) ORDER BY e.created_at) FROM public.nexus_introduction_events e WHERE e.introduction_id=i.id)
      ) ORDER BY i.created_at DESC) FROM public.nexus_introductions i WHERE i.inquiry_id=q.id), '[]'::jsonb)
  ) ORDER BY q.created_at DESC) FROM public.nexus_inquiries q WHERE lower(q.email)=v_email), '[]'::jsonb);
END $$;

CREATE OR REPLACE FUNCTION public.nexus_founder_owns(_intro uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.nexus_introductions i JOIN public.nexus_inquiries q ON q.id=i.inquiry_id
    WHERE i.id=_intro AND lower(q.email) = public.nexus_founder_email())
$$;

CREATE OR REPLACE FUNCTION public.authorize_nexus_introduction(_intro uuid, _fields text[], _version text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE i public.nexus_introductions; q public.nexus_inquiries; c public.nexus_consent_versions; payload jsonb; f text;
BEGIN
  IF NOT public.nexus_founder_owns(_intro) THEN RAISE EXCEPTION 'not_permitted'; END IF;
  SELECT * INTO i FROM public.nexus_introductions WHERE id=_intro FOR UPDATE;
  IF i.status NOT IN ('proposed','reconsent_required') THEN RAISE EXCEPTION 'not_open_for_authorization'; END IF;
  SELECT * INTO c FROM public.nexus_consent_versions WHERE version=_version AND is_current;
  IF c.version IS NULL THEN RAISE EXCEPTION 'consent_version_outdated'; END IF;
  SELECT * INTO q FROM public.nexus_inquiries WHERE id=i.inquiry_id;
  FOREACH f IN ARRAY coalesce(_fields,'{}') LOOP
    IF f NOT IN ('name','email','phone','location','description') THEN RAISE EXCEPTION 'bad_field'; END IF;
  END LOOP;
  IF 'phone' = ANY(_fields) AND q.phone IS NULL THEN RAISE EXCEPTION 'bad_field'; END IF;
  IF 'location' = ANY(_fields) AND nullif(q.location,'') IS NULL THEN RAISE EXCEPTION 'bad_field'; END IF;
  IF NOT ('email' = ANY(_fields) OR 'phone' = ANY(_fields)) THEN RAISE EXCEPTION 'contact_method_required'; END IF;
  payload := public.nexus_build_payload(i.inquiry_id, i.partner_name, _fields);
  UPDATE public.nexus_introductions SET status='authorized', consent_version=c.version,
    consent_text = replace(replace(c.consent_template, '{partner}', i.partner_name), '{category_line}', coalesce(c.category_lines->>i.category_id, '')),
    selected_fields=(SELECT array_agg(DISTINCT x ORDER BY x) FROM unnest(_fields) x), consent_payload=payload, consent_payload_hash=md5(payload::text),
    authorized_at=now(), updated_at=now() WHERE id=_intro;
  PERFORM public.nexus_intro_event(_intro, 'authorized', jsonb_build_object('fields', _fields, 'consent_version', c.version));
END $$;

CREATE OR REPLACE FUNCTION public.decline_nexus_introduction(_intro uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE i public.nexus_introductions;
BEGIN
  IF NOT public.nexus_founder_owns(_intro) THEN RAISE EXCEPTION 'not_permitted'; END IF;
  SELECT * INTO i FROM public.nexus_introductions WHERE id=_intro FOR UPDATE;
  IF i.status NOT IN ('proposed','reconsent_required') THEN RAISE EXCEPTION 'not_declinable'; END IF;
  UPDATE public.nexus_introductions SET status='declined', decided_at=now(), updated_at=now() WHERE id=_intro;
  PERFORM public.nexus_intro_event(_intro, 'declined', '{}'::jsonb);
END $$;

CREATE OR REPLACE FUNCTION public.withdraw_nexus_introduction(_intro uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE i public.nexus_introductions;
BEGIN
  IF NOT public.nexus_founder_owns(_intro) THEN RAISE EXCEPTION 'not_permitted'; END IF;
  SELECT * INTO i FROM public.nexus_introductions WHERE id=_intro FOR UPDATE;
  IF i.status = 'sent' THEN RAISE EXCEPTION 'already_sent'; END IF;
  IF i.status <> 'authorized' THEN RAISE EXCEPTION 'not_withdrawable'; END IF;
  UPDATE public.nexus_introductions SET status='withdrawn', decided_at=now(), updated_at=now() WHERE id=_intro;
  PERFORM public.nexus_intro_event(_intro, 'withdrawn', '{}'::jsonb);
END $$;

CREATE OR REPLACE FUNCTION public.partner_nexus_introductions()
RETURNS TABLE(id uuid, sent_at timestamptz, payload jsonb) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT i.id, i.sent_at, i.sent_payload FROM public.nexus_introductions i
  WHERE i.partner_user_id = auth.uid() AND i.status='sent' ORDER BY i.sent_at DESC
$$;

REVOKE EXECUTE ON FUNCTION public.nexus_build_payload(uuid, text, text[]) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.nexus_intro_event(uuid, text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.nexus_partner_eligible(uuid, text, boolean) FROM PUBLIC, anon;
