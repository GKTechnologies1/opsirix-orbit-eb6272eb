import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AccessArea = { key: "admin" | "staff" | "company" | "partner" | "member"; label: string; description: string; to: string };

// Verified server-side from the signed-in user's own role, membership and application rows (RLS applies).
export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const uid = context.userId;
    const [admin, staff, partnerRole, application, memberships] = await Promise.all([
      sb.rpc("has_role", { _user_id: uid, _role: "admin" }),
      sb.rpc("has_staff_role", { _user_id: uid }),
      sb.rpc("has_role", { _user_id: uid, _role: "partner" }),
      sb.from("partner_applications").select("id").eq("user_id", uid).maybeSingle(),
      sb.from("organization_members").select("organization_id").eq("user_id", uid),
    ]);
    const areas: AccessArea[] = [];
    if (admin.data) areas.push({ key: "admin", label: "Admin/CEO Staff Console", description: "Oversight, queues, access, content and releases.", to: "/staff" });
    else if (staff.data) areas.push({ key: "staff", label: "Staff Console", description: "Work assigned to you by the Admin/CEO.", to: "/staff" });
    if ((memberships.data ?? []).length) areas.push({ key: "company", label: "Company workspace", description: "Your companies, members and history.", to: "/workspace" });
    if (partnerRole.data || application.data) areas.push({ key: "partner", label: "Partner workspace", description: "Your application, profile and introductions.", to: "/partner" });
    areas.push({ key: "member", label: "Nexus member area", description: "Browse approved profiles and follow your help requests.", to: "/nexus/directory" });
    return { areas };
  });
