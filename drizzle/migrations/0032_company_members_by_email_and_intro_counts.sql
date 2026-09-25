CREATE OR REPLACE FUNCTION public.set_organization_member_by_email(_organization_id uuid, _email text, _role text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor uuid := auth.uid(); v_user uuid;
BEGIN
  IF public.organization_role(v_actor, _organization_id) IS DISTINCT FROM 'owner'::public.organization_member_role THEN
    RAISE EXCEPTION 'Only a company owner can manage members' USING ERRCODE = 'insufficient_privilege'; END IF;
  IF _role NOT IN ('member','viewer','remove') THEN RAISE EXCEPTION 'Invalid company role' USING ERRCODE = 'check_violation'; END IF;
  SELECT id INTO v_user FROM auth.users WHERE lower(email) = lower(trim(_email)) AND email_confirmed_at IS NOT NULL;
  IF v_user IS NULL THEN RAISE EXCEPTION 'No confirmed Opsirix account uses that email. Ask the person to create a free account first.' USING ERRCODE = 'check_violation'; END IF;
  IF v_user = v_actor THEN RAISE EXCEPTION 'Owners cannot change their own access here' USING ERRCODE = 'check_violation'; END IF;
  IF _role = 'remove' THEN
    IF public.organization_role(v_user, _organization_id) = 'owner' THEN RAISE EXCEPTION 'Owners cannot be removed here' USING ERRCODE = 'check_violation'; END IF;
    DELETE FROM public.organization_members WHERE organization_id = _organization_id AND user_id = v_user;
    INSERT INTO public.audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary)
    VALUES (_organization_id, v_actor, 'membership.removed', 'organization_member', v_user::text, 'Company member removed.');
  ELSE
    IF public.organization_role(v_user, _organization_id) = 'owner' THEN RAISE EXCEPTION 'Owners cannot be changed here' USING ERRCODE = 'check_violation'; END IF;
    PERFORM public.set_organization_member(_organization_id, v_user, _role);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.admin_introduction_counts()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'not_permitted'; END IF;
  RETURN jsonb_build_object(
    'awaiting_founder', (SELECT count(*) FROM nexus_introductions WHERE status IN ('proposed','reconsent_required')),
    'ready_to_send', (SELECT count(*) FROM nexus_introductions WHERE status='authorized'),
    'sent', (SELECT count(*) FROM nexus_introductions WHERE status='sent'),
    'notice_failed', (SELECT count(*) FROM nexus_introductions WHERE partner_notice_status='email_failed'),
    'closed_without_send', (SELECT count(*) FROM nexus_introductions WHERE status IN ('declined','withdrawn','cancelled')));
END $$;