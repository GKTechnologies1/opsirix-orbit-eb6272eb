CREATE TABLE public.launch_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id uuid NOT NULL REFERENCES public.launch_intakes(id) ON DELETE CASCADE,
  assignee_id uuid NOT NULL,
  assigned_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  revoked_by uuid
);
CREATE UNIQUE INDEX launch_assignments_one_active ON public.launch_assignments(intake_id) WHERE revoked_at IS NULL;
GRANT SELECT ON public.launch_assignments TO authenticated;
GRANT ALL ON public.launch_assignments TO service_role;
ALTER TABLE public.launch_assignments ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.launch_can_review(_uid uuid, _intake uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(public.has_role(_uid, 'admin'), false)
    OR (coalesce(public.has_staff_role(_uid, ARRAY['operations_lead']::text[]), false)
        AND EXISTS (SELECT 1 FROM public.launch_assignments a WHERE a.intake_id = _intake AND a.assignee_id = _uid AND a.revoked_at IS NULL))
$$;
GRANT EXECUTE ON FUNCTION public.launch_can_review(uuid, uuid) TO authenticated, service_role;

CREATE POLICY "Admin sees all; assignee sees own assignment" ON public.launch_assignments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR assignee_id = auth.uid());

DROP POLICY "Founder reads own intake; reviewers read submitted" ON public.launch_intakes;
CREATE POLICY "Founder reads own intake; admin or assigned lead reads submitted" ON public.launch_intakes FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (status <> 'draft' AND public.launch_can_review(auth.uid(), id)));
DROP POLICY "Reviewers only read reviews" ON public.launch_reviews;
CREATE POLICY "Admin or assigned lead reads reviews" ON public.launch_reviews FOR SELECT TO authenticated
  USING (public.launch_can_review(auth.uid(), intake_id));
DROP POLICY "Founder or reviewer reads events" ON public.launch_events;
CREATE POLICY "Founder, admin or assigned lead reads events" ON public.launch_events FOR SELECT TO authenticated
  USING (public.launch_can_review(auth.uid(), intake_id) OR EXISTS (SELECT 1 FROM public.launch_intakes i WHERE i.id = intake_id AND i.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.launch_assign(_intake uuid, _assignee uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_status text;
BEGIN
  IF NOT coalesce(public.has_role(v_uid, 'admin'), false) THEN RAISE EXCEPTION 'Only the Admin/CEO can assign Launch intakes'; END IF;
  SELECT status INTO v_status FROM public.launch_intakes WHERE id = _intake FOR UPDATE;
  IF v_status IS NULL OR v_status = 'draft' THEN RAISE EXCEPTION 'Only submitted intakes can be assigned'; END IF;
  IF _assignee IS NOT NULL AND NOT coalesce(public.has_staff_role(_assignee, ARRAY['operations_lead']::text[]), false) THEN
    RAISE EXCEPTION 'Assignee must be an Operations Lead'; END IF;
  UPDATE public.launch_assignments SET revoked_at = now(), revoked_by = v_uid WHERE intake_id = _intake AND revoked_at IS NULL;
  IF _assignee IS NOT NULL THEN
    INSERT INTO public.launch_assignments(intake_id, assignee_id, assigned_by) VALUES (_intake, _assignee, v_uid);
  END IF;
  INSERT INTO public.launch_events(intake_id, event, actor_id) VALUES (_intake, CASE WHEN _assignee IS NULL THEN 'unassigned' ELSE 'assigned' END, v_uid);
  INSERT INTO public.audit_events(actor_id, event_type, subject_type, subject_id, summary)
    VALUES (v_uid, 'launch.assignment', 'launch_intake', _intake::text, CASE WHEN _assignee IS NULL THEN 'Launch intake unassigned' ELSE 'Launch intake assigned' END);
END $$;
REVOKE ALL ON FUNCTION public.launch_assign(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.launch_assign(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.launch_record_review(_intake uuid, _kind text, _outcome text, _reason text, _founder_message text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_status text;
BEGIN
  IF NOT public.launch_can_review(v_uid, _intake) THEN RAISE EXCEPTION 'Not authorized'; END IF;
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