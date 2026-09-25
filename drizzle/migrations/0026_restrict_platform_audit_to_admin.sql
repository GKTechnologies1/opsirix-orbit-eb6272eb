DROP POLICY IF EXISTS "Members and staff read permitted audit history" ON public.audit_events;
CREATE POLICY "Members and admins read permitted audit history" ON public.audit_events
FOR SELECT TO authenticated
USING (
  (organization_id IS NOT NULL AND public.can_access_organization(auth.uid(), organization_id))
  OR (organization_id IS NULL AND (public.has_role(auth.uid(), 'admin'::app_role) OR actor_id = auth.uid()))
);