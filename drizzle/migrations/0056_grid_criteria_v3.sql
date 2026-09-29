ALTER TABLE public.grid_reviews ADD COLUMN IF NOT EXISTS criteria_version text NOT NULL DEFAULT 'grid-dimensions-v1';

CREATE TABLE public.grid_criterion_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.grid_reviews(id) ON DELETE CASCADE,
  criterion text NOT NULL,
  answer text,
  counts jsonb NOT NULL DEFAULT '{}'::jsonb,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  note text NOT NULL DEFAULT '',
  updated_by uuid NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (review_id, criterion)
);
GRANT SELECT ON public.grid_criterion_answers TO authenticated;
GRANT ALL ON public.grid_criterion_answers TO service_role;
ALTER TABLE public.grid_criterion_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Grid answers follow their review" ON public.grid_criterion_answers FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.grid_reviews r WHERE r.id = grid_criterion_answers.review_id
  AND public.grid_can_read(auth.uid(), r.organization_id, r.kind, r.status, r.created_by)));

-- Free-text v1 entries may not be attached to a v3 record.
CREATE OR REPLACE FUNCTION public.grid_entries_v1_only() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF (SELECT criteria_version FROM grid_reviews WHERE id = NEW.review_id) <> 'grid-dimensions-v1' THEN
    RAISE EXCEPTION 'This month uses criteria version 3' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER grid_entries_v1_only BEFORE INSERT OR UPDATE ON public.grid_review_entries FOR EACH ROW EXECUTE FUNCTION public.grid_entries_v1_only();

CREATE OR REPLACE FUNCTION public.grid_v3_check(_c text, _kind text, _a jsonb) RETURNS void
LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE
  ans text := _a->>'answer'; cnt jsonb := coalesce(_a->'counts','{}'::jsonb); det jsonb := coalesce(_a->'detail','{}'::jsonb);
  note text := coalesce(_a->>'note',''); k text; v jsonb; st text; lbl text; area text;
  choice text[] := ARRAY['in_place','partly','not_yet','evidence_not_shown','not_applicable'];
  n_total numeric;
BEGIN
  IF length(_a::text) > 2000 THEN RAISE EXCEPTION 'Answer too long' USING ERRCODE='check_violation'; END IF;
  IF length(note) > 300 THEN RAISE EXCEPTION 'Notes are limited to 300 characters' USING ERRCODE='check_violation'; END IF;
  IF jsonb_typeof(cnt) <> 'object' OR jsonb_typeof(det) <> 'object' THEN RAISE EXCEPTION 'Invalid answer' USING ERRCODE='check_violation'; END IF;
  FOR k, v IN SELECT * FROM jsonb_each(cnt) LOOP
    IF jsonb_typeof(v) <> 'number' OR (v#>>'{}')::numeric <> floor((v#>>'{}')::numeric) OR (v#>>'{}')::numeric < 0 OR (v#>>'{}')::numeric > 10000 THEN
      RAISE EXCEPTION 'Counts must be whole numbers from 0 to 10000' USING ERRCODE='check_violation'; END IF;
  END LOOP;
  IF cnt ? 'total' THEN
    n_total := (cnt->>'total')::numeric;
    FOR k, v IN SELECT * FROM jsonb_each(cnt) WHERE key <> 'total' LOOP
      IF (v#>>'{}')::numeric > n_total THEN RAISE EXCEPTION 'A count cannot be larger than the total' USING ERRCODE='check_violation'; END IF;
    END LOOP;
  END IF;

  IF _c IN ('engagement_record','calendar_current','calendar_entries','overdue_status','business_account','vendor_paperwork','board_updated','tasks_owner_due','responsibilities','doc_locations','major_contracts') THEN
    IF ans IS NULL OR NOT ans = ANY(choice) THEN RAISE EXCEPTION 'Choose an answer for every check' USING ERRCODE='check_violation'; END IF;
    IF ans = 'not_applicable' AND _c IN ('calendar_current','business_account','board_updated','doc_locations') THEN
      RAISE EXCEPTION 'Not applicable is not allowed for this check' USING ERRCODE='check_violation'; END IF;
    IF ans = 'not_applicable' AND btrim(note) = '' THEN RAISE EXCEPTION 'Add a one-line reason for Not applicable' USING ERRCODE='check_violation'; END IF;
  ELSIF _c IN ('tasks_by_due','long_overdue','retrieval') THEN
    IF ans IS NOT NULL THEN RAISE EXCEPTION 'This check records counts, not a choice' USING ERRCODE='check_violation'; END IF;
  ELSE
    RAISE EXCEPTION 'Unknown or inactive check' USING ERRCODE='check_violation';
  END IF;

  IF _c = 'business_account' THEN
    IF ans = 'partly' OR note <> '' OR cnt <> '{}'::jsonb OR det <> '{}'::jsonb THEN
      RAISE EXCEPTION 'Only whether a business account was shown is recorded' USING ERRCODE='check_violation'; END IF;
  ELSIF _c = 'overdue_status' THEN
    IF cnt ? 'overdue' AND coalesce((cnt->>'done')::int,0) + coalesce((cnt->>'extended')::int,0) + coalesce((cnt->>'referred')::int,0) + coalesce((cnt->>'no_status')::int,0) <> (cnt->>'overdue')::int THEN
      RAISE EXCEPTION 'Done, Extended, Referred and No status must add up to the overdue count' USING ERRCODE='check_violation'; END IF;
    IF coalesce((cnt->>'extended')::int,0) > 0 AND coalesce(det->>'extended_dates_recorded','') <> 'true' THEN
      RAISE EXCEPTION 'Extended entries need a new date recorded in the calendar' USING ERRCODE='check_violation'; END IF;
  ELSIF _c = 'responsibilities' THEN
    IF det - ARRAY['bookkeeping','bills','calendar'] <> '{}'::jsonb THEN RAISE EXCEPTION 'Only the three responsibility areas are recorded' USING ERRCODE='check_violation'; END IF;
    IF ans <> 'evidence_not_shown' THEN
      FOREACH area IN ARRAY ARRAY['bookkeeping','bills','calendar'] LOOP
        IF coalesce(det->>area,'') NOT IN ('assigned','not_assigned','not_applicable') THEN
          RAISE EXCEPTION 'Record each responsibility area' USING ERRCODE='check_violation'; END IF;
      END LOOP;
    END IF;
  ELSIF _c = 'doc_locations' THEN
    IF ans IN ('in_place','partly') AND jsonb_array_length(coalesce(det->'labels','[]'::jsonb)) = 0 THEN
      RAISE EXCEPTION 'Name at least one location' USING ERRCODE='check_violation'; END IF;
    IF jsonb_array_length(coalesce(det->'labels','[]'::jsonb)) > 5 THEN RAISE EXCEPTION 'Up to five locations' USING ERRCODE='check_violation'; END IF;
    FOR lbl IN SELECT jsonb_array_elements_text(coalesce(det->'labels','[]'::jsonb)) LOOP
      IF length(btrim(lbl)) = 0 OR length(lbl) > 60 OR lbl ~* '(://|www\.|@|\.com|\.net|\.org|password)' THEN
        RAISE EXCEPTION 'Use a location type or short label, not a link or login' USING ERRCODE='check_violation'; END IF;
    END LOOP;
  END IF;

  IF _c IN ('board_updated','tasks_owner_due','tasks_by_due','long_overdue') AND det ? 'source' AND det->>'source' NOT IN ('flow','external') THEN
    RAISE EXCEPTION 'Invalid board source' USING ERRCODE='check_violation'; END IF;
  IF _c IN ('board_updated','tasks_owner_due') AND ans NOT IN ('evidence_not_shown','not_yet','not_applicable') AND NOT det ? 'source' THEN
    RAISE EXCEPTION 'Say whether the board is Opsirix Flow or an external board' USING ERRCODE='check_violation'; END IF;
  IF _c = 'board_updated' AND det ? 'last_update' AND (det->>'last_update')::date > current_date THEN
    RAISE EXCEPTION 'The last update cannot be in the future' USING ERRCODE='check_violation'; END IF;

  IF _c = 'tasks_by_due' THEN
    st := coalesce(det->>'status','');
    IF st = 'counted' THEN
      IF NOT det ? 'source' OR coalesce((cnt->>'due')::int,0) = 0 THEN RAISE EXCEPTION 'Enter the tasks due and the board source, or choose No tasks due' USING ERRCODE='check_violation'; END IF;
      IF coalesce((cnt->>'completed')::int,0) + coalesce((cnt->>'updated_only')::int,0) > (cnt->>'due')::int THEN
        RAISE EXCEPTION 'Completed and updated-only tasks cannot exceed tasks due' USING ERRCODE='check_violation'; END IF;
    ELSIF st IN ('no_tasks_due','no_data') THEN
      IF cnt <> '{}'::jsonb THEN RAISE EXCEPTION 'No counts are recorded when there were no tasks due or no data' USING ERRCODE='check_violation'; END IF;
    ELSE RAISE EXCEPTION 'Record the task counts, No tasks due, or No data' USING ERRCODE='check_violation'; END IF;
  ELSIF _c = 'long_overdue' THEN
    st := coalesce(det->>'status','');
    IF st = 'counted' THEN IF NOT cnt ? 'overdue_30' OR NOT det ? 'source' THEN RAISE EXCEPTION 'Enter the count and board source, or choose No data' USING ERRCODE='check_violation'; END IF;
    ELSIF st = 'no_data' THEN IF cnt <> '{}'::jsonb THEN RAISE EXCEPTION 'No count is recorded with No data' USING ERRCODE='check_violation'; END IF;
    ELSE RAISE EXCEPTION 'Record the count or No data' USING ERRCODE='check_violation'; END IF;
  ELSIF _c = 'retrieval' THEN
    IF _kind <> 'staff_evidence_review' THEN RAISE EXCEPTION 'The retrieval exercise is part of the Opsirix evidence review only' USING ERRCODE='check_violation'; END IF;
    st := coalesce(det->>'status','');
    IF st = 'run' THEN
      IF jsonb_array_length(coalesce(det->'types','[]'::jsonb)) NOT BETWEEN 1 AND 3 THEN RAISE EXCEPTION 'Pick one to three document types' USING ERRCODE='check_violation'; END IF;
      IF EXISTS (SELECT 1 FROM jsonb_array_elements_text(det->'types') t WHERE t NOT IN ('engagement_record','vendor_paperwork','major_contracts')) THEN
        RAISE EXCEPTION 'Only active document checks can be used' USING ERRCODE='check_violation'; END IF;
      IF (SELECT count(DISTINCT t) FROM jsonb_array_elements_text(det->'types') t) <> jsonb_array_length(det->'types') THEN RAISE EXCEPTION 'Pick each type once' USING ERRCODE='check_violation'; END IF;
      IF NOT cnt ? 'found' OR (cnt->>'found')::int > jsonb_array_length(det->'types') THEN RAISE EXCEPTION 'Found cannot exceed the types picked' USING ERRCODE='check_violation'; END IF;
    ELSIF st = 'not_run' THEN NULL;
    ELSE RAISE EXCEPTION 'Record the retrieval result or Not run' USING ERRCODE='check_violation'; END IF;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.grid_save_criteria(_org uuid, _period date, _kind text, _answers jsonb, _submit boolean)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v public.grid_reviews; v_period date := date_trunc('month', _period)::date; a jsonb; t text;
  required text[] := ARRAY['engagement_record','calendar_current','calendar_entries','overdue_status','business_account','vendor_paperwork','board_updated','tasks_owner_due','responsibilities','tasks_by_due','long_overdue','doc_locations','major_contracts'];
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required' USING ERRCODE='insufficient_privilege'; END IF;
  IF _kind = 'self_assessment' THEN
    IF coalesce(public.organization_role(auth.uid(), _org)::text,'') NOT IN ('owner','member') THEN
      RAISE EXCEPTION 'Only company owners and members can write the self-assessment' USING ERRCODE='insufficient_privilege'; END IF;
  ELSIF _kind = 'staff_evidence_review' THEN
    IF NOT (public.has_role(auth.uid(),'admin') OR (public.has_staff_role(auth.uid()) AND public.has_active_staff_grant(auth.uid(), _org))) THEN
      RAISE EXCEPTION 'Only Opsirix staff with access to this company can write the evidence review' USING ERRCODE='insufficient_privilege'; END IF;
  ELSE RAISE EXCEPTION 'Unknown record type' USING ERRCODE='check_violation'; END IF;
  IF v_period > date_trunc('month', now())::date THEN RAISE EXCEPTION 'Reviews cannot be written for a future month' USING ERRCODE='check_violation'; END IF;
  IF jsonb_typeof(coalesce(_answers,'[]'::jsonb)) <> 'array' OR jsonb_array_length(coalesce(_answers,'[]'::jsonb)) > 14 THEN RAISE EXCEPTION 'Invalid answers' USING ERRCODE='check_violation'; END IF;

  SELECT * INTO v FROM grid_reviews WHERE organization_id = _org AND period = v_period AND kind = _kind;
  IF v.id IS NOT NULL AND v.status = 'submitted' THEN RAISE EXCEPTION 'This record was submitted and is final' USING ERRCODE='check_violation'; END IF;
  IF v.id IS NOT NULL AND v.criteria_version <> 'grid-criteria-v3' THEN RAISE EXCEPTION 'This month already has a record using the earlier Grid format' USING ERRCODE='check_violation'; END IF;
  IF v.id IS NOT NULL AND _kind = 'staff_evidence_review' AND v.created_by <> auth.uid() AND NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'Another staff member is drafting this review' USING ERRCODE='insufficient_privilege'; END IF;

  FOR a IN SELECT * FROM jsonb_array_elements(coalesce(_answers,'[]'::jsonb)) LOOP
    PERFORM public.grid_v3_check(a->>'criterion', _kind, a);
  END LOOP;
  IF (SELECT count(DISTINCT x->>'criterion') FROM jsonb_array_elements(coalesce(_answers,'[]'::jsonb)) x) <> jsonb_array_length(coalesce(_answers,'[]'::jsonb)) THEN
    RAISE EXCEPTION 'Each check can be answered once' USING ERRCODE='check_violation'; END IF;
  -- Retrieval may only use types that apply (not marked Not applicable) in this same record.
  FOR t IN SELECT jsonb_array_elements_text(x->'detail'->'types') FROM jsonb_array_elements(coalesce(_answers,'[]'::jsonb)) x WHERE x->>'criterion' = 'retrieval' AND x->'detail'->>'status' = 'run' LOOP
    IF NOT EXISTS (SELECT 1 FROM jsonb_array_elements(_answers) y WHERE y->>'criterion' = t AND coalesce(y->>'answer','') NOT IN ('','not_applicable')) THEN
      RAISE EXCEPTION 'Retrieval can only use document checks that apply to this company' USING ERRCODE='check_violation'; END IF;
  END LOOP;
  IF _submit AND EXISTS (SELECT 1 FROM unnest(required) r WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(_answers,'[]'::jsonb)) x WHERE x->>'criterion' = r)) THEN
    RAISE EXCEPTION 'Answer all 13 checks before submitting' USING ERRCODE='check_violation'; END IF;

  IF v.id IS NULL THEN
    INSERT INTO grid_reviews (organization_id, period, kind, created_by, criteria_version) VALUES (_org, v_period, _kind, auth.uid(), 'grid-criteria-v3') RETURNING * INTO v;
  END IF;
  DELETE FROM grid_criterion_answers WHERE review_id = v.id;
  INSERT INTO grid_criterion_answers (review_id, criterion, answer, counts, detail, note, updated_by)
  SELECT v.id, x->>'criterion', x->>'answer', coalesce(x->'counts','{}'::jsonb), coalesce(x->'detail','{}'::jsonb), coalesce(x->>'note',''), auth.uid()
  FROM jsonb_array_elements(coalesce(_answers,'[]'::jsonb)) x;
  UPDATE grid_reviews SET status = CASE WHEN _submit THEN 'submitted' ELSE status END, submitted_at = CASE WHEN _submit THEN now() ELSE submitted_at END, updated_at = now() WHERE id = v.id;
  INSERT INTO audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary, metadata)
  VALUES (_org, auth.uid(), CASE WHEN _submit THEN 'grid.submitted' ELSE 'grid.draft_saved' END, 'grid', v.id::text,
    CASE WHEN _kind = 'self_assessment' THEN 'Grid self-assessment ' ELSE 'Grid staff evidence review ' END || CASE WHEN _submit THEN 'submitted.' ELSE 'draft saved.' END,
    jsonb_build_object('period', v_period, 'kind', _kind, 'criteria_version', 'grid-criteria-v3'));
  RETURN v.id;
END $$;
REVOKE ALL ON FUNCTION public.grid_save_criteria(uuid, date, text, jsonb, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grid_save_criteria(uuid, date, text, jsonb, boolean) TO authenticated;