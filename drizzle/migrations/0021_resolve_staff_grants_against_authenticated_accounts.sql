CREATE OR REPLACE FUNCTION public.set_staff_access_by_email(_organization_id uuid, _email text, _enabled boolean, _expires_at timestamptz DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_staff uuid;
BEGIN
  IF v_actor IS NULL OR public.organization_role(v_actor, _organization_id) <> 'owner' THEN
    RAISE EXCEPTION 'Only the company owner can manage staff access to this workspace' USING ERRCODE = 'insufficient_privilege';
  END IF;

  SELECT u.id INTO v_staff
  FROM auth.users u
  WHERE lower(u.email) = lower(btrim(_email))
    AND public.has_staff_role(u.id)
  LIMIT 1;

  IF v_staff IS NULL THEN
    RAISE EXCEPTION 'No approved staff account matches that email' USING ERRCODE = 'no_data_found';
  END IF;
  IF v_staff = v_actor THEN
    RAISE EXCEPTION 'You cannot grant staff access to yourself' USING ERRCODE = 'check_violation';
  END IF;

  INSERT INTO public.staff_access_grants (organization_id, staff_user_id, scope, granted_by, expires_at, revoked_at)
  VALUES (_organization_id, v_staff, 'workspace_summary', v_actor, _expires_at, CASE WHEN _enabled THEN NULL ELSE now() END)
  ON CONFLICT (organization_id, staff_user_id, scope)
  DO UPDATE SET granted_by = v_actor, expires_at = _expires_at, revoked_at = CASE WHEN _enabled THEN NULL ELSE now() END;

  INSERT INTO public.audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary, metadata)
  VALUES (_organization_id, v_actor, CASE WHEN _enabled THEN 'staff_access.granted' ELSE 'staff_access.revoked' END,
    'staff_access_grant', v_staff::text, CASE WHEN _enabled THEN 'Staff workspace access granted.' ELSE 'Staff workspace access revoked.' END,
    jsonb_build_object('scope', 'workspace_summary', 'expires_at', _expires_at));
END
$$;
REVOKE EXECUTE ON FUNCTION public.set_staff_access_by_email(uuid, text, boolean, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_staff_access_by_email(uuid, text, boolean, timestamptz) TO authenticated;