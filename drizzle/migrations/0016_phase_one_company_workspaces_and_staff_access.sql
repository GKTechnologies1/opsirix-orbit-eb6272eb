ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'operations_lead';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'compliance_coordinator';

CREATE TYPE public.organization_member_role AS ENUM ('owner', 'member', 'viewer');

CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 2 AND 160),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role public.organization_member_role NOT NULL DEFAULT 'viewer',
  added_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);
GRANT SELECT ON public.organization_members TO authenticated;
GRANT ALL ON public.organization_members TO service_role;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  actor_id uuid NOT NULL,
  event_type text NOT NULL CHECK (char_length(event_type) BETWEEN 3 AND 80),
  subject_type text NOT NULL CHECK (char_length(subject_type) BETWEEN 2 AND 80),
  subject_id text NOT NULL CHECK (char_length(subject_id) BETWEEN 1 AND 160),
  summary text NOT NULL CHECK (char_length(summary) BETWEEN 2 AND 300),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_events TO authenticated;
GRANT ALL ON public.audit_events TO service_role;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_staff_role(_user_id uuid, _roles text[] DEFAULT ARRAY['admin','operations_lead','compliance_coordinator']::text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text = ANY(_roles)
  )
$$;
GRANT EXECUTE ON FUNCTION public.has_staff_role(uuid, text[]) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.organization_role(_user_id uuid, _organization_id uuid)
RETURNS public.organization_member_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.organization_members
  WHERE user_id = _user_id AND organization_id = _organization_id
$$;
GRANT EXECUTE ON FUNCTION public.organization_role(uuid, uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.can_access_organization(_user_id uuid, _organization_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_staff_role(_user_id)
    OR EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE user_id = _user_id AND organization_id = _organization_id
    )
$$;
GRANT EXECUTE ON FUNCTION public.can_access_organization(uuid, uuid) TO authenticated, service_role;

CREATE POLICY "Members and staff read organizations"
ON public.organizations FOR SELECT TO authenticated
USING (public.can_access_organization(auth.uid(), id));

CREATE POLICY "Members and staff read organization membership"
ON public.organization_members FOR SELECT TO authenticated
USING (public.can_access_organization(auth.uid(), organization_id));

CREATE POLICY "Members and staff read permitted audit history"
ON public.audit_events FOR SELECT TO authenticated
USING (
  (organization_id IS NOT NULL AND public.can_access_organization(auth.uid(), organization_id))
  OR (organization_id IS NULL AND public.has_staff_role(auth.uid()))
);

CREATE OR REPLACE FUNCTION public.create_company_workspace(_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_org uuid;
  v_name text := btrim(_name);
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF char_length(v_name) < 2 OR char_length(v_name) > 160 THEN
    RAISE EXCEPTION 'Company name must be between 2 and 160 characters' USING ERRCODE = 'check_violation';
  END IF;

  INSERT INTO public.organizations (name, created_by)
  VALUES (v_name, v_user)
  RETURNING id INTO v_org;

  INSERT INTO public.organization_members (organization_id, user_id, role, added_by)
  VALUES (v_org, v_user, 'owner', v_user);

  INSERT INTO public.audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary)
  VALUES (v_org, v_user, 'workspace.created', 'organization', v_org::text, 'Company workspace created.');

  RETURN v_org;
END
$$;
GRANT EXECUTE ON FUNCTION public.create_company_workspace(text) TO authenticated;

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
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF public.organization_role(v_user, _organization_id) <> 'owner' AND NOT public.has_role(v_user, 'admin') THEN
    RAISE EXCEPTION 'Only a company owner or Admin/CEO can rename this workspace' USING ERRCODE = 'insufficient_privilege';
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
GRANT EXECUTE ON FUNCTION public.rename_company_workspace(uuid, text) TO authenticated;

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
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF public.organization_role(v_actor, _organization_id) <> 'owner' AND NOT public.has_role(v_actor, 'admin') THEN
    RAISE EXCEPTION 'Only a company owner or Admin/CEO can manage members' USING ERRCODE = 'insufficient_privilege';
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
GRANT EXECUTE ON FUNCTION public.set_organization_member(uuid, uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.set_staff_role(_user_id uuid, _role text, _enabled boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_role public.app_role;
BEGIN
  IF v_actor IS NULL OR NOT public.has_role(v_actor, 'admin') THEN
    RAISE EXCEPTION 'Only Admin/CEO can manage staff access' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF _user_id = v_actor THEN
    RAISE EXCEPTION 'You cannot change your own staff access' USING ERRCODE = 'check_violation';
  END IF;
  IF _role NOT IN ('operations_lead','compliance_coordinator') THEN
    RAISE EXCEPTION 'Only approved Phase 1 staff roles can be managed here' USING ERRCODE = 'check_violation';
  END IF;
  v_role := _role::public.app_role;

  IF _enabled THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, v_role) ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    DELETE FROM public.user_roles WHERE user_id = _user_id AND role = v_role;
  END IF;

  INSERT INTO public.audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary, metadata)
  VALUES (NULL, v_actor, CASE WHEN _enabled THEN 'staff_role.granted' ELSE 'staff_role.revoked' END,
    'user_role', _user_id::text, CASE WHEN _enabled THEN 'Staff access granted.' ELSE 'Staff access revoked.' END,
    jsonb_build_object('role', _role));
END
$$;
GRANT EXECUTE ON FUNCTION public.set_staff_role(uuid, text, boolean) TO authenticated;

CREATE INDEX organizations_created_by_idx ON public.organizations(created_by, created_at DESC);
CREATE INDEX organization_members_user_idx ON public.organization_members(user_id, organization_id);
CREATE INDEX audit_events_organization_idx ON public.audit_events(organization_id, created_at DESC);
CREATE INDEX audit_events_actor_idx ON public.audit_events(actor_id, created_at DESC);

COMMENT ON TABLE public.organizations IS 'Shared company identity only; Staff Console private records must use separate tables.';
COMMENT ON TABLE public.audit_events IS 'Append-only operational history. Do not store private note bodies or sensitive founder content.';