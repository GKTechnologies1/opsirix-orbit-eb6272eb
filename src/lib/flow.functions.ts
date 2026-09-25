import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const uuid = z.string().uuid();
const status = z.enum(["todo", "in_progress", "blocked", "done"]);
const fail = (e: { message: string } | null) => (e ? { success: false as const, error: e.message } : { success: true as const });

/** Flow boards and tasks for every company the caller can access (RLS: members, viewers, granted staff, Admin). */
export const getFlow = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const uid = context.userId;
    const [{ data: orgs }, { data: boards }, { data: tasks }, { data: mine }, { data: editors }, staffRole, admin] = await Promise.all([
      sb.from("organizations").select("id,name").order("name"),
      sb.from("flow_boards").select("id,organization_id,name,created_at").is("archived_at", null).order("created_at"),
      sb.from("flow_tasks").select("id,board_id,organization_id,title,details,assignee_id,due_on,status,escalated_at,escalation_note,created_at,updated_at").order("created_at"),
      sb.from("organization_members").select("organization_id,role").eq("user_id", uid),
      sb.from("flow_editors").select("organization_id,user_id"),
      sb.rpc("has_staff_role", { _user_id: uid }),
      sb.rpc("has_role", { _user_id: uid, _role: "admin" }),
    ]);
    const roleOf = new Map((mine ?? []).map((m) => [m.organization_id, m.role]));
    const owned = [...roleOf].filter(([, r]) => r === "owner").map(([id]) => id);
    // Co-member names only for owners (same rule as company history).
    const people = (await Promise.all(owned.map((id) => sb.rpc("company_member_people", { _organization_id: id })))).map((r, i) => ({ org: owned[i], rows: r.data ?? [] }));
    const shareRows = owned.length ? (await sb.from("flow_task_shares").select("task_id,partner_user_id,revoked_at")).data ?? [] : [];
    const companies = (orgs ?? []).map((o) => {
      const role = roleOf.get(o.id) ?? null;
      const canEdit = role === "owner" || (role === "member" && (editors ?? []).some((e) => e.organization_id === o.id && e.user_id === uid));
      const ppl = people.find((p) => p.org === o.id)?.rows ?? [];
      const label = (id: string | null) => (!id ? "Unassigned" : id === uid ? "You" : ppl.find((p) => p.user_id === id)?.full_name || ppl.find((p) => p.user_id === id)?.email || "A company member");
      return {
        id: o.id, name: o.name, role, canEdit, isOwner: role === "owner",
        canEscalate: !role && (Boolean(admin.data) || Boolean(staffRole.data)),
        members: role === "owner" ? ppl.map((p) => ({ id: p.user_id, label: p.full_name || p.email })) : [{ id: uid, label: "You" }].filter(() => canEdit),
        editors: role === "owner" ? (editors ?? []).filter((e) => e.organization_id === o.id).map((e) => ppl.find((p) => p.user_id === e.user_id)?.email ?? "member") : [],
        boards: (boards ?? []).filter((b) => b.organization_id === o.id).map((b) => ({
          ...b,
          tasks: (tasks ?? []).filter((t) => t.board_id === b.id).map((t) => ({ ...t, assignee: label(t.assignee_id), shared: role === "owner" ? shareRows.filter((s) => s.task_id === t.id && !s.revoked_at).length : 0 })),
        })),
      };
    });
    return { companies };
  });

export const createFlowBoard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ organizationId: uuid, name: z.string().trim().min(2).max(120) }).parse(i))
  .handler(async ({ data, context }) => fail((await context.supabase.rpc("flow_create_board", { _org: data.organizationId, _name: data.name })).error));

export const saveFlowTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({
    boardId: uuid, taskId: uuid.nullable(), title: z.string().trim().min(2).max(200), details: z.string().max(2000).default(""),
    assigneeId: uuid.nullable(), dueOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(), status,
  }).parse(i))
  .handler(async ({ data, context }) => fail((await context.supabase.rpc("flow_save_task", {
    _board: data.boardId, _task: data.taskId as string, _title: data.title, _details: data.details,
    _assignee: data.assigneeId as string, _due: data.dueOn as string, _status: data.status,
  })).error));

export const setFlowEditor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ organizationId: uuid, email: z.string().trim().email().max(255), enabled: z.boolean() }).parse(i))
  .handler(async ({ data, context }) => fail((await context.supabase.rpc("flow_set_editor", { _org: data.organizationId, _email: data.email, _enabled: data.enabled })).error));

export const setFlowEscalation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ taskId: uuid, note: z.string().trim().max(500), raise: z.boolean() }).parse(i))
  .handler(async ({ data, context }) => fail((await context.supabase.rpc("flow_set_escalation", { _task: data.taskId, _note: data.note, _raise: data.raise })).error));

export const shareFlowTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ taskId: uuid, email: z.string().trim().email().max(255), enabled: z.boolean() }).parse(i))
  .handler(async ({ data, context }) => fail((await context.supabase.rpc("flow_share_task", { _task: data.taskId, _partner_email: data.email, _enabled: data.enabled })).error));

export const getPartnerFlowTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => ({ tasks: (await context.supabase.rpc("partner_flow_tasks")).data ?? [] }));
