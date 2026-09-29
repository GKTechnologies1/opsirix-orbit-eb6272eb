ALTER TABLE public.launch_intakes ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE RESTRICT;
CREATE INDEX launch_intakes_organization_idx ON public.launch_intakes(organization_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.launch_save_intake_v2(_organization_id uuid, _answers jsonb, _name text, _email text, _submit boolean, _notice_version text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_row public.launch_intakes; v_was text;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF _organization_id IS NULL OR NOT EXISTS (SELECT 1 FROM public.organization_members m WHERE m.organization_id = _organization_id AND m.user_id = v_uid) THEN
    RAISE EXCEPTION 'Choose a company workspace you currently belong to' USING ERRCODE = '42501';
  END IF;
  IF jsonb_typeof(_answers) <> 'object' OR length(_answers::text) > 8000 THEN RAISE EXCEPTION 'Invalid answers'; END IF;
  IF _answers ?| ARRAY['immigration_status','visa','work_authorization','government_matter'] THEN RAISE EXCEPTION 'Field not collected in Launch intake'; END IF;
  SELECT * INTO v_row FROM public.launch_intakes WHERE user_id = v_uid AND status IN ('draft','submitted','changes_requested') FOR UPDATE;
  IF FOUND AND v_row.status = 'submitted' THEN RAISE EXCEPTION 'Intake already submitted and awaiting review'; END IF;
  IF FOUND AND v_row.organization_id IS NOT NULL AND v_row.organization_id <> _organization_id THEN RAISE EXCEPTION 'An open intake cannot be moved to another company'; END IF;
  IF NOT FOUND THEN
    INSERT INTO public.launch_intakes(user_id, organization_id) VALUES (v_uid, _organization_id) RETURNING * INTO v_row;
    INSERT INTO public.launch_events(intake_id, event, actor_id) VALUES (v_row.id, 'draft_started', v_uid);
  END IF;
  v_was := v_row.status;
  UPDATE public.launch_intakes SET organization_id = coalesce(organization_id, _organization_id), answers = _answers,
    name_override = nullif(btrim(coalesce(_name,'')), ''), email_override = nullif(btrim(coalesce(_email,'')), ''),
    status = CASE WHEN _submit THEN 'submitted' ELSE status END,
    ref = CASE WHEN _submit AND ref IS NULL THEN 'OX-LAUNCH-' || lpad(nextval('public.launch_intake_ref_seq')::text, 6, '0') ELSE ref END,
    submitted_at = CASE WHEN _submit THEN now() ELSE submitted_at END,
    scope_notice_version = CASE WHEN _submit THEN _notice_version ELSE scope_notice_version END,
    updated_at = now()
  WHERE id = v_row.id;
  IF _submit THEN
    INSERT INTO public.launch_events(intake_id, event, actor_id) VALUES (v_row.id, CASE WHEN v_was = 'changes_requested' THEN 'resubmitted' ELSE 'submitted' END, v_uid);
    INSERT INTO public.audit_events(organization_id, actor_id, event_type, subject_type, subject_id, summary)
      VALUES (_organization_id, v_uid, 'launch.intake_submitted', 'launch_intake', v_row.id::text, 'Launch intake submitted');
  END IF;
  RETURN v_row.id;
END $$;
REVOKE ALL ON FUNCTION public.launch_save_intake_v2(uuid,jsonb,text,text,boolean,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.launch_save_intake_v2(uuid,jsonb,text,text,boolean,text) TO authenticated;
COMMENT ON COLUMN public.launch_intakes.organization_id IS 'Company workspace selected by the founder; new writes require current membership.';