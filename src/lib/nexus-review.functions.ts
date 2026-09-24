import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * One review entry point for every decision an Opsirix reviewer makes.
 * It runs as the signed-in reviewer, so every database rule (row access, type
 * evidence checks, publication gate) still applies. There is no privileged shortcut.
 */
const SUBJECTS = ["application", "listing_type", "authority", "agreement", "license", "profile_revision", "service", "suggestion", "listing"] as const;
const DECISIONS = ["approved", "verified", "recorded", "changes_requested", "declined", "suspended", "reinstated", "published", "unpublished"] as const;

const ALLOWED: Record<(typeof SUBJECTS)[number], readonly (typeof DECISIONS)[number][]> = {
  application: ["approved", "changes_requested", "declined"],
  listing_type: ["approved", "changes_requested", "declined", "suspended"],
  authority: ["verified", "changes_requested", "declined"],
  agreement: ["recorded", "changes_requested"],
  license: ["verified", "changes_requested", "declined"],
  profile_revision: ["approved", "changes_requested", "declined"],
  service: ["approved", "changes_requested", "declined"],
  suggestion: ["approved", "declined"],
  listing: ["published", "unpublished", "suspended", "reinstated"],
};

const schema = z.object({
  applicationId: z.string().uuid(),
  subjectType: z.enum(SUBJECTS),
  subjectId: z.string().min(1).max(200),
  subjectLabel: z.string().max(300).optional(),
  decision: z.enum(DECISIONS),
  applicantMessage: z.string().trim().max(2000).optional(),
  internalNote: z.string().trim().max(4000).optional(),
  agreementReference: z.string().trim().max(300).optional(),
}).superRefine((value, ctx) => {
  if (!ALLOWED[value.subjectType].includes(value.decision)) ctx.addIssue({ code: "custom", message: "That decision is not available for this item.", path: ["decision"] });
  if (value.decision === "changes_requested" && (value.applicantMessage ?? "").length < 10) ctx.addIssue({ code: "custom", message: "Tell the applicant specifically what to change (at least 10 characters).", path: ["applicantMessage"] });
  if (value.decision === "recorded" && !(value.agreementReference ?? "").length) ctx.addIssue({ code: "custom", message: "Record where the written agreement or approval is kept.", path: ["agreementReference"] });
});

export type ReviewInput = z.infer<typeof schema>;

export const reviewSubject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const parsed = schema.safeParse(input);
    if (!parsed.success) return { invalid: parsed.error.issues[0]?.message ?? "Invalid review." } as const;
    return parsed.data;
  })
  .handler(async ({ data, context }) => {
    if ("invalid" in data) return { success: false as const, error: data.invalid };
    const sb = context.supabase;
    const { data: isAdmin } = await sb.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) return { success: false as const, error: "You do not have permission to review applications." };

    const { data: app } = await sb.from("partner_applications").select("id,user_id,status").eq("id", data.applicationId).maybeSingle();
    if (!app) return { success: false as const, error: "Application not found." };
    if (app.user_id === context.userId) return { success: false as const, error: "Reviewers cannot review their own organization." };
    const owner = app.user_id;
    const now = new Date().toISOString();
    const d = data.decision;
    let error: { message: string } | null = null;
    let matched = 0;
    const count = (res: { data: unknown[] | null; error: { message: string } | null }) => { error = res.error; matched = res.data?.length ?? 0; };

    switch (data.subjectType) {
      case "application": {
        const res = await sb.from("partner_applications").update({ status: d as "approved" | "changes_requested" | "declined", updated_at: now }).eq("id", app.id).select("id");
        count(res);
        if (!res.error) await sb.from("partner_review_events").insert({ application_id: app.id, reviewer_id: context.userId, from_status: app.status, to_status: d as "approved", note: data.applicantMessage || null });
        break;
      }
      case "listing_type":
        count(await sb.from("partner_listing_types").update({ review_status: d, review_note: data.applicantMessage || null }).eq("id", data.subjectId).eq("user_id", owner).select("id"));
        break;
      case "authority":
        count(await sb.from("partner_track_details").update({ authority_review_status: d === "verified" ? "verified" : d }).eq("application_id", app.id).eq("user_id", owner).select("application_id"));
        break;
      case "agreement":
        count(await sb.from("partner_track_details").update(d === "recorded" ? { agreement_status: "recorded", agreement_reference: data.agreementReference } : { agreement_status: "pending" }).eq("application_id", app.id).eq("user_id", owner).select("application_id"));
        break;
      case "license":
        count(await sb.from("partner_licenses").update({ review_status: d === "declined" ? "rejected" : d, reviewed_by: context.userId, reviewed_at: now }).eq("id", data.subjectId).eq("user_id", owner).select("id"));
        break;
      case "profile_revision":
        count(await sb.from("partner_profile_revisions").update({ status: d }).eq("id", data.subjectId).eq("user_id", owner).select("id"));
        break;
      case "service":
        count(await sb.from("partner_service_selections").update({ review_status: d === "approved" ? "approved" : d }).eq("id", data.subjectId).eq("user_id", owner).select("id"));
        break;
      case "suggestion":
        count(await sb.from("partner_service_suggestions").update({ status: d as "approved" | "declined", reviewed_by: context.userId, reviewed_at: now }).eq("id", data.subjectId).eq("user_id", owner).select("id"));
        break;
      case "listing": {
        const patch = d === "published" ? { is_published: true } : d === "unpublished" ? { is_published: false } : d === "suspended" ? { is_suspended: true, suspension_reason: data.internalNote || data.applicantMessage || "Suspended by Opsirix review" } : { is_suspended: false, suspension_reason: null };
        count(await sb.from("partner_profiles").update(patch).eq("user_id", owner).select("id"));
        break;
      }
    }
    if (error) return { success: false as const, error: (error as { message: string }).message };
    if (!matched) return { success: false as const, error: "Nothing was changed. The item may not belong to this application." };

    const { data: decision, error: decisionError } = await sb.from("partner_review_decisions").insert({
      application_id: app.id, subject_type: data.subjectType, subject_id: data.subjectId, subject_label: data.subjectLabel ?? null,
      decision: d, applicant_message: data.applicantMessage || null, reviewer_id: context.userId,
    }).select("id").single();
    if (decisionError) return { success: false as const, error: decisionError.message };
    if (data.internalNote) {
      await sb.from("partner_review_internal_notes").insert({ decision_id: decision.id, application_id: app.id, note: data.internalNote, author_id: context.userId });
    }
    return { success: true as const };
  });
