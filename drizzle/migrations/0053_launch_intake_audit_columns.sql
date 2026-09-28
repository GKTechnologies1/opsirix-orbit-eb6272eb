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
    INSERT INTO public.audit_events(actor_id, event_type, subject_type, subject_id, summary)
      VALUES (v_uid, 'launch.intake_submitted', 'launch_intake', v_row.id::text, 'Launch intake submitted');
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
  INSERT INTO public.audit_events(actor_id, event_type, subject_type, subject_id, summary)
    VALUES (v_uid, 'launch.' || _kind, 'launch_intake', _intake::text, CASE WHEN _kind = 'outcome' THEN 'Launch outcome recorded' ELSE 'Launch correction requested' END);
END $$;