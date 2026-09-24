
CREATE OR REPLACE FUNCTION public.type_id_for_label(_label text)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.service_partner_types
  WHERE lower(trim(label)) = lower(trim(_label)) OR id = lower(trim(_label)) LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.application_type_id(_application uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.type_id_for_label(a.professional_type) FROM public.partner_applications a WHERE a.id = _application
$$;

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
    v_type := public.type_id_for_label(NEW.professional_type);
    PERFORM public.assert_can_edit_type(auth.uid(), v_type);
    IF TG_OP = 'UPDATE' AND OLD.status IN ('approved','declined') THEN
      RAISE EXCEPTION 'This application has already been decided' USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.status NOT IN ('draft','submitted') THEN NEW.status := COALESCE(OLD.status,'draft'); END IF;
    IF NEW.status = 'submitted' AND (TG_OP = 'INSERT' OR OLD.status <> 'submitted') THEN NEW.submitted_at := now(); END IF;
  END IF;
  RETURN NEW;
END $$;
