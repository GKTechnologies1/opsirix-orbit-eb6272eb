import { useMemo, useState, type ReactNode } from "react";

export type SortOption<T> = { key: string; label: string; compare: (a: T, b: T) => number };
export type FilterOption<T> = { key: string; label: string; options: { value: string; label: string }[]; match: (row: T, value: string) => boolean };

/** Shared search, filters, sorting and pagination for record lists. Row numbers are view positions, not record IDs. */
export function useListControls<T>(rows: T[], opts: { text: (row: T) => string; sorts: SortOption<T>[]; filters?: FilterOption<T>[]; pageSize?: number; date?: (row: T) => string }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(opts.sorts[0]?.key ?? "");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const size = opts.pageSize ?? 10;
  const result = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = rows.filter((r) => !q || opts.text(r).toLowerCase().includes(q));
    for (const f of opts.filters ?? []) if (filters[f.key]) out = out.filter((r) => f.match(r, filters[f.key]));
    if (opts.date && from) out = out.filter((r) => opts.date!(r).slice(0, 10) >= from);
    if (opts.date && to) out = out.filter((r) => opts.date!(r).slice(0, 10) <= to);
    const s = opts.sorts.find((x) => x.key === sort);
    if (s) out = [...out].sort(s.compare);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, query, sort, filters, from, to]);
  const pages = Math.max(1, Math.ceil(result.length / size));
  const current = Math.min(page, pages);
  const start = (current - 1) * size;
  return {
    query, setQuery: (v: string) => { setQuery(v); setPage(1); },
    sort, setSort, filters, setFilter: (k: string, v: string) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); },
    page: current, pages, setPage, total: rows.length, matched: result.length, start,
    visible: result.slice(start, start + size), sorts: opts.sorts, filterDefs: opts.filters ?? [],
    hasDate: Boolean(opts.date), from, to,
    setFrom: (v: string) => { setFrom(v); setPage(1); }, setTo: (v: string) => { setTo(v); setPage(1); },
    clear: () => { setQuery(""); setFilters({}); setFrom(""); setTo(""); setPage(1); },
  };
}

type Controls = Omit<ReturnType<typeof useListControls<unknown>>, "visible" | "sorts" | "filterDefs"> & { sorts: { key: string; label: string }[]; filterDefs: { key: string; label: string; options: { value: string; label: string }[] }[] };

export function ListToolbar({ c, label, placeholder }: { c: Pick<Controls, "query" | "setQuery" | "sort" | "setSort" | "sorts" | "filterDefs" | "filters" | "setFilter"> & Partial<Pick<Controls, "hasDate" | "from" | "to" | "setFrom" | "setTo">>; label: string; placeholder?: string }) {
  return <div className="list-toolbar" role="search" aria-label={label}>
    <label>Search<input type="search" value={c.query} onChange={(e) => c.setQuery(e.target.value)} maxLength={120} placeholder={placeholder} /></label>
    {c.filterDefs.map((f) => <label key={f.key}>{f.label}<select value={c.filters[f.key] ?? ""} onChange={(e) => c.setFilter(f.key, e.target.value)}><option value="">All</option>{f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>)}
    {c.hasDate && <><label>From<input type="date" value={c.from} onChange={(e) => c.setFrom?.(e.target.value)} /></label>
      <label>To<input type="date" value={c.to} onChange={(e) => c.setTo?.(e.target.value)} /></label></>}
    <label>Sort by<select value={c.sort} onChange={(e) => c.setSort(e.target.value)}>{c.sorts.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select></label>
  </div>;
}

export function ListSummary({ c, noun }: { c: Pick<Controls, "matched" | "total" | "start"> & { visible: unknown[] }; noun: [string, string] }) {
  const w = c.total === 1 ? noun[0] : noun[1];
  if (c.matched === 0) return null;
  return <p className="list-summary" role="status">Showing {c.start + 1} to {c.start + c.visible.length} of {c.matched}{c.matched !== c.total ? ` matching (${c.total} ${w} in total)` : ` ${c.matched === 1 ? noun[0] : noun[1]}`}.</p>;
}

export function ListEmpty({ c, children }: { c: Pick<Controls, "matched" | "total" | "clear">; children: ReactNode }) {
  if (c.total === 0) return <>{children}</>;
  if (c.matched === 0) return <p className="list-summary" role="status">No records match these choices. <button type="button" className="list-link" onClick={c.clear}>Clear search and filters</button></p>;
  return null;
}

export function ListPager({ c }: { c: Pick<Controls, "page" | "pages" | "setPage"> }) {
  if (c.pages <= 1) return null;
  return <nav className="list-pager" aria-label="Pages">
    <button type="button" disabled={c.page <= 1} onClick={() => c.setPage(c.page - 1)}>Previous</button>
    <span>Page {c.page} of {c.pages}</span>
    <button type="button" disabled={c.page >= c.pages} onClick={() => c.setPage(c.page + 1)}>Next</button>
  </nav>;
}
