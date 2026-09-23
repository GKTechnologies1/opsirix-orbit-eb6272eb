import type { Database } from "@/integrations/supabase/types";

export type CatalogServiceRow = Database["public"]["Tables"]["service_catalog"]["Row"];
export type CatalogCategoryRow = Database["public"]["Tables"]["service_categories"]["Row"];
export type CatalogTypeRow = Database["public"]["Tables"]["service_partner_types"]["Row"];

const norm = (v: string) => v.toLowerCase().replace(/[^a-z0-9&]+/g, " ").trim();

/**
 * Shared matcher for partner onboarding and future client search.
 * Aliases help people find a service; they are never shown or stored as partner claims.
 */
export function matchesService(service: Pick<CatalogServiceRow, "label" | "description" | "search_aliases">, query: string, categoryLabel = "") {
  const q = norm(query);
  if (!q) return true;
  const haystack = norm([service.label, service.description, categoryLabel, ...service.search_aliases].join(" "));
  if (haystack.includes(q)) return true;
  const words = q.split(" ").filter((w) => w.length > 1);
  return words.length > 0 && words.every((w) => haystack.includes(w));
}

export function searchServiceIds(services: CatalogServiceRow[], query: string) {
  return services.filter((s) => s.is_active && matchesService(s, query)).map((s) => s.id);
}
