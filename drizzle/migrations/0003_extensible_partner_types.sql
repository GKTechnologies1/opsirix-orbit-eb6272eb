ALTER TABLE public.service_partner_types
  ADD COLUMN IF NOT EXISTS track text NOT NULL DEFAULT 'professional_service' CHECK (track IN ('professional_service', 'institution', 'brokerage')),
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS is_open_for_registration boolean NOT NULL DEFAULT true;
COMMENT ON TABLE public.service_partner_types IS 'Nexus partner types. Not exhaustive: new types (e.g. university, banking, insurance) are added as rows with their own track, hidden until is_open_for_registration is true.';