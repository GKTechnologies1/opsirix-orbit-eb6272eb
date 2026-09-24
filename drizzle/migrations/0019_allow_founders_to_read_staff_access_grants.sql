CREATE POLICY "Owners read staff grants"
ON public.staff_access_grants FOR SELECT TO authenticated
USING (public.organization_role(auth.uid(), organization_id) = 'owner');