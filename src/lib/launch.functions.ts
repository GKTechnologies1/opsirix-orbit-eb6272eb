import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Draft scope notice. Shown as information only; not Terms acceptance or an attestation. No checkbox until owner approves final wording. */
export const LAUNCH_SCOPE_NOTICE_VERSION = "draft-2026-09-28";
export const LAUNCH_SCOPE_NOTICE =
  "Opsirix Launch helps organize the operational side of starting or running a business: checklists, documents, tasks and introductions to independent professionals. Opsirix does not give legal, immigration, tax or financial advice, and sending this intake does not mean any professional has reviewed your situation.";

export const LAUNCH_OUTCOMES = {
  ready_for_coordination: "Ready for coordination",
  professional_input_recommended: "Professional input recommended",
  outside_current_scope: "Outside current Opsirix scope",
} as const;

const yn3 = z.enum(["yes", "no", "prefer_not"]);
export const launchAnswersSchema = z.object({
  preferred_contact: z.enum(["email", "phone"]).optional(),
  phone: z.string().trim().max(40).optional(),
  business_name: z.string().trim().max(160).optional(),
  not_formed: z.boolean().optional(),
  stage: z.enum(["idea", "forming", "operating_lt1", "operating_1plus"]).optional(),
  registration_status: z.enum(["current", "planned"]).optional(),
  registration_country: z.string().trim().max(80).optional(),
  registration_region: z.string().trim().max(80).optional(),
  team_size: z.enum(["0", "1-5", "6-20", "20+"]).optional(),
  help_with: z.array(z.enum(["operations", "documents", "tasks", "professional", "bookkeeping", "other"])).max(6).optional(),
  help_other: z.string().trim().max(300).optional(),
  attorney: yn3.optional(),
  cpa: yn3.optional(),
  nexus_help: z.enum(["yes", "no"]).optional(),
  immigration_attorney_intro: z.enum(["yes", "no"]).optional(),
}).strict();
export type LaunchAnswers = z.infer<typeof launchAnswersSchema>;

export function missingForSubmit(a: LaunchAnswers, email: string): string[] {
  const m: string[] = [];
  if (!email) m.push("Email");
  if (!a.preferred_contact) m.push("Preferred contact");
  if (a.preferred_contact === "phone" && !a.phone) m.push("Phone number");
  if (!a.not_formed && !a.business_name) m.push("Business name");
  if (!a.stage) m.push("Stage");
  if (!a.registration_status || !a.registration_country) m.push("Registration location");
  if (!a.team_size) m.push("People working in the business");
  if (!a.help_with?.length) m.push("What you want help with");
  if (!a.attorney) m.push("Attorney question");
  if (!a.cpa) m.push("Tax professional question");
  if (!a.nexus_help) m.push("Nexus introduction question");
  return m;
}

export const getMyLaunch = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const [{ data: intakes }, { data: profile }, { data: claims }] = await Promise.all([
      sb.from("launch_intakes").select("id,ref,status,answers,name_override,email_override,founder_message,submitted_at,updated_at").eq("user_id", context.userId).order("created_at", { ascending: false }),
      sb.from("profiles").select("full_name,email").eq("id", context.userId).maybeSingle(),
      sb.auth.getUser(),
    ]);
    const ids = (intakes ?? []).map((i) => i.id);
    const { data: events } = ids.length ? await sb.from("launch_events").select("intake_id,event,created_at").in("intake_id", ids).order("created_at") : { data: [] };
    return {
      account: { name: profile?.full_name ?? "", email: profile?.email ?? claims.user?.email ?? "" },
      intakes: (intakes ?? []).map((i) => ({ ...i, answers: i.answers as LaunchAnswers, events: (events ?? []).filter((e) => e.intake_id === i.id) })),
    };
  });

export const saveMyLaunch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({
    answers: launchAnswersSchema, name: z.string().trim().max(120), email: z.string().trim().max(255), submit: z.boolean(),
  }).parse(i))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { data: profile } = await sb.from("profiles").select("full_name,email").eq("id", context.userId).maybeSingle();
    // Store name/email only when they differ from the account, to avoid duplicate copies.
    const name = data.name && data.name !== (profile?.full_name ?? "") ? data.name : "";
    const email = data.email && data.email !== (profile?.email ?? "") ? data.email : "";
    if (email && !z.string().email().safeParse(email).success) return { success: false as const, error: "Enter a valid email address." };
    if (data.submit) {
      const missing = missingForSubmit(data.answers, data.email || profile?.email || "");
      if (missing.length) return { success: false as const, error: `Please complete: ${missing.join(", ")}.` };
    }
    const { error } = await sb.rpc("launch_save_intake", { _answers: data.answers, _name: name, _email: email, _submit: data.submit, _notice_version: LAUNCH_SCOPE_NOTICE_VERSION });
    return error ? { success: false as const, error: error.message } : { success: true as const };
  });

export const getLaunchQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const { data: allowed } = await sb.rpc("launch_is_reviewer", { _uid: context.userId });
    if (!allowed) return { allowed: false as const, isAdmin: false, leads: [] as { id: string; name: string }[], intakes: [] };
    const { data: isAdmin } = await sb.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    const { data: assigns } = await sb.from("launch_assignments").select("intake_id,assignee_id,created_at").is("revoked_at", null);
    const [{ data: intakes }, { data: reviews }, { data: events }] = await Promise.all([
      sb.from("launch_intakes").select("id,ref,user_id,status,answers,name_override,email_override,submitted_at,updated_at").neq("status", "draft").order("submitted_at", { ascending: false }),
      sb.from("launch_reviews").select("intake_id,kind,outcome,reason,founder_message,reviewer_id,created_at").order("created_at"),
      sb.from("launch_events").select("intake_id,event,actor_id,created_at").order("created_at"),
    ]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: leadRows } = isAdmin ? await supabaseAdmin.from("user_roles").select("user_id").eq("role", "operations_lead") : { data: [] };
    const people = new Set<string>([...(leadRows ?? []).map((l) => l.user_id), ...(assigns ?? []).map((a) => a.assignee_id), ...(intakes ?? []).map((i) => i.user_id), ...(reviews ?? []).map((r) => r.reviewer_id), ...(events ?? []).map((e) => e.actor_id)]);
    const { data: profiles } = people.size ? await supabaseAdmin.from("profiles").select("id,full_name,email").in("id", [...people]) : { data: [] };
    const who = new Map((profiles ?? []).map((p) => [p.id, p]));
    const label = (id: string, founder: string) => (id === founder ? "Founder" : who.get(id)?.full_name || "Opsirix staff");
    return {
      allowed: true as const,
      isAdmin: Boolean(isAdmin),
      leads: (leadRows ?? []).map((l) => ({ id: l.user_id, name: who.get(l.user_id)?.full_name || "Operations Lead" })),
      intakes: (intakes ?? []).map((i) => ({
        id: i.id, ref: i.ref, status: i.status, submitted_at: i.submitted_at, updated_at: i.updated_at,
        answers: i.answers as LaunchAnswers,
        assignee: (() => { const a = (assigns ?? []).find((x) => x.intake_id === i.id); return a ? { id: a.assignee_id, name: who.get(a.assignee_id)?.full_name || "Operations Lead", since: a.created_at } : null; })(),
        name: i.name_override || who.get(i.user_id)?.full_name || "",
        email: i.email_override || who.get(i.user_id)?.email || "",
        reviews: (reviews ?? []).filter((r) => r.intake_id === i.id).map(({ reviewer_id, ...r }) => ({ ...r, reviewer: label(reviewer_id, i.user_id) })),
        events: (events ?? []).filter((e) => e.intake_id === i.id).map(({ actor_id, ...e }) => ({ ...e, actor: label(actor_id, i.user_id) })),
      })),
    };
  });

export const recordLaunchReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({
    intakeId: z.string().uuid(), kind: z.enum(["outcome", "changes_requested"]),
    outcome: z.enum(["ready_for_coordination", "professional_input_recommended", "outside_current_scope"]).nullable(),
    reason: z.string().trim().min(10).max(1000), founderMessage: z.string().trim().min(10).max(1000),
  }).refine((d) => (d.kind === "outcome") === !!d.outcome, "Choose an outcome").parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("launch_record_review", { _intake: data.intakeId, _kind: data.kind, _outcome: data.outcome ?? "", _reason: data.reason, _founder_message: data.founderMessage });
    return error ? { success: false as const, error: error.message } : { success: true as const };
  });

export const assignLaunch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ intakeId: z.string().uuid(), assigneeId: z.string().uuid().nullable() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("launch_assign", { _intake: data.intakeId, _assignee: data.assigneeId as string });
    return error ? { success: false as const, error: error.message } : { success: true as const };
  });
