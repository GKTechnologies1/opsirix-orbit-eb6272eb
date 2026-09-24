-- Each partner type an organization claims is a separate, owner-created, separately reviewed record.
CREATE TABLE public.partner_listing_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  application_id uuid NOT NULL REFERENCES public.partner_applications(id) ON DELETE CASCADE,
  partner_type_id text NOT NULL REFERENCES public.service_partner_types(id),
  review_status text NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending','approved','changes_requested','declined')),
  review_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, partner_type_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_listing_types TO authenticated;
GRANT SELECT ON public.partner_listing_types TO anon;
GRANT ALL ON public.partner_listing_types TO service_role;
ALTER TABLE public.partner_listing_types ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.partner_profiles
  ADD COLUMN profile_review_status text NOT NULL DEFAULT 'pending' CHECK (profile_review_status IN ('pending','approved','changes_requested')),
  ADD COLUMN profile_reviewed_by uuid,
  ADD COLUMN profile_reviewed_at timestamptz;
COMMENT ON COLUMN public.partner_profiles.partner_type_id IS 'Deprecated. Public types come only from approved partner_listing_types rows.';

-- Is one claimed type publicly visible for this owner?
CREATE OR REPLACE FUNCTION public.listing_type_is_public(_user uuid, _type text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.partner_listing_types lt
    JOIN public.partner_applications a ON a.id = lt.application_id AND a.user_id = lt.user_id
    JOIN public.service_partner_types t ON t.id = lt.partner_type_id
    WHERE lt.user_id = _user AND lt.partner_type_id = _type
      AND lt.review_status = 'approved' AND a.status = 'approved' AND t.is_open_for_registration
      AND EXISTS (SELECT 1 FROM public.partner_service_selections s JOIN public.service_catalog c ON c.id = s.service_id
                  WHERE s.user_id = _user AND s.partner_type = _type AND s.review_status = 'approved' AND c.is_active))
$$;

CREATE OR REPLACE FUNCTION public.profile_is_public(_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.partner_profiles p WHERE p.user_id = _user AND p.is_published AND p.profile_review_status = 'approved')
     AND EXISTS (SELECT 1 FROM public.partner_listing_types lt WHERE lt.user_id = _user AND public.listing_type_is_public(_user, lt.partner_type_id))
$$;
GRANT EXECUTE ON FUNCTION public.listing_type_is_public(uuid, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.profile_is_public(uuid) TO anon, authenticated, service_role;

-- Guard claimed types: owner-created only, type immutable, only admins review, approval needs matching approved application and evidence.
CREATE OR REPLACE FUNCTION public.guard_listing_type()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE is_admin boolean := public.has_role(auth.uid(), 'admin'); v_track text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF auth.uid() IS NULL OR auth.uid() <> NEW.user_id THEN
      RAISE EXCEPTION 'Only the organization itself can claim a partner type' USING ERRCODE = 'check_violation';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.partner_applications a WHERE a.id = NEW.application_id AND a.user_id = NEW.user_id) THEN
      RAISE EXCEPTION 'Application does not belong to this account' USING ERRCODE = 'check_violation';
    END IF;
    NEW.review_status := 'pending'; NEW.reviewed_by := NULL; NEW.reviewed_at := NULL;
    RETURN NEW;
  END IF;
  IF NEW.partner_type_id <> OLD.partner_type_id OR NEW.user_id <> OLD.user_id OR NEW.application_id <> OLD.application_id THEN
    RAISE EXCEPTION 'A claimed partner type cannot be relabeled; the organization must claim the other type separately' USING ERRCODE = 'check_violation';
  END IF;
  IF NOT is_admin THEN
    NEW.review_status := OLD.review_status; NEW.reviewed_by := OLD.reviewed_by; NEW.reviewed_at := OLD.reviewed_at; NEW.review_note := OLD.review_note;
    RETURN NEW;
  END IF;
  IF NEW.review_status = 'approved' AND OLD.review_status <> 'approved' THEN
    IF NOT EXISTS (SELECT 1 FROM public.partner_applications a WHERE a.id = NEW.application_id AND a.user_id = NEW.user_id AND a.status = 'approved') THEN
      RAISE EXCEPTION 'Type approval rejected: the application is not approved' USING ERRCODE = 'check_violation';
    END IF;
    SELECT track INTO v_track FROM public.service_partner_types WHERE id = NEW.partner_type_id;
    IF v_track IN ('institution','brokerage') AND NOT EXISTS (
      SELECT 1 FROM public.partner_track_details d WHERE d.application_id = NEW.application_id AND d.track = v_track AND d.authority_verified) THEN
      RAISE EXCEPTION 'Type approval rejected: representative authority is not verified' USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.partner_type_id = 'insurance' AND NOT EXISTS (
      SELECT 1 FROM public.partner_licenses l WHERE l.application_id = NEW.application_id AND l.review_status = 'verified') THEN
      RAISE EXCEPTION 'Type approval rejected: no verified insurance license' USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  IF NEW.review_status IS DISTINCT FROM OLD.review_status THEN
    NEW.reviewed_by := auth.uid(); NEW.reviewed_at := now();
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER guard_listing_type BEFORE INSERT OR UPDATE ON public.partner_listing_types
  FOR EACH ROW EXECUTE FUNCTION public.guard_listing_type();

CREATE POLICY "Owners read own claimed types" ON public.partner_listing_types FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners claim types" ON public.partner_listing_types FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners withdraw unapproved types" ON public.partner_listing_types FOR DELETE TO authenticated USING (auth.uid() = user_id AND review_status <> 'approved');
CREATE POLICY "Admins read claimed types" ON public.partner_listing_types FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins review claimed types" ON public.partner_listing_types FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Public reads publicly listed types" ON public.partner_listing_types FOR SELECT TO anon, authenticated
  USING (public.profile_is_public(user_id) AND public.listing_type_is_public(user_id, partner_type_id));

-- Profiles: owner edits send the profile back to review; publishing needs a reviewed profile plus at least one publicly listable type.
CREATE OR REPLACE FUNCTION public.guard_profile_publication()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE is_admin boolean := public.has_role(auth.uid(),'admin');
BEGIN
  IF NOT is_admin THEN
    IF TG_OP = 'INSERT' THEN
      NEW.is_published := false; NEW.profile_review_status := 'pending'; NEW.profile_reviewed_by := NULL; NEW.profile_reviewed_at := NULL;
    ELSE
      NEW.is_published := OLD.is_published; NEW.partner_type_id := OLD.partner_type_id;
      NEW.profile_review_status := OLD.profile_review_status; NEW.profile_reviewed_by := OLD.profile_reviewed_by; NEW.profile_reviewed_at := OLD.profile_reviewed_at;
      IF (NEW.display_name, NEW.organization_name, NEW.professional_type, NEW.city, NEW.state_region, NEW.service_areas, NEW.professional_summary)
         IS DISTINCT FROM (OLD.display_name, OLD.organization_name, OLD.professional_type, OLD.city, OLD.state_region, OLD.service_areas, OLD.professional_summary) THEN
        NEW.profile_review_status := 'pending';
      END IF;
    END IF;
  ELSIF TG_OP = 'INSERT' OR NEW.profile_review_status IS DISTINCT FROM OLD.profile_review_status THEN
    NEW.profile_reviewed_by := CASE WHEN NEW.profile_review_status = 'approved' THEN auth.uid() END;
    NEW.profile_reviewed_at := CASE WHEN NEW.profile_review_status = 'approved' THEN now() END;
  END IF;
  IF NEW.is_published AND (TG_OP = 'INSERT' OR NOT OLD.is_published) THEN
    IF NEW.profile_review_status <> 'approved' THEN
      RAISE EXCEPTION 'Publication rejected: profile has not been reviewed' USING ERRCODE = 'check_violation';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.partner_listing_types lt WHERE lt.user_id = NEW.user_id AND public.listing_type_is_public(NEW.user_id, lt.partner_type_id)) THEN
      RAISE EXCEPTION 'Publication rejected: no approved, open partner type with an approved application and reviewed services' USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;

DROP POLICY IF EXISTS "Public can read published partner profiles" ON public.partner_profiles;
CREATE POLICY "Public can read published partner profiles" ON public.partner_profiles FOR SELECT TO anon, authenticated
  USING (public.profile_is_public(user_id));

-- Closing a type no longer flips is_published; visibility is computed, so a multi-type organization keeps its other listed types.
DROP TRIGGER IF EXISTS unpublish_on_type_close ON public.service_partner_types;

-- Service approvals must belong to a type the organization actually claimed.
CREATE OR REPLACE FUNCTION public.check_service_selection()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.service_catalog c WHERE c.id = NEW.service_id AND c.partner_type = NEW.partner_type) THEN
    RAISE EXCEPTION 'Service % does not belong to partner type %', NEW.service_id, NEW.partner_type;
  END IF;
  IF TG_OP = 'INSERT' AND NOT EXISTS (SELECT 1 FROM public.service_catalog c WHERE c.id = NEW.service_id AND c.is_active) THEN
    RAISE EXCEPTION 'Service % is retired and cannot be newly selected', NEW.service_id;
  END IF;
  IF TG_OP = 'UPDATE' AND (NEW.user_id <> OLD.user_id OR NEW.partner_type <> OLD.partner_type OR NEW.service_id <> OLD.service_id) THEN
    RAISE EXCEPTION 'A service selection cannot be moved to another organization, type, or service';
  END IF;
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    IF NOT EXISTS (SELECT 1 FROM public.service_partner_types t WHERE t.id = NEW.partner_type AND t.is_open_for_registration) THEN
      RAISE EXCEPTION 'This partner type is not open for registration yet';
    END IF;
    IF NEW.application_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.partner_applications a WHERE a.id = NEW.application_id AND a.user_id = NEW.user_id) THEN
      RAISE EXCEPTION 'Application does not belong to this account';
    END IF;
    NEW.review_status := 'draft';
    NEW.qualification_verified := false;
  ELSIF NEW.review_status = 'approved' AND NOT EXISTS (
    SELECT 1 FROM public.partner_listing_types lt WHERE lt.user_id = NEW.user_id AND lt.partner_type_id = NEW.partner_type) THEN
    RAISE EXCEPTION 'Service approval rejected: organization has not claimed partner type %', NEW.partner_type;
  END IF;
  IF NEW.is_featured AND (SELECT count(*) FROM public.partner_service_selections s WHERE s.user_id = NEW.user_id AND s.is_featured AND s.id <> NEW.id) >= 3 THEN
    RAISE EXCEPTION 'You can feature up to three services';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $function$;

-- Safe public service list: only approved services of publicly listed types; no private reviewer fields.
CREATE OR REPLACE FUNCTION public.public_partner_services()
RETURNS TABLE (user_id uuid, partner_type text, service_id text, label text, is_featured boolean, offering_description text, accepting_inquiries boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.user_id, s.partner_type, s.service_id, c.label, s.is_featured, s.offering_description, s.accepting_inquiries
  FROM public.partner_service_selections s JOIN public.service_catalog c ON c.id = s.service_id
  WHERE s.review_status = 'approved' AND c.is_active
    AND public.profile_is_public(s.user_id) AND public.listing_type_is_public(s.user_id, s.partner_type)
$$;
GRANT EXECUTE ON FUNCTION public.public_partner_services() TO anon, authenticated, service_role;