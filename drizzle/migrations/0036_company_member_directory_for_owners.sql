CREATE OR REPLACE FUNCTION public.company_member_people(_organization_id uuid)
RETURNS TABLE(user_id uuid, full_name text, email text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT p.id, p.full_name, p.email FROM public.organization_members m JOIN public.profiles p ON p.id=m.user_id
  WHERE m.organization_id=_organization_id AND public.organization_role(auth.uid(), _organization_id)='owner'
$$;
REVOKE ALL ON FUNCTION public.company_member_people(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.company_member_people(uuid) TO authenticated;