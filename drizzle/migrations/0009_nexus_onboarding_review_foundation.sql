-- ============ Private preview access for closed partner types ============
CREATE TABLE public.partner_type_preview_access (
  user_id uuid NOT NULL,
  partner_type_id text NOT NULL REFERENCES public.service_partner_types(id) ON DELETE CASCADE,
  granted_by uuid NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, partner_type_id)
);
GRANT SELECT, INSERT, DELETE ON public.partner_type_preview_access TO authenticated;
GRANT ALL ON public.partner_type_preview_access TO service_role;
ALTER TABLE public.partner_type_preview_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own preview access" ON public.partner_type_preview_access FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins grant preview access" ON public.partner_type_preview_access FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') AND granted_by = auth.uid());
CREATE POLICY "Admins revoke preview access" ON public.partner_type_preview_access FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.can_register_type(_uid uuid, _type text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.service_partner_types t WHERE t.id = _type AND t.is_active AND (
    t.is_open_for_registration OR public.has_role(_uid,'admin')
    OR EXISTS (SELECT 1 FROM public.partner_type_preview_access p WHERE p.user_id = _uid AND p.partner_type_id = _type)))
$$;
GRANT EXECUTE ON FUNCTION public.can_register_type(uuid, text) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Read open partner types" ON public.service_partner_types;
CREATE POLICY "Read open or previewable partner types" ON public.service_partner_types FOR SELECT TO anon, authenticated
  USING (is_open_for_registration OR public.can_register_type(auth.uid(), id));
DROP POLICY IF EXISTS "Read categories of open types" ON public.service_categories;
CREATE POLICY "Read categories of open or previewable types" ON public.service_categories FOR SELECT TO anon, authenticated
  USING (public.can_register_type(auth.uid(), partner_type));
DROP POLICY IF EXISTS "Read catalog of open types" ON public.service_catalog;
CREATE POLICY "Read catalog of open or previewable types" ON public.service_catalog FOR SELECT TO anon, authenticated
  USING (public.can_register_type(auth.uid(), partner_type));

ALTER TABLE public.service_catalog ADD COLUMN client_label text;

-- ============ Applications: kind and resumable step ============
ALTER TABLE public.partner_applications
  ADD COLUMN application_kind text NOT NULL DEFAULT 'organization' CHECK (application_kind IN ('organization','expression_of_interest')),
  ADD COLUMN onboarding_step text;

CREATE OR REPLACE FUNCTION public.guard_application()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND public.has_role(auth.uid(),'admin') AND auth.uid() <> OLD.user_id THEN
    IF NEW.application_kind IS DISTINCT FROM OLD.application_kind OR NEW.organization_name IS DISTINCT FROM OLD.organization_name THEN
      RAISE EXCEPTION 'Reviewers cannot change what an organization applied as' USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER guard_application BEFORE UPDATE ON public.partner_applications FOR EACH ROW EXECUTE FUNCTION public.guard_application();

-- ============ Track details: evidence, consents, agreement, review status ============
ALTER TABLE public.partner_track_details
  ADD COLUMN representative_phone text,
  ADD COLUMN rep_public_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN org_public_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN authority_evidence_method text CHECK (authority_evidence_method IN ('work_email_domain','official_staff_page','signed_letter','verification_contact','other')),
  ADD COLUMN authority_evidence_detail text CHECK (char_length(authority_evidence_detail) <= 1000),
  ADD COLUMN authority_review_status text NOT NULL DEFAULT 'pending' CHECK (authority_review_status IN ('pending','verified','changes_requested','declined')),
  ADD COLUMN agreement_status text NOT NULL DEFAULT 'none' CHECK (agreement_status IN ('none','pending','recorded')),
  ADD COLUMN agreement_reference text,
  ADD COLUMN service_areas text[] NOT NULL DEFAULT '{}',
  ADD COLUMN industries text[] NOT NULL DEFAULT '{}',
  ADD COLUMN response_time text;
UPDATE public.partner_track_details SET authority_review_status = 'verified' WHERE authority_verified;

CREATE OR REPLACE FUNCTION public.guard_track_details()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_kind text;
BEGIN
  SELECT application_kind INTO v_kind FROM public.partner_applications WHERE id = NEW.application_id;
  IF NOT public.has_role(auth.uid(),'admin') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.authority_review_status := 'pending'; NEW.agreement_reference := NULL;
      IF NEW.agreement_status = 'recorded' THEN NEW.agreement_status := 'none'; END IF;
    ELSE
      NEW.authority_review_status := OLD.authority_review_status; NEW.agreement_reference := OLD.agreement_reference;
      IF OLD.agreement_status = 'recorded' THEN NEW.agreement_status := 'recorded';
      ELSIF NEW.agreement_status = 'recorded' THEN NEW.agreement_status := OLD.agreement_status; END IF;
      IF (NEW.representative_name, NEW.representative_title, NEW.representative_email, NEW.representative_authorized, NEW.authority_evidence_method, NEW.authority_evidence_detail, NEW.track)
         IS DISTINCT FROM (OLD.representative_name, OLD.representative_title, OLD.representative_email, OLD.representative_authorized, OLD.authority_evidence_method, OLD.authority_evidence_detail, OLD.track) THEN
        NEW.authority_review_status := 'pending';
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' AND NEW.authority_review_status IS NOT DISTINCT FROM OLD.authority_review_status AND NEW.authority_verified IS DISTINCT FROM OLD.authority_verified THEN
    NEW.authority_review_status := CASE WHEN NEW.authority_verified THEN 'verified' ELSE 'pending' END;
  END IF;
  IF v_kind = 'expression_of_interest' THEN
    NEW.representative_authorized := false; NEW.rep_public_consent := false; NEW.org_public_consent := false;
    IF NEW.authority_review_status = 'verified' THEN NEW.authority_review_status := 'pending'; END IF;
  END IF;
  NEW.authority_verified := (NEW.authority_review_status = 'verified');
  NEW.updated_at := now();
  RETURN NEW;
END $$;

-- ============ Licenses: expiry and change requests ============
ALTER TABLE public.partner_licenses ADD COLUMN expires_on date;
ALTER TABLE public.partner_licenses DROP CONSTRAINT partner_licenses_review_status_check;
ALTER TABLE public.partner_licenses ADD CONSTRAINT partner_licenses_review_status_check CHECK (review_status IN ('pending','verified','changes_requested','rejected'));
DROP POLICY IF EXISTS "Owners remove pending licenses" ON public.partner_licenses;
CREATE POLICY "Owners remove unverified licenses" ON public.partner_licenses FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND review_status IN ('pending','changes_requested','rejected'));

-- ============ Selections: more review states; no prices for institution/brokerage ============
ALTER TABLE public.partner_service_selections DROP CONSTRAINT partner_service_selections_review_status_check;
ALTER TABLE public.partner_service_selections ADD CONSTRAINT partner_service_selections_review_status_check CHECK (review_status IN ('draft','approved','changes_requested','declined'));

CREATE OR REPLACE FUNCTION public.check_service_selection()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $function$
DECLARE v_track text;
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
  SELECT track INTO v_track FROM public.service_partner_types WHERE id = NEW.partner_type;
  IF v_track <> 'professional_service' THEN
    NEW.pricing := NULL; NEW.price_min := NULL; NEW.price_max := NULL;
  END IF;
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    IF NOT public.can_register_type(auth.uid(), NEW.partner_type) THEN
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

CREATE OR REPLACE FUNCTION public.force_pending_suggestion()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') AND auth.role() <> 'service_role' THEN
    IF NOT public.can_register_type(auth.uid(), NEW.partner_type) THEN
      RAISE EXCEPTION 'This partner type is not open for registration yet';
    END IF;
    NEW.status := 'pending'; NEW.reviewed_by := NULL; NEW.reviewed_at := NULL; NEW.resulting_service_id := NULL;
  END IF;
  RETURN NEW;
END $function$;

-- ============ Claimed types: withdraw, suspend, full evidence checks ============
ALTER TABLE public.partner_listing_types DROP CONSTRAINT partner_listing_types_review_status_check;
ALTER TABLE public.partner_listing_types ADD CONSTRAINT partner_listing_types_review_status_check
  CHECK (review_status IN ('pending','approved','changes_requested','declined','suspended','withdrawn'));

CREATE OR REPLACE FUNCTION public.type_evidence_ok(_application uuid, _type text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.partner_applications a JOIN public.service_partner_types t ON t.id = _type
    WHERE a.id = _application AND a.status = 'approved' AND a.application_kind = 'organization'
      AND (t.track = 'professional_service' OR EXISTS (
        SELECT 1 FROM public.partner_track_details d WHERE d.application_id = a.id AND d.track = t.track
          AND d.representative_authorized AND d.authority_review_status = 'verified'
          AND (_type <> 'university' OR d.agreement_status = 'recorded')))
      AND (_type <> 'insurance' OR EXISTS (
        SELECT 1 FROM public.partner_licenses l WHERE l.application_id = a.id AND l.review_status = 'verified'
          AND (l.expires_on IS NULL OR l.expires_on >= current_date))))
$$;
GRANT EXECUTE ON FUNCTION public.type_evidence_ok(uuid, text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.guard_listing_type()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE is_admin boolean := public.has_role(auth.uid(), 'admin');
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF auth.uid() IS NULL OR auth.uid() <> NEW.user_id THEN
      RAISE EXCEPTION 'Only the organization itself can claim a partner type' USING ERRCODE = 'check_violation';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.partner_applications a WHERE a.id = NEW.application_id AND a.user_id = NEW.user_id AND a.application_kind = 'organization') THEN
      RAISE EXCEPTION 'An expression of interest cannot claim a listing type' USING ERRCODE = 'check_violation';
    END IF;
    IF NOT public.can_register_type(auth.uid(), NEW.partner_type_id) THEN
      RAISE EXCEPTION 'This partner type is not open for registration yet' USING ERRCODE = 'check_violation';
    END IF;
    NEW.review_status := 'pending'; NEW.reviewed_by := NULL; NEW.reviewed_at := NULL;
    RETURN NEW;
  END IF;
  IF NEW.partner_type_id <> OLD.partner_type_id OR NEW.user_id <> OLD.user_id OR NEW.application_id <> OLD.application_id THEN
    RAISE EXCEPTION 'A claimed partner type cannot be relabeled; the organization must claim the other type separately' USING ERRCODE = 'check_violation';
  END IF;
  IF NOT is_admin OR auth.uid() = NEW.user_id THEN
    IF NEW.review_status = 'withdrawn' THEN NULL;
    ELSIF OLD.review_status = 'withdrawn' AND NEW.review_status = 'pending' THEN NULL;
    ELSE NEW.review_status := OLD.review_status; END IF;
    IF NEW.review_status IS DISTINCT FROM OLD.review_status THEN NEW.reviewed_by := NULL; NEW.reviewed_at := NULL;
    ELSE NEW.reviewed_by := OLD.reviewed_by; NEW.reviewed_at := OLD.reviewed_at; END IF;
    NEW.review_note := OLD.review_note;
    RETURN NEW;
  END IF;
  IF NEW.review_status = 'approved' AND OLD.review_status <> 'approved' AND NOT public.type_evidence_ok(NEW.application_id, NEW.partner_type_id) THEN
    RAISE EXCEPTION 'Type approval rejected: application, representative authority, agreement, or license evidence is incomplete' USING ERRCODE = 'check_violation';
  END IF;
  IF NEW.review_status = 'withdrawn' AND OLD.review_status <> 'withdrawn' THEN
    RAISE EXCEPTION 'Only the organization can withdraw its own claim' USING ERRCODE = 'check_violation';
  END IF;
  IF NEW.review_status IS DISTINCT FROM OLD.review_status THEN
    NEW.reviewed_by := auth.uid(); NEW.reviewed_at := now();
  END IF;
  RETURN NEW;
END $$;
CREATE POLICY "Owners withdraw own claims" ON public.partner_listing_types FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.listing_type_is_public(_user uuid, _type text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.partner_listing_types lt
    JOIN public.service_partner_types t ON t.id = lt.partner_type_id
    WHERE lt.user_id = _user AND lt.partner_type_id = _type AND lt.review_status = 'approved'
      AND t.is_open_for_registration
      AND public.type_evidence_ok(lt.application_id, lt.partner_type_id)
      AND EXISTS (SELECT 1 FROM public.partner_service_selections s JOIN public.service_catalog c ON c.id = s.service_id
                  WHERE s.user_id = _user AND s.partner_type = _type AND s.review_status = 'approved' AND c.is_active))
$$;

-- ============ Profiles: suspension; owners edit through revisions only ============
ALTER TABLE public.partner_profiles
  ADD COLUMN is_suspended boolean NOT NULL DEFAULT false,
  ADD COLUMN suspension_reason text;

CREATE OR REPLACE FUNCTION public.profile_is_public(_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.partner_profiles p WHERE p.user_id = _user AND p.is_published AND NOT p.is_suspended AND p.profile_review_status = 'approved')
     AND EXISTS (SELECT 1 FROM public.partner_listing_types lt WHERE lt.user_id = _user AND public.listing_type_is_public(_user, lt.partner_type_id))
$$;

CREATE OR REPLACE FUNCTION public.guard_profile_publication()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE is_admin boolean := public.has_role(auth.uid(),'admin');
BEGIN
  IF NOT is_admin THEN
    IF TG_OP = 'INSERT' THEN
      NEW.is_published := false; NEW.profile_review_status := 'pending'; NEW.profile_reviewed_by := NULL; NEW.profile_reviewed_at := NULL; NEW.is_suspended := false;
    ELSE
      NEW := OLD;
    END IF;
  ELSIF TG_OP = 'INSERT' OR NEW.profile_review_status IS DISTINCT FROM OLD.profile_review_status THEN
    NEW.profile_reviewed_by := CASE WHEN NEW.profile_review_status = 'approved' THEN auth.uid() END;
    NEW.profile_reviewed_at := CASE WHEN NEW.profile_review_status = 'approved' THEN now() END;
  END IF;
  IF NEW.is_published AND NOT NEW.is_suspended AND (TG_OP = 'INSERT' OR NOT OLD.is_published OR OLD.is_suspended) THEN
    IF NEW.profile_review_status <> 'approved' THEN
      RAISE EXCEPTION 'Publication rejected: profile has not been reviewed' USING ERRCODE = 'check_violation';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.partner_listing_types lt WHERE lt.user_id = NEW.user_id AND public.listing_type_is_public(NEW.user_id, lt.partner_type_id)) THEN
      RAISE EXCEPTION 'Publication rejected: no approved, open partner type with an approved application, verified evidence, and reviewed services' USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;

CREATE TABLE public.partner_profile_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  application_id uuid REFERENCES public.partner_applications(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '' CHECK (char_length(display_name) <= 160),
  organization_name text NOT NULL DEFAULT '' CHECK (char_length(organization_name) <= 160),
  city text, state_region text,
  service_areas text[] NOT NULL DEFAULT '{}',
  professional_summary text NOT NULL DEFAULT '' CHECK (char_length(professional_summary) <= 1500),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','changes_requested','approved','declined','superseded')),
  submitted_at timestamptz, reviewed_by uuid, reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX partner_profile_revisions_one_open ON public.partner_profile_revisions (user_id) WHERE status IN ('draft','submitted','changes_requested');
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_profile_revisions TO authenticated;
GRANT ALL ON public.partner_profile_revisions TO service_role;
ALTER TABLE public.partner_profile_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read own revisions" ON public.partner_profile_revisions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners create revisions" ON public.partner_profile_revisions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners edit open revisions" ON public.partner_profile_revisions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status IN ('draft','changes_requested','submitted')) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners discard draft revisions" ON public.partner_profile_revisions FOR DELETE TO authenticated USING (auth.uid() = user_id AND status IN ('draft','changes_requested'));
CREATE POLICY "Admins read revisions" ON public.partner_profile_revisions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins review revisions" ON public.partner_profile_revisions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.guard_profile_revision()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') OR auth.uid() = NEW.user_id THEN
    IF NEW.status NOT IN ('draft','submitted') THEN NEW.status := 'draft'; END IF;
    NEW.reviewed_by := NULL; NEW.reviewed_at := NULL;
    IF NEW.status = 'submitted' THEN NEW.submitted_at := now(); END IF;
    IF NEW.application_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.partner_applications a WHERE a.id = NEW.application_id AND a.user_id = NEW.user_id) THEN
      RAISE EXCEPTION 'Application does not belong to this account';
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    RAISE EXCEPTION 'Only the organization can propose its profile' USING ERRCODE = 'check_violation';
  ELSE
    IF (NEW.display_name, NEW.organization_name, NEW.city, NEW.state_region, NEW.service_areas, NEW.professional_summary)
       IS DISTINCT FROM (OLD.display_name, OLD.organization_name, OLD.city, OLD.state_region, OLD.service_areas, OLD.professional_summary) THEN
      RAISE EXCEPTION 'Reviewers cannot rewrite a partner''s proposed profile' USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.status = 'approved' AND OLD.status <> 'submitted' THEN
      RAISE EXCEPTION 'Only a submitted revision can be approved' USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status THEN NEW.reviewed_by := auth.uid(); NEW.reviewed_at := now(); END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER guard_profile_revision BEFORE INSERT OR UPDATE ON public.partner_profile_revisions FOR EACH ROW EXECUTE FUNCTION public.guard_profile_revision();

CREATE OR REPLACE FUNCTION public.apply_approved_revision()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_type text;
BEGIN
  IF NEW.status = 'approved' AND OLD.status <> 'approved' THEN
    SELECT professional_type INTO v_type FROM public.partner_applications WHERE user_id = NEW.user_id;
    INSERT INTO public.partner_profiles (user_id, display_name, organization_name, professional_type, city, state_region, service_areas, professional_summary, profile_review_status)
    VALUES (NEW.user_id, NEW.display_name, NEW.organization_name, COALESCE(v_type,''), NEW.city, NEW.state_region, NEW.service_areas, NEW.professional_summary, 'approved')
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, organization_name = EXCLUDED.organization_name,
      city = EXCLUDED.city, state_region = EXCLUDED.state_region, service_areas = EXCLUDED.service_areas,
      professional_summary = EXCLUDED.professional_summary, profile_review_status = 'approved';
    UPDATE public.partner_profile_revisions SET status = 'superseded' WHERE user_id = NEW.user_id AND status = 'approved' AND id <> NEW.id;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER apply_approved_revision AFTER UPDATE ON public.partner_profile_revisions FOR EACH ROW EXECUTE FUNCTION public.apply_approved_revision();

-- ============ Review decisions (applicant-visible) and internal notes (admin-only) ============
CREATE TABLE public.partner_review_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.partner_applications(id) ON DELETE CASCADE,
  subject_type text NOT NULL CHECK (subject_type IN ('application','listing_type','authority','agreement','license','profile_revision','service','suggestion','listing')),
  subject_id text NOT NULL,
  subject_label text,
  decision text NOT NULL CHECK (decision IN ('approved','verified','recorded','changes_requested','declined','suspended','reinstated','published','unpublished')),
  applicant_message text CHECK (char_length(applicant_message) <= 2000),
  reviewer_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (decision <> 'changes_requested' OR char_length(btrim(COALESCE(applicant_message,''))) >= 10)
);
GRANT SELECT, INSERT ON public.partner_review_decisions TO authenticated;
GRANT ALL ON public.partner_review_decisions TO service_role;
ALTER TABLE public.partner_review_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Applicants read decisions on their application" ON public.partner_review_decisions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.partner_applications a WHERE a.id = application_id AND a.user_id = auth.uid()));
CREATE POLICY "Admins read decisions" ON public.partner_review_decisions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins record decisions" ON public.partner_review_decisions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') AND reviewer_id = auth.uid());

CREATE TABLE public.partner_review_internal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id uuid REFERENCES public.partner_review_decisions(id) ON DELETE CASCADE,
  application_id uuid NOT NULL REFERENCES public.partner_applications(id) ON DELETE CASCADE,
  note text NOT NULL CHECK (char_length(note) BETWEEN 1 AND 4000),
  author_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.partner_review_internal_notes TO authenticated;
GRANT ALL ON public.partner_review_internal_notes TO service_role;
ALTER TABLE public.partner_review_internal_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read internal notes" ON public.partner_review_internal_notes FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins write internal notes" ON public.partner_review_internal_notes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') AND author_id = auth.uid());

CREATE OR REPLACE FUNCTION public.public_partner_representatives()
RETURNS TABLE (user_id uuid, representative_name text, representative_title text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT d.user_id, d.representative_name, d.representative_title
  FROM public.partner_track_details d
  WHERE d.rep_public_consent AND d.org_public_consent AND d.representative_authorized AND d.authority_review_status = 'verified'
    AND public.profile_is_public(d.user_id)
$$;
GRANT EXECUTE ON FUNCTION public.public_partner_representatives() TO anon, authenticated, service_role;