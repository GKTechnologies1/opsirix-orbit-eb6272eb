CREATE OR REPLACE FUNCTION public.flow_can_edit(_user uuid, _org uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(public.organization_role(_user, _org) = 'owner'
    OR (public.organization_role(_user, _org) = 'member' AND EXISTS (SELECT 1 FROM flow_editors e WHERE e.organization_id = _org AND e.user_id = _user)), false)
$$;