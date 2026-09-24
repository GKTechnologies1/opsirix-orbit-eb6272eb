import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const companyName = z.string().trim().min(2).max(160);
const uuid = z.string().uuid();
const staffRole = z.enum(["operations_lead", "compliance_coordinator"]);
const staffGrant = z.object({ organizationId: uuid, email: z.string().trim().email().max(255), enabled: z.boolean(), expiresAt: z.string().datetime().nullable() });

export const getCompanyWorkspaces = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: organizations, error } = await context.supabase.from("organizations").select("id,name,created_by,created_at,updated_at").order("created_at", { ascending: false });
    if (error) throw error;
    const ids = organizations.map((item) => item.id);
    const [members, events, grants] = await Promise.all([
      ids.length ? context.supabase.from("organization_members").select("organization_id,user_id,role,created_at").in("organization_id", ids) : Promise.resolve({ data: [], error: null }),
      ids.length ? context.supabase.from("audit_events").select("id,organization_id,actor_id,event_type,summary,created_at").in("organization_id", ids).order("created_at", { ascending: false }).limit(100) : Promise.resolve({ data: [], error: null }),
      ids.length ? context.supabase.from("staff_access_grants").select("organization_id,staff_user_id,expires_at,revoked_at,created_at").in("organization_id", ids) : Promise.resolve({ data: [], error: null }),
    ]);
    if (members.error) throw members.error;
    if (events.error) throw events.error;
    if (grants.error) throw grants.error;
    const staffIds = [...new Set((grants.data ?? []).map((item) => item.staff_user_id))];
    const { data: staffPeople } = staffIds.length ? await context.supabase.from("profiles").select("id,full_name,email").in("id", staffIds) : { data: [] };
    return { organizations, members: members.data ?? [], events: events.data ?? [], grants: (grants.data ?? []).map((grant) => ({ ...grant, person: (staffPeople ?? []).find((person) => person.id === grant.staff_user_id) ?? null })), userId: context.userId };
  });

export const createCompanyWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ name: companyName }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: id, error } = await context.supabase.rpc("create_company_workspace", { _name: data.name });
    if (error) return { success: false as const, error: error.message };
    return { success: true as const, id };
  });

export const renameCompanyWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ organizationId: uuid, name: companyName }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("rename_company_workspace", { _organization_id: data.organizationId, _name: data.name });
    if (error) return { success: false as const, error: error.message };
    return { success: true as const };
  });

export const setCompanyStaffGrant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => staffGrant.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("set_staff_access_by_email", {
      _organization_id: data.organizationId,
      _email: data.email,
      _enabled: data.enabled,
      _expires_at: data.expiresAt ?? undefined,
    });
    if (error) return { success: false as const, error: error.message };
    return { success: true as const };
  });

export const getStaffConsole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [staff, admin] = await Promise.all([
      context.supabase.rpc("has_staff_role", { _user_id: context.userId }),
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
    ]);
    if (!staff.data) return { allowed: false as const, isAdmin: false, roles: [], team: [], history: [] };
    const { data: ownRoles } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    if (!admin.data) return { allowed: true as const, isAdmin: false, roles: (ownRoles ?? []).map((item) => item.role), team: [], history: [] };
    const [{ data: roleRows }, { data: history }] = await Promise.all([
      context.supabase.from("user_roles").select("user_id,role,created_at").in("role", ["admin", "operations_lead", "compliance_coordinator"]),
      context.supabase.from("audit_events").select("id,actor_id,event_type,subject_id,summary,metadata,created_at").is("organization_id", null).order("created_at", { ascending: false }).limit(100),
    ]);
    const ids = [...new Set((roleRows ?? []).map((item) => item.user_id))];
    const { data: people } = ids.length ? await context.supabase.from("profiles").select("id,full_name,email").in("id", ids) : { data: [] };
    return {
      allowed: true as const,
      isAdmin: true,
      roles: (ownRoles ?? []).map((item) => item.role),
      team: (roleRows ?? []).map((item) => ({ ...item, person: (people ?? []).find((person) => person.id === item.user_id) ?? null })),
      history: history ?? [],
    };
  });

export const setStaffAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ email: z.string().trim().email().max(255), role: staffRole, enabled: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) return { success: false as const, error: "Only Admin/CEO can manage staff access." };
    const { data: person } = await context.supabase.from("profiles").select("id").ilike("email", data.email).maybeSingle();
    if (!person) return { success: false as const, error: "No account matches that email." };
    const { error } = await context.supabase.rpc("set_staff_role", { _user_id: person.id, _role: data.role, _enabled: data.enabled });
    if (error) return { success: false as const, error: error.message };
    return { success: true as const };
  });