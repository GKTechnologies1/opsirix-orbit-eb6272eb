-- Owners may resubmit a claim after a reviewer asked for changes (goes back to pending review, never to approved).
CREATE OR REPLACE FUNCTION public.guard_listing_type()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE is_admin boolean := public.has_role(auth.uid(), 'admin');
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF auth.uid() IS NULL OR auth.uid() <> NEW.user_id THEN
      RAISE EXCEPTION 'Only the organization itself can claim a partner type' USING ERRCODE = 'check_violation';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.partner_applications a WHERE a.id = NEW.application_id AND a.user_id = NEW.user_id AND a.application_kind = 'organization') THEN
      RAISE EXCEPTION 'An expression of interest cannot claim a listing type' USING ERRCODE = 'check_violation';
    END IF;
    IF NOT public.can_register_type(auth.uid(), NEW.partner_type_id) THEN
      RAISE EXCEPTION 'This partner type is not open for registration yet' USING ERRCODE = 'check_violation';
    END IF;
    NEW.review_status := 'pending'; NEW.reviewed_by := NULL; NEW.reviewed_at := NULL;
    RETURN NEW;
  END IF;
  IF NEW.partner_type_id <> OLD.partner_type_id OR NEW.user_id <> OLD.user_id OR NEW.application_id <> OLD.application_id THEN
    RAISE EXCEPTION 'A claimed partner type cannot be relabeled; the organization must claim the other type separately' USING ERRCODE = 'check_violation';
  END IF;
  IF NOT is_admin OR auth.uid() = NEW.user_id THEN
    IF NEW.review_status = 'withdrawn' THEN NULL;
    ELSIF OLD.review_status IN ('withdrawn','changes_requested') AND NEW.review_status = 'pending' THEN NULL;
    ELSE NEW.review_status := OLD.review_status; END IF;
    IF NEW.review_status IS DISTINCT FROM OLD.review_status THEN NEW.reviewed_by := NULL; NEW.reviewed_at := NULL;
    ELSE NEW.reviewed_by := OLD.reviewed_by; NEW.reviewed_at := OLD.reviewed_at; END IF;
    NEW.review_note := OLD.review_note;
    RETURN NEW;
  END IF;
  IF NEW.review_status = 'approved' AND OLD.review_status <> 'approved' AND NOT public.type_evidence_ok(NEW.application_id, NEW.partner_type_id) THEN
    RAISE EXCEPTION 'Type approval rejected: application, representative authority, agreement, or license evidence is incomplete' USING ERRCODE = 'check_violation';
  END IF;
  IF NEW.review_status = 'withdrawn' AND OLD.review_status <> 'withdrawn' THEN
    RAISE EXCEPTION 'Only the organization can withdraw its own claim' USING ERRCODE = 'check_violation';
  END IF;
  IF NEW.review_status IS DISTINCT FROM OLD.review_status THEN
    NEW.reviewed_by := auth.uid(); NEW.reviewed_at := now();
  END IF;
  RETURN NEW;
END $$;