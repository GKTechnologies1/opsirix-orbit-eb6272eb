ALTER TABLE public.partner_profiles ADD COLUMN IF NOT EXISTS partner_type_id text REFERENCES public.service_partner_types(id);

CREATE OR REPLACE FUNCTION public.partner_type_is_open(_type text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT is_active AND is_open_for_registration FROM public.service_partner_types WHERE id = _type), false)
$$;
GRANT EXECUTE ON FUNCTION public.partner_type_is_open(text) TO anon, authenticated, service_role;

-- Publication gate: nobody (including admins and service role) can publish a listing
-- unless its partner type is open and the owner's application is approved.
CREATE OR REPLACE FUNCTION public.guard_profile_publication() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') AND COALESCE(auth.role(),'') <> 'service_role' THEN
    IF TG_OP = 'INSERT' THEN NEW.is_published := false;
    ELSE NEW.is_published := OLD.is_published; NEW.partner_type_id := OLD.partner_type_id; END IF;
  END IF;
  IF NEW.is_published THEN
    IF NEW.partner_type_id IS NULL OR NOT public.partner_type_is_open(NEW.partner_type_id) THEN
      RAISE EXCEPTION 'Publication rejected: partner type % is closed or not set', COALESCE(NEW.partner_type_id,'(none)') USING ERRCODE = 'check_violation';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.partner_applications a WHERE a.user_id = NEW.user_id AND a.status = 'approved') THEN
      RAISE EXCEPTION 'Publication rejected: application is not approved' USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_profile_publication ON public.partner_profiles;
CREATE TRIGGER guard_profile_publication BEFORE INSERT OR UPDATE ON public.partner_profiles FOR EACH ROW EXECUTE FUNCTION public.guard_profile_publication();

-- Public listing query: only published profiles of open types.
DROP POLICY IF EXISTS "Public can read published partner profiles" ON public.partner_profiles;
CREATE POLICY "Public can read published partner profiles" ON public.partner_profiles FOR SELECT TO anon, authenticated
  USING (is_published = true AND partner_type_id IS NOT NULL AND public.partner_type_is_open(partner_type_id));

-- Closing a type immediately unpublishes its listings.
CREATE OR REPLACE FUNCTION public.unpublish_on_type_close() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (NEW.is_active AND NEW.is_open_for_registration) THEN
    UPDATE public.partner_profiles SET is_published = false WHERE partner_type_id = NEW.id AND is_published;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS unpublish_on_type_close ON public.service_partner_types;
CREATE TRIGGER unpublish_on_type_close AFTER UPDATE OF is_active, is_open_for_registration ON public.service_partner_types FOR EACH ROW EXECUTE FUNCTION public.unpublish_on_type_close();