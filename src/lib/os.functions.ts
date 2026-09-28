import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Intro = { status: string };
type NexusReq = { id: string; category_id: string; status: string; created_at: string; introductions: Intro[] };

/**
 * Founder OS overview. Everything is read as the signed-in user, so RLS decides what each role may see.
 * Only companies the caller belongs to are included; staff use the Staff Console. No scores, no Vault/AI data.
 */
export const getOsOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase; const uid = context.userId;
    const today = new Date().toISOString().slice(0, 10);
    const week = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
    const [{ data: mine }, { data: orgs }, { data: tasks }, { data: holds }, { data: reviews }, { data: reqs }, { data: nexus }, { data: editors }] = await Promise.all([
      sb.from("organization_members").select("organization_id,role").eq("user_id", uid),
      sb.from("organizations").select("id,name"),
      sb.from("flow_tasks").select("id,organization_id,board_id,title,status,due_on,assignee_id").neq("status", "done"),
      sb.from("flow_escalations").select("task_id").is("cleared_at", null),
      sb.from("grid_reviews").select("organization_id,period,kind,status,submitted_at,updated_at").order("period", { ascending: false }),
      sb.from("core_requests").select("id,organization_id,ref,title,status,updated_at").order("updated_at", { ascending: false }),
      sb.rpc("founder_nexus_requests"),
      sb.from("flow_editors").select("organization_id").eq("user_id", uid),
    ]);
    const held = new Set((holds ?? []).map((h) => h.task_id));
    const companies = (mine ?? []).map((m) => {
      const org = (orgs ?? []).find((o) => o.id === m.organization_id);
      const t = (tasks ?? []).filter((x) => x.organization_id === m.organization_id);
      const g = (reviews ?? []).filter((x) => x.organization_id === m.organization_id);
      const c = (reqs ?? []).filter((x) => x.organization_id === m.organization_id);
      const lastSubmitted = (kind: string) => g.find((x) => x.kind === kind && x.status === "submitted") ?? null;
      const draft = (kind: string) => g.find((x) => x.kind === kind && x.status === "draft") ?? null;
      const canEdit = m.role === "owner" || (m.role === "member" && (editors ?? []).some((e) => e.organization_id === m.organization_id));
      return {
        id: m.organization_id, name: org?.name ?? "Company", role: m.role as string, canEdit,
        flow: {
          open: t.length,
          overdue: t.filter((x) => x.due_on && x.due_on < today).length,
          dueSoon: t.filter((x) => x.due_on && x.due_on >= today && x.due_on <= week).length,
          onHold: t.filter((x) => held.has(x.id)).length,
          mine: t.filter((x) => x.assignee_id === uid).length,
          next: [...t].sort((a, b) => (a.due_on ?? "9999").localeCompare(b.due_on ?? "9999")).slice(0, 5)
            .map((x) => ({ id: x.id, title: x.title, status: x.status, due_on: x.due_on, hold: held.has(x.id) })),
        },
        grid: {
          self: lastSubmitted("self_assessment")?.period ?? null,
          staff: lastSubmitted("staff_evidence_review")?.period ?? null,
          selfDraft: draft("self_assessment")?.period ?? null,
        },
        core: {
          open: c.filter((x) => ["submitted", "accepted", "awaiting_owner"].includes(x.status)).length,
          awaitingYou: c.filter((x) => x.status === "awaiting_owner").map((x) => ({ id: x.id, ref: x.ref, title: x.title })),
          submitted: c.filter((x) => x.status === "submitted").length,
          inProgress: c.filter((x) => x.status === "accepted").length,
        },
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
    const n = (nexus ?? []) as NexusReq[];
    return {
      companies,
      nexus: {
        total: n.length,
        open: n.filter((x) => !["closed"].includes(x.status)).length,
        needsConsent: n.reduce((s, x) => s + (x.introductions ?? []).filter((i) => ["proposed", "reconsent_required"].includes(i.status)).length, 0),
        latest: n.slice(0, 3).map((x) => ({ id: x.id, category_id: x.category_id, status: x.status, created_at: x.created_at })),
      },
    };
  });
