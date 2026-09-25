import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { NEXUS_CATEGORY_COPY, NEXUS_DISCLOSURE_VERSION } from "./nexus-discovery";

function publicClient() {
  return createClient<Database>(process.env["SUPABASE_URL"]!, process.env["SUPABASE_PUBLISHABLE_KEY"]!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

/** Open, active categories that also have approved public copy. Closed types are never returned. */
export const getOpenNexusCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("service_partner_types")
    .select("id,display_order,is_active,is_open_for_registration")
    .eq("is_active", true)
    .eq("is_open_for_registration", true)
    .order("display_order");
  if (error) return [] as string[];
  return (data ?? []).map((row) => row.id).filter((id) => id in NEXUS_CATEGORY_COPY);
});

const inquirySchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().default(""),
  category: z.string().trim().min(1).max(60),
  location: z.string().trim().max(160).optional().default(""),
  description: z.string().trim().min(20).max(1000),
  acknowledged: z.literal(true),
  contactConsent: z.literal(true),
  website: z.string().max(0).optional(),
});

async function sha256(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const submitNexusInquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inquirySchema.parse(input))
  .handler(async ({ data }) => {
    if (data.phone && data.phone.length < 6) return { success: false as const, error: "Please enter a valid phone number or leave it blank." };
    if (!(data.category in NEXUS_CATEGORY_COPY)) return { success: false as const, error: "That category is not currently available through Nexus." };
    const ip = getRequestHeader("cf-connecting-ip") ?? getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
    const clientHash = ip ? await sha256(`nexus:${ip}`) : null;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: id, error } = await supabaseAdmin.rpc("submit_nexus_inquiry", {
      _full_name: data.fullName,
      _email: data.email,
      _phone: data.phone ?? "",
      _category: data.category,
      _location: data.location ?? "",
      _description: data.description,
      _disclosure_version: NEXUS_DISCLOSURE_VERSION,
      _client_hash: clientHash ?? undefined,
    });
    if (error || !id) {
      if (error?.message.includes("category_unavailable")) return { success: false as const, error: "That category is not currently available through Nexus." };
      if (error?.message.includes("rate_limited")) return { success: false as const, error: "We have received several requests from you recently. Please try again later." };
      console.error("Nexus inquiry save failed", error?.message);
      return { success: false as const, error: "Your inquiry was not saved. Please try again." };
    }
    return { success: true as const };
  });

export const getMemberDirectory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("nexus_member_directory");
    if (error) throw new Error("Directory unavailable");
    return data ?? [];
  });

// ---------- Staff inquiry triage ----------
export const listNexusInquiries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: isAdmin }, { data: isStaff }] = await Promise.all([
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
      context.supabase.rpc("has_staff_role", { _user_id: context.userId }),
    ]);
    if (!isStaff) return { allowed: false as const, isAdmin: false, inquiries: [], assignments: [] };
    const [{ data: inquiries }, { data: assignments }] = await Promise.all([
      context.supabase.from("nexus_inquiries").select("id,category_id,status,triage_role,is_test,created_at").order("created_at", { ascending: false }).limit(200),
      context.supabase.from("nexus_inquiry_assignments").select("id,inquiry_id,assignee_id,purpose,created_at,revoked_at").is("revoked_at", null),
    ]);
    const ids = [...new Set((assignments ?? []).map((a) => a.assignee_id))];
    const { data: people } = ids.length ? await context.supabase.from("profiles").select("id,full_name,email").in("id", ids) : { data: [] };
    return {
      allowed: true as const,
      isAdmin: Boolean(isAdmin),
      userId: context.userId,
      inquiries: inquiries ?? [],
      assignments: (assignments ?? []).map((a) => ({ ...a, person: (people ?? []).find((p) => p.id === a.assignee_id) ?? null })),
    };
  });

export const openNexusInquiry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase.rpc("open_nexus_inquiry", { _inquiry: data.id });
    if (error || !rows?.length) return { success: false as const, error: "You do not have access to this inquiry." };
    const r = rows[0];
    return { success: true as const, inquiry: { id: r.id, full_name: r.full_name, email: r.email, phone: r.phone, category_id: r.category_id, location: r.location, description: r.description, status: r.status, is_test: r.is_test, created_at: r.created_at, disclosure_version: r.disclosure_version } };
  });

export const assignNexusInquiry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), email: z.string().trim().email().max(255), purpose: z.enum(["triage", "review_task"]), enabled: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const before = await context.supabase.from("nexus_inquiry_assignments").select("id", { count: "exact", head: true }).eq("inquiry_id", data.id);
    const { error } = await context.supabase.rpc("assign_nexus_inquiry", { _inquiry: data.id, _assignee_email: data.email, _purpose: data.purpose, _enabled: data.enabled });
    if (error) return { success: false as const, error: error.message };
    const { data: allowed } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!allowed) {
      const { data: mine } = await context.supabase.from("nexus_inquiry_assignments").select("id").eq("inquiry_id", data.id).eq("assignee_id", context.userId).eq("purpose", "triage").is("revoked_at", null);
      if (!mine?.length || data.purpose !== "review_task") return { success: false as const, error: "You are not permitted to change this assignment." };
    }
    void before;
    return { success: true as const };
  });

export const setNexusInquiryStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), status: z.enum(["under_review", "closed"]) }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("set_nexus_inquiry_status", { _inquiry: data.id, _status: data.status });
    if (error) return { success: false as const, error: error.message };
    const { data: row } = await context.supabase.from("nexus_inquiries").select("status").eq("id", data.id).maybeSingle();
    if (row?.status !== data.status) return { success: false as const, error: "You are not permitted to change this inquiry's status." };
    return { success: true as const };
  });
