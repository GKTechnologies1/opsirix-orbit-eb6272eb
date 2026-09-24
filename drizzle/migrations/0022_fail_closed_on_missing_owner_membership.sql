CREATE OR REPLACE FUNCTION public.rename_company_workspace(_organization_id uuid, _name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_user uuid := auth.uid(); v_name text := btrim(_name);
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'insufficient_privilege'; END IF;
  IF public.organization_role(v_user, _organization_id) IS DISTINCT FROM 'owner'::public.organization_member_role THEN
    RAISE EXCEPTION 'Only a company owner can rename this workspace' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF char_length(v_name) < 2 OR char_length(v_name) > 160 THEN RAISE EXCEPTION 'Company name must be between 2 and 160 characters' USING ERRCODE = 'check_violation'; END IF;
  UPDATE public.organizations SET name = v_name, updated_at = now() WHERE id = _organization_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Company workspace not found' USING ERRCODE = 'no_data_found'; END IF;
  INSERT INTO public.audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary)
  VALUES (_organization_id, v_user, 'workspace.renamed', 'organization', _organization_id::text, 'Company workspace name updated.');
END
$$;

CREATE OR REPLACE FUNCTION public.set_organization_member(_organization_id uuid, _user_id uuid, _role text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor uuid := auth.uid(); v_role public.organization_member_role;
BEGIN
  IF v_actor IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'insufficient_privilege'; END IF;
  IF public.organization_role(v_actor, _organization_id) IS DISTINCT FROM 'owner'::public.organization_member_role THEN RAISE EXCEPTION 'Only a company owner can manage members' USING ERRCODE = 'insufficient_privilege'; END IF;
  IF _user_id = v_actor AND _role <> 'owner' THEN RAISE EXCEPTION 'Owners cannot lower their own access' USING ERRCODE = 'check_violation'; END IF;
  IF _role NOT IN ('owner','member','viewer') THEN RAISE EXCEPTION 'Invalid company role' USING ERRCODE = 'check_violation'; END IF;
  v_role := _role::public.organization_member_role;
  INSERT INTO public.organization_members (organization_id, user_id, role, added_by) VALUES (_organization_id, _user_id, v_role, v_actor)
  ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role, added_by = v_actor, updated_at = now();
  INSERT INTO public.audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary, metadata)
  VALUES (_organization_id, v_actor, 'membership.updated', 'organization_member', _user_id::text, 'Company membership updated.', jsonb_build_object('role', _role));
END
$$;

CREATE OR REPLACE FUNCTION public.set_staff_access_by_email(_organization_id uuid, _email text, _enabled boolean, _expires_at timestamptz DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE v_actor uuid := auth.uid(); v_staff uuid;
BEGIN
  IF v_actor IS NULL OR public.organization_role(v_actor, _organization_id) IS DISTINCT FROM 'owner'::public.organization_member_role THEN RAISE EXCEPTION 'Only the company owner can manage staff access to this workspace' USING ERRCODE = 'insufficient_privilege'; END IF;
  SELECT u.id INTO v_staff FROM auth.users u WHERE lower(u.email) = lower(btrim(_email)) AND public.has_staff_role(u.id) LIMIT 1;
  IF v_staff IS NULL THEN RAISE EXCEPTION 'No approved staff account matches that email' USING ERRCODE = 'no_data_found'; END IF;
  IF v_staff = v_actor THEN RAISE EXCEPTION 'You cannot grant staff access to yourself' USING ERRCODE = 'check_violation'; END IF;
  INSERT INTO public.staff_access_grants (organization_id, staff_user_id, scope, granted_by, expires_at, revoked_at)
  VALUES (_organization_id, v_staff, 'workspace_summary', v_actor, _expires_at, CASE WHEN _enabled THEN NULL ELSE now() END)
  ON CONFLICT (organization_id, staff_user_id, scope) DO UPDATE SET granted_by = v_actor, expires_at = _expires_at, revoked_at = CASE WHEN _enabled THEN NULL ELSE now() END;
  INSERT INTO public.audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary, metadata)
  VALUES (_organization_id, v_actor, CASE WHEN _enabled THEN 'staff_access.granted' ELSE 'staff_access.revoked' END, 'staff_access_grant', v_staff::text, CASE WHEN _enabled THEN 'Staff workspace access granted.' ELSE 'Staff workspace access revoked.' END, jsonb_build_object('scope', 'workspace_summary', 'expires_at', _expires_at));
END
$$;

CREATE OR REPLACE FUNCTION public.set_staff_access_grant(_organization_id uuid, _staff_user_id uuid, _enabled boolean, _expires_at timestamptz DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor uuid := auth.uid();
BEGIN
  IF v_actor IS NULL OR public.organization_role(v_actor, _organization_id) IS DISTINCT FROM 'owner'::public.organization_member_role THEN RAISE EXCEPTION 'Only the company owner can manage staff access to this workspace' USING ERRCODE = 'insufficient_privilege'; END IF;
  IF NOT public.has_staff_role(_staff_user_id) THEN RAISE EXCEPTION 'Access can be granted only to an approved staff account' USING ERRCODE = 'check_violation'; END IF;
  IF _staff_user_id = v_actor THEN RAISE EXCEPTION 'You cannot grant staff access to yourself' USING ERRCODE = 'check_violation'; END IF;
  INSERT INTO public.staff_access_grants (organization_id, staff_user_id, scope, granted_by, expires_at, revoked_at)
  VALUES (_organization_id, _staff_user_id, 'workspace_summary', v_actor, _expires_at, CASE WHEN _enabled THEN NULL ELSE now() END)
  ON CONFLICT (organization_id, staff_user_id, scope) DO UPDATE SET granted_by = v_actor, expires_at = _expires_at, revoked_at = CASE WHEN _enabled THEN NULL ELSE now() END;
  INSERT INTO public.audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary, metadata)
  VALUES (_organization_id, v_actor, CASE WHEN _enabled THEN 'staff_access.granted' ELSE 'staff_access.revoked' END, 'staff_access_grant', _staff_user_id::text, CASE WHEN _enabled THEN 'Staff workspace access granted.' ELSE 'Staff workspace access revoked.' END, jsonb_build_object('scope', 'workspace_summary', 'expires_at', _expires_at));
END
$$;