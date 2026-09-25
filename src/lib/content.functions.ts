import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type FaqItem = { q: string; a: string };
export type ContentBody = { heading: string; body: string; cta_label?: string; cta_href?: string; items?: FaqItem[] };

/** Public: only published, non-pricing content. Pricing is never returned. */
export const getPublishedContent = createServerFn({ method: "GET" })
  .inputValidator((d: { keys: string[] }) => z.object({ keys: z.array(z.string().max(80)).max(20) }).parse(d))
  .handler(async ({ data }) => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const sb = createClient<Database>(process.env["SUPABASE_URL"]!, key, { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } });
    const { data: rows, error } = await sb.rpc("published_site_content", { _keys: data.keys });
    if (error) return {} as Record<string, ContentBody>;
    return Object.fromEntries((rows ?? []).map((r) => [r.key, r.body as ContentBody])) as Record<string, ContentBody>;
  });

type Result = { success: true } | { success: false; error: string };
const ok = (error: { message: string } | null): Result => (error ? { success: false, error: error.message } : { success: true });

export const getContentAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const { data: isAdmin } = await sb.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) return null;
    const [blocks, versions, types, cats, catalog, changes, sugg] = await Promise.all([
      sb.from("site_content_blocks").select("*").order("key"),
      sb.from("site_content_versions").select("*").order("version", { ascending: false }),
      sb.from("service_partner_types").select("id,label,is_open_for_registration").order("display_order"),
      sb.from("service_categories").select("id,partner_type,label,display_order").order("display_order"),
      sb.from("service_catalog").select("id,partner_type,category_id,label,description,search_aliases,display_order,is_active,client_label").order("display_order"),
      sb.from("service_catalog_changes").select("id,service_id,change_type,created_at,changed_by").order("created_at", { ascending: false }).limit(15),
      sb.from("partner_service_suggestions").select("id").eq("status", "pending"),
    ]);
    const authorIds = [...new Set((versions.data ?? []).flatMap((v) => [v.author_id, v.published_by]).filter(Boolean) as string[])];
    const { data: people } = authorIds.length ? await sb.from("profiles").select("id,email").in("id", authorIds) : { data: [] };
    const who = Object.fromEntries((people ?? []).map((p) => [p.id, p.email]));
    return {
      blocks: blocks.data ?? [],
      versions: (versions.data ?? []).map((v) => ({ ...v, body: v.body as ContentBody, author: v.author_id ? who[v.author_id] ?? "Staff" : "Initial import", publisher: v.published_by ? who[v.published_by] ?? "Staff" : null })),
      types: types.data ?? [], categories: cats.data ?? [], catalog: catalog.data ?? [],
      changes: changes.data ?? [], suggestionsPending: (sugg.data ?? []).length,
    };
  });

const body = z.object({ heading: z.string().trim().min(1).max(160), body: z.string().trim().min(1).max(2000), cta_label: z.string().trim().max(60).optional(), cta_href: z.string().trim().max(300).optional(), items: z.array(z.object({ q: z.string().trim().min(1).max(200), a: z.string().trim().min(1).max(1200) })).min(1).max(12).optional() });

export const saveContentDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { key: string; body: ContentBody; summary: string }) => z.object({ key: z.string(), body, summary: z.string().trim().min(1).max(300) }).parse(d))
  .handler(async ({ data, context }) => {
    const clean: Record<string, unknown> = { heading: data.body.heading, body: data.body.body };
    if (data.body.items) clean.items = data.body.items;
    if (data.body.cta_label || data.body.cta_href) { clean.cta_label = data.body.cta_label ?? ""; clean.cta_href = data.body.cta_href ?? ""; }
    const { error } = await context.supabase.rpc("save_content_draft", { _key: data.key, _body: clean as never, _summary: data.summary });
    return ok(error);
  });

export const publishContentVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => ok((await context.supabase.rpc("publish_content_version", { _version: data.id })).error));

export const unpublishContentBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { key: string }) => z.object({ key: z.string() }).parse(d))
  .handler(async ({ data, context }) => ok((await context.supabase.rpc("unpublish_content_block", { _key: data.key })).error));

export const restoreContentVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; summary: string }) => z.object({ id: z.string().uuid(), summary: z.string().max(300) }).parse(d))
  .handler(async ({ data, context }) => ok((await context.supabase.rpc("restore_content_version", { _version: data.id, _summary: data.summary })).error));

export const updateCatalogChoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; description: string; aliases: string[]; clientLabel: string }) => z.object({ id: z.string(), description: z.string().trim().min(1).max(600), aliases: z.array(z.string().trim().max(60)).max(20), clientLabel: z.string().max(120) }).parse(d))
  .handler(async ({ data, context }) => ok((await context.supabase.rpc("admin_update_catalog_choice", { _id: data.id, _description: data.description, _aliases: data.aliases.filter(Boolean), _client_label: data.clientLabel })).error));

export const moveCatalogChoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; direction: -1 | 1 }) => z.object({ id: z.string(), direction: z.union([z.literal(-1), z.literal(1)]) }).parse(d))
  .handler(async ({ data, context }) => ok((await context.supabase.rpc("admin_move_catalog_choice", { _id: data.id, _direction: data.direction })).error));

export const setCatalogRetired = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; retired: boolean }) => z.object({ id: z.string(), retired: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => ok((await context.supabase.rpc("admin_set_catalog_retired", { _id: data.id, _retired: data.retired })).error));

export const addCatalogChoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; category: string; label: string; description: string; aliases: string[] }) => z.object({ id: z.string().max(80), category: z.string(), label: z.string().trim().min(1).max(120), description: z.string().trim().min(1).max(600), aliases: z.array(z.string().max(60)).max(20) }).parse(d))
  .handler(async ({ data, context }) => ok((await context.supabase.rpc("admin_add_catalog_choice", { _id: data.id, _category: data.category, _label: data.label, _description: data.description, _aliases: data.aliases.filter(Boolean) })).error));
