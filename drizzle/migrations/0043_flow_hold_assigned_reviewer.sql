ALTER TABLE public.flow_escalations ADD COLUMN reviewer_id uuid, ADD COLUMN cleared_by_override boolean NOT NULL DEFAULT false;

CREATE TABLE public.flow_hold_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escalation_id uuid NOT NULL REFERENCES public.flow_escalations(id),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  task_id uuid NOT NULL REFERENCES public.flow_tasks(id),
  field text NOT NULL CHECK (field IN ('title','details','assignee','due_on')),
  old_value text,
  new_value text,
  changed_by uuid NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.flow_hold_changes(escalation_id);
GRANT SELECT ON public.flow_hold_changes TO authenticated;
GRANT ALL ON public.flow_hold_changes TO service_role;
ALTER TABLE public.flow_hold_changes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company access reads hold changes" ON public.flow_hold_changes FOR SELECT TO authenticated USING (public.can_access_organization(auth.uid(), organization_id));

-- Eligible reviewers: Admin/CEO, or staff with an active grant for the company.
CREATE OR REPLACE FUNCTION public.flow_is_hold_reviewer(_user uuid, _org uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user,'admin') OR (public.has_staff_role(_user) AND public.has_active_staff_grant(_user, _org))
$$;
REVOKE ALL ON FUNCTION public.flow_is_hold_reviewer(uuid,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.flow_is_hold_reviewer(uuid,uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.flow_hold_reviewers(_org uuid) RETURNS TABLE(user_id uuid, label text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.flow_is_hold_reviewer(auth.uid(), _org) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='insufficient_privilege'; END IF;
  RETURN QUERY SELECT p.id, coalesce(nullif(p.full_name,''), p.email) FROM profiles p
    WHERE p.id <> auth.uid() AND public.flow_is_hold_reviewer(p.id, _org) ORDER BY 2;
END $$;
REVOKE ALL ON FUNCTION public.flow_hold_reviewers(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.flow_hold_reviewers(uuid) TO authenticated;

-- Held tasks: wording/owner/date may change, status may not; every change is logged against the hold.
CREATE OR REPLACE FUNCTION public.flow_save_task(_board uuid, _task uuid, _title text, _details text, _assignee uuid, _due date, _status text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid; v uuid := _task; t public.flow_tasks; v_esc uuid;
BEGIN
  SELECT organization_id INTO v_org FROM flow_boards WHERE id = _board AND archived_at IS NULL;
  IF v_org IS NULL THEN RAISE EXCEPTION 'Board not found' USING ERRCODE='no_data_found'; END IF;
  IF auth.uid() IS NULL OR NOT public.flow_can_edit(auth.uid(), v_org) THEN RAISE EXCEPTION 'You can view this board but not change it' USING ERRCODE='insufficient_privilege'; END IF;
  IF _assignee IS NOT NULL AND public.organization_role(_assignee, v_org) IS NULL THEN RAISE EXCEPTION 'Tasks can only be assigned to company members' USING ERRCODE='check_violation'; END IF;
  IF v IS NULL THEN
    INSERT INTO flow_tasks (board_id, organization_id, title, details, assignee_id, due_on, status, created_by)
    VALUES (_board, v_org, btrim(_title), nullif(btrim(_details),''), _assignee, _due, coalesce(_status,'todo'), auth.uid()) RETURNING id INTO v;
    PERFORM public.flow_audit(v_org, 'flow.task_created', v, 'Flow task created.', jsonb_build_object('status', coalesce(_status,'todo')));
  ELSE
    SELECT * INTO t FROM flow_tasks WHERE id = v AND board_id = _board;
    IF t.id IS NULL THEN RAISE EXCEPTION 'Task not found' USING ERRCODE='no_data_found'; END IF;
    SELECT id INTO v_esc FROM flow_escalations WHERE task_id = v AND cleared_at IS NULL;
    IF v_esc IS NOT NULL THEN
      IF _status IS DISTINCT FROM t.status THEN RAISE EXCEPTION 'This task is on hold until the assigned reviewer records written clearance' USING ERRCODE='check_violation'; END IF;
      INSERT INTO flow_hold_changes (escalation_id, organization_id, task_id, field, old_value, new_value, changed_by)
      SELECT v_esc, v_org, v, f, o, n, auth.uid() FROM (VALUES
        ('title', t.title, btrim(_title)),
        ('details', t.details, nullif(btrim(_details),'')),
        ('assignee', t.assignee_id::text, _assignee::text),
        ('due_on', t.due_on::text, _due::text)) x(f,o,n)
      WHERE o IS DISTINCT FROM n;
    END IF;
    UPDATE flow_tasks SET title = btrim(_title), details = nullif(btrim(_details),''), assignee_id = _assignee, due_on = _due, status = _status, updated_at = now()
    WHERE id = v AND board_id = _board;
    PERFORM public.flow_audit(v_org, CASE WHEN v_esc IS NULL THEN 'flow.task_updated' ELSE 'flow.task_updated_during_hold' END, v, CASE WHEN v_esc IS NULL THEN 'Flow task updated.' ELSE 'Flow task corrected while on hold; hold remains.' END, jsonb_build_object('status', _status));
  END IF;
  RETURN v;
END $$;

DROP FUNCTION IF EXISTS public.flow_set_escalation(uuid, text, boolean);
CREATE FUNCTION public.flow_set_escalation(_task uuid, _note text, _raise boolean, _reviewer uuid DEFAULT NULL, _override boolean DEFAULT false) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid; v_status text; v_esc public.flow_escalations; v_ref text; v_admin boolean;
BEGIN
  SELECT organization_id, status INTO v_org, v_status FROM flow_tasks WHERE id = _task;
  IF v_org IS NULL THEN RAISE EXCEPTION 'Task not found' USING ERRCODE='no_data_found'; END IF;
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required' USING ERRCODE='insufficient_privilege'; END IF;
  v_admin := public.has_role(auth.uid(),'admin');
  SELECT * INTO v_esc FROM flow_escalations WHERE task_id = _task AND cleared_at IS NULL;
  IF _raise THEN
    IF NOT public.flow_is_hold_reviewer(auth.uid(), v_org) THEN RAISE EXCEPTION 'Only Opsirix staff assigned to this company can place a hold' USING ERRCODE='insufficient_privilege'; END IF;
    IF v_esc.id IS NOT NULL THEN RAISE EXCEPTION 'This task already has an open hold (%)', v_esc.ref USING ERRCODE='unique_violation'; END IF;
    IF coalesce(char_length(btrim(_note)),0) < 3 THEN RAISE EXCEPTION 'Add a short reason' USING ERRCODE='check_violation'; END IF;
    IF _reviewer IS NULL THEN RAISE EXCEPTION 'Choose a clearance reviewer' USING ERRCODE='check_violation'; END IF;
    IF _reviewer = auth.uid() THEN RAISE EXCEPTION 'The person placing a hold cannot be its clearance reviewer' USING ERRCODE='check_violation'; END IF;
    IF NOT public.flow_is_hold_reviewer(_reviewer, v_org) THEN RAISE EXCEPTION 'That reviewer is not authorized for this company' USING ERRCODE='check_violation'; END IF;
    v_ref := 'OX-ESC-' || to_char(now(),'YYYY') || '-' || lpad(nextval('flow_escalation_seq')::text, 3, '0');
    INSERT INTO flow_escalations (ref, organization_id, task_id, prior_status, reason, raised_by, reviewer_id) VALUES (v_ref, v_org, _task, v_status, btrim(_note), auth.uid(), _reviewer);
    UPDATE flow_tasks SET status = 'blocked', escalated_at = now(), escalated_by = auth.uid(), escalation_note = btrim(_note), updated_at = now() WHERE id = _task;
    PERFORM public.flow_audit(v_org, 'flow.escalated', _task, 'Opsirix placed a Flow task on hold.', jsonb_build_object('ref', v_ref, 'prior_status', v_status, 'reviewer_id', _reviewer));
  ELSE
    IF v_esc.id IS NULL THEN RAISE EXCEPTION 'No open hold on this task' USING ERRCODE='no_data_found'; END IF;
    IF v_esc.reviewer_id IS DISTINCT FROM auth.uid() THEN
      IF NOT v_admin THEN RAISE EXCEPTION 'Only the assigned reviewer or Admin/CEO can clear this hold' USING ERRCODE='insufficient_privilege'; END IF;
      IF NOT _override THEN RAISE EXCEPTION 'Admin/CEO must confirm an explicit override to clear a hold assigned to someone else' USING ERRCODE='check_violation'; END IF;
    ELSIF NOT public.flow_is_hold_reviewer(auth.uid(), v_org) THEN
      RAISE EXCEPTION 'Your company access has ended; ask Admin/CEO to reassign or override' USING ERRCODE='insufficient_privilege';
    END IF;
    IF coalesce(char_length(btrim(_note)),0) < 10 THEN RAISE EXCEPTION 'Written clearance of at least 10 characters is required' USING ERRCODE='check_violation'; END IF;
    UPDATE flow_escalations SET clearance_note = btrim(_note), cleared_by = auth.uid(), cleared_at = now(), cleared_by_override = (v_esc.reviewer_id IS DISTINCT FROM auth.uid()) WHERE id = v_esc.id;
    UPDATE flow_tasks SET status = v_esc.prior_status, escalated_at = NULL, escalated_by = NULL, escalation_note = NULL, updated_at = now() WHERE id = _task;
    PERFORM public.flow_audit(v_org, CASE WHEN v_esc.reviewer_id IS DISTINCT FROM auth.uid() THEN 'flow.escalation_override' ELSE 'flow.escalation_cleared' END, _task,
      CASE WHEN v_esc.reviewer_id IS DISTINCT FROM auth.uid() THEN 'Admin/CEO override: hold cleared with written reason.' ELSE 'Assigned reviewer recorded written clearance for a Flow task.' END,
      jsonb_build_object('ref', v_esc.ref, 'restored_status', v_esc.prior_status, 'override', v_esc.reviewer_id IS DISTINCT FROM auth.uid(),
        'changes_during_hold', (SELECT count(*) FROM flow_hold_changes c WHERE c.escalation_id = v_esc.id)));
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.flow_set_escalation(uuid,text,boolean,uuid,boolean) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.flow_set_escalation(uuid,text,boolean,uuid,boolean) TO authenticated;