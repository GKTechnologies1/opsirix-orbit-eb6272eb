CREATE TABLE public.flow_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);
CREATE TABLE public.flow_editors (
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  user_id uuid NOT NULL,
  granted_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);
CREATE TABLE public.flow_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES public.flow_boards(id),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  title text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 200),
  details text CHECK (details IS NULL OR char_length(details) <= 2000),
  assignee_id uuid,
  due_on date,
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in_progress','blocked','done')),
  escalated_at timestamptz,
  escalated_by uuid,
  escalation_note text CHECK (escalation_note IS NULL OR char_length(escalation_note) <= 500),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.flow_task_shares (
  task_id uuid NOT NULL REFERENCES public.flow_tasks(id),
  partner_user_id uuid NOT NULL,
  shared_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  PRIMARY KEY (task_id, partner_user_id)
);
CREATE INDEX ON public.flow_tasks(organization_id);
CREATE INDEX ON public.flow_boards(organization_id);

GRANT SELECT ON public.flow_boards, public.flow_editors, public.flow_tasks, public.flow_task_shares TO authenticated;
GRANT ALL ON public.flow_boards, public.flow_editors, public.flow_tasks, public.flow_task_shares TO service_role;
ALTER TABLE public.flow_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_editors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_task_shares ENABLE ROW LEVEL SECURITY;

-- Company members, viewers, granted staff and Admin read; all writes go through functions below.
CREATE POLICY "Company access reads boards" ON public.flow_boards FOR SELECT TO authenticated USING (public.can_access_organization(auth.uid(), organization_id));
CREATE POLICY "Company access reads tasks" ON public.flow_tasks FOR SELECT TO authenticated USING (public.can_access_organization(auth.uid(), organization_id));
CREATE POLICY "Company access reads editors" ON public.flow_editors FOR SELECT TO authenticated USING (public.can_access_organization(auth.uid(), organization_id));
CREATE POLICY "Owners read shares" ON public.flow_task_shares FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.flow_tasks t WHERE t.id = task_id AND (public.organization_role(auth.uid(), t.organization_id) = 'owner' OR public.has_role(auth.uid(),'admin'))));

CREATE OR REPLACE FUNCTION public.flow_can_edit(_user uuid, _org uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.organization_role(_user, _org) = 'owner'
    OR (public.organization_role(_user, _org) = 'member' AND EXISTS (SELECT 1 FROM flow_editors e WHERE e.organization_id = _org AND e.user_id = _user))
$$;

CREATE OR REPLACE FUNCTION public.flow_audit(_org uuid, _type text, _subject uuid, _summary text, _meta jsonb DEFAULT '{}'::jsonb) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary, metadata)
  VALUES (_org, auth.uid(), _type, 'flow', _subject::text, _summary, _meta)
$$;
REVOKE ALL ON FUNCTION public.flow_audit(uuid,text,uuid,text,jsonb) FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.flow_create_board(_org uuid, _name text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.flow_can_edit(auth.uid(), _org) THEN RAISE EXCEPTION 'Only the company owner or a delegated member can create boards' USING ERRCODE='insufficient_privilege'; END IF;
  INSERT INTO flow_boards (organization_id, name, created_by) VALUES (_org, btrim(_name), auth.uid()) RETURNING id INTO v;
  PERFORM public.flow_audit(_org, 'flow.board_created', v, 'Flow board created.');
  RETURN v;
END $$;

CREATE OR REPLACE FUNCTION public.flow_set_editor(_org uuid, _email text, _enabled boolean) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user uuid;
BEGIN
  IF auth.uid() IS NULL OR public.organization_role(auth.uid(), _org) IS DISTINCT FROM 'owner' THEN RAISE EXCEPTION 'Only a company owner can delegate Flow editing' USING ERRCODE='insufficient_privilege'; END IF;
  SELECT m.user_id INTO v_user FROM organization_members m JOIN profiles p ON p.id = m.user_id WHERE m.organization_id = _org AND lower(p.email) = lower(btrim(_email));
  IF v_user IS NULL THEN RAISE EXCEPTION 'That email is not a member of this company' USING ERRCODE='no_data_found'; END IF;
  IF public.organization_role(v_user, _org) <> 'member' THEN RAISE EXCEPTION 'Only members (not viewers) can be delegated' USING ERRCODE='check_violation'; END IF;
  IF _enabled THEN INSERT INTO flow_editors (organization_id, user_id, granted_by) VALUES (_org, v_user, auth.uid()) ON CONFLICT DO NOTHING;
  ELSE DELETE FROM flow_editors WHERE organization_id = _org AND user_id = v_user; END IF;
  PERFORM public.flow_audit(_org, CASE WHEN _enabled THEN 'flow.editor_granted' ELSE 'flow.editor_removed' END, v_user, CASE WHEN _enabled THEN 'Flow editing delegated to a member.' ELSE 'Flow editing removed from a member.' END);
END $$;

CREATE OR REPLACE FUNCTION public.flow_save_task(_board uuid, _task uuid, _title text, _details text, _assignee uuid, _due date, _status text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid; v uuid := _task;
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
    UPDATE flow_tasks SET title = btrim(_title), details = nullif(btrim(_details),''), assignee_id = _assignee, due_on = _due, status = _status, updated_at = now()
    WHERE id = v AND board_id = _board;
    IF NOT FOUND THEN RAISE EXCEPTION 'Task not found' USING ERRCODE='no_data_found'; END IF;
    PERFORM public.flow_audit(v_org, 'flow.task_updated', v, 'Flow task updated.', jsonb_build_object('status', _status));
  END IF;
  RETURN v;
END $$;

-- Staff with an active grant (and Admin) may raise or clear an escalation; each is audited.
CREATE OR REPLACE FUNCTION public.flow_set_escalation(_task uuid, _note text, _raise boolean) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid;
BEGIN
  SELECT organization_id INTO v_org FROM flow_tasks WHERE id = _task;
  IF v_org IS NULL THEN RAISE EXCEPTION 'Task not found' USING ERRCODE='no_data_found'; END IF;
  IF auth.uid() IS NULL OR NOT (public.has_role(auth.uid(),'admin') OR (public.has_staff_role(auth.uid()) AND public.has_active_staff_grant(auth.uid(), v_org))) THEN
    RAISE EXCEPTION 'Only Opsirix staff assigned to this company can escalate' USING ERRCODE='insufficient_privilege'; END IF;
  IF _raise THEN
    IF coalesce(char_length(btrim(_note)),0) < 3 THEN RAISE EXCEPTION 'Add a short reason' USING ERRCODE='check_violation'; END IF;
    UPDATE flow_tasks SET escalated_at = now(), escalated_by = auth.uid(), escalation_note = btrim(_note), updated_at = now() WHERE id = _task;
    PERFORM public.flow_audit(v_org, 'flow.escalated', _task, 'Opsirix flagged a Flow task for attention.');
  ELSE
    UPDATE flow_tasks SET escalated_at = NULL, escalated_by = NULL, escalation_note = NULL, updated_at = now() WHERE id = _task;
    PERFORM public.flow_audit(v_org, 'flow.escalation_cleared', _task, 'Opsirix cleared a Flow escalation.', jsonb_build_object('reason', left(coalesce(btrim(_note),''),200)));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.flow_share_task(_task uuid, _partner_email text, _enabled boolean) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid; v_partner uuid;
BEGIN
  SELECT organization_id INTO v_org FROM flow_tasks WHERE id = _task;
  IF v_org IS NULL OR auth.uid() IS NULL OR public.organization_role(auth.uid(), v_org) IS DISTINCT FROM 'owner' THEN RAISE EXCEPTION 'Only a company owner can share tasks' USING ERRCODE='insufficient_privilege'; END IF;
  SELECT p.id INTO v_partner FROM profiles p WHERE lower(p.email) = lower(btrim(_partner_email)) AND public.has_role(p.id, 'partner');
  IF v_partner IS NULL THEN RAISE EXCEPTION 'No approved partner account matches that email' USING ERRCODE='no_data_found'; END IF;
  IF _enabled THEN
    INSERT INTO flow_task_shares (task_id, partner_user_id, shared_by) VALUES (_task, v_partner, auth.uid())
    ON CONFLICT (task_id, partner_user_id) DO UPDATE SET revoked_at = NULL, shared_by = auth.uid(), created_at = now();
  ELSE
    UPDATE flow_task_shares SET revoked_at = now() WHERE task_id = _task AND partner_user_id = v_partner;
  END IF;
  PERFORM public.flow_audit(v_org, CASE WHEN _enabled THEN 'flow.task_shared' ELSE 'flow.task_unshared' END, _task, CASE WHEN _enabled THEN 'Flow task shared with a partner.' ELSE 'Flow task sharing removed.' END);
END $$;

-- Partner projection: only explicitly shared, unrevoked tasks; no details of assignees or other tasks.
CREATE OR REPLACE FUNCTION public.partner_flow_tasks() RETURNS TABLE(task_id uuid, company text, title text, details text, due_on date, status text, shared_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT t.id, o.name, t.title, t.details, t.due_on, t.status, s.created_at
  FROM flow_task_shares s JOIN flow_tasks t ON t.id = s.task_id JOIN organizations o ON o.id = t.organization_id
  WHERE s.partner_user_id = auth.uid() AND s.revoked_at IS NULL
  ORDER BY s.created_at DESC
$$;

REVOKE ALL ON FUNCTION public.flow_create_board(uuid,text), public.flow_set_editor(uuid,text,boolean), public.flow_save_task(uuid,uuid,text,text,uuid,date,text), public.flow_set_escalation(uuid,text,boolean), public.flow_share_task(uuid,text,boolean), public.partner_flow_tasks(), public.flow_can_edit(uuid,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.flow_create_board(uuid,text), public.flow_set_editor(uuid,text,boolean), public.flow_save_task(uuid,uuid,text,text,uuid,date,text), public.flow_set_escalation(uuid,text,boolean), public.flow_share_task(uuid,text,boolean), public.partner_flow_tasks(), public.flow_can_edit(uuid,uuid) TO authenticated;