-- Draft partner types (not open for registration) are visible only to admins.
DROP POLICY IF EXISTS "Anyone can read partner types" ON public.service_partner_types;
CREATE POLICY "Read open partner types" ON public.service_partner_types FOR SELECT TO anon, authenticated
  USING (is_open_for_registration OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Anyone can read categories" ON public.service_categories;
CREATE POLICY "Read categories of open types" ON public.service_categories FOR SELECT TO anon, authenticated
  USING (public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.service_partner_types t WHERE t.id = partner_type AND t.is_open_for_registration));
DROP POLICY IF EXISTS "Anyone can read catalog" ON public.service_catalog;
CREATE POLICY "Read catalog of open types" ON public.service_catalog FOR SELECT TO anon, authenticated
  USING (public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.service_partner_types t WHERE t.id = partner_type AND t.is_open_for_registration));

-- Selections and suggestions cannot target draft types, and must reference the caller's own application.
CREATE OR REPLACE FUNCTION public.check_service_selection() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.service_catalog c WHERE c.id = NEW.service_id AND c.partner_type = NEW.partner_type) THEN
    RAISE EXCEPTION 'Service % does not belong to partner type %', NEW.service_id, NEW.partner_type;
  END IF;
  IF TG_OP = 'INSERT' AND NOT EXISTS (SELECT 1 FROM public.service_catalog c WHERE c.id = NEW.service_id AND c.is_active) THEN
    RAISE EXCEPTION 'Service % is retired and cannot be newly selected', NEW.service_id;
  END IF;
  IF NOT public.has_role(auth.uid(), 'admin') AND auth.role() <> 'service_role' THEN
    IF NOT EXISTS (SELECT 1 FROM public.service_partner_types t WHERE t.id = NEW.partner_type AND t.is_open_for_registration) THEN
      RAISE EXCEPTION 'This partner type is not open for registration yet';
    END IF;
    IF NEW.application_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.partner_applications a WHERE a.id = NEW.application_id AND a.user_id = NEW.user_id) THEN
      RAISE EXCEPTION 'Application does not belong to this account';
    END IF;
    NEW.review_status := 'draft';
    NEW.qualification_verified := false;
  END IF;
  IF NEW.is_featured AND (SELECT count(*) FROM public.partner_service_selections s WHERE s.user_id = NEW.user_id AND s.is_featured AND s.id <> NEW.id) >= 3 THEN
    RAISE EXCEPTION 'You can feature up to three services';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.force_pending_suggestion() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') AND auth.role() <> 'service_role' THEN
    IF NOT EXISTS (SELECT 1 FROM public.service_partner_types t WHERE t.id = NEW.partner_type AND t.is_open_for_registration) THEN
      RAISE EXCEPTION 'This partner type is not open for registration yet';
    END IF;
    NEW.status := 'pending'; NEW.reviewed_by := NULL; NEW.reviewed_at := NULL; NEW.resulting_service_id := NULL;
  END IF;
  RETURN NEW;
END $$;

-- Private representative and license records must belong to the caller's own application.
DROP POLICY IF EXISTS "Owners insert own track details" ON public.partner_track_details;
CREATE POLICY "Owners insert own track details" ON public.partner_track_details FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND authority_verified = false
    AND EXISTS (SELECT 1 FROM public.partner_applications a WHERE a.id = application_id AND a.user_id = auth.uid()));
DROP POLICY IF EXISTS "Owners or admins update track details" ON public.partner_track_details;
CREATE POLICY "Owners or admins update track details" ON public.partner_track_details FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR (auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.partner_applications a WHERE a.id = application_id AND a.user_id = auth.uid())));
DROP POLICY IF EXISTS "Owners add pending licenses" ON public.partner_licenses;
CREATE POLICY "Owners add pending licenses" ON public.partner_licenses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND review_status = 'pending' AND reviewed_by IS NULL
    AND EXISTS (SELECT 1 FROM public.partner_applications a WHERE a.id = application_id AND a.user_id = auth.uid()));

-- Only admins can publish or unpublish a partner profile.
CREATE OR REPLACE FUNCTION public.guard_profile_publication() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') AND auth.role() <> 'service_role' THEN
    IF TG_OP = 'INSERT' THEN NEW.is_published := false;
    ELSE NEW.is_published := OLD.is_published; END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_profile_publication ON public.partner_profiles;
CREATE TRIGGER guard_profile_publication BEFORE INSERT OR UPDATE ON public.partner_profiles FOR EACH ROW EXECUTE FUNCTION public.guard_profile_publication();