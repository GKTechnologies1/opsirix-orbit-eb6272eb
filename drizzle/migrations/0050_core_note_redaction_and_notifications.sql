-- 1. Admin oversight: status-history notes are redacted unless the caller can read the request (membership or active owner grant).
CREATE OR REPLACE FUNCTION public.core_admin_oversight()
 RETURNS TABLE(id uuid, ref text, organization_id uuid, organization_name text, title text, status text, requested_by uuid, handled_by uuid, board_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, events jsonb, access_grants jsonb)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN RETURN; END IF;
  RETURN QUERY
  SELECT r.id, r.ref, r.organization_id, o.name, r.title, r.status,
    r.requested_by, r.handled_by, r.board_id, r.created_at, r.updated_at,
    coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'id', e.id, 'from_status', e.from_status, 'to_status', e.to_status,
        'note', NULL,
        'note_redacted', e.note IS NOT NULL,
        'actor_id', e.actor_id, 'created_at', e.created_at
      ) ORDER BY e.created_at)
      FROM core_request_events e WHERE e.request_id = r.id
    ), '[]'::jsonb),
    coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'id', g.id, 'staff_user_id', g.staff_user_id,
        'staff_label', coalesce(nullif(p.full_name,''), p.email, 'Opsirix staff'),
        'scope', g.scope, 'purpose', g.purpose, 'expires_at', g.expires_at,
        'created_at', g.created_at, 'revoked_at', g.revoked_at,
        'state', CASE WHEN g.revoked_at IS NOT NULL THEN 'revoked' WHEN g.expires_at <= now() THEN 'expired' ELSE 'active' END
      ) ORDER BY g.created_at DESC)
      FROM core_access_grants g LEFT JOIN profiles p ON p.id = g.staff_user_id
      WHERE g.request_id = r.id
    ), '[]'::jsonb)
  FROM core_requests r JOIN organizations o ON o.id = r.organization_id
  ORDER BY r.created_at DESC;
END $function$;

-- 2. In-app Core notifications (no email). Generic title + reference + time only.
CREATE TABLE public.core_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL,
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  request_id uuid NOT NULL REFERENCES public.core_requests(id),
  event text NOT NULL CHECK (event IN ('submitted','accepted','ready','reopened','access_revoked','access_expired')),
  ref text NOT NULL,
  dedupe_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  UNIQUE (recipient_id, dedupe_key)
);
CREATE INDEX core_notifications_recipient_idx ON public.core_notifications (recipient_id, created_at DESC);
GRANT SELECT ON public.core_notifications TO authenticated;
GRANT ALL ON public.core_notifications TO service_role;
ALTER TABLE public.core_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recipients read their own Core notifications" ON public.core_notifications
  FOR SELECT TO authenticated USING (recipient_id = auth.uid());

CREATE OR REPLACE FUNCTION public.core_notify_event()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE r public.core_requests; v_event text;
BEGIN
  SELECT * INTO r FROM core_requests WHERE id = NEW.request_id;
  v_event := CASE
    WHEN NEW.to_status = 'submitted' THEN 'submitted'
    WHEN NEW.to_status = 'accepted' AND NEW.from_status = 'awaiting_owner' THEN 'reopened'
    WHEN NEW.to_status = 'accepted' THEN 'accepted'
    WHEN NEW.to_status = 'awaiting_owner' THEN 'ready'
    ELSE NULL END;
  IF v_event IS NULL THEN RETURN NEW; END IF;
  IF v_event IN ('submitted','accepted','ready') THEN
    INSERT INTO core_notifications (recipient_id, organization_id, request_id, event, ref, dedupe_key, created_at)
    SELECT m.user_id, NEW.organization_id, NEW.request_id, v_event, r.ref, 'event:' || NEW.id, NEW.created_at
    FROM organization_members m
    WHERE m.organization_id = NEW.organization_id AND m.role = 'owner' AND m.user_id IS DISTINCT FROM NEW.actor_id
    ON CONFLICT (recipient_id, dedupe_key) DO NOTHING;
  ELSE -- reopened: the handling staff member and staff with an active handle grant
    INSERT INTO core_notifications (recipient_id, organization_id, request_id, event, ref, dedupe_key, created_at)
    SELECT DISTINCT s.uid, NEW.organization_id, NEW.request_id, v_event, r.ref, 'event:' || NEW.id, NEW.created_at
    FROM (
      SELECT r.handled_by AS uid WHERE r.handled_by IS NOT NULL AND public.core_can_handle(r.handled_by, r.id)
      UNION SELECT g.staff_user_id FROM core_access_grants g
        WHERE g.request_id = r.id AND g.scope = 'handle' AND g.revoked_at IS NULL AND g.expires_at > now()
    ) s WHERE s.uid IS DISTINCT FROM NEW.actor_id
    ON CONFLICT (recipient_id, dedupe_key) DO NOTHING;
  END IF;
  RETURN NEW;
END $function$;
CREATE TRIGGER core_notify_event_trg AFTER INSERT ON public.core_request_events
  FOR EACH ROW EXECUTE FUNCTION public.core_notify_event();

CREATE OR REPLACE FUNCTION public.core_notify_revoked()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.revoked_at IS NULL AND NEW.revoked_at IS NOT NULL AND OLD.expires_at > NEW.revoked_at THEN
    INSERT INTO core_notifications (recipient_id, organization_id, request_id, event, ref, dedupe_key, created_at)
    SELECT NEW.staff_user_id, NEW.organization_id, NEW.request_id, 'access_revoked', r.ref, 'revoked:' || NEW.id, NEW.revoked_at
    FROM core_requests r WHERE r.id = NEW.request_id
    ON CONFLICT (recipient_id, dedupe_key) DO NOTHING;
  END IF;
  RETURN NEW;
END $function$;
CREATE TRIGGER core_notify_revoked_trg AFTER UPDATE OF revoked_at ON public.core_access_grants
  FOR EACH ROW EXECUTE FUNCTION public.core_notify_revoked();

-- Expiry has no event row, so it is recorded (once) when the staff member next loads notifications.
CREATE OR REPLACE FUNCTION public.core_my_notifications()
 RETURNS TABLE(id uuid, event text, ref text, request_id uuid, created_at timestamptz, read_at timestamptz)
 LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  INSERT INTO core_notifications (recipient_id, organization_id, request_id, event, ref, dedupe_key, created_at)
  SELECT g.staff_user_id, g.organization_id, g.request_id, 'access_expired', r.ref, 'expired:' || g.id, g.expires_at
  FROM core_access_grants g JOIN core_requests r ON r.id = g.request_id
  WHERE g.staff_user_id = auth.uid() AND g.revoked_at IS NULL AND g.expires_at <= now()
  ON CONFLICT (recipient_id, dedupe_key) DO NOTHING;
  RETURN QUERY SELECT n.id, n.event, n.ref, n.request_id, n.created_at, n.read_at
    FROM core_notifications n WHERE n.recipient_id = auth.uid() ORDER BY n.created_at DESC LIMIT 100;
END $function$;

CREATE OR REPLACE FUNCTION public.core_mark_notifications_read(_ids uuid[])
 RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v int;
BEGIN
  IF auth.uid() IS NULL THEN RETURN 0; END IF;
  UPDATE core_notifications SET read_at = now()
   WHERE recipient_id = auth.uid() AND read_at IS NULL AND (_ids IS NULL OR id = ANY(_ids));
  GET DIAGNOSTICS v = ROW_COUNT; RETURN v;
END $function$;

REVOKE ALL ON FUNCTION public.core_my_notifications() FROM public, anon;
REVOKE ALL ON FUNCTION public.core_mark_notifications_read(uuid[]) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.core_my_notifications() TO authenticated;
GRANT EXECUTE ON FUNCTION public.core_mark_notifications_read(uuid[]) TO authenticated;
REVOKE ALL ON FUNCTION public.core_notify_event() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.core_notify_revoked() FROM public, anon, authenticated;