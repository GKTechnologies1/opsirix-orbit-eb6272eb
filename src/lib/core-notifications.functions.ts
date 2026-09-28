import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const CORE_NOTICE_TITLES: Record<string, string> = {
  submitted: "New Core request submitted",
  accepted: "Core request accepted by Opsirix",
  ready: "Core request ready for your review",
  reopened: "Core request reopened",
  access_revoked: "Your access to a Core request was revoked",
  access_expired: "Your access to a Core request has ended",
};

/** Personal in-app Core notifications. Only title, reference and time; never request content. */
export const getMyCoreNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("core_my_notifications");
    if (error) throw new Error("Notifications could not be loaded");
    return (data ?? []).map((n) => ({ ...n, title: CORE_NOTICE_TITLES[n.event] ?? "Core update" }));
  });

export const markCoreNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ ids: z.array(z.string().uuid()).max(100).nullable() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("core_mark_notifications_read", { _ids: data.ids as string[] });
    if (error) throw new Error("Could not update notifications");
    return { ok: true };
  });
