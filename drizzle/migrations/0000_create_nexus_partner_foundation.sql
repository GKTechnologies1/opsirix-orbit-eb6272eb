CREATE TYPE public.app_role AS ENUM ('applicant', 'partner', 'admin');
CREATE TYPE public.partner_application_status AS ENUM ('draft', 'submitted', 'under_review', 'changes_requested', 'approved', 'declined');
CREATE TYPE public.credential_status AS ENUM ('pending', 'verified', 'rejected');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can create own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can read profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can read roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.partner_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  organization_name TEXT NOT NULL DEFAULT '',
  professional_type TEXT NOT NULL DEFAULT '',
  website TEXT,
  phone TEXT,
  city TEXT,
  state_region TEXT,
  service_areas TEXT[] NOT NULL DEFAULT '{}',
  years_experience INTEGER,
  license_number TEXT,
  license_jurisdiction TEXT,
  professional_summary TEXT NOT NULL DEFAULT '',
  referral_code TEXT,
  status public.partner_application_status NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.partner_applications TO authenticated;
GRANT ALL ON public.partner_applications TO service_role;
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Applicants can read own application" ON public.partner_applications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Applicants can create own application" ON public.partner_applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status IN ('draft', 'submitted'));
CREATE POLICY "Applicants can update own application" ON public.partner_applications FOR UPDATE TO authenticated USING (auth.uid() = user_id AND status IN ('draft', 'changes_requested')) WITH CHECK (auth.uid() = user_id AND status IN ('draft', 'submitted'));
CREATE POLICY "Admins can read applications" ON public.partner_applications FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update applications" ON public.partner_applications FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.partner_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.partner_applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  credential_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  status public.credential_status NOT NULL DEFAULT 'pending',
  reviewer_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, DELETE ON public.partner_credentials TO authenticated;
GRANT ALL ON public.partner_credentials TO service_role;
ALTER TABLE public.partner_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Applicants can read own credentials" ON public.partner_credentials FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Applicants can add own credentials" ON public.partner_credentials FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Applicants can remove pending credentials" ON public.partner_credentials FOR DELETE TO authenticated USING (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Admins can read credentials" ON public.partner_credentials FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.partner_review_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.partner_applications(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  from_status public.partner_application_status,
  to_status public.partner_application_status NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.partner_review_events TO authenticated;
GRANT ALL ON public.partner_review_events TO service_role;
ALTER TABLE public.partner_review_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Applicants can read own review history" ON public.partner_review_events FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.partner_applications a WHERE a.id = application_id AND a.user_id = auth.uid()));
CREATE POLICY "Admins can read review history" ON public.partner_review_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create review events" ON public.partner_review_events FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND reviewer_id = auth.uid());

CREATE TABLE public.partner_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  professional_type TEXT NOT NULL,
  city TEXT,
  state_region TEXT,
  service_areas TEXT[] NOT NULL DEFAULT '{}',
  professional_summary TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.partner_profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.partner_profiles TO authenticated;
GRANT ALL ON public.partner_profiles TO service_role;
ALTER TABLE public.partner_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published partner profiles" ON public.partner_profiles FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Partners can read own profile" ON public.partner_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Partners can update own profile" ON public.partner_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'partner')) WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'partner'));
CREATE POLICY "Admins manage partner profiles" ON public.partner_profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.partner_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.partner_campaigns TO anon, authenticated;
GRANT ALL ON public.partner_campaigns TO service_role;
ALTER TABLE public.partner_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can resolve active campaign codes" ON public.partner_campaigns FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins manage campaigns" ON public.partner_campaigns FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.partner_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  application_id UUID REFERENCES public.partner_applications(id) ON DELETE SET NULL,
  campaign_id UUID NOT NULL REFERENCES public.partner_campaigns(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, campaign_id)
);
GRANT SELECT, INSERT ON public.partner_attributions TO authenticated;
GRANT ALL ON public.partner_attributions TO service_role;
ALTER TABLE public.partner_attributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own attribution" ON public.partner_attributions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own attribution" ON public.partner_attributions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can read attribution" ON public.partner_attributions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX partner_applications_status_created_idx ON public.partner_applications(status, created_at DESC);
CREATE INDEX partner_credentials_application_idx ON public.partner_credentials(application_id);
CREATE INDEX partner_review_events_application_idx ON public.partner_review_events(application_id, created_at DESC);
CREATE INDEX partner_profiles_published_idx ON public.partner_profiles(is_published, professional_type);

CREATE POLICY "Users upload own partner credentials" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'partner-credentials' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users read own partner credentials" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'partner-credentials' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')));
CREATE POLICY "Users delete own pending credential files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'partner-credentials' AND (storage.foldername(name))[1] = auth.uid()::text);
