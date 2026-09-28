import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const uuid = z.string().uuid();
const fail = (e: { message: string } | null) => (e ? { success: false as const, error: e.message } : { success: true as const });

export const GRID_DIMENSIONS = [
  { key: "documentation", label: "Documentation" },
  { key: "compliance_calendar", label: "Compliance calendar" },
  { key: "financial_coordination", label: "Financial coordination" },
  { key: "operational_workflow", label: "Operational workflow" },
  { key: "startup_readiness", label: "Startup readiness" },
] as const;

async function companiesFor(sb: any, uid: string) {
  const [{ data: orgs }, { data: mine }, staff, admin] = await Promise.all([
    sb.from("organizations").select("id,name").order("name"),
    sb.from("organization_members").select("organization_id,role").eq("user_id", uid),
    sb.rpc("has_staff_role", { _user_id: uid }),
    sb.rpc("has_role", { _user_id: uid, _role: "admin" }),
  ]);
  const roleOf = new Map<string, string>((mine ?? []).map((m: any) => [m.organization_id, m.role]));
  return { orgs: (orgs ?? []) as { id: string; name: string }[], roleOf, isStaff: Boolean(staff.data) || Boolean(admin.data), isAdmin: Boolean(admin.data) };
}

/** Grid records per company. RLS hides drafts from people who may not read them. No scores exist. */
export const getGrid = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase; const uid = context.userId;
    const { orgs, roleOf, isStaff } = await companiesFor(sb, uid);
    const [{ data: reviews }, { data: entries }] = await Promise.all([
      sb.from("grid_reviews").select("id,organization_id,period,kind,status,created_by,submitted_at,updated_at").order("period", { ascending: false }),
      sb.from("grid_review_entries").select("review_id,dimension,observation,evidence,updated_at"),
    ]);
    return {
      companies: orgs.map((o) => {
        const role = roleOf.get(o.id) ?? null;
        return {
          id: o.id, name: o.name, role,
          canSelf: role === "owner" || role === "member",
          canStaff: !role && isStaff,
          reviews: (reviews ?? []).filter((r) => r.organization_id === o.id).map((r) => ({
            ...r, mine: r.created_by === uid, entries: (entries ?? []).filter((e) => e.review_id === r.id),
          })),
        };
      }),
    };
  });

export const saveGridReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({
    organizationId: uuid, period: z.string().regex(/^\d{4}-\d{2}$/), kind: z.enum(["self_assessment", "staff_evidence_review"]), submit: z.boolean(),
    entries: z.array(z.object({ dimension: z.enum(GRID_DIMENSIONS.map((d) => d.key) as [string, ...string[]]), observation: z.string().max(2000), evidence: z.string().max(1000) })).max(5),
  }).parse(i))
  .handler(async ({ data, context }) => fail((await context.supabase.rpc("grid_save_review", {
    _org: data.organizationId, _period: `${data.period}-01`, _kind: data.kind, _entries: data.entries, _submit: data.submit,
  })).error));

/** Core requests with their Flow board tasks and status history. */
export const getCore = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase; const uid = context.userId;
    const { orgs, roleOf, isStaff, isAdmin } = await companiesFor(sb, uid);
    const [{ data: reqs }, { data: editors }, oversight] = await Promise.all([
      sb.from("core_requests").select("id,ref,organization_id,title,description,status,requested_by,handled_by,board_id,status_note,created_at,updated_at").order("created_at", { ascending: false }),
      sb.from("flow_editors").select("organization_id,user_id").eq("user_id", uid),
      isAdmin ? sb.rpc("core_admin_oversight") : Promise.resolve({ data: [] }),
    ]);
    const contentRequests = reqs ?? [];
    const oversightRows = (oversight.data ?? []) as Array<{ id: string; ref: string; organization_id: string; organization_name: string; title: string; status: string; requested_by: string; handled_by: string | null; board_id: string | null; created_at: string; updated_at: string; events: Array<{ id: string; from_status: string | null; to_status: string; note: string | null; actor_id: string; created_at: string }>; access_grants: Array<{ id: string; staff_user_id: string; staff_label: string; scope: string; purpose: string; expires_at: string; created_at: string; revoked_at: string | null; state: string }> }>;
    const boardIds = contentRequests.map((r) => r.board_id).filter(Boolean) as string[];
    const { data: tasks } = boardIds.length
      ? await sb.from("flow_tasks").select("id,board_id,title,status,due_on").in("board_id", boardIds).order("created_at")
      : { data: [] as { id: string; board_id: string; title: string; status: string; due_on: string | null }[] };
    const { data: holds } = boardIds.length ? await sb.from("flow_escalations").select("task_id,ref").is("cleared_at", null) : { data: [] as { task_id: string; ref: string }[] };
    // Access grants: owner/Admin see every grant; staff see only their own. Staff-only companies come from request grants.
    const grants = await Promise.all(contentRequests.map(async (r) => ({ id: r.id, rows: (await sb.rpc("core_access_list", { _request: r.id })).data ?? [] })));
    const history = await Promise.all(contentRequests.map(async (r) => ({ id: r.id, rows: (await sb.rpc("core_history", { _request: r.id })).data ?? [] })));
    const allOrgs = [...orgs];
    for (const r of [...contentRequests, ...oversightRows]) {
      if (!allOrgs.some((o) => o.id === r.organization_id)) {
        const { data: name } = await sb.rpc("core_company_label", { _request: r.id });
        allOrgs.push({ id: r.organization_id, name: (name as string | null) ?? "Company" });
      }
    }
    const who = (id: string | null, org: string) => (!id ? "" : id === uid ? "You" : roleOf.get(org) ? "A company member or Opsirix" : "Company or Opsirix");
    const companies = allOrgs.map((o) => {
      const role = roleOf.get(o.id) ?? null;
      const canEdit = role === "owner" || (role === "member" && (editors ?? []).some((e) => e.organization_id === o.id));
      const fullRequests = contentRequests.filter((r) => r.organization_id === o.id).map((r) => {
        const access = grants.find((g) => g.id === r.id)?.rows ?? [];
        const mine = access.find((a) => a.staff_user_id === uid && a.state === "active");
        return {
          ...r, handledByMe: r.handled_by === uid, requestedBy: who(r.requested_by, o.id),
          oversightOnly: false, canHandle: !role && mine?.scope === "handle", myAccess: mine ? { scope: mine.scope, expires_at: mine.expires_at, purpose: mine.purpose } : null,
          access: role === "owner" || (!role && isAdmin) ? access : [],
          tasks: (tasks ?? []).filter((t) => t.board_id === r.board_id).map((t) => ({ ...t, hold: (holds ?? []).find((h) => h.task_id === t.id)?.ref ?? null })),
          events: (history.find((h) => h.id === r.id)?.rows ?? []).map((e) => ({ id: e.id, request_id: r.id, from_status: e.from_status, to_status: e.to_status, note: e.note, note_redacted: e.note_redacted, created_at: e.created_at, actor: e.actor_label })),
        };
      });
      const metadataRequests = oversightRows.filter((r) => r.organization_id === o.id && !contentRequests.some((full) => full.id === r.id)).map((r) => ({
        ...r, description: "", status_note: null, handledByMe: false, requestedBy: "Company member", oversightOnly: true, canHandle: false, myAccess: null,
        access: (r.access_grants ?? []).map((a) => ({ ...a, request_id: r.id })), tasks: [], events: (r.events ?? []).map((e) => { const x = e as unknown as { id: string; from_status: string | null; to_status: string; created_at: string; note_redacted?: boolean; actor_label?: string }; return { id: x.id, request_id: r.id, from_status: x.from_status, to_status: x.to_status, created_at: x.created_at, note: null, note_redacted: Boolean(x.note_redacted), actor: x.actor_label ?? "Opsirix or company" }; }),
      }));
      return {
        id: o.id, name: o.name, role, canEdit, isOwner: role === "owner", isStaff: !role && isStaff, isAdmin: !role && isAdmin,
        requests: [...fullRequests, ...metadataRequests],
      };
    });
    // Staff/Admin without membership only see companies where a request is visible to them.
    return { companies: companies.filter((c) => c.role || c.requests.length) };
  });

export const grantCoreAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ requestId: uuid, email: z.string().trim().email().max(255), scope: z.enum(["read", "handle"]), purpose: z.string().trim().min(10).max(300), expiresOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).parse(i))
  .handler(async ({ data, context }) => fail((await context.supabase.rpc("core_grant_access", { _request: data.requestId, _email: data.email, _scope: data.scope, _purpose: data.purpose, _expires: `${data.expiresOn}T23:59:59Z` })).error));

export const revokeCoreAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ grantId: uuid }).parse(i))
  .handler(async ({ data, context }) => fail((await context.supabase.rpc("core_revoke_access", { _grant: data.grantId })).error));

export const submitCoreRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ organizationId: uuid, title: z.string().trim().min(3).max(200), description: z.string().max(4000).default("") }).parse(i))
  .handler(async ({ data, context }) => fail((await context.supabase.rpc("core_submit_request", { _org: data.organizationId, _title: data.title, _description: data.description })).error));

export const transitionCoreRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ requestId: uuid, action: z.enum(["accept", "decline", "ready", "withdraw", "close", "reopen"]), note: z.string().max(1000).default("") }).parse(i))
  .handler(async ({ data, context }) => fail((await context.supabase.rpc("core_transition", { _request: data.requestId, _action: data.action, _note: data.note })).error));

export const saveCoreTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ requestId: uuid, taskId: uuid.nullable(), title: z.string().trim().min(2).max(200), dueOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(), status: z.enum(["todo", "in_progress", "blocked", "done"]) }).parse(i))
  .handler(async ({ data, context }) => fail((await context.supabase.rpc("core_save_task", { _request: data.requestId, _task: data.taskId as string, _title: data.title, _due: data.dueOn as string, _status: data.status })).error));
