DROP POLICY IF EXISTS "Members and admins read permitted audit history" ON public.audit_events;
CREATE POLICY "Owners and admins read permitted audit history" ON public.audit_events
FOR SELECT TO authenticated USING (
  ((organization_id IS NOT NULL) AND (public.organization_role(auth.uid(), organization_id) = 'owner' OR public.has_role(auth.uid(), 'admin'::app_role)))
  OR ((organization_id IS NULL) AND (public.has_role(auth.uid(), 'admin'::app_role) OR actor_id = auth.uid()))
);

CREATE OR REPLACE FUNCTION public.company_history_view(_organization_id uuid)
RETURNS TABLE(id uuid, organization_id uuid, event_type text, summary text, created_at timestamptz, actor text, details jsonb)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.can_access_organization(auth.uid(), _organization_id) THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT e.id, e.organization_id, e.event_type::text, e.summary::text, e.created_at,
    CASE WHEN e.actor_id = auth.uid() THEN 'You'
         WHEN EXISTS (SELECT 1 FROM organization_members m WHERE m.organization_id = e.organization_id AND m.user_id = e.actor_id) THEN 'A company member'
         ELSE 'Opsirix' END,
    CASE
      WHEN e.event_type = 'membership.updated' AND nullif(e.metadata->>'role','') IS NOT NULL
        THEN jsonb_build_array(jsonb_build_object('label','Access','value', initcap(e.metadata->>'role')))
      WHEN e.event_type = 'workspace.renamed' AND nullif(e.metadata->>'previous_name','') IS NOT NULL
        THEN jsonb_build_array(jsonb_build_object('label','Previous name','value', left(e.metadata->>'previous_name',160)))
      WHEN e.event_type LIKE 'staff_access.%' AND nullif(e.metadata->>'scope','') IS NOT NULL
        THEN jsonb_build_array(jsonb_build_object('label','Scope','value', left(e.metadata->>'scope',160)))
      ELSE '[]'::jsonb END
  FROM audit_events e
  WHERE e.organization_id = _organization_id
  ORDER BY e.created_at DESC
  LIMIT 100;
END $$;
REVOKE ALL ON FUNCTION public.company_history_view(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.company_history_view(uuid) TO authenticated;