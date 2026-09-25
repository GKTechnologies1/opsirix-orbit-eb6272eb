CREATE OR REPLACE FUNCTION public.flow_share_task(_task uuid, _partner_email text, _enabled boolean) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid; v_partner uuid;
BEGIN
  SELECT organization_id INTO v_org FROM flow_tasks WHERE id = _task;
  IF v_org IS NULL OR auth.uid() IS NULL OR public.organization_role(auth.uid(), v_org) IS DISTINCT FROM 'owner' THEN RAISE EXCEPTION 'Only a company owner can share tasks' USING ERRCODE='insufficient_privilege'; END IF;
  SELECT p.id INTO v_partner FROM profiles p
  WHERE lower(p.email) = lower(btrim(_partner_email))
    AND EXISTS (SELECT 1 FROM partner_applications a WHERE a.user_id = p.id AND a.status = 'approved');
  IF v_partner IS NULL THEN RAISE EXCEPTION 'No approved partner account matches that email' USING ERRCODE='no_data_found'; END IF;
  IF _enabled THEN
    INSERT INTO flow_task_shares (task_id, partner_user_id, shared_by) VALUES (_task, v_partner, auth.uid())
    ON CONFLICT (task_id, partner_user_id) DO UPDATE SET revoked_at = NULL, shared_by = auth.uid(), created_at = now();
  ELSE
    UPDATE flow_task_shares SET revoked_at = now() WHERE task_id = _task AND partner_user_id = v_partner;
  END IF;
  PERFORM public.flow_audit(v_org, CASE WHEN _enabled THEN 'flow.task_shared' ELSE 'flow.task_unshared' END, _task, CASE WHEN _enabled THEN 'Flow task shared with a partner.' ELSE 'Flow task sharing removed.' END);
END $$;