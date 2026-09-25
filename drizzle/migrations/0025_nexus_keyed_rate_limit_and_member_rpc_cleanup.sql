CREATE OR REPLACE FUNCTION public.submit_nexus_inquiry_keyed(_full_name text, _email text, _phone text, _category text, _location text, _description text, _disclosure_version text, _client_key text, _email_key text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
  IF _email_key IS NULL OR length(_email_key) <> 64 THEN
    RAISE EXCEPTION 'rate_key_missing' USING ERRCODE = 'check_violation';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.service_partner_types WHERE id = _category AND is_active AND is_open_for_registration) THEN
    RAISE EXCEPTION 'category_unavailable' USING ERRCODE = 'check_violation';
  END IF;
  IF (SELECT count(*) FROM public.nexus_inquiries WHERE email_hash = _email_key AND created_at > now() - interval '1 hour') >= 3
     OR (_client_key IS NOT NULL AND (SELECT count(*) FROM public.nexus_inquiries WHERE client_hash = _client_key AND created_at > now() - interval '1 hour') >= 5) THEN
    RAISE EXCEPTION 'rate_limited' USING ERRCODE = 'check_violation';
  END IF;
  INSERT INTO public.nexus_inquiries (full_name, email, phone, category_id, location, description, disclosure_version, acknowledged_at, contact_consent_at, is_test, email_hash, client_hash)
  VALUES (trim(_full_name), lower(trim(_email)), nullif(trim(_phone), ''), _category, nullif(trim(_location), ''), trim(_description), _disclosure_version, now(), now(), lower(trim(_email)) LIKE '%@example.test', _email_key, _client_key)
  RETURNING id INTO v_id;
  INSERT INTO public.audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary, metadata)
  VALUES (NULL, '00000000-0000-0000-0000-000000000000', 'nexus_inquiry.received', 'nexus_inquiry', v_id::text, 'Nexus inquiry received for review.', jsonb_build_object('category', _category, 'triage_role', 'operations_lead'));
  RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION public.submit_nexus_inquiry_keyed(text,text,text,text,text,text,text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_nexus_inquiry_keyed(text,text,text,text,text,text,text,text,text) TO service_role;
REVOKE EXECUTE ON FUNCTION public.submit_nexus_inquiry(text,text,text,text,text,text,text,text) FROM service_role;
COMMENT ON FUNCTION public.submit_nexus_inquiry(text,text,text,text,text,text,text,text) IS 'DEPRECATED: unkeyed email digest; replaced by submit_nexus_inquiry_keyed';
COMMENT ON COLUMN public.nexus_inquiries.email_hash IS 'Rate-limit key: HMAC-SHA256 of normalized email with a server-held secret. Not a privacy control; the plain email is stored in the email column.';
REVOKE EXECUTE ON FUNCTION public.public_partner_representatives() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.public_partner_services() FROM authenticated;