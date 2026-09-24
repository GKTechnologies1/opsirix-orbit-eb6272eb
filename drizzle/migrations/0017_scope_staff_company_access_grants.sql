CREATE TABLE public.staff_access_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  staff_user_id uuid NOT NULL,
  scope text NOT NULL DEFAULT 'workspace_summary' CHECK (scope IN ('workspace_summary')),
  granted_by uuid NOT NULL,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, staff_user_id, scope)
);
GRANT SELECT ON public.staff_access_grants TO authenticated;
GRANT ALL ON public.staff_access_grants TO service_role;
ALTER TABLE public.staff_access_grants ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_active_staff_grant(_user_id uuid, _organization_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_access_grants
    WHERE staff_user_id = _user_id
      AND organization_id = _organization_id
      AND revoked_at IS NULL
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;
GRANT EXECUTE ON FUNCTION public.has_active_staff_grant(uuid, uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.can_access_organization(_user_id uuid, _organization_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
    OR EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE user_id = _user_id AND organization_id = _organization_id
    )
    OR (public.has_staff_role(_user_id) AND public.has_active_staff_grant(_user_id, _organization_id))
$$;

CREATE POLICY "Staff read own active grants"
ON public.staff_access_grants FOR SELECT TO authenticated
USING (staff_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_staff_access_grant(_organization_id uuid, _staff_user_id uuid, _enabled boolean, _expires_at timestamptz DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
BEGIN
  IF v_actor IS NULL OR public.organization_role(v_actor, _organization_id) <> 'owner' THEN
    RAISE EXCEPTION 'Only the company owner can manage staff access to this workspace' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF NOT public.has_staff_role(_staff_user_id) THEN
    RAISE EXCEPTION 'Access can be granted only to an approved staff account' USING ERRCODE = 'check_violation';
  END IF;
  IF _staff_user_id = v_actor THEN
    RAISE EXCEPTION 'You cannot grant staff access to yourself' USING ERRCODE = 'check_violation';
  END IF;

  INSERT INTO public.staff_access_grants (organization_id, staff_user_id, scope, granted_by, expires_at, revoked_at)
  VALUES (_organization_id, _staff_user_id, 'workspace_summary', v_actor, _expires_at, CASE WHEN _enabled THEN NULL ELSE now() END)
  ON CONFLICT (organization_id, staff_user_id, scope)
  DO UPDATE SET granted_by = v_actor, expires_at = _expires_at, revoked_at = CASE WHEN _enabled THEN NULL ELSE now() END;

  INSERT INTO public.audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary, metadata)
  VALUES (_organization_id, v_actor, CASE WHEN _enabled THEN 'staff_access.granted' ELSE 'staff_access.revoked' END,
    'staff_access_grant', _staff_user_id::text, CASE WHEN _enabled THEN 'Staff workspace access granted.' ELSE 'Staff workspace access revoked.' END,
    jsonb_build_object('scope', 'workspace_summary', 'expires_at', _expires_at));
END
$$;
GRANT EXECUTE ON FUNCTION public.set_staff_access_grant(uuid, uuid, boolean, timestamptz) TO authenticated;

CREATE INDEX staff_access_grants_staff_idx ON public.staff_access_grants(staff_user_id, organization_id) WHERE revoked_at IS NULL;
COMMENT ON TABLE public.staff_access_grants IS 'Founder-controlled, revocable access to company workspace summaries. Never grants Vault access or access to client content.';