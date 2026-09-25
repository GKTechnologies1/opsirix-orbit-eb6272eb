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

export const setCompanyMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ organizationId: z.string().uuid(), email: z.string().trim().email().max(255), role: z.enum(["member", "viewer", "remove"]) }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("set_organization_member_by_email", { _organization_id: data.organizationId, _email: data.email, _role: data.role });
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
/** Admin/CEO overview: counts and queues from real records only. Non-admins receive nothing. */
export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const { data: isAdmin } = await sb.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) return null;
    const today = new Date().toISOString().slice(0, 10);
    const [apps, types, track, lic, revs, svc, sug, inq, asg, prof, cred, audit, ptypes, cver, cchg] = await Promise.all([
      sb.from("partner_applications").select("status"),
      sb.from("partner_listing_types").select("partner_type_id,review_status"),
      sb.from("partner_track_details").select("track,authority_review_status,agreement_status"),
      sb.from("partner_licenses").select("review_status,expires_on"),
      sb.from("partner_profile_revisions").select("status"),
      sb.from("partner_service_selections").select("partner_type,review_status"),
      sb.from("partner_service_suggestions").select("status"),
      sb.from("nexus_inquiries").select("id,status,category_id"),
      sb.from("nexus_inquiry_assignments").select("inquiry_id,purpose,revoked_at"),
      sb.from("partner_profiles").select("partner_type_id,is_published,is_suspended"),
      sb.from("partner_credentials").select("status"),
      sb.from("audit_events").select("id,event_type,summary,created_at").order("created_at", { ascending: false }).limit(15),
      sb.from("service_partner_types").select("id,label,is_open_for_registration").order("display_order"),
      sb.from("site_content_versions").select("status"),
      sb.from("service_catalog_changes").select("id,service_id,change_type,created_at").order("created_at", { ascending: false }).limit(5),
    ]);
    const n = <T,>(rows: T[] | null, f: (r: T) => boolean) => (rows ?? []).filter(f).length;
    const assigned = new Set((asg.data ?? []).filter((a) => !a.revoked_at).map((a) => a.inquiry_id));
    return {
      applications: { submitted: n(apps.data, (r) => r.status === "submitted" || r.status === "under_review"), changes: n(apps.data, (r) => r.status === "changes_requested"), draft: n(apps.data, (r) => r.status === "draft"), approved: n(apps.data, (r) => r.status === "approved") },
      credentialsPending: n(cred.data, (r) => r.status === "pending"),
      authorityPending: n(track.data, (r) => r.authority_review_status === "pending"),
      universityAgreementMissing: n(track.data, (r) => r.track === "institution" && r.agreement_status !== "recorded"),
      licensesPending: n(lic.data, (r) => r.review_status === "pending"),
      licensesExpired: n(lic.data, (r) => !!r.expires_on && r.expires_on < today),
      profileEditsPending: n(revs.data, (r) => r.status === "submitted"),
      servicesPending: n(svc.data, (r) => r.review_status === "submitted" || r.review_status === "pending"),
      suggestionsPending: n(sug.data, (r) => r.status === "pending"),
      inquiriesOpen: n(inq.data, (r) => r.status !== "closed"),
      inquiriesUnassigned: n(inq.data, (r) => r.status !== "closed" && !assigned.has(r.id)),
      complianceTasks: n(asg.data, (r) => !r.revoked_at && r.purpose === "review_task"),
      types: (ptypes.data ?? []).map((t) => ({
        id: t.id, label: t.label, open: t.is_open_for_registration,
        claimsPending: n(types.data, (r) => r.partner_type_id === t.id && r.review_status === "pending"),
        claimsApproved: n(types.data, (r) => r.partner_type_id === t.id && r.review_status === "approved"),
        published: n(prof.data, (r) => r.partner_type_id === t.id && r.is_published && !r.is_suspended),
      })),
      audit: audit.data ?? [],
      intros: ((await sb.rpc("admin_introduction_counts")).data ?? {}) as Record<string, number>,
      content: { drafts: n(cver.data, (r) => r.status === "draft"), published: n(cver.data, (r) => r.status === "published"), catalogChanges: cchg.data ?? [] },
    };
  });
