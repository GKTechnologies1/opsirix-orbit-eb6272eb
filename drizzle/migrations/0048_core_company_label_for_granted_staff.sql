CREATE OR REPLACE FUNCTION public.core_company_label(_request uuid) RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT o.name FROM core_requests r JOIN organizations o ON o.id = r.organization_id
  WHERE r.id = _request AND public.core_can_read(auth.uid(), r.id)
$$;
REVOKE ALL ON FUNCTION public.core_company_label(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.core_company_label(uuid) TO authenticated;