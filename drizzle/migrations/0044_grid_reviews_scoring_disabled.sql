CREATE TABLE public.grid_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  period date NOT NULL,
  kind text NOT NULL CHECK (kind IN ('self_assessment','staff_evidence_review')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted')),
  created_by uuid NOT NULL,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, period, kind)
);
COMMENT ON TABLE public.grid_reviews IS 'Grid monthly records. Scoring disabled: no score column until owner approves rewritten criteria and specialist review.';
CREATE TABLE public.grid_review_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.grid_reviews(id) ON DELETE CASCADE,
  dimension text NOT NULL CHECK (dimension IN ('documentation','compliance_calendar','financial_coordination','operational_workflow','startup_readiness')),
  observation text NOT NULL DEFAULT '' CHECK (char_length(observation) <= 2000),
  evidence text NOT NULL DEFAULT '' CHECK (char_length(evidence) <= 1000),
  updated_by uuid NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (review_id, dimension)
);
GRANT SELECT ON public.grid_reviews, public.grid_review_entries TO authenticated;
GRANT ALL ON public.grid_reviews, public.grid_review_entries TO service_role;
ALTER TABLE public.grid_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grid_review_entries ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.grid_can_read(_user uuid, _org uuid, _kind text, _status text, _author uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.can_access_organization(_user, _org) AND (
    _status = 'submitted' OR _author = _user OR public.has_role(_user,'admin')
    OR (_kind = 'self_assessment' AND public.organization_role(_user, _org) IN ('owner','member')))
$$;
REVOKE ALL ON FUNCTION public.grid_can_read(uuid,uuid,text,text,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.grid_can_read(uuid,uuid,text,text,uuid) TO authenticated;

CREATE POLICY "Grid reviews readable by role" ON public.grid_reviews FOR SELECT TO authenticated
  USING (public.grid_can_read(auth.uid(), organization_id, kind, status, created_by));
CREATE POLICY "Grid entries follow their review" ON public.grid_review_entries FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.grid_reviews r WHERE r.id = review_id AND public.grid_can_read(auth.uid(), r.organization_id, r.kind, r.status, r.created_by)));

-- Self-assessment: company owner or member. Staff evidence review: staff with active company grant, or Admin/CEO.
-- Submitted records are final. No scoring input exists.
CREATE OR REPLACE FUNCTION public.grid_save_review(_org uuid, _period date, _kind text, _entries jsonb, _submit boolean) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v public.grid_reviews; v_period date := date_trunc('month', _period)::date; e jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required' USING ERRCODE='insufficient_privilege'; END IF;
  IF _kind = 'self_assessment' THEN
    IF public.organization_role(auth.uid(), _org) NOT IN ('owner','member') OR public.organization_role(auth.uid(), _org) IS NULL THEN
      RAISE EXCEPTION 'Only company owners and members can write the self-assessment' USING ERRCODE='insufficient_privilege'; END IF;
  ELSIF _kind = 'staff_evidence_review' THEN
    IF NOT (public.has_role(auth.uid(),'admin') OR (public.has_staff_role(auth.uid()) AND public.has_active_staff_grant(auth.uid(), _org))) THEN
      RAISE EXCEPTION 'Only Opsirix staff with access to this company can write the evidence review' USING ERRCODE='insufficient_privilege'; END IF;
  ELSE RAISE EXCEPTION 'Unknown record type' USING ERRCODE='check_violation'; END IF;
  IF v_period > date_trunc('month', now())::date THEN RAISE EXCEPTION 'Reviews cannot be written for a future month' USING ERRCODE='check_violation'; END IF;
  SELECT * INTO v FROM grid_reviews WHERE organization_id = _org AND period = v_period AND kind = _kind;
  IF v.id IS NOT NULL AND v.status = 'submitted' THEN RAISE EXCEPTION 'This record was submitted and is final' USING ERRCODE='check_violation'; END IF;
  IF v.id IS NOT NULL AND _kind = 'staff_evidence_review' AND v.created_by <> auth.uid() AND NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'Another staff member is drafting this review' USING ERRCODE='insufficient_privilege'; END IF;
  IF v.id IS NULL THEN
    INSERT INTO grid_reviews (organization_id, period, kind, created_by) VALUES (_org, v_period, _kind, auth.uid()) RETURNING * INTO v;
  END IF;
  FOR e IN SELECT * FROM jsonb_array_elements(coalesce(_entries,'[]'::jsonb)) LOOP
    INSERT INTO grid_review_entries (review_id, dimension, observation, evidence, updated_by)
    VALUES (v.id, e->>'dimension', left(coalesce(e->>'observation',''),2000), left(coalesce(e->>'evidence',''),1000), auth.uid())
    ON CONFLICT (review_id, dimension) DO UPDATE SET observation = EXCLUDED.observation, evidence = EXCLUDED.evidence, updated_by = auth.uid(), updated_at = now();
  END LOOP;
  IF _submit THEN
    IF (SELECT count(*) FROM grid_review_entries WHERE review_id = v.id AND btrim(observation) <> '') < 5 THEN
      RAISE EXCEPTION 'Add an observation for all five areas before submitting' USING ERRCODE='check_violation'; END IF;
    UPDATE grid_reviews SET status = 'submitted', submitted_at = now(), updated_at = now() WHERE id = v.id;
  ELSE
    UPDATE grid_reviews SET updated_at = now() WHERE id = v.id;
  END IF;
  INSERT INTO audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary, metadata)
  VALUES (_org, auth.uid(), CASE WHEN _submit THEN 'grid.submitted' ELSE 'grid.draft_saved' END, 'grid', v.id::text,
    CASE WHEN _kind = 'self_assessment' THEN 'Grid self-assessment ' ELSE 'Grid staff evidence review ' END || CASE WHEN _submit THEN 'submitted.' ELSE 'draft saved.' END,
    jsonb_build_object('period', v_period, 'kind', _kind));
  RETURN v.id;
END $$;
REVOKE ALL ON FUNCTION public.grid_save_review(uuid,date,text,jsonb,boolean) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.grid_save_review(uuid,date,text,jsonb,boolean) TO authenticated;