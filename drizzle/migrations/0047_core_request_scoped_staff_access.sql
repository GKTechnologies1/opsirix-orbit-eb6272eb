-- Owner-granted, request-scoped, time-limited Opsirix staff access to Core requests and their Flow boards.
CREATE TABLE public.core_access_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.core_requests(id),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  staff_user_id uuid NOT NULL,
  scope text NOT NULL CHECK (scope IN ('read','handle')),
  purpose text NOT NULL CHECK (char_length(purpose) BETWEEN 10 AND 300),
  expires_at timestamptz NOT NULL,
  granted_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  revoked_by uuid
);
CREATE UNIQUE INDEX core_access_one_active ON public.core_access_grants(request_id, staff_user_id) WHERE revoked_at IS NULL;
CREATE INDEX ON public.core_access_grants(staff_user_id);
GRANT ALL ON public.core_access_grants TO service_role;
ALTER TABLE public.core_access_grants ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.core_access_grants IS 'Append-style trail of owner grants. Read only through core_access_list. Expiry and revocation are checked on every read and write.';

CREATE OR REPLACE FUNCTION public.core_can_handle(_user uuid, _request uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(public.has_role(_user,'admin') OR (public.has_staff_role(_user) AND EXISTS (
    SELECT 1 FROM core_access_grants g WHERE g.request_id = _request AND g.staff_user_id = _user AND g.scope = 'handle'
      AND g.revoked_at IS NULL AND g.expires_at > now())), false)
$$;
CREATE OR REPLACE FUNCTION public.core_can_read(_user uuid, _request uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(public.has_role(_user,'admin')
    OR EXISTS (SELECT 1 FROM core_requests r JOIN organization_members m ON m.organization_id = r.organization_id WHERE r.id = _request AND m.user_id = _user)
    OR (public.has_staff_role(_user) AND EXISTS (
      SELECT 1 FROM core_access_grants g WHERE g.request_id = _request AND g.staff_user_id = _user AND g.revoked_at IS NULL AND g.expires_at > now())), false)
$$;
CREATE OR REPLACE FUNCTION public.core_board_request(_board uuid) RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM core_requests WHERE board_id = _board LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.core_can_handle(uuid,uuid), public.core_can_read(uuid,uuid), public.core_board_request(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.core_can_handle(uuid,uuid), public.core_can_read(uuid,uuid), public.core_board_request(uuid) TO authenticated;

-- Reads: Core rows and Core Flow boards follow the request grant, not the company-wide staff grant.
DROP POLICY "Company access reads Core requests" ON public.core_requests;
DROP POLICY "Company access reads Core events" ON public.core_request_events;
CREATE POLICY "Members, Admin or granted staff read Core requests" ON public.core_requests FOR SELECT TO authenticated USING (public.core_can_read(auth.uid(), id));
CREATE POLICY "Members, Admin or granted staff read Core events" ON public.core_request_events FOR SELECT TO authenticated USING (public.core_can_read(auth.uid(), request_id));
DROP POLICY "Company access reads boards" ON public.flow_boards;
DROP POLICY "Company access reads tasks" ON public.flow_tasks;
CREATE POLICY "Company access reads boards" ON public.flow_boards FOR SELECT TO authenticated USING (
  CASE WHEN public.core_board_request(id) IS NULL THEN public.can_access_organization(auth.uid(), organization_id)
       ELSE public.core_can_read(auth.uid(), public.core_board_request(id)) END);
CREATE POLICY "Company access reads tasks" ON public.flow_tasks FOR SELECT TO authenticated USING (
  CASE WHEN public.core_board_request(board_id) IS NULL THEN public.can_access_organization(auth.uid(), organization_id)
       ELSE public.core_can_read(auth.uid(), public.core_board_request(board_id)) END);
DROP POLICY "Company access reads escalations" ON public.flow_escalations;
DROP POLICY "Company access reads hold changes" ON public.flow_hold_changes;
CREATE POLICY "Task readers read escalations" ON public.flow_escalations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.flow_tasks t WHERE t.id = task_id));
CREATE POLICY "Task readers read hold changes" ON public.flow_hold_changes FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.flow_tasks t WHERE t.id = task_id));

-- Writes on Core-board holds require a live handle grant (or Admin).
CREATE OR REPLACE FUNCTION public.core_guard_escalation() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_req uuid;
BEGIN
  SELECT public.core_board_request(t.board_id) INTO v_req FROM flow_tasks t WHERE t.id = NEW.task_id;
  IF v_req IS NULL THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    IF NOT public.core_can_handle(auth.uid(), v_req) THEN RAISE EXCEPTION 'Your access to this Core request has ended or does not allow holds' USING ERRCODE='insufficient_privilege'; END IF;
    IF NEW.reviewer_id IS NOT NULL AND NOT public.core_can_handle(NEW.reviewer_id, v_req) THEN RAISE EXCEPTION 'That reviewer has no active access to this Core request' USING ERRCODE='check_violation'; END IF;
  ELSIF NEW.cleared_at IS NOT NULL AND OLD.cleared_at IS NULL AND NOT NEW.cleared_by_override AND NOT public.core_can_handle(auth.uid(), v_req) THEN
    RAISE EXCEPTION 'Your access to this Core request has ended' USING ERRCODE='insufficient_privilege';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER core_guard_escalation BEFORE INSERT OR UPDATE ON public.flow_escalations FOR EACH ROW EXECUTE FUNCTION public.core_guard_escalation();

-- Owner grants and revokes.
CREATE OR REPLACE FUNCTION public.core_grant_access(_request uuid, _email text, _scope text, _purpose text, _expires timestamptz) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE r public.core_requests; v_staff uuid; v_id uuid; v_old public.core_access_grants;
BEGIN
  SELECT * INTO r FROM core_requests WHERE id = _request FOR UPDATE;
  IF r.id IS NULL OR auth.uid() IS NULL OR public.organization_role(auth.uid(), r.organization_id) IS DISTINCT FROM 'owner'::public.organization_member_role THEN
    RAISE EXCEPTION 'Only the company owner can grant access to a Core request' USING ERRCODE='insufficient_privilege'; END IF;
  IF r.status NOT IN ('submitted','accepted','awaiting_owner') THEN RAISE EXCEPTION 'This request is finished; access cannot be granted' USING ERRCODE='check_violation'; END IF;
  IF _scope NOT IN ('read','handle') THEN RAISE EXCEPTION 'Choose a scope' USING ERRCODE='check_violation'; END IF;
  IF char_length(btrim(coalesce(_purpose,''))) NOT BETWEEN 10 AND 300 THEN RAISE EXCEPTION 'Describe the purpose (10 to 300 characters)' USING ERRCODE='check_violation'; END IF;
  IF _expires IS NULL OR _expires <= now() OR _expires > now() + interval '90 days' THEN RAISE EXCEPTION 'Choose an end date within the next 90 days' USING ERRCODE='check_violation'; END IF;
  SELECT u.id INTO v_staff FROM auth.users u WHERE lower(u.email) = lower(btrim(_email));
  IF v_staff IS NULL OR NOT public.has_staff_role(v_staff) OR public.has_role(v_staff,'admin') THEN
    RAISE EXCEPTION 'That email is not an Opsirix staff account that can be assigned' USING ERRCODE='check_violation'; END IF;
  SELECT * INTO v_old FROM core_access_grants WHERE request_id = r.id AND staff_user_id = v_staff AND revoked_at IS NULL;
  IF v_old.id IS NOT NULL THEN UPDATE core_access_grants SET revoked_at = now(), revoked_by = auth.uid() WHERE id = v_old.id; END IF;
  INSERT INTO core_access_grants (request_id, organization_id, staff_user_id, scope, purpose, expires_at, granted_by)
  VALUES (r.id, r.organization_id, v_staff, _scope, btrim(_purpose), _expires, auth.uid()) RETURNING id INTO v_id;
  INSERT INTO audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary, metadata)
  VALUES (r.organization_id, auth.uid(), 'core.access_granted', 'core', r.id::text, 'Staff access to Core request ' || r.ref || ' granted' || CASE WHEN v_old.id IS NOT NULL THEN ' (replaces earlier grant)' ELSE '' END || '.',
    jsonb_build_object('ref', r.ref, 'scope', _scope, 'expires_at', _expires, 'staff_user_id', v_staff, 'grant_id', v_id));
  RETURN v_id;
END $$;

CREATE OR REPLACE FUNCTION public.core_revoke_access(_grant uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE g public.core_access_grants; v_ref text;
BEGIN
  SELECT * INTO g FROM core_access_grants WHERE id = _grant FOR UPDATE;
  IF g.id IS NULL OR auth.uid() IS NULL OR public.organization_role(auth.uid(), g.organization_id) IS DISTINCT FROM 'owner'::public.organization_member_role THEN
    RAISE EXCEPTION 'Only the company owner can revoke this access' USING ERRCODE='insufficient_privilege'; END IF;
  IF g.revoked_at IS NOT NULL THEN RAISE EXCEPTION 'Already revoked' USING ERRCODE='check_violation'; END IF;
  UPDATE core_access_grants SET revoked_at = now(), revoked_by = auth.uid() WHERE id = g.id;
  SELECT ref INTO v_ref FROM core_requests WHERE id = g.request_id;
  INSERT INTO audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary, metadata)
  VALUES (g.organization_id, auth.uid(), 'core.access_revoked', 'core', g.request_id::text, 'Staff access to Core request ' || v_ref || ' revoked.',
    jsonb_build_object('ref', v_ref, 'scope', g.scope, 'staff_user_id', g.staff_user_id, 'grant_id', g.id, 'was_expired', g.expires_at <= now()));
END $$;

CREATE OR REPLACE FUNCTION public.core_access_list(_request uuid)
RETURNS TABLE(id uuid, request_id uuid, staff_user_id uuid, staff_label text, scope text, purpose text, expires_at timestamptz, created_at timestamptz, revoked_at timestamptz, state text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid; v_full boolean;
BEGIN
  SELECT organization_id INTO v_org FROM core_requests WHERE core_requests.id = _request;
  IF v_org IS NULL OR auth.uid() IS NULL THEN RETURN; END IF;
  v_full := public.has_role(auth.uid(),'admin') OR public.organization_role(auth.uid(), v_org) = 'owner'::public.organization_member_role;
  RETURN QUERY SELECT g.id, g.request_id, g.staff_user_id, coalesce(nullif(p.full_name,''), p.email, 'Opsirix staff'), g.scope, g.purpose, g.expires_at, g.created_at, g.revoked_at,
    CASE WHEN g.revoked_at IS NOT NULL THEN 'revoked' WHEN g.expires_at <= now() THEN 'expired' ELSE 'active' END
  FROM core_access_grants g LEFT JOIN profiles p ON p.id = g.staff_user_id
  WHERE g.request_id = _request AND (v_full OR g.staff_user_id = auth.uid())
  ORDER BY g.created_at DESC;
END $$;
REVOKE ALL ON FUNCTION public.core_grant_access(uuid,text,text,text,timestamptz), public.core_revoke_access(uuid), public.core_access_list(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.core_grant_access(uuid,text,text,text,timestamptz), public.core_revoke_access(uuid), public.core_access_list(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.core_guard_escalation() FROM public, anon, authenticated;

-- Transitions and task writes now require a live request grant with handle scope (or Admin).
CREATE OR REPLACE FUNCTION public.core_transition(_request uuid, _action text, _note text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.core_requests; v_staff boolean; v_editor boolean; v_to text; v_board uuid;
BEGIN
  SELECT * INTO r FROM core_requests WHERE id = _request FOR UPDATE;
  IF r.id IS NULL OR auth.uid() IS NULL OR NOT public.core_can_read(auth.uid(), r.id) THEN RAISE EXCEPTION 'Request not found' USING ERRCODE='no_data_found'; END IF;
  v_staff := public.organization_role(auth.uid(), r.organization_id) IS NULL AND public.core_can_handle(auth.uid(), r.id);
  v_editor := public.flow_can_edit(auth.uid(), r.organization_id);
  IF _action = 'accept' AND v_staff AND r.status = 'submitted' THEN v_to := 'accepted';
  ELSIF _action = 'decline' AND v_staff AND r.status = 'submitted' THEN v_to := 'declined';
    IF char_length(btrim(coalesce(_note,''))) < 10 THEN RAISE EXCEPTION 'Give the company a written reason (10+ characters)' USING ERRCODE='check_violation'; END IF;
  ELSIF _action = 'ready' AND v_staff AND r.status = 'accepted' THEN v_to := 'awaiting_owner';
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

CREATE OR REPLACE FUNCTION public.core_save_task(_request uuid, _task uuid, _title text, _due date, _status text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.core_requests; v uuid := _task; t public.flow_tasks;
BEGIN
  SELECT * INTO r FROM core_requests WHERE id = _request;
  IF r.id IS NULL OR auth.uid() IS NULL OR public.organization_role(auth.uid(), r.organization_id) IS NOT NULL OR NOT public.core_can_handle(auth.uid(), r.id) THEN
    RAISE EXCEPTION 'Only Opsirix staff with active handling access to this request can change its tasks' USING ERRCODE='insufficient_privilege'; END IF;
  IF r.status <> 'accepted' OR r.board_id IS NULL THEN RAISE EXCEPTION 'Tasks can only change while the request is in progress' USING ERRCODE='check_violation'; END IF;
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