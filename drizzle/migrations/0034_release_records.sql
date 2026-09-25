CREATE TABLE public.release_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key text NOT NULL,
  title text NOT NULL,
  authorized_by text NOT NULL,
  activated_by text NOT NULL,
  activated_at timestamptz NOT NULL,
  test_result text NOT NULL,
  effect_preview text NOT NULL,
  effect_live_site text NOT NULL,
  effect_backend text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.release_records TO authenticated;
GRANT ALL ON public.release_records TO service_role;
ALTER TABLE public.release_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read release records" ON public.release_records FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
-- Records are append-only: no update or delete policies exist.