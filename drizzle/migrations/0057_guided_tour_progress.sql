CREATE TABLE public.guided_tour_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_key text NOT NULL CHECK (role_key IN ('workspace_switcher','directory_member','founder_owner','editing_member','viewer','partner','operations_lead','compliance_coordinator','admin_ceo')),
  tour_key text NOT NULL CHECK (char_length(tour_key) BETWEEN 3 AND 80),
  tour_version integer NOT NULL CHECK (tour_version > 0),
  current_step integer NOT NULL DEFAULT 0 CHECK (current_step >= 0),
  status text NOT NULL DEFAULT 'started' CHECK (status IN ('started','skipped','completed')),
  started_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (user_id, role_key, tour_key, tour_version)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guided_tour_progress TO authenticated;
GRANT ALL ON public.guided_tour_progress TO service_role;
ALTER TABLE public.guided_tour_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Accounts read own tour progress" ON public.guided_tour_progress FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Accounts create own tour progress" ON public.guided_tour_progress FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Accounts update own tour progress" ON public.guided_tour_progress FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Accounts delete own tour progress" ON public.guided_tour_progress FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX guided_tour_progress_user_idx ON public.guided_tour_progress(user_id, updated_at DESC);

CREATE OR REPLACE FUNCTION public.tour_role_allowed(_user_id uuid, _role_key text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE _role_key
    WHEN 'workspace_switcher' THEN (
      (CASE WHEN public.has_staff_role(_user_id) THEN 1 ELSE 0 END) +
      (CASE WHEN EXISTS (SELECT 1 FROM public.organization_members m WHERE m.user_id = _user_id) THEN 1 ELSE 0 END) +
      (CASE WHEN public.has_role(_user_id, 'partner') OR EXISTS (SELECT 1 FROM public.partner_applications p WHERE p.user_id = _user_id) THEN 1 ELSE 0 END) + 1
    ) > 1
    WHEN 'directory_member' THEN true
    WHEN 'founder_owner' THEN EXISTS (SELECT 1 FROM public.organization_members m WHERE m.user_id = _user_id AND m.role = 'owner')
    WHEN 'editing_member' THEN EXISTS (SELECT 1 FROM public.organization_members m WHERE m.user_id = _user_id AND m.role = 'member')
    WHEN 'viewer' THEN EXISTS (SELECT 1 FROM public.organization_members m WHERE m.user_id = _user_id AND m.role = 'viewer')
    WHEN 'partner' THEN public.has_role(_user_id, 'partner') OR EXISTS (SELECT 1 FROM public.partner_applications p WHERE p.user_id = _user_id)
    WHEN 'operations_lead' THEN public.has_staff_role(_user_id, ARRAY['operations_lead']::text[])
    WHEN 'compliance_coordinator' THEN public.has_staff_role(_user_id, ARRAY['compliance_coordinator']::text[])
    WHEN 'admin_ceo' THEN public.has_role(_user_id, 'admin')
    ELSE false
  END
$$;
GRANT EXECUTE ON FUNCTION public.tour_role_allowed(uuid, text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.save_guided_tour_progress(_role_key text, _tour_key text, _tour_version integer, _current_step integer, _status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL OR NOT public.tour_role_allowed(v_user, _role_key) THEN
    RAISE EXCEPTION 'Tour is not available for current access' USING ERRCODE = '42501';
  END IF;
  IF _status NOT IN ('started','skipped','completed') OR _current_step < 0 OR _tour_version < 1 OR char_length(_tour_key) NOT BETWEEN 3 AND 80 THEN
    RAISE EXCEPTION 'Invalid tour progress' USING ERRCODE = 'check_violation';
  END IF;
  INSERT INTO public.guided_tour_progress(user_id, role_key, tour_key, tour_version, current_step, status, completed_at)
  VALUES (v_user, _role_key, _tour_key, _tour_version, _current_step, _status, CASE WHEN _status = 'completed' THEN now() END)
  ON CONFLICT (user_id, role_key, tour_key, tour_version) DO UPDATE SET
    current_step = EXCLUDED.current_step,
    status = EXCLUDED.status,
    updated_at = now(),
    completed_at = CASE WHEN EXCLUDED.status = 'completed' THEN now() ELSE NULL END;
END
$$;
REVOKE ALL ON FUNCTION public.save_guided_tour_progress(text, text, integer, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_guided_tour_progress(text, text, integer, integer, text) TO authenticated;

COMMENT ON TABLE public.guided_tour_progress IS 'Per-account, verified-role, versioned guided tour state; access is rechecked on every write.';
COMMENT ON FUNCTION public.tour_role_allowed(uuid, text) IS 'Re-evaluates current role and membership so revoked access cannot retain a role tour.';