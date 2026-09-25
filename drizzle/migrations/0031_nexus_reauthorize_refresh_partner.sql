CREATE OR REPLACE FUNCTION public.authorize_nexus_introduction(_intro uuid, _fields text[], _version text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE i public.nexus_introductions; q public.nexus_inquiries; c public.nexus_consent_versions; payload jsonb; f text; cur_name text;
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
  -- The founder always authorizes the partner's current name, as shown on the screen after reload.
  SELECT organization_name INTO cur_name FROM public.partner_profiles WHERE id=i.partner_profile_id;
  payload := public.nexus_build_payload(i.inquiry_id, cur_name, _fields);
  UPDATE public.nexus_introductions SET status='authorized', partner_name=cur_name, consent_version=c.version,
    consent_text = replace(replace(c.consent_template, '{partner}', cur_name), '{category_line}', coalesce(c.category_lines->>i.category_id, '')),
    selected_fields=(SELECT array_agg(DISTINCT x ORDER BY x) FROM unnest(_fields) x), consent_payload=payload, consent_payload_hash=md5(payload::text),
    authorized_at=now(), updated_at=now() WHERE id=_intro;
  PERFORM public.nexus_intro_event(_intro, 'authorized', jsonb_build_object('fields', _fields, 'consent_version', c.version));
END $$;

-- Founders see the partner's current name while a decision is pending.
CREATE OR REPLACE FUNCTION public.founder_nexus_requests()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_email text := public.nexus_founder_email();
BEGIN
  IF v_email IS NULL THEN RETURN '[]'::jsonb; END IF;
  RETURN coalesce((SELECT jsonb_agg(jsonb_build_object(
    'id', q.id, 'category_id', q.category_id, 'status', q.status, 'created_at', q.created_at,
    'full_name', q.full_name, 'email', q.email, 'phone', q.phone, 'location', q.location, 'description', q.description,
    'introductions', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'id', i.id,
        'partner_name', CASE WHEN i.status IN ('proposed','reconsent_required') THEN (SELECT p.organization_name FROM public.partner_profiles p WHERE p.id=i.partner_profile_id) ELSE i.partner_name END,
        'status', i.status, 'selected_fields', i.selected_fields,
        'consent_version', i.consent_version, 'authorized_at', i.authorized_at, 'sent_at', i.sent_at,
        'events', (SELECT jsonb_agg(jsonb_build_object('event', e.event, 'at', e.created_at) ORDER BY e.created_at) FROM public.nexus_introduction_events e WHERE e.introduction_id=i.id)
      ) ORDER BY i.created_at DESC) FROM public.nexus_introductions i WHERE i.inquiry_id=q.id), '[]'::jsonb)
  ) ORDER BY q.created_at DESC) FROM public.nexus_inquiries q WHERE lower(q.email)=v_email), '[]'::jsonb);
END $$;