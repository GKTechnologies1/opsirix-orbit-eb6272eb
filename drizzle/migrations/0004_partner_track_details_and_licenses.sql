CREATE TABLE public.partner_track_details (
  application_id uuid PRIMARY KEY REFERENCES public.partner_applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  track text NOT NULL CHECK (track IN ('institution','brokerage')),
  representative_name text NOT NULL,
  representative_title text,
  representative_email text,
  representative_authorized boolean NOT NULL DEFAULT false,
  campus_or_program text,
  geographic_reach text,
  audiences text[] NOT NULL DEFAULT '{}',
  segments_served text[] NOT NULL DEFAULT '{}',
  languages text[] NOT NULL DEFAULT '{}',
  introduction_method text,
  carriers_markets text,
  authority_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.partner_track_details TO authenticated;
GRANT ALL ON public.partner_track_details TO service_role;
ALTER TABLE public.partner_track_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read own track details" ON public.partner_track_details FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owners insert own track details" ON public.partner_track_details FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND authority_verified = false);
CREATE POLICY "Owners or admins update track details" ON public.partner_track_details FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.guard_track_details() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN
    NEW.authority_verified := false;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER guard_track_details BEFORE INSERT OR UPDATE ON public.partner_track_details FOR EACH ROW EXECUTE FUNCTION public.guard_track_details();

CREATE TABLE public.partner_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.partner_applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  state_code text NOT NULL,
  line_of_authority text NOT NULL,
  license_number text NOT NULL,
  producer_id text,
  review_status text NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending','verified','rejected')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_licenses TO authenticated;
GRANT ALL ON public.partner_licenses TO service_role;
ALTER TABLE public.partner_licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read own licenses" ON public.partner_licenses FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owners add pending licenses" ON public.partner_licenses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND review_status = 'pending' AND reviewed_by IS NULL);
CREATE POLICY "Admins review licenses" ON public.partner_licenses FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owners remove pending licenses" ON public.partner_licenses FOR DELETE TO authenticated USING (auth.uid() = user_id AND review_status = 'pending');