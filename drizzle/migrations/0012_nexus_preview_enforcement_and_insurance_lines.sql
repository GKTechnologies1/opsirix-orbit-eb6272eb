
-- Resolve an application's partner type id from its stored label or id.
CREATE OR REPLACE FUNCTION public.application_type_id(_application uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT t.id FROM public.partner_applications a JOIN public.service_partner_types t
    ON (t.label = a.professional_type OR t.id = a.professional_type) WHERE a.id = _application LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.assert_can_edit_type(_uid uuid, _type text)
RETURNS void LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _type IS NOT NULL AND NOT public.has_role(_uid,'admin') AND NOT public.can_register_type(_uid, _type) THEN
    RAISE EXCEPTION 'This partner type is not open for registration yet' USING ERRCODE = 'check_violation';
  END IF;
END $$;

-- Applications: closed types require preview access for every non-admin save and submission.
CREATE OR REPLACE FUNCTION public.guard_application()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_type text;
BEGIN
  IF TG_OP = 'UPDATE' AND public.has_role(auth.uid(),'admin') AND auth.uid() <> OLD.user_id THEN
    IF NEW.application_kind IS DISTINCT FROM OLD.application_kind OR NEW.organization_name IS DISTINCT FROM OLD.organization_name THEN
      RAISE EXCEPTION 'Reviewers cannot change what an organization applied as' USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
  END IF;
  IF auth.uid() IS NOT NULL AND auth.uid() = NEW.user_id THEN
    SELECT id INTO v_type FROM public.service_partner_types WHERE label = NEW.professional_type OR id = NEW.professional_type LIMIT 1;
    PERFORM public.assert_can_edit_type(auth.uid(), v_type);
    IF TG_OP = 'UPDATE' AND OLD.status IN ('approved','declined') THEN
      RAISE EXCEPTION 'This application has already been decided' USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.status NOT IN ('draft','submitted') THEN NEW.status := COALESCE(OLD.status,'draft'); END IF;
    IF NEW.status = 'submitted' AND (TG_OP = 'INSERT' OR OLD.status <> 'submitted') THEN NEW.submitted_at := now(); END IF;
  END IF;
  RETURN NEW;
END $$;

-- Track details, licenses, revisions, suggestions, credentials: same server-side preview gate.
CREATE OR REPLACE FUNCTION public.guard_closed_type_child()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_type text;
BEGIN
  IF public.has_role(auth.uid(),'admin') AND auth.uid() IS DISTINCT FROM NEW.user_id THEN RETURN NEW; END IF;
  IF TG_TABLE_NAME = 'partner_service_suggestions' THEN v_type := NEW.partner_type;
  ELSIF NEW.application_id IS NOT NULL THEN v_type := public.application_type_id(NEW.application_id);
  END IF;
  PERFORM public.assert_can_edit_type(auth.uid(), v_type);
  IF TG_TABLE_NAME = 'partner_licenses' AND v_type IS DISTINCT FROM 'insurance' THEN
    RAISE EXCEPTION 'State licenses are only recorded for insurance applications' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS guard_closed_type_child ON public.partner_track_details;
CREATE TRIGGER guard_closed_type_child BEFORE INSERT OR UPDATE ON public.partner_track_details FOR EACH ROW EXECUTE FUNCTION public.guard_closed_type_child();
DROP TRIGGER IF EXISTS guard_closed_type_child ON public.partner_licenses;
CREATE TRIGGER guard_closed_type_child BEFORE INSERT OR UPDATE ON public.partner_licenses FOR EACH ROW EXECUTE FUNCTION public.guard_closed_type_child();
DROP TRIGGER IF EXISTS guard_closed_type_child ON public.partner_profile_revisions;
CREATE TRIGGER guard_closed_type_child BEFORE INSERT OR UPDATE ON public.partner_profile_revisions FOR EACH ROW EXECUTE FUNCTION public.guard_closed_type_child();
DROP TRIGGER IF EXISTS guard_closed_type_child ON public.partner_service_suggestions;
CREATE TRIGGER guard_closed_type_child BEFORE INSERT OR UPDATE ON public.partner_service_suggestions FOR EACH ROW EXECUTE FUNCTION public.guard_closed_type_child();
DROP TRIGGER IF EXISTS guard_closed_type_child ON public.partner_credentials;
CREATE TRIGGER guard_closed_type_child BEFORE INSERT OR UPDATE ON public.partner_credentials FOR EACH ROW EXECUTE FUNCTION public.guard_closed_type_child();

-- Insurance: standard lines of authority, and which lines each coverage inquiry needs.
ALTER TABLE public.partner_licenses DROP CONSTRAINT IF EXISTS partner_licenses_line_check;
ALTER TABLE public.partner_licenses ADD CONSTRAINT partner_licenses_line_check
  CHECK (line_of_authority IN ('property','casualty','life','accident_health','surety')) NOT VALID;
ALTER TABLE public.service_catalog ADD COLUMN IF NOT EXISTS required_lines text[];
UPDATE public.service_catalog SET required_lines = CASE id
  WHEN 'ins-commercial-property' THEN ARRAY['property']
  WHEN 'ins-inland-marine-and-equipment' THEN ARRAY['property']
  WHEN 'ins-business-owner-s-policy' THEN ARRAY['property','casualty']
  WHEN 'ins-surety-bonds' THEN ARRAY['surety','casualty']
  WHEN 'ins-group-health' THEN ARRAY['accident_health']
  WHEN 'ins-group-dental-and-vision' THEN ARRAY['accident_health']
  WHEN 'ins-group-life-and-disability' THEN ARRAY['life','accident_health']
  ELSE ARRAY['casualty'] END
WHERE partner_type = 'insurance';

CREATE OR REPLACE FUNCTION public.insurance_service_licensed(_user uuid, _service text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.service_catalog c JOIN public.partner_licenses l ON l.user_id = _user
    WHERE c.id = _service AND l.review_status = 'verified' AND (l.expires_on IS NULL OR l.expires_on >= current_date)
      AND l.line_of_authority = ANY (COALESCE(c.required_lines, ARRAY[]::text[])))
$$;

CREATE OR REPLACE FUNCTION public.check_service_selection()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
  IF NOT public.has_role(auth.uid(), 'admin') OR auth.uid() = NEW.user_id THEN
    IF NOT public.can_register_type(auth.uid(), NEW.partner_type) THEN
      RAISE EXCEPTION 'This partner type is not open for registration yet';
    END IF;
    IF NEW.application_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.partner_applications a WHERE a.id = NEW.application_id AND a.user_id = NEW.user_id) THEN
      RAISE EXCEPTION 'Application does not belong to this account';
    END IF;
    NEW.review_status := 'draft';
    NEW.qualification_verified := false;
  ELSIF NEW.review_status = 'approved' AND (TG_OP = 'INSERT' OR OLD.review_status <> 'approved') THEN
    IF NOT EXISTS (SELECT 1 FROM public.partner_listing_types lt WHERE lt.user_id = NEW.user_id AND lt.partner_type_id = NEW.partner_type) THEN
      RAISE EXCEPTION 'Service approval rejected: organization has not claimed partner type %', NEW.partner_type;
    END IF;
    IF NEW.partner_type = 'insurance' AND NOT public.insurance_service_licensed(NEW.user_id, NEW.service_id) THEN
      RAISE EXCEPTION 'Coverage inquiry approval rejected: no verified, unexpired license covers the line this inquiry needs' USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  IF NEW.is_featured AND (SELECT count(*) FROM public.partner_service_selections s WHERE s.user_id = NEW.user_id AND s.is_featured AND s.id <> NEW.id) >= 3 THEN
    RAISE EXCEPTION 'You can feature up to three services';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;

-- Public view: an insurance inquiry stays listed only while a matching license is verified and current.
CREATE OR REPLACE FUNCTION public.listing_type_is_public(_user uuid, _type text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.partner_listing_types lt
    JOIN public.service_partner_types t ON t.id = lt.partner_type_id
    WHERE lt.user_id = _user AND lt.partner_type_id = _type AND lt.review_status = 'approved'
      AND t.is_open_for_registration
      AND public.type_evidence_ok(lt.application_id, lt.partner_type_id)
      AND EXISTS (SELECT 1 FROM public.partner_service_selections s JOIN public.service_catalog c ON c.id = s.service_id
                  WHERE s.user_id = _user AND s.partner_type = _type AND s.review_status = 'approved' AND c.is_active
                    AND (_type <> 'insurance' OR public.insurance_service_licensed(_user, s.service_id))))
$$;

-- Insurance profile revisions: the listed state must be a verified license state.
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
    IF NEW.status = 'approved' AND NEW.application_id IS NOT NULL AND public.application_type_id(NEW.application_id) = 'insurance'
       AND NULLIF(trim(NEW.state_region),'') IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM public.partner_licenses l WHERE l.user_id = NEW.user_id AND l.review_status = 'verified'
                       AND upper(l.state_code) = upper(trim(NEW.state_region)) AND (l.expires_on IS NULL OR l.expires_on >= current_date)) THEN
      RAISE EXCEPTION 'Profile approval rejected: the listed state is not covered by a verified insurance license' USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status THEN NEW.reviewed_by := auth.uid(); NEW.reviewed_at := now(); END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
