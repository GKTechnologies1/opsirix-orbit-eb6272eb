-- Admin/CEO receives Core oversight metadata only unless the company owner grants request-scoped access.
CREATE OR REPLACE FUNCTION public.core_can_handle(_user uuid, _request uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(public.has_staff_role(_user) AND EXISTS (
    SELECT 1 FROM core_access_grants g
    WHERE g.request_id = _request
      AND g.staff_user_id = _user
      AND g.scope = 'handle'
      AND g.revoked_at IS NULL
      AND g.expires_at > now()
  ), false)
$$;

CREATE OR REPLACE FUNCTION public.core_can_read(_user uuid, _request uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(
    EXISTS (
      SELECT 1 FROM core_requests r
      JOIN organization_members m ON m.organization_id = r.organization_id
      WHERE r.id = _request AND m.user_id = _user
    )
    OR (public.has_staff_role(_user) AND EXISTS (
      SELECT 1 FROM core_access_grants g
      WHERE g.request_id = _request
        AND g.staff_user_id = _user
        AND g.revoked_at IS NULL
        AND g.expires_at > now()
    )), false)
$$;

CREATE OR REPLACE FUNCTION public.core_admin_oversight()
RETURNS TABLE(
  id uuid,
  ref text,
  organization_id uuid,
  organization_name text,
  title text,
  status text,
  requested_by uuid,
  handled_by uuid,
  board_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  events jsonb,
  access_grants jsonb
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT r.id, r.ref, r.organization_id, o.name, r.title, r.status,
    r.requested_by, r.handled_by, r.board_id, r.created_at, r.updated_at,
    coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'id', e.id,
        'from_status', e.from_status,
        'to_status', e.to_status,
        'note', e.note,
        'actor_id', e.actor_id,
        'created_at', e.created_at
      ) ORDER BY e.created_at)
      FROM core_request_events e WHERE e.request_id = r.id
    ), '[]'::jsonb),
    coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'id', g.id,
        'staff_user_id', g.staff_user_id,
        'staff_label', coalesce(nullif(p.full_name,''), p.email, 'Opsirix staff'),
        'scope', g.scope,
        'purpose', g.purpose,
        'expires_at', g.expires_at,
        'created_at', g.created_at,
        'revoked_at', g.revoked_at,
        'state', CASE WHEN g.revoked_at IS NOT NULL THEN 'revoked' WHEN g.expires_at <= now() THEN 'expired' ELSE 'active' END
      ) ORDER BY g.created_at DESC)
      FROM core_access_grants g LEFT JOIN profiles p ON p.id = g.staff_user_id
      WHERE g.request_id = r.id
    ), '[]'::jsonb)
  FROM core_requests r
  JOIN organizations o ON o.id = r.organization_id
  ORDER BY r.created_at DESC;
END $$;
REVOKE ALL ON FUNCTION public.core_admin_oversight() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.core_admin_oversight() TO authenticated;

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
  IF v_staff IS NULL OR NOT public.has_staff_role(v_staff) THEN
    RAISE EXCEPTION 'That email is not an Opsirix staff account that can be assigned' USING ERRCODE='check_violation'; END IF;
  SELECT * INTO v_old FROM core_access_grants WHERE request_id = r.id AND staff_user_id = v_staff AND revoked_at IS NULL;
  IF v_old.id IS NOT NULL THEN UPDATE core_access_grants SET revoked_at = now(), revoked_by = auth.uid() WHERE id = v_old.id; END IF;
  INSERT INTO core_access_grants (request_id, organization_id, staff_user_id, scope, purpose, expires_at, granted_by)
  VALUES (r.id, r.organization_id, v_staff, _scope, btrim(_purpose), _expires, auth.uid()) RETURNING core_access_grants.id INTO v_id;
  INSERT INTO audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary, metadata)
  VALUES (r.organization_id, auth.uid(), 'core.access_granted', 'core', r.id::text, 'Staff access to Core request ' || r.ref || ' granted' || CASE WHEN v_old.id IS NOT NULL THEN ' (replaces earlier grant)' ELSE '' END || '.',
    jsonb_build_object('ref', r.ref, 'scope', _scope, 'expires_at', _expires, 'staff_user_id', v_staff, 'grant_id', v_id));
  RETURN v_id;
END $$;

CREATE OR REPLACE FUNCTION public.core_guard_escalation() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_req uuid;
BEGIN
  SELECT public.core_board_request(t.board_id) INTO v_req FROM flow_tasks t WHERE t.id = NEW.task_id;
  IF v_req IS NULL THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    IF NOT public.core_can_handle(auth.uid(), v_req) THEN RAISE EXCEPTION 'Your access to this Core request has ended or does not allow holds' USING ERRCODE='insufficient_privilege'; END IF;
    IF NEW.reviewer_id IS NOT NULL AND NOT public.core_can_handle(NEW.reviewer_id, v_req) THEN RAISE EXCEPTION 'That reviewer has no active handling access to this Core request' USING ERRCODE='check_violation'; END IF;
  ELSIF NEW.cleared_at IS NOT NULL AND OLD.cleared_at IS NULL AND NOT public.core_can_handle(auth.uid(), v_req) THEN
    RAISE EXCEPTION 'Your access to this Core request has ended' USING ERRCODE='insufficient_privilege';
  END IF;
  RETURN NEW;
END $$;

COMMENT ON FUNCTION public.core_admin_oversight() IS 'Admin/CEO metadata-only oversight of Core requests. Excludes request descriptions and Flow task content; full access requires an active owner grant.';
COMMENT ON FUNCTION public.core_can_read(uuid,uuid) IS 'Full Core request and linked Flow content require company membership or an active owner-granted request scope; Admin alone is insufficient.';