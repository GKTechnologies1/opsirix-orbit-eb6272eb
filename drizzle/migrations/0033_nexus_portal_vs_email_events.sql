ALTER TABLE public.nexus_introductions ADD COLUMN IF NOT EXISTS partner_notice_attempts integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.send_nexus_introduction(_intro uuid, _hash text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
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
  IF _hash IS DISTINCT FROM i.consent_payload_hash THEN RETURN jsonb_build_object('result','payload_mismatch'); END IF;
  IF NOT public.nexus_partner_eligible(i.partner_profile_id, i.category_id, q.is_test) THEN
    UPDATE public.nexus_introductions SET send_attempts=send_attempts+1, last_send_error='Partner is no longer eligible.', updated_at=now() WHERE id=_intro;
    PERFORM public.nexus_intro_event(_intro, 'send_failed', jsonb_build_object('reason','partner_not_eligible'));
    RETURN jsonb_build_object('result','failed','error','Partner is no longer eligible.');
  END IF;
  UPDATE public.nexus_introductions SET status='sent', sent_by=auth.uid(), sent_at=now(), sent_payload=i.consent_payload,
    send_attempts=send_attempts+1, last_send_error=NULL, updated_at=now() WHERE id=_intro;
  UPDATE public.nexus_inquiries SET status='introduced', updated_at=now() WHERE id=i.inquiry_id;
  PERFORM public.nexus_intro_event(_intro, 'shared_in_partner_portal', jsonb_build_object('fields', i.selected_fields));
  RETURN jsonb_build_object('result','sent','partner_user_id', i.partner_user_id);
END $function$;

-- Notification outcomes are appended as new events; earlier outcomes (e.g. a failure) are never overwritten.
CREATE OR REPLACE FUNCTION public.record_nexus_partner_notice(_intro uuid, _status text)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE i public.nexus_introductions; n int;
BEGIN
  SELECT * INTO i FROM public.nexus_introductions WHERE id=_intro FOR UPDATE;
  IF i.id IS NULL OR i.status <> 'sent' OR NOT public.nexus_can_manage_inquiry(auth.uid(), i.inquiry_id) THEN RAISE EXCEPTION 'not_permitted'; END IF;
  IF _status NOT IN ('emailed','email_failed','email_skipped') THEN RAISE EXCEPTION 'bad_status'; END IF;
  n := i.partner_notice_attempts + 1;
  UPDATE public.nexus_introductions SET partner_notice_status=_status, partner_notice_at=now(), partner_notice_attempts=n WHERE id=_intro;
  PERFORM public.nexus_intro_event(_intro, CASE _status WHEN 'emailed' THEN 'notification_email_delivered' WHEN 'email_failed' THEN 'notification_email_failed' ELSE 'notification_email_skipped' END, jsonb_build_object('attempt', n));
END $function$;

-- Notification retry: only for sent introductions whose last email did not deliver. Never re-sends the disclosure.
CREATE OR REPLACE FUNCTION public.begin_nexus_notice_retry(_intro uuid)
 RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE i public.nexus_introductions;
BEGIN
  SELECT * INTO i FROM public.nexus_introductions WHERE id=_intro FOR UPDATE;
  IF i.id IS NULL OR NOT public.nexus_can_manage_inquiry(auth.uid(), i.inquiry_id) THEN RAISE EXCEPTION 'not_permitted'; END IF;
  IF i.status <> 'sent' THEN RAISE EXCEPTION 'not_shared'; END IF;
  IF i.partner_notice_status = 'emailed' THEN RAISE EXCEPTION 'already_notified'; END IF;
  IF i.partner_notice_attempts >= 5 THEN RAISE EXCEPTION 'retry_limit'; END IF;
  PERFORM public.nexus_intro_event(_intro, 'notification_retry_requested', jsonb_build_object('attempt', i.partner_notice_attempts + 1));
  RETURN i.partner_user_id;
END $function$;

CREATE OR REPLACE FUNCTION public.admin_introduction_counts()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'not_permitted'; END IF;
  RETURN jsonb_build_object(
    'awaiting_founder', (SELECT count(*) FROM nexus_introductions WHERE status IN ('proposed','reconsent_required')),
    'ready_to_send', (SELECT count(*) FROM nexus_introductions WHERE status='authorized'),
    'sent', (SELECT count(*) FROM nexus_introductions WHERE status='sent'),
    'notice_failed', (SELECT count(*) FROM nexus_introductions WHERE status='sent' AND partner_notice_status='email_failed'),
    'closed_without_send', (SELECT count(*) FROM nexus_introductions WHERE status IN ('declined','withdrawn','cancelled')));
END $$;