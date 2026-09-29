import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { BUILT_IN_TOURS, TOUR_VERSION, type TourRole } from "@/lib/guided-tours";

const roleSchema = z.enum(["workspace_switcher", "directory_member", "founder_owner", "editing_member", "viewer", "partner", "operations_lead", "compliance_coordinator", "admin_ceo"]);
const statusSchema = z.enum(["started", "skipped", "completed"]);

export const getTourContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const uid = context.userId;
    const [admin, ops, compliance, partnerRole, application, memberships, progress, tourContent] = await Promise.all([
      sb.rpc("has_role", { _user_id: uid, _role: "admin" }),
      sb.rpc("has_staff_role", { _user_id: uid, _roles: ["operations_lead"] }),
      sb.rpc("has_staff_role", { _user_id: uid, _roles: ["compliance_coordinator"] }),
      sb.rpc("has_role", { _user_id: uid, _role: "partner" }),
      sb.from("partner_applications").select("id").eq("user_id", uid).maybeSingle(),
      sb.from("organization_members").select("role").eq("user_id", uid),
      sb.from("guided_tour_progress").select("role_key,tour_key,tour_version,current_step,status,updated_at").eq("user_id", uid),
      sb.from("site_content_blocks").select("published_version_id,site_content_versions!site_content_blocks_published_version_id_fkey(body)").eq("key", "app.guided_tours").maybeSingle(),
    ]);
    const roles: TourRole[] = ["directory_member"];
    const memberRoles = new Set((memberships.data ?? []).map((row) => row.role));
    if (memberRoles.has("owner")) roles.push("founder_owner");
    if (memberRoles.has("member")) roles.push("editing_member");
    if (memberRoles.has("viewer")) roles.push("viewer");
    if (partnerRole.data || application.data) roles.push("partner");
    if (ops.data) roles.push("operations_lead");
    if (compliance.data) roles.push("compliance_coordinator");
    if (admin.data) roles.push("admin_ceo");
    if (roles.length > 1) roles.unshift("workspace_switcher");
    const published = tourContent.data?.published_version_id ? tourContent.data.site_content_versions : null;
    return { roles, version: TOUR_VERSION, progress: progress.data ?? [], publishedContent: published };
  });

export const saveTourProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ role: roleSchema, tourKey: z.string().min(3).max(80), version: z.number().int().positive(), step: z.number().int().nonnegative(), status: statusSchema }).parse(input))
  .handler(async ({ data, context }) => {
    const expected = BUILT_IN_TOURS[data.role].key;
    if (data.tourKey !== expected || data.version !== TOUR_VERSION) return { success: false as const, error: "This tour version is not available." };
    const { error } = await context.supabase.rpc("save_guided_tour_progress", { _role_key: data.role, _tour_key: data.tourKey, _tour_version: data.version, _current_step: data.step, _status: data.status });
    return error ? { success: false as const, error: error.message } : { success: true as const };
  });