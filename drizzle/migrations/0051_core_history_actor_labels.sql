-- Actor label for Core history, computed with the caller's own permissions.
-- Owners see company member names; Admin/CEO sees staff names (already visible in grant lists); everyone else sees role labels.
CREATE OR REPLACE FUNCTION public.core_actor_label(_caller uuid, _actor uuid, _org uuid)
 RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_role public.organization_member_role; v_name text; v_caller_owner boolean; v_caller_admin boolean;
BEGIN
  IF _actor IS NULL THEN RETURN 'System'; END IF;
  IF _actor = _caller THEN RETURN 'You'; END IF;
  SELECT nullif(btrim(full_name),'') INTO v_name FROM profiles WHERE id = _actor;
  v_caller_admin := public.has_role(_caller, 'admin');
  v_caller_owner := public.organization_role(_caller, _org) = 'owner'::public.organization_member_role;
  v_role := public.organization_role(_actor, _org);
  IF v_role IS NOT NULL THEN
    IF v_caller_owner AND v_name IS NOT NULL THEN RETURN v_name; END IF;
    RETURN CASE v_role WHEN 'owner' THEN 'Company owner' WHEN 'member' THEN 'Company member' ELSE 'Company viewer' END;
  END IF;
  IF public.has_staff_role(_actor) THEN
    IF v_caller_admin AND v_name IS NOT NULL THEN RETURN v_name || ' (Opsirix staff)'; END IF;
    RETURN 'Opsirix staff';
  END IF;
  RETURN 'Former company member';
END $function$;
REVOKE ALL ON FUNCTION public.core_actor_label(uuid, uuid, uuid) FROM public, anon, authenticated;

-- History for one request: full notes for readers (members / active grant); redacted notes for Admin/CEO oversight; nothing otherwise. No raw actor IDs.
CREATE OR REPLACE FUNCTION public.core_history(_request uuid)
 RETURNS TABLE(id uuid, from_status text, to_status text, note text, note_redacted boolean, actor_label text, created_at timestamptz)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_org uuid; v_read boolean;
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  SELECT organization_id INTO v_org FROM core_requests WHERE core_requests.id = _request;
  IF v_org IS NULL THEN RETURN; END IF;
  v_read := public.core_can_read(auth.uid(), _request);
  IF NOT v_read AND NOT public.has_role(auth.uid(), 'admin') THEN RETURN; END IF;
  RETURN QUERY SELECT e.id, e.from_status, e.to_status,
      CASE WHEN v_read THEN e.note ELSE NULL END,
      (NOT v_read AND e.note IS NOT NULL),
      public.core_actor_label(auth.uid(), e.actor_id, v_org), e.created_at
    FROM core_request_events e WHERE e.request_id = _request ORDER BY e.created_at;
END $function$;
REVOKE ALL ON FUNCTION public.core_history(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.core_history(uuid) TO authenticated;

-- Oversight: events now carry actor_label instead of actor_id.
CREATE OR REPLACE FUNCTION public.core_admin_oversight()
 RETURNS TABLE(id uuid, ref text, organization_id uuid, organization_name text, title text, status text, requested_by uuid, handled_by uuid, board_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, events jsonb, access_grants jsonb)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN RETURN; END IF;
  RETURN QUERY
  SELECT r.id, r.ref, r.organization_id, o.name, r.title, r.status,
    r.requested_by, r.handled_by, r.board_id, r.created_at, r.updated_at,
    coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'id', e.id, 'from_status', e.from_status, 'to_status', e.to_status,
        'note', NULL, 'note_redacted', e.note IS NOT NULL,
        'actor_label', public.core_actor_label(auth.uid(), e.actor_id, r.organization_id),
        'created_at', e.created_at
      ) ORDER BY e.created_at)
      FROM core_request_events e WHERE e.request_id = r.id
    ), '[]'::jsonb),
    coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'id', g.id, 'staff_user_id', g.staff_user_id,
        'staff_label', coalesce(nullif(p.full_name,''), p.email, 'Opsirix staff'),
        'scope', g.scope, 'purpose', g.purpose, 'expires_at', g.expires_at,
        'created_at', g.created_at, 'revoked_at', g.revoked_at,
        'state', CASE WHEN g.revoked_at IS NOT NULL THEN 'revoked' WHEN g.expires_at <= now() THEN 'expired' ELSE 'active' END
      ) ORDER BY g.created_at DESC)
      FROM core_access_grants g LEFT JOIN profiles p ON p.id = g.staff_user_id
      WHERE g.request_id = r.id
    ), '[]'::jsonb)
  FROM core_requests r JOIN organizations o ON o.id = r.organization_id
  ORDER BY r.created_at DESC;
END $function$;