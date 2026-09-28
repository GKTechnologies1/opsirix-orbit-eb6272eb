CREATE SEQUENCE IF NOT EXISTS public.launch_intake_ref_seq;

CREATE TABLE public.launch_intakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref text UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','changes_requested','reviewed')),
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  name_override text CHECK (name_override IS NULL OR length(name_override) <= 120),
  email_override text CHECK (email_override IS NULL OR length(email_override) <= 255),
  scope_notice_version text,
  founder_message text,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX launch_intakes_one_open_per_user ON public.launch_intakes(user_id) WHERE status IN ('draft','submitted','changes_requested');

CREATE TABLE public.launch_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id uuid NOT NULL REFERENCES public.launch_intakes(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('outcome','changes_requested')),
  outcome text CHECK (outcome IN ('ready_for_coordination','professional_input_recommended','outside_current_scope')),
  reason text NOT NULL CHECK (length(btrim(reason)) BETWEEN 10 AND 1000),
  founder_message text NOT NULL CHECK (length(btrim(founder_message)) BETWEEN 10 AND 1000),
  reviewer_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((kind = 'outcome') = (outcome IS NOT NULL))
);

CREATE TABLE public.launch_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id uuid NOT NULL REFERENCES public.launch_intakes(id) ON DELETE CASCADE,
  event text NOT NULL,
  actor_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.launch_intakes, public.launch_reviews, public.launch_events TO authenticated;
GRANT ALL ON public.launch_intakes, public.launch_reviews, public.launch_events TO service_role;
ALTER TABLE public.launch_intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.launch_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.launch_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.launch_is_reviewer(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(public.has_staff_role(_uid, ARRAY['admin','operations_lead']::text[]), false)
$$;
GRANT EXECUTE ON FUNCTION public.launch_is_reviewer(uuid) TO authenticated, service_role;

CREATE POLICY "Founder reads own intake; reviewers read submitted" ON public.launch_intakes FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (status <> 'draft' AND public.launch_is_reviewer(auth.uid())));
CREATE POLICY "Reviewers only read reviews" ON public.launch_reviews FOR SELECT TO authenticated
  USING (public.launch_is_reviewer(auth.uid()));
CREATE POLICY "Founder or reviewer reads events" ON public.launch_events FOR SELECT TO authenticated
  USING (public.launch_is_reviewer(auth.uid()) OR EXISTS (SELECT 1 FROM public.launch_intakes i WHERE i.id = intake_id AND i.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.launch_save_intake(_answers jsonb, _name text, _email text, _submit boolean, _notice_version text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_row public.launch_intakes; v_was text;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF jsonb_typeof(_answers) <> 'object' OR length(_answers::text) > 8000 THEN RAISE EXCEPTION 'Invalid answers'; END IF;
  IF _answers ?| ARRAY['immigration_status','visa','work_authorization','government_matter'] THEN RAISE EXCEPTION 'Field not collected in Launch intake'; END IF;
  SELECT * INTO v_row FROM public.launch_intakes WHERE user_id = v_uid AND status IN ('draft','submitted','changes_requested') FOR UPDATE;
  IF FOUND AND v_row.status = 'submitted' THEN RAISE EXCEPTION 'Intake already submitted and awaiting review'; END IF;
  IF NOT FOUND THEN
    INSERT INTO public.launch_intakes(user_id) VALUES (v_uid) RETURNING * INTO v_row;
    INSERT INTO public.launch_events(intake_id, event, actor_id) VALUES (v_row.id, 'draft_started', v_uid);
  END IF;
  v_was := v_row.status;
  UPDATE public.launch_intakes SET answers = _answers,
    name_override = nullif(btrim(coalesce(_name,'')), ''), email_override = nullif(btrim(coalesce(_email,'')), ''),
    status = CASE WHEN _submit THEN 'submitted' ELSE status END,
    ref = CASE WHEN _submit AND ref IS NULL THEN 'OX-LAUNCH-' || lpad(nextval('public.launch_intake_ref_seq')::text, 6, '0') ELSE ref END,
    submitted_at = CASE WHEN _submit THEN now() ELSE submitted_at END,
    scope_notice_version = CASE WHEN _submit THEN _notice_version ELSE scope_notice_version END,
    updated_at = now()
  WHERE id = v_row.id;
  IF _submit THEN
    INSERT INTO public.launch_events(intake_id, event, actor_id) VALUES (v_row.id, CASE WHEN v_was = 'changes_requested' THEN 'resubmitted' ELSE 'submitted' END, v_uid);
    INSERT INTO public.audit_events(actor_id, action, entity_type, entity_id, summary)
      VALUES (v_uid, 'launch.intake_submitted', 'launch_intake', v_row.id, 'Launch intake submitted');
  END IF;
  RETURN v_row.id;
END $$;

CREATE OR REPLACE FUNCTION public.launch_record_review(_intake uuid, _kind text, _outcome text, _reason text, _founder_message text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_status text;
BEGIN
  IF NOT public.launch_is_reviewer(v_uid) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT status INTO v_status FROM public.launch_intakes WHERE id = _intake FOR UPDATE;
  IF v_status IS DISTINCT FROM 'submitted' THEN RAISE EXCEPTION 'Only submitted intakes can be reviewed'; END IF;
  IF _kind NOT IN ('outcome','changes_requested') THEN RAISE EXCEPTION 'Invalid review type'; END IF;
  INSERT INTO public.launch_reviews(intake_id, kind, outcome, reason, founder_message, reviewer_id)
    VALUES (_intake, _kind, CASE WHEN _kind = 'outcome' THEN _outcome END, btrim(_reason), btrim(_founder_message), v_uid);
  UPDATE public.launch_intakes SET status = CASE WHEN _kind = 'outcome' THEN 'reviewed' ELSE 'changes_requested' END,
    founder_message = btrim(_founder_message), updated_at = now() WHERE id = _intake;
  INSERT INTO public.launch_events(intake_id, event, actor_id) VALUES (_intake, CASE WHEN _kind = 'outcome' THEN 'outcome_recorded' ELSE 'correction_requested' END, v_uid);
  INSERT INTO public.audit_events(actor_id, action, entity_type, entity_id, summary)
    VALUES (v_uid, 'launch.' || _kind, 'launch_intake', _intake, CASE WHEN _kind = 'outcome' THEN 'Launch outcome recorded' ELSE 'Launch correction requested' END);
END $$;

REVOKE ALL ON FUNCTION public.launch_save_intake(jsonb, text, text, boolean, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.launch_record_review(uuid, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.launch_save_intake(jsonb, text, text, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.launch_record_review(uuid, text, text, text, text) TO authenticated;