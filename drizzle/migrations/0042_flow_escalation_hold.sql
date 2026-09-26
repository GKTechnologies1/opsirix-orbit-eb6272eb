CREATE TABLE public.flow_escalations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref text NOT NULL UNIQUE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  task_id uuid NOT NULL REFERENCES public.flow_tasks(id),
  prior_status text NOT NULL,
  risk_level text NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low','medium','high')),
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 3 AND 500),
  raised_by uuid NOT NULL,
  raised_at timestamptz NOT NULL DEFAULT now(),
  clearance_note text CHECK (clearance_note IS NULL OR char_length(clearance_note) BETWEEN 10 AND 1000),
  cleared_by uuid,
  cleared_at timestamptz
);
CREATE UNIQUE INDEX flow_escalations_one_open ON public.flow_escalations(task_id) WHERE cleared_at IS NULL;
CREATE INDEX ON public.flow_escalations(organization_id);
CREATE SEQUENCE public.flow_escalation_seq;
GRANT SELECT ON public.flow_escalations TO authenticated;
GRANT ALL ON public.flow_escalations TO service_role;
ALTER TABLE public.flow_escalations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company access reads escalations" ON public.flow_escalations FOR SELECT TO authenticated USING (public.can_access_organization(auth.uid(), organization_id));

-- Tasks under an open escalation are held: editors may change wording/owner/date but not status.
CREATE OR REPLACE FUNCTION public.flow_save_task(_board uuid, _task uuid, _title text, _details text, _assignee uuid, _due date, _status text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid; v uuid := _task; v_cur text;
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
    SELECT status INTO v_cur FROM flow_tasks WHERE id = v AND board_id = _board;
    IF v_cur IS NULL THEN RAISE EXCEPTION 'Task not found' USING ERRCODE='no_data_found'; END IF;
    IF _status IS DISTINCT FROM v_cur AND EXISTS (SELECT 1 FROM flow_escalations e WHERE e.task_id = v AND e.cleared_at IS NULL) THEN
      RAISE EXCEPTION 'This task is on hold until Opsirix records written clearance' USING ERRCODE='check_violation'; END IF;
    UPDATE flow_tasks SET title = btrim(_title), details = nullif(btrim(_details),''), assignee_id = _assignee, due_on = _due, status = _status, updated_at = now()
    WHERE id = v AND board_id = _board;
    PERFORM public.flow_audit(v_org, 'flow.task_updated', v, 'Flow task updated.', jsonb_build_object('status', _status));
  END IF;
  RETURN v;
END $$;

-- Raise: staff with an active company grant or Admin. Task is held (Blocked). Clear: written clearance (10+ chars) required; task returns to its prior status.
CREATE OR REPLACE FUNCTION public.flow_set_escalation(_task uuid, _note text, _raise boolean) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid; v_status text; v_esc public.flow_escalations; v_ref text;
BEGIN
  SELECT organization_id, status INTO v_org, v_status FROM flow_tasks WHERE id = _task;
  IF v_org IS NULL THEN RAISE EXCEPTION 'Task not found' USING ERRCODE='no_data_found'; END IF;
  IF auth.uid() IS NULL OR NOT (public.has_role(auth.uid(),'admin') OR (public.has_staff_role(auth.uid()) AND public.has_active_staff_grant(auth.uid(), v_org))) THEN
    RAISE EXCEPTION 'Only Opsirix staff assigned to this company can escalate or clear' USING ERRCODE='insufficient_privilege'; END IF;
  SELECT * INTO v_esc FROM flow_escalations WHERE task_id = _task AND cleared_at IS NULL;
  IF _raise THEN
    IF v_esc.id IS NOT NULL THEN RAISE EXCEPTION 'This task already has an open escalation (%)', v_esc.ref USING ERRCODE='unique_violation'; END IF;
    IF coalesce(char_length(btrim(_note)),0) < 3 THEN RAISE EXCEPTION 'Add a short reason' USING ERRCODE='check_violation'; END IF;
    v_ref := 'OX-ESC-' || to_char(now(),'YYYY') || '-' || lpad(nextval('flow_escalation_seq')::text, 3, '0');
    INSERT INTO flow_escalations (ref, organization_id, task_id, prior_status, reason, raised_by) VALUES (v_ref, v_org, _task, v_status, btrim(_note), auth.uid());
    UPDATE flow_tasks SET status = 'blocked', escalated_at = now(), escalated_by = auth.uid(), escalation_note = btrim(_note), updated_at = now() WHERE id = _task;
    PERFORM public.flow_audit(v_org, 'flow.escalated', _task, 'Opsirix placed a Flow task on hold.', jsonb_build_object('ref', v_ref, 'prior_status', v_status));
  ELSE
    IF v_esc.id IS NULL THEN RAISE EXCEPTION 'No open escalation on this task' USING ERRCODE='no_data_found'; END IF;
    IF coalesce(char_length(btrim(_note)),0) < 10 THEN RAISE EXCEPTION 'Written clearance of at least 10 characters is required' USING ERRCODE='check_violation'; END IF;
    UPDATE flow_escalations SET clearance_note = btrim(_note), cleared_by = auth.uid(), cleared_at = now() WHERE id = v_esc.id;
    UPDATE flow_tasks SET status = CASE WHEN status = 'blocked' THEN v_esc.prior_status ELSE status END, escalated_at = NULL, escalated_by = NULL, escalation_note = NULL, updated_at = now() WHERE id = _task;
    PERFORM public.flow_audit(v_org, 'flow.escalation_cleared', _task, 'Opsirix recorded written clearance for a Flow task.', jsonb_build_object('ref', v_esc.ref, 'restored_status', v_esc.prior_status));
  END IF;
END $$;

-- Owner-only preview of exactly what a partner would receive, without sharing.
CREATE OR REPLACE FUNCTION public.flow_share_preview(_task uuid, _partner_email text)
RETURNS TABLE(partner_name text, company text, title text, details text, due_on date, status text, already_shared boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid; v_partner uuid;
BEGIN
  SELECT organization_id INTO v_org FROM flow_tasks WHERE id = _task;
  IF v_org IS NULL OR auth.uid() IS NULL OR public.organization_role(auth.uid(), v_org) IS DISTINCT FROM 'owner' THEN RAISE EXCEPTION 'Only a company owner can preview sharing' USING ERRCODE='insufficient_privilege'; END IF;
  SELECT p.id INTO v_partner FROM profiles p WHERE lower(p.email) = lower(btrim(_partner_email))
    AND EXISTS (SELECT 1 FROM partner_applications a WHERE a.user_id = p.id AND a.status = 'approved');
  IF v_partner IS NULL THEN RAISE EXCEPTION 'No approved partner account matches that email' USING ERRCODE='no_data_found'; END IF;
  RETURN QUERY SELECT coalesce(nullif(pp.display_name,''), nullif(pr.full_name,''), 'Approved partner'), o.name, t.title, t.details, t.due_on, t.status,
    EXISTS (SELECT 1 FROM flow_task_shares s WHERE s.task_id = _task AND s.partner_user_id = v_partner AND s.revoked_at IS NULL)
  FROM flow_tasks t JOIN organizations o ON o.id = t.organization_id
  LEFT JOIN profiles pr ON pr.id = v_partner
  LEFT JOIN partner_profiles pp ON pp.user_id = v_partner
  WHERE t.id = _task LIMIT 1;
END $$;
REVOKE ALL ON FUNCTION public.flow_share_preview(uuid,text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.flow_share_preview(uuid,text) TO authenticated;

-- Existing flags (from phase 1) become escalation records so they are held the same way.
INSERT INTO public.flow_escalations (ref, organization_id, task_id, prior_status, reason, raised_by, raised_at)
SELECT 'OX-ESC-' || to_char(t.escalated_at,'YYYY') || '-' || lpad(nextval('public.flow_escalation_seq')::text,3,'0'), t.organization_id, t.id, t.status, coalesce(t.escalation_note,'Flagged before hold rule'), t.escalated_by, t.escalated_at
FROM public.flow_tasks t WHERE t.escalated_at IS NOT NULL AND t.escalated_by IS NOT NULL;