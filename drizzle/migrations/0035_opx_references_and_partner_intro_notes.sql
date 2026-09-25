CREATE SEQUENCE IF NOT EXISTS public.opx_reference_seq START 1 NO CYCLE;

CREATE TABLE public.opx_references (
  number bigint PRIMARY KEY DEFAULT nextval('public.opx_reference_seq'),
  organization_id uuid UNIQUE REFERENCES public.organizations(id),
  partner_application_id uuid UNIQUE REFERENCES public.partner_applications(id),
  merged_into bigint REFERENCES public.opx_references(number),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT opx_has_subject CHECK (organization_id IS NOT NULL OR partner_application_id IS NOT NULL OR merged_into IS NOT NULL)
);
ALTER SEQUENCE public.opx_reference_seq OWNED BY public.opx_references.number;
GRANT SELECT ON public.opx_references TO authenticated;
GRANT ALL ON public.opx_references TO service_role;
ALTER TABLE public.opx_references ENABLE ROW LEVEL SECURITY;
CREATE POLICY "opx read own or staff" ON public.opx_references FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(),'admin')
  OR (organization_id IS NOT NULL AND public.can_access_organization(auth.uid(), organization_id))
  OR (partner_application_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.partner_applications a WHERE a.id=partner_application_id AND a.user_id=auth.uid()))
);

CREATE OR REPLACE FUNCTION public.opx_format(_n bigint) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT 'OPX-'||lpad(_n::text,6,'0') $$;

-- Organizations get a number on creation; partner applications when first submitted (drafts do not).
CREATE OR REPLACE FUNCTION public.opx_assign_org() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN INSERT INTO public.opx_references(organization_id) VALUES (NEW.id) ON CONFLICT (organization_id) DO NOTHING; RETURN NEW; END $$;
CREATE TRIGGER opx_assign_org AFTER INSERT ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.opx_assign_org();

CREATE OR REPLACE FUNCTION public.opx_assign_app() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.status <> 'draft' THEN
    INSERT INTO public.opx_references(partner_application_id) VALUES (NEW.id) ON CONFLICT (partner_application_id) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER opx_assign_app AFTER INSERT OR UPDATE OF status ON public.partner_applications FOR EACH ROW EXECUTE FUNCTION public.opx_assign_app();

-- Backfill in creation order across both kinds; one number each, no auto-merge.
INSERT INTO public.opx_references(organization_id, partner_application_id, created_at)
SELECT org_id, app_id, created_at FROM (
  SELECT id org_id, NULL::uuid app_id, created_at FROM public.organizations
  UNION ALL SELECT NULL, id, created_at FROM public.partner_applications WHERE status <> 'draft'
) s ORDER BY created_at;

-- Admin-only merge: keeps the lower number, retires the other permanently (never reused).
CREATE OR REPLACE FUNCTION public.admin_merge_opx(_keep bigint, _retire bigint) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE k public.opx_references; r public.opx_references;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Only the Admin/CEO can merge references'; END IF;
  SELECT * INTO k FROM public.opx_references WHERE number=_keep FOR UPDATE;
  SELECT * INTO r FROM public.opx_references WHERE number=_retire FOR UPDATE;
  IF k.number IS NULL OR r.number IS NULL OR k.merged_into IS NOT NULL OR r.merged_into IS NOT NULL OR _keep=_retire THEN RAISE EXCEPTION 'Both references must exist and be active'; END IF;
  IF (k.organization_id IS NOT NULL AND r.organization_id IS NOT NULL) OR (k.partner_application_id IS NOT NULL AND r.partner_application_id IS NOT NULL) THEN RAISE EXCEPTION 'Only a company workspace and a partner application can be merged'; END IF;
  UPDATE public.opx_references SET organization_id=NULL, partner_application_id=NULL, merged_into=_keep WHERE number=_retire;
  UPDATE public.opx_references SET organization_id=coalesce(k.organization_id,r.organization_id), partner_application_id=coalesce(k.partner_application_id,r.partner_application_id) WHERE number=_keep;
  INSERT INTO public.audit_events(organization_id, actor_id, event_type, subject_type, subject_id, summary, metadata)
  VALUES (coalesce(k.organization_id,r.organization_id), auth.uid(), 'opx_merged', 'opx_reference', public.opx_format(_keep), public.opx_format(_retire)||' merged into '||public.opx_format(_keep), '{}'::jsonb);
END $$;
REVOKE ALL ON FUNCTION public.admin_merge_opx(bigint,bigint) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_merge_opx(bigint,bigint) TO authenticated;

-- Admin search by number or name.
CREATE OR REPLACE FUNCTION public.admin_search_opx(_q text) RETURNS TABLE(reference text, kind text, name text, status text, merged_into text, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE n bigint := nullif(regexp_replace(coalesce(_q,''),'\D','','g'),'')::bigint;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Only the Admin/CEO can search references'; END IF;
  RETURN QUERY SELECT public.opx_format(r.number),
    CASE WHEN r.merged_into IS NOT NULL THEN 'Merged' WHEN r.organization_id IS NOT NULL AND r.partner_application_id IS NOT NULL THEN 'Company and partner' WHEN r.organization_id IS NOT NULL THEN 'Company' ELSE 'Partner' END,
    coalesce(o.name, a.organization_name, ''), coalesce(a.status::text, ''), CASE WHEN r.merged_into IS NULL THEN NULL ELSE public.opx_format(r.merged_into) END, r.created_at
  FROM public.opx_references r LEFT JOIN public.organizations o ON o.id=r.organization_id LEFT JOIN public.partner_applications a ON a.id=r.partner_application_id
  WHERE coalesce(_q,'')='' OR r.number=n OR coalesce(o.name,'') ILIKE '%'||_q||'%' OR coalesce(a.organization_name,'') ILIKE '%'||_q||'%'
  ORDER BY r.number LIMIT 200;
END $$;
REVOKE ALL ON FUNCTION public.admin_search_opx(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_search_opx(text) TO authenticated;

-- Partner introductions: private workspace notes, personal read and follow-up state.
CREATE OR REPLACE FUNCTION public.partner_owns_intro(_intro uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM public.nexus_introductions i WHERE i.id=_intro AND i.partner_user_id=auth.uid() AND i.status='sent') $$;

CREATE TABLE public.partner_intro_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  introduction_id uuid NOT NULL REFERENCES public.nexus_introductions(id),
  author_id uuid NOT NULL DEFAULT auth.uid(),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.partner_intro_notes TO authenticated;
GRANT ALL ON public.partner_intro_notes TO service_role;
ALTER TABLE public.partner_intro_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partner notes read" ON public.partner_intro_notes FOR SELECT TO authenticated USING (public.partner_owns_intro(introduction_id));
CREATE POLICY "partner notes add" ON public.partner_intro_notes FOR INSERT TO authenticated WITH CHECK (author_id=auth.uid() AND public.partner_owns_intro(introduction_id));
CREATE POLICY "partner notes delete own" ON public.partner_intro_notes FOR DELETE TO authenticated USING (author_id=auth.uid() AND public.partner_owns_intro(introduction_id));

CREATE TABLE public.partner_intro_state (
  introduction_id uuid NOT NULL REFERENCES public.nexus_introductions(id),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  read_at timestamptz,
  follow_up boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (introduction_id, user_id)
);
GRANT SELECT, INSERT, UPDATE ON public.partner_intro_state TO authenticated;
GRANT ALL ON public.partner_intro_state TO service_role;
ALTER TABLE public.partner_intro_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "intro state own read" ON public.partner_intro_state FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE POLICY "intro state own insert" ON public.partner_intro_state FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid() AND public.partner_owns_intro(introduction_id));
CREATE POLICY "intro state own update" ON public.partner_intro_state FOR UPDATE TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid() AND public.partner_owns_intro(introduction_id));