CREATE OR REPLACE FUNCTION public.insurance_offered_states(_user uuid, _geography text)
RETURNS text[] LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT CASE WHEN NULLIF(trim(COALESCE(_geography,'')),'') IS NOT NULL
    THEN ARRAY(SELECT DISTINCT upper(t) FROM unnest(regexp_split_to_array(trim(_geography), '[\s,;/]+')) t WHERE t <> '')
    ELSE ARRAY(SELECT upper(trim(a.state_region)) FROM public.partner_applications a WHERE a.user_id = _user AND NULLIF(trim(a.state_region),'') IS NOT NULL)
  END
$$;

CREATE OR REPLACE FUNCTION public.insurance_service_licensed(_user uuid, _service text, _states text[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT COALESCE(cardinality(_states), 0) > 0 AND NOT EXISTS (
    SELECT 1 FROM unnest(_states) st WHERE NOT EXISTS (
      SELECT 1 FROM public.service_catalog c JOIN public.partner_licenses l ON l.user_id = _user
      WHERE c.id = _service AND l.review_status = 'verified'
        AND (l.expires_on IS NULL OR l.expires_on >= current_date)
        AND upper(l.state_code) = st
        AND l.line_of_authority = ANY (COALESCE(c.required_lines, ARRAY[]::text[]))))
$$;

CREATE OR REPLACE FUNCTION public.insurance_service_licensed(_user uuid, _service text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT public.insurance_service_licensed(_user, _service, public.insurance_offered_states(_user,
    (SELECT s.geography FROM public.partner_service_selections s WHERE s.user_id = _user AND s.service_id = _service LIMIT 1)))
$$;

CREATE OR REPLACE FUNCTION public.public_partner_services()
 RETURNS TABLE(user_id uuid, partner_type text, service_id text, label text, is_featured boolean, offering_description text, accepting_inquiries boolean)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT s.user_id, s.partner_type, s.service_id, c.label, s.is_featured, s.offering_description, s.accepting_inquiries
  FROM public.partner_service_selections s JOIN public.service_catalog c ON c.id = s.service_id
  WHERE s.review_status = 'approved' AND c.is_active
    AND public.profile_is_public(s.user_id) AND public.listing_type_is_public(s.user_id, s.partner_type)
    AND (s.partner_type <> 'insurance' OR public.insurance_service_licensed(s.user_id, s.service_id))
$$;

CREATE OR REPLACE FUNCTION public.check_service_selection()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
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
  ELSIF NEW.review_status = 'approved' AND (TG_OP = 'INSERT' OR OLD.review_status <> 'approved' OR NEW.geography IS DISTINCT FROM OLD.geography) THEN
    IF NOT EXISTS (SELECT 1 FROM public.partner_listing_types lt WHERE lt.user_id = NEW.user_id AND lt.partner_type_id = NEW.partner_type) THEN
      RAISE EXCEPTION 'Service approval rejected: organization has not claimed partner type %', NEW.partner_type;
    END IF;
    IF NEW.partner_type = 'insurance' AND NOT public.insurance_service_licensed(NEW.user_id, NEW.service_id, public.insurance_offered_states(NEW.user_id, NEW.geography)) THEN
      RAISE EXCEPTION 'Coverage inquiry approval rejected: every state where it is offered needs a verified, unexpired license for a line this inquiry requires' USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  IF NEW.is_featured AND (SELECT count(*) FROM public.partner_service_selections s WHERE s.user_id = NEW.user_id AND s.is_featured AND s.id <> NEW.id) >= 3 THEN
    RAISE EXCEPTION 'You can feature up to three services';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $function$;