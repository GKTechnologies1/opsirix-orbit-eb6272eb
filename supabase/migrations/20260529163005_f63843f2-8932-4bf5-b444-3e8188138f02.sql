CREATE TABLE public.discovery_call_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  website TEXT,
  business_stage TEXT,
  service_interest TEXT,
  preferred_contact_method TEXT,
  preferred_meeting_time TEXT,
  message TEXT NOT NULL,
  source_page TEXT NOT NULL DEFAULT 'Opsirix Website',
  status TEXT NOT NULL DEFAULT 'New',
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

GRANT INSERT ON public.discovery_call_submissions TO anon, authenticated;
GRANT ALL ON public.discovery_call_submissions TO service_role;

ALTER TABLE public.discovery_call_submissions ENABLE ROW LEVEL SECURITY;

-- Public can insert (form submission from anonymous visitors)
CREATE POLICY "Anyone can submit a discovery call request"
ON public.discovery_call_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(full_name) BETWEEN 2 AND 200
  AND length(email) BETWEEN 5 AND 320
  AND length(message) BETWEEN 10 AND 5000
);

-- No SELECT/UPDATE/DELETE policies = locked down to service_role only.
CREATE INDEX idx_discovery_submissions_created_at
  ON public.discovery_call_submissions (created_at DESC);