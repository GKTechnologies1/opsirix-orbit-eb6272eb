import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const NEXUS_CONSENT_VERSION = "nexus-intro-consent-2026-09-25-v1";

const ERRORS: Record<string, string> = {
  not_permitted: "You are not permitted to do this.",
  inquiry_closed: "This request is closed.",
  partner_not_eligible: "That partner is not eligible for this request.",
  already_proposed: "This partner has already been proposed for this request.",
  not_open_for_authorization: "This introduction can no longer be authorized.",
  consent_version_outdated: "The consent wording has changed. Please reload and review it again.",
  bad_field: "One of the selected items is not available.",
  contact_method_required: "Select your email address or phone number so the partner can reply.",
  not_declinable: "This introduction can no longer be declined.",
  not_withdrawable: "This introduction cannot be withdrawn.",
  already_sent: "This introduction has already been sent, so it can no longer be withdrawn.",
  not_cancellable: "This introduction can no longer be cancelled.",
};
function friendly(message?: string) {
  const key = Object.keys(ERRORS).find((k) => message?.includes(k));
  return key ? ERRORS[key] : "Something went wrong. Nothing was sent.";
}
const id = z.object({ id: z.string().uuid() });

// ---------- Staff ----------
export const staffIntroductions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => id.parse(i))
  .handler(async ({ data, context }) => {
    const [{ data: intros }, { data: candidates }] = await Promise.all([
      context.supabase.rpc("staff_nexus_introductions", { _inquiry: data.id }),
      context.supabase.rpc("nexus_intro_candidates", { _inquiry: data.id }),
    ]);
    return { intros: (intros ?? []) as StaffIntro[], candidates: candidates ?? [] };
  });

export type StaffIntro = { id: string; partner_name: string; status: string; proposed_at: string; selected_fields: string[]; consent_version: string | null; authorized_at: string | null; sent_at: string | null; send_attempts: number; last_send_error: string | null; partner_notice_status: string | null; events: { event: string; at: string }[] | null };

export const proposeIntroduction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ inquiryId: z.string().uuid(), profileId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("propose_nexus_introduction", { _inquiry: data.inquiryId, _profile: data.profileId });
    return error ? { success: false as const, error: friendly(error.message) } : { success: true as const };
  });

export const cancelIntroduction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => id.parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("cancel_nexus_introduction", { _intro: data.id });
    return error ? { success: false as const, error: friendly(error.message) } : { success: true as const };
  });

export const previewSend = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => id.parse(i))
  .handler(async ({ data, context }) => {
    const { data: r, error } = await context.supabase.rpc("preview_nexus_send", { _intro: data.id });
    if (error || !r) return { success: false as const, error: friendly(error?.message) };
    return { success: true as const, preview: r as { status: string; partner_name: string; payload: { partner: string; category: string; fields: Record<string, string> } | null; hash: string | null; unchanged: boolean; eligible: boolean } };
  });

export const sendIntroduction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid(), hash: z.string().min(8).max(64) }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: r, error } = await context.supabase.rpc("send_nexus_introduction", { _intro: data.id, _hash: data.hash });
    if (error || !r) return { success: false as const, error: friendly(error?.message) };
    const res = r as { result: string; error?: string; partner_user_id?: string };
    if (res.result === "already_sent") return { success: true as const, message: "Already sent. No duplicate was created." };
    if (res.result === "reconsent_required") return { success: false as const, error: "The partner or shared details changed. New founder authorization is required. Nothing was sent." };
    if (res.result === "payload_mismatch") return { success: false as const, error: "The details you reviewed are out of date. Reload and review again. Nothing was sent." };
    if (res.result === "not_authorized") return { success: false as const, error: "This introduction is not authorized (it may have been withdrawn). Nothing was sent." };
    if (res.result === "failed") return { success: false as const, error: `${res.error} Nothing was sent; the founder can still withdraw.` };
    // Sent: the partner can now see it in their workspace. Email notice carries no personal details.
    let notice: "emailed" | "email_failed" | "email_skipped" = "email_skipped";
    try {
      const apiKey = process.env["RESEND_API_KEY"];
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: u } = await supabaseAdmin.auth.admin.getUserById(res.partner_user_id!);
      if (apiKey && u.user?.email && !u.user.email.toLowerCase().endsWith("@example.test")) {
        const { Resend } = await import("resend");
        const { error: mailError } = await new Resend(apiKey).emails.send({
          from: "Opsirix Nexus <noreply@opsirix.com>",
          to: u.user.email,
          subject: "You have a new Opsirix introduction",
          html: `<div style="font-family:system-ui,sans-serif;max-width:560px;color:#0f172a"><p>Opsirix has sent you a new introduction through Nexus.</p><p>Sign in to your Opsirix partner workspace and open Introductions to see the details the person chose to share.</p><p style="color:#64748b;font-size:13px">For privacy, this email does not include the person's details.</p></div>`,
        });
        notice = mailError ? "email_failed" : "emailed";
        if (mailError) console.error("Partner notice email failed", mailError.message);
      }
    } catch (e) {
      notice = "email_failed";
      console.error("Partner notice email threw", e instanceof Error ? e.message : e);
    }
    await context.supabase.rpc("record_nexus_partner_notice", { _intro: data.id, _status: notice });
    return { success: true as const, message: notice === "emailed" ? "Sent. The partner was notified by email." : notice === "email_failed" ? "Sent. The partner can see it in their workspace, but the email notice failed." : "Sent. The partner can see it in their workspace." };
  });

// ---------- Founder ----------
export type FounderRequest = { id: string; category_id: string; status: string; created_at: string; full_name: string; email: string; phone: string | null; location: string | null; description: string; introductions: { id: string; partner_name: string; status: string; selected_fields: string[]; consent_version: string | null; authorized_at: string | null; sent_at: string | null; events: { event: string; at: string }[] | null }[] };

export const founderRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data }, { data: consent }] = await Promise.all([
      context.supabase.rpc("founder_nexus_requests"),
      context.supabase.from("nexus_consent_versions").select("version,consent_template,category_lines").eq("is_current", true).maybeSingle(),
    ]);
    return { requests: (data ?? []) as FounderRequest[], consent: consent as { version: string; consent_template: string; category_lines: Record<string, string> } | null };
  });

export const founderDecide = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid(), action: z.enum(["authorize", "decline", "withdraw"]), fields: z.array(z.enum(["name", "email", "phone", "location", "description"])).max(5).optional(), version: z.string().max(80).optional() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = data.action === "authorize"
      ? await context.supabase.rpc("authorize_nexus_introduction", { _intro: data.id, _fields: data.fields ?? [], _version: data.version ?? "" })
      : data.action === "decline"
        ? await context.supabase.rpc("decline_nexus_introduction", { _intro: data.id })
        : await context.supabase.rpc("withdraw_nexus_introduction", { _intro: data.id });
    return error ? { success: false as const, error: friendly(error.message) } : { success: true as const };
  });

// ---------- Partner ----------
export const partnerIntroductions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("partner_nexus_introductions");
    return (data ?? []) as { id: string; sent_at: string; payload: { partner: string; category: string; fields: Record<string, string> } }[];
  });
