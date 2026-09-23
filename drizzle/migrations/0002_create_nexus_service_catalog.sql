CREATE TYPE public.service_delivery_mode AS ENUM ('remote', 'in_person', 'both');
CREATE TYPE public.service_engagement AS ENUM ('project', 'ongoing', 'both');
CREATE TYPE public.service_pricing AS ENUM ('starting_price', 'price_range', 'custom_quote');
CREATE TYPE public.service_suggestion_status AS ENUM ('pending', 'approved', 'declined');

CREATE TABLE public.service_partner_types (
  id text PRIMARY KEY,
  label text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);
CREATE TABLE public.service_categories (
  id text PRIMARY KEY,
  partner_type text NOT NULL REFERENCES public.service_partner_types(id),
  label text NOT NULL,
  is_prominent boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);
CREATE TABLE public.service_catalog (
  id text PRIMARY KEY CHECK (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  partner_type text NOT NULL REFERENCES public.service_partner_types(id),
  category_id text NOT NULL REFERENCES public.service_categories(id),
  label text NOT NULL,
  description text NOT NULL,
  search_aliases text[] NOT NULL DEFAULT '{}',
  display_order int NOT NULL DEFAULT 0,
  qualification_note text,
  is_active boolean NOT NULL DEFAULT true,
  catalog_version int NOT NULL DEFAULT 1,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  retired_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX service_catalog_type_idx ON public.service_catalog(partner_type, category_id, display_order);

CREATE TABLE public.service_catalog_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id text NOT NULL REFERENCES public.service_catalog(id),
  change_type text NOT NULL CHECK (change_type IN ('added', 'renamed', 'updated', 'retired', 'restored')),
  previous_label text,
  new_label text,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  catalog_version int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.partner_service_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id uuid REFERENCES public.partner_applications(id) ON DELETE CASCADE,
  partner_type text NOT NULL REFERENCES public.service_partner_types(id),
  service_id text NOT NULL REFERENCES public.service_catalog(id),
  offering_description text CHECK (char_length(offering_description) <= 1000),
  client_types text CHECK (char_length(client_types) <= 300),
  industries text CHECK (char_length(industries) <= 300),
  geography text CHECK (char_length(geography) <= 300),
  delivery_mode public.service_delivery_mode,
  engagement public.service_engagement,
  pricing public.service_pricing,
  price_min numeric(12,2) CHECK (price_min IS NULL OR price_min >= 0),
  price_max numeric(12,2) CHECK (price_max IS NULL OR price_max >= 0),
  accepting_inquiries boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  responsible_professional text CHECK (char_length(responsible_professional) <= 200),
  professional_jurisdiction text CHECK (char_length(professional_jurisdiction) <= 200),
  review_status text NOT NULL DEFAULT 'draft' CHECK (review_status IN ('draft', 'approved')),
  qualification_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, partner_type, service_id)
);
CREATE INDEX partner_service_selections_user_idx ON public.partner_service_selections(user_id);
CREATE INDEX partner_service_selections_service_idx ON public.partner_service_selections(service_id);

CREATE TABLE public.partner_service_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_type text NOT NULL REFERENCES public.service_partner_types(id),
  category_id text REFERENCES public.service_categories(id),
  label text NOT NULL CHECK (char_length(label) BETWEEN 2 AND 120),
  description text NOT NULL CHECK (char_length(description) BETWEEN 20 AND 1000),
  status public.service_suggestion_status NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  resulting_service_id text REFERENCES public.service_catalog(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Service type/category must match catalog; service must match chosen type
CREATE OR REPLACE FUNCTION public.check_service_selection()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.service_catalog c WHERE c.id = NEW.service_id AND c.partner_type = NEW.partner_type) THEN
    RAISE EXCEPTION 'Service % does not belong to partner type %', NEW.service_id, NEW.partner_type;
  END IF;
  IF TG_OP = 'INSERT' AND NOT EXISTS (SELECT 1 FROM public.service_catalog c WHERE c.id = NEW.service_id AND c.is_active) THEN
    RAISE EXCEPTION 'Service % is retired and cannot be newly selected', NEW.service_id;
  END IF;
  IF NEW.is_featured AND (SELECT count(*) FROM public.partner_service_selections s WHERE s.user_id = NEW.user_id AND s.is_featured AND s.id <> NEW.id) >= 3 THEN
    RAISE EXCEPTION 'You can feature up to three services';
  END IF;
  IF NOT public.has_role(auth.uid(), 'admin') AND auth.role() <> 'service_role' THEN
    NEW.review_status := 'draft';
    NEW.qualification_verified := false;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER partner_service_selections_check BEFORE INSERT OR UPDATE ON public.partner_service_selections
FOR EACH ROW EXECUTE FUNCTION public.check_service_selection();

CREATE OR REPLACE FUNCTION public.force_pending_suggestion()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') AND auth.role() <> 'service_role' THEN
    NEW.status := 'pending'; NEW.reviewed_by := NULL; NEW.reviewed_at := NULL; NEW.resulting_service_id := NULL;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER partner_service_suggestions_pending BEFORE INSERT OR UPDATE ON public.partner_service_suggestions
FOR EACH ROW EXECUTE FUNCTION public.force_pending_suggestion();

GRANT SELECT ON public.service_partner_types, public.service_categories, public.service_catalog TO anon, authenticated;
GRANT INSERT, UPDATE ON public.service_partner_types, public.service_categories, public.service_catalog TO authenticated;
GRANT SELECT, INSERT ON public.service_catalog_changes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_service_selections, public.partner_service_suggestions TO authenticated;
GRANT ALL ON public.service_partner_types, public.service_categories, public.service_catalog, public.service_catalog_changes, public.partner_service_selections, public.partner_service_suggestions TO service_role;

ALTER TABLE public.service_partner_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_catalog_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_service_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_service_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read partner types" ON public.service_partner_types FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can read categories" ON public.service_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can read catalog" ON public.service_catalog FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage partner types" ON public.service_partner_types FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage categories" ON public.service_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage catalog" ON public.service_catalog FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins read catalog changes" ON public.service_catalog_changes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins record catalog changes" ON public.service_catalog_changes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND changed_by = auth.uid());

CREATE POLICY "Partners read own selections" ON public.partner_service_selections FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Partners add own selections" ON public.partner_service_selections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Partners edit own selections" ON public.partner_service_selections FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Partners remove own selections" ON public.partner_service_selections FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage selections" ON public.partner_service_selections FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners read own suggestions" ON public.partner_service_suggestions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Partners add own suggestions" ON public.partner_service_suggestions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Partners edit own pending suggestions" ON public.partner_service_suggestions FOR UPDATE TO authenticated USING (auth.uid() = user_id AND status = 'pending') WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Partners remove own pending suggestions" ON public.partner_service_suggestions FOR DELETE TO authenticated USING (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Admins manage suggestions" ON public.partner_service_suggestions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));