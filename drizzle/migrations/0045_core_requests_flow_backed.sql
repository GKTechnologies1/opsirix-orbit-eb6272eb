CREATE SEQUENCE public.core_request_seq;
CREATE TABLE public.core_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref text NOT NULL UNIQUE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 200),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 4000),
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','accepted','awaiting_owner','closed','declined','withdrawn')),
  requested_by uuid NOT NULL,
  handled_by uuid,
  board_id uuid REFERENCES public.flow_boards(id),
  status_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.core_requests(organization_id);
CREATE TABLE public.core_request_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.core_requests(id),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  from_status text,
  to_status text NOT NULL,
  note text,
  actor_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.core_request_events(request_id);
GRANT SELECT ON public.core_requests, public.core_request_events TO authenticated;
GRANT ALL ON public.core_requests, public.core_request_events TO service_role;
ALTER TABLE public.core_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_request_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company access reads Core requests" ON public.core_requests FOR SELECT TO authenticated USING (public.can_access_organization(auth.uid(), organization_id));
CREATE POLICY "Company access reads Core events" ON public.core_request_events FOR SELECT TO authenticated USING (public.can_access_organization(auth.uid(), organization_id));

CREATE OR REPLACE FUNCTION public.core_is_staff(_user uuid, _org uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user,'admin') OR (public.has_staff_role(_user) AND public.has_active_staff_grant(_user, _org))
$$;
REVOKE ALL ON FUNCTION public.core_is_staff(uuid,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.core_is_staff(uuid,uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.core_log(_req public.core_requests, _to text, _note text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO core_request_events (request_id, organization_id, from_status, to_status, note, actor_id) VALUES (_req.id, _req.organization_id, _req.status, _to, nullif(btrim(_note),''), auth.uid());
  INSERT INTO audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary, metadata)
  VALUES (_req.organization_id, auth.uid(), 'core.' || _to, 'core', _req.id::text, 'Core request ' || _req.ref || ': ' || replace(_to,'_',' ') || '.', jsonb_build_object('ref', _req.ref, 'from', _req.status));
END $$;
REVOKE ALL ON FUNCTION public.core_log(public.core_requests,text,text) FROM public, anon, authenticated;

-- Owner or member (with Flow editing) submits; owner/requester withdraws before acceptance.
CREATE OR REPLACE FUNCTION public.core_submit_request(_org uuid, _title text, _description text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.core_requests;
BEGIN
  IF auth.uid() IS NULL OR NOT public.flow_can_edit(auth.uid(), _org) THEN RAISE EXCEPTION 'Only company owners and editing members can submit Core requests' USING ERRCODE='insufficient_privilege'; END IF;
  IF char_length(btrim(coalesce(_title,''))) < 3 THEN RAISE EXCEPTION 'Add a short title' USING ERRCODE='check_violation'; END IF;
  INSERT INTO core_requests (ref, organization_id, title, description, requested_by, status)
  VALUES ('OX-CORE-' || to_char(now(),'YYYY') || '-' || lpad(nextval('core_request_seq')::text,3,'0'), _org, btrim(_title), coalesce(btrim(_description),''), auth.uid(), 'submitted') RETURNING * INTO r;
  INSERT INTO core_request_events (request_id, organization_id, from_status, to_status, actor_id) VALUES (r.id, _org, NULL, 'submitted', auth.uid());
  INSERT INTO audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary, metadata)
  VALUES (_org, auth.uid(), 'core.submitted', 'core', r.id::text, 'Core request ' || r.ref || ' submitted.', jsonb_build_object('ref', r.ref));
  RETURN r.id;
END $$;

-- Transitions:
--  staff (active grant or Admin): accept (creates a Flow board), decline (reason), ready (awaiting_owner)
--  owner/editor: withdraw (only before accepted), close (from awaiting_owner, note), reopen (awaiting_owner -> accepted, note)
CREATE OR REPLACE FUNCTION public.core_transition(_request uuid, _action text, _note text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.core_requests; v_staff boolean; v_editor boolean; v_to text; v_board uuid;
BEGIN
  SELECT * INTO r FROM core_requests WHERE id = _request FOR UPDATE;
  IF r.id IS NULL OR auth.uid() IS NULL OR NOT public.can_access_organization(auth.uid(), r.organization_id) THEN RAISE EXCEPTION 'Request not found' USING ERRCODE='no_data_found'; END IF;
  v_staff := public.organization_role(auth.uid(), r.organization_id) IS NULL AND public.core_is_staff(auth.uid(), r.organization_id);
  v_editor := public.flow_can_edit(auth.uid(), r.organization_id);
  IF _action = 'accept' AND v_staff AND r.status = 'submitted' THEN v_to := 'accepted';
  ELSIF _action = 'decline' AND v_staff AND r.status = 'submitted' THEN v_to := 'declined';
    IF char_length(btrim(coalesce(_note,''))) < 10 THEN RAISE EXCEPTION 'Give the company a written reason (10+ characters)' USING ERRCODE='check_violation'; END IF;
  ELSIF _action = 'ready' AND v_staff AND r.status = 'accepted' AND r.handled_by = auth.uid() THEN v_to := 'awaiting_owner';
  ELSIF _action = 'withdraw' AND v_editor AND r.status = 'submitted' THEN v_to := 'withdrawn';
  ELSIF _action = 'close' AND v_editor AND r.status = 'awaiting_owner' THEN v_to := 'closed';
    IF char_length(btrim(coalesce(_note,''))) < 3 THEN RAISE EXCEPTION 'Add a closing note' USING ERRCODE='check_violation'; END IF;
  ELSIF _action = 'reopen' AND v_editor AND r.status = 'awaiting_owner' THEN v_to := 'accepted';
    IF char_length(btrim(coalesce(_note,''))) < 3 THEN RAISE EXCEPTION 'Say what still needs doing' USING ERRCODE='check_violation'; END IF;
  ELSE RAISE EXCEPTION 'That action is not available to you at this stage' USING ERRCODE='insufficient_privilege'; END IF;
  IF v_to = 'accepted' AND r.board_id IS NULL THEN
    INSERT INTO flow_boards (organization_id, name, created_by) VALUES (r.organization_id, left('Core ' || r.ref || ': ' || r.title, 120), auth.uid()) RETURNING id INTO v_board;
  END IF;
  PERFORM public.core_log(r, v_to, _note);
  UPDATE core_requests SET status = v_to, status_note = nullif(btrim(_note),''), board_id = coalesce(board_id, v_board),
    handled_by = CASE WHEN _action = 'accept' THEN auth.uid() ELSE handled_by END, updated_at = now() WHERE id = r.id;
END $$;

-- Handling staff add or update tasks on the request's Flow board while the request is accepted. Holds are respected.
CREATE OR REPLACE FUNCTION public.core_save_task(_request uuid, _task uuid, _title text, _due date, _status text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.core_requests; v uuid := _task; t public.flow_tasks;
BEGIN
  SELECT * INTO r FROM core_requests WHERE id = _request;
  IF r.id IS NULL OR auth.uid() IS NULL OR r.handled_by IS DISTINCT FROM auth.uid() OR NOT public.core_is_staff(auth.uid(), r.organization_id) THEN
    RAISE EXCEPTION 'Only the staff member handling this request, while their company access is active, can change its tasks' USING ERRCODE='insufficient_privilege'; END IF;
  IF r.status <> 'accepted' THEN RAISE EXCEPTION 'Tasks can only change while the request is in progress' USING ERRCODE='check_violation'; END IF;
  IF _status NOT IN ('todo','in_progress','blocked','done') OR char_length(btrim(coalesce(_title,''))) < 2 THEN RAISE EXCEPTION 'Check the task title and status' USING ERRCODE='check_violation'; END IF;
  IF v IS NULL THEN
    INSERT INTO flow_tasks (board_id, organization_id, title, due_on, status, created_by) VALUES (r.board_id, r.organization_id, btrim(_title), _due, _status, auth.uid()) RETURNING id INTO v;
    PERFORM public.flow_audit(r.organization_id, 'flow.task_created', v, 'Core task created by Opsirix.', jsonb_build_object('core_ref', r.ref));
  ELSE
    SELECT * INTO t FROM flow_tasks WHERE id = v AND board_id = r.board_id;
    IF t.id IS NULL THEN RAISE EXCEPTION 'Task not found on this request' USING ERRCODE='no_data_found'; END IF;
    IF _status IS DISTINCT FROM t.status AND EXISTS (SELECT 1 FROM flow_escalations e WHERE e.task_id = v AND e.cleared_at IS NULL) THEN
      RAISE EXCEPTION 'This task is on hold until the assigned reviewer records written clearance' USING ERRCODE='check_violation'; END IF;
    UPDATE flow_tasks SET title = btrim(_title), due_on = _due, status = _status, updated_at = now() WHERE id = v;
    PERFORM public.flow_audit(r.organization_id, 'flow.task_updated', v, 'Core task updated by Opsirix.', jsonb_build_object('core_ref', r.ref, 'status', _status));
  END IF;
  RETURN v;
END $$;
REVOKE ALL ON FUNCTION public.core_submit_request(uuid,text,text) FROM public, anon;
REVOKE ALL ON FUNCTION public.core_transition(uuid,text,text) FROM public, anon;
REVOKE ALL ON FUNCTION public.core_save_task(uuid,uuid,text,date,text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.core_submit_request(uuid,text,text), public.core_transition(uuid,text,text), public.core_save_task(uuid,uuid,text,date,text) TO authenticated;