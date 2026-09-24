CREATE OR REPLACE FUNCTION public.rename_company_workspace(_organization_id uuid, _name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_name text := btrim(_name);
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'insufficient_privilege'; END IF;
  IF public.organization_role(v_user, _organization_id) <> 'owner' THEN
    RAISE EXCEPTION 'Only a company owner can rename this workspace' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF char_length(v_name) < 2 OR char_length(v_name) > 160 THEN
    RAISE EXCEPTION 'Company name must be between 2 and 160 characters' USING ERRCODE = 'check_violation';
  END IF;
  UPDATE public.organizations SET name = v_name, updated_at = now() WHERE id = _organization_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Company workspace not found' USING ERRCODE = 'no_data_found'; END IF;
  INSERT INTO public.audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary)
  VALUES (_organization_id, v_user, 'workspace.renamed', 'organization', _organization_id::text, 'Company workspace name updated.');
END
$$;

CREATE OR REPLACE FUNCTION public.set_organization_member(_organization_id uuid, _user_id uuid, _role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_role public.organization_member_role;
BEGIN
  IF v_actor IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'insufficient_privilege'; END IF;
  IF public.organization_role(v_actor, _organization_id) <> 'owner' THEN
    RAISE EXCEPTION 'Only a company owner can manage members' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF _user_id = v_actor AND _role <> 'owner' THEN
    RAISE EXCEPTION 'Owners cannot lower their own access' USING ERRCODE = 'check_violation';
  END IF;
  IF _role NOT IN ('owner','member','viewer') THEN
    RAISE EXCEPTION 'Invalid company role' USING ERRCODE = 'check_violation';
  END IF;
  v_role := _role::public.organization_member_role;
  INSERT INTO public.organization_members (organization_id, user_id, role, added_by)
  VALUES (_organization_id, _user_id, v_role, v_actor)
  ON CONFLICT (organization_id, user_id)
  DO UPDATE SET role = EXCLUDED.role, added_by = v_actor, updated_at = now();
  INSERT INTO public.audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary, metadata)
  VALUES (_organization_id, v_actor, 'membership.updated', 'organization_member', _user_id::text, 'Company membership updated.', jsonb_build_object('role', _role));
END
$$;

REVOKE EXECUTE ON FUNCTION public.has_staff_role(uuid, text[]) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.organization_role(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_access_organization(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_active_staff_grant(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.create_company_workspace(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rename_company_workspace(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_organization_member(uuid, uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_staff_role(uuid, text, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_staff_access_grant(uuid, uuid, boolean, timestamptz) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_staff_access_by_email(uuid, text, boolean, timestamptz) FROM PUBLIC, anon;