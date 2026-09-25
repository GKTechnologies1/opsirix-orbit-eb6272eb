import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, CircleX } from "lucide-react";
import { OperatingShell } from "@/components/workspace/OperatingShell";
import { Button } from "@/components/ui/button";
import { NexusDiscoverySection } from "@/components/sections/NexusDiscoverySection";
import { FAQSection, FAQ_DEFAULT } from "@/components/sections/FAQSection";
import {
  addCatalogChoice, getContentAdmin, moveCatalogChoice, publishContentVersion, restoreContentVersion,
  saveContentDraft, setCatalogRetired, unpublishContentBlock, updateCatalogChoice, type ContentBody, type FaqItem,
} from "@/lib/content.functions";

export const Route = createFileRoute("/_authenticated/staff/content")({
  head: () => ({ meta: [
    { title: "Content & Catalog | Opsirix Staff" },
    { name: "description", content: "Admin/CEO management of approved website content and the Nexus service catalog." },
    { property: "og:title", content: "Content & Catalog | Opsirix Staff" },
    { property: "og:description", content: "Admin/CEO management of approved website content and the Nexus service catalog." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ContentPage,
});

type Data = NonNullable<Awaited<ReturnType<typeof getContentAdmin>>>;
type Version = Data["versions"][number];
const fmt = (s: string | null) => (s ? new Date(s).toISOString().slice(0, 16).replace("T", " ") + " UTC" : "");
const linkOk = (v: string) => !v || /^\/[A-Za-z0-9/_-]*$/.test(v) || /^https:\/\/[A-Za-z0-9.-]+(\/\S*)?$/.test(v);

function ContentPage() {
  const load = useServerFn(getContentAdmin);
  const [data, setData] = useState<Data | null | undefined>();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const refresh = useCallback(() => load().then(setData).catch(() => setData(null)), [load]);
  useEffect(() => { void refresh(); }, [refresh]);
  const run = async (p: Promise<{ success: boolean; error?: string }>, done: string) => {
    const r = await p; setMsg(r.success ? { ok: true, text: done } : { ok: false, text: r.error ?? "The change was refused." }); await refresh();
  };
  return <OperatingShell mode="staff" eyebrow="Admin / CEO" title="Content & Catalog">
    {data === undefined ? <p className="ops-muted">Checking access.</p> : data === null ? <section className="ops-empty"><CircleX /><h2>Access restricted</h2><p>Only Admin/CEO can manage website content and the service catalog.</p></section> : <>
      <p className="ops-lead">Every edit is saved as a draft, previewed, then published. Pricing drafts stay hidden until a reconciled pricing schedule is approved. Catalog edits never open a partner category or approve a partner.</p>
      {msg && <p role="status" className={msg.ok ? "ops-feedback" : "ops-feedback ops-error"}>{msg.text}</p>}
      {data.blocks.map((b) => <ContentBlock key={b.key} block={b} versions={data.versions.filter((v) => v.block_key === b.key)} run={run} openTypes={data.types.filter((x) => x.is_open_for_registration).map((x) => x.id)} />)}
      <Catalog data={data} run={run} />
      <section className="ops-panel"><h2>Recent catalog changes</h2>{data.changes.length ? <ul className="ops-list">{data.changes.map((c) => <li key={c.id}><strong>{c.change_type}</strong> {c.service_id} <span className="ops-muted">{fmt(c.created_at)}</span></li>)}</ul> : <p className="ops-muted">No catalog changes yet.</p>}
        <Link to="/admin/applications">Review {data.suggestionsPending} pending service suggestions</Link></section>
    </>}
  </OperatingShell>;
}

type Run = (p: Promise<{ success: boolean; error?: string }>, done: string) => Promise<void>;

function ContentBlock({ block, versions, run, openTypes }: { block: Data["blocks"][number]; versions: Version[]; run: Run; openTypes: string[] }) {
  const save = useServerFn(saveContentDraft), publish = useServerFn(publishContentVersion), unpublish = useServerFn(unpublishContentBlock), restore = useServerFn(restoreContentVersion);
  const published = versions.find((v) => v.id === block.published_version_id);
  const draft = versions.find((v) => v.status === "draft");
  const isFaq = block.kind === "faq";
  const empty: ContentBody = isFaq ? { ...FAQ_DEFAULT, items: FAQ_DEFAULT.items.map((i) => ({ ...i })) } : { heading: "", body: "" };
  const base = draft?.body ?? published?.body ?? empty;
  const [f, setF] = useState<ContentBody>(base);
  const [summary, setSummary] = useState("");
  const [preview, setPreview] = useState(false);
  useEffect(() => { setF(draft?.body ?? published?.body ?? empty); }, [draft?.id, published?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const errors = [!f.heading.trim() && "Heading is required.", !f.body.trim() && "Body is required.", !summary.trim() && "Add a change summary.",
    !linkOk(f.cta_href ?? "") && "Button link must be a site path like /nexus/help or an https address.",
    Boolean(f.cta_label) !== Boolean(f.cta_href) && "A button needs both a label and a link.",
    isFaq && !(f.items?.length) && "Add at least one question.",
    isFaq && (f.items ?? []).some((i) => !i.q.trim() || !i.a.trim()) && "Every question needs a question and an answer.",
    JSON.stringify(f).includes("\u2014") && "Replace long dashes with commas, periods or colons."].filter(Boolean) as string[];
  const items = f.items ?? [];
  const setItem = (n: number, patch: Partial<FaqItem>) => setF({ ...f, items: items.map((it, i) => (i === n ? { ...it, ...patch } : it)) });
  const moveItem = (n: number, d: number) => { const next = [...items]; const t = n + d; if (t < 0 || t >= next.length) return; [next[n], next[t]] = [next[t], next[n]]; setF({ ...f, items: next }); };
  const isPricing = block.kind === "pricing";
  return <section className="ops-panel" aria-labelledby={`cb-${block.key}`}>
    <p className="ops-panel-kicker">{isPricing ? "Hidden until pricing is approved" : published ? `Published: version ${published.version}` : "Not published: built-in text shows"}</p>
    <h2 id={`cb-${block.key}`}>{block.label}</h2>
    <p className="ops-muted">Public pages that change when published: <strong>{isPricing ? "none (publishing is blocked)" : block.pages.join(", ")}</strong></p>
    <div className="ops-create-form" style={{ gridTemplateColumns: "1fr" }}>
      <label>{isFaq ? "Section heading" : "Heading"}<input value={f.heading} onChange={(e) => setF({ ...f, heading: e.target.value })} maxLength={160} /></label>
      {isFaq ? <label>Small label above the heading<input value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} maxLength={60} /></label>
        : <label>Body<textarea rows={4} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} maxLength={2000} /></label>}
      {isFaq && <fieldset className="ops-faq-editor"><legend>Questions ({items.length} of 12)</legend>
        {items.map((it, n) => <div key={n} className="ops-panel" style={{ padding: 12 }}>
          <label>Question {n + 1}<input value={it.q} onChange={(e) => setItem(n, { q: e.target.value })} maxLength={200} /></label>
          <label>Answer<textarea rows={3} value={it.a} onChange={(e) => setItem(n, { a: e.target.value })} maxLength={1200} /></label>
          <div className="ops-actions">
            <Button size="sm" variant="outline" className="ops-outline" aria-label={`Move question ${n + 1} up`} disabled={n === 0} onClick={() => moveItem(n, -1)}><ArrowUp /></Button>
            <Button size="sm" variant="outline" className="ops-outline" aria-label={`Move question ${n + 1} down`} disabled={n === items.length - 1} onClick={() => moveItem(n, 1)}><ArrowDown /></Button>
            <Button size="sm" variant="outline" className="ops-outline" disabled={items.length <= 1} onClick={() => setF({ ...f, items: items.filter((_, i) => i !== n) })}>Remove question</Button>
          </div>
        </div>)}
        <Button variant="outline" className="ops-outline" disabled={items.length >= 12} onClick={() => setF({ ...f, items: [...items, { q: "", a: "" }] })}>Add a question</Button>
      </fieldset>}
      {!isFaq && <><label>Button label<input value={f.cta_label ?? ""} onChange={(e) => setF({ ...f, cta_label: e.target.value })} maxLength={60} /></label>
      <label>Button link<input value={f.cta_href ?? ""} onChange={(e) => setF({ ...f, cta_href: e.target.value })} placeholder="/nexus/help" /></label></>}
      <label>Change summary<input value={summary} onChange={(e) => setSummary(e.target.value)} maxLength={300} /></label>
      {errors.length > 0 && <ul className="ops-muted" aria-live="polite">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
      <div className="ops-actions">
        <Button disabled={errors.length > 0} onClick={() => run(save({ data: { key: block.key, body: { heading: f.heading, body: f.body, cta_label: f.cta_label || undefined, cta_href: f.cta_href || undefined, items: isFaq ? items : undefined }, summary } }), "Draft saved.").then(() => setSummary(""))}>Save draft</Button>
        <Button variant="outline" className="ops-outline" onClick={() => setPreview((p) => !p)}>{preview ? "Hide preview" : "Preview"}</Button>
        {draft && !isPricing && <Button onClick={() => run(publish({ data: { id: draft.id } }), `Version ${draft.version} published to ${block.pages.join(", ")}.`)}>Publish draft v{draft.version}</Button>}
        {published && !isPricing && <Button variant="outline" className="ops-outline" onClick={() => run(unpublish({ data: { key: block.key } }), "Unpublished. The built-in text shows again.")}>Unpublish</Button>}
      </div>
    </div>
    {preview && <div className="content-preview" aria-label="Preview"><p className="ops-panel-kicker">Preview (not public)</p>
      {block.key === "home.nexus" ? <NexusDiscoverySection categories={openTypes} content={f} /> : isFaq ? <FAQSection content={f} /> : <article className="ops-panel"><h3>{f.heading}</h3><p>{f.body}</p></article>}</div>}
    <h3>Version history</h3>
    <div className="ops-table-wrap"><table><thead><tr><th>Version</th><th>Status</th><th>Summary</th><th>Author</th><th>Saved</th><th>Published</th><th /></tr></thead><tbody>
      {versions.map((v) => <tr key={v.id}><td>{v.version}</td><td>{v.status}</td><td>{v.change_summary}</td><td>{v.author}</td><td>{fmt(v.created_at)}</td><td>{v.publisher ? `${v.publisher}, ${fmt(v.published_at)}` : fmt(v.published_at)}</td>
        <td>{!isPricing && v.status !== "draft" && v.id !== block.published_version_id && <Button size="sm" variant="outline" className="ops-outline" onClick={() => run(restore({ data: { id: v.id, summary: `Restored version ${v.version}` } }), `Version ${v.version} restored and published.`)}>Restore</Button>}</td></tr>)}
    </tbody></table></div>
  </section>;
}

function Catalog({ data, run }: { data: Data; run: Run }) {
  const [type, setType] = useState(data.types[0]?.id ?? "");
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ description: "", aliases: "", clientLabel: "" });
  const [add, setAdd] = useState({ id: "", category: "", label: "", description: "", aliases: "" });
  const update = useServerFn(updateCatalogChoice), move = useServerFn(moveCatalogChoice), retire = useServerFn(setCatalogRetired), create = useServerFn(addCatalogChoice);
  const t = data.types.find((x) => x.id === type);
  const cats = data.categories.filter((c) => c.partner_type === type);
  return <section className="ops-panel" aria-labelledby="catalog-title">
    <p className="ops-panel-kicker">Nexus service catalog</p><h2 id="catalog-title">Categories and choices</h2>
    <label>Partner category <select value={type} onChange={(e) => setType(e.target.value)}>{data.types.map((x) => <option key={x.id} value={x.id}>{x.label} ({x.is_open_for_registration ? "open" : "closed"})</option>)}</select></label>
    {t && !t.is_open_for_registration && <p className="ops-muted">This category is closed. Editing its choices does not open it or show them to anyone.</p>}
    <p className="ops-muted">Retiring a choice keeps its permanent ID. Existing applications keep it; it just can't be newly selected.</p>
    {cats.map((c) => <div key={c.id}><h3>{c.label}</h3><div className="ops-table-wrap"><table><thead><tr><th>Choice</th><th>Permanent ID</th><th>Status</th><th>Search terms</th><th /></tr></thead><tbody>
      {data.catalog.filter((s) => s.category_id === c.id).map((s) => <tr key={s.id}>
        <td><strong>{s.label}</strong><br /><span className="ops-muted">{s.description}</span>
          {editing === s.id && <div className="ops-create-form" style={{ gridTemplateColumns: "1fr" }}>
            <label>Description<textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <label>Search terms (comma separated)<input value={form.aliases} onChange={(e) => setForm({ ...form, aliases: e.target.value })} /></label>
            <label>Client-facing label (optional)<input value={form.clientLabel} onChange={(e) => setForm({ ...form, clientLabel: e.target.value })} /></label>
            <div className="ops-actions"><Button disabled={!form.description.trim()} onClick={() => run(update({ data: { id: s.id, description: form.description, aliases: form.aliases.split(",").map((a) => a.trim()), clientLabel: form.clientLabel } }), "Choice updated.").then(() => setEditing(null))}>Save</Button><Button variant="outline" className="ops-outline" onClick={() => setEditing(null)}>Cancel</Button></div>
          </div>}</td>
        <td><code>{s.id}</code></td><td>{s.is_active ? "Active" : "Retired"}</td><td>{(s.search_aliases ?? []).join(", ")}</td>
        <td><div className="ops-actions">
          <Button size="sm" variant="outline" className="ops-outline" aria-label={`Move ${s.label} up`} onClick={() => run(move({ data: { id: s.id, direction: -1 } }), "Order updated.")}><ArrowUp /></Button>
          <Button size="sm" variant="outline" className="ops-outline" aria-label={`Move ${s.label} down`} onClick={() => run(move({ data: { id: s.id, direction: 1 } }), "Order updated.")}><ArrowDown /></Button>
          <Button size="sm" variant="outline" className="ops-outline" onClick={() => { setEditing(s.id); setForm({ description: s.description, aliases: (s.search_aliases ?? []).join(", "), clientLabel: s.client_label ?? "" }); }}>Edit</Button>
          <Button size="sm" variant="outline" className="ops-outline" onClick={() => run(retire({ data: { id: s.id, retired: s.is_active } }), s.is_active ? "Choice retired." : "Choice reactivated.")}>{s.is_active ? "Retire" : "Reactivate"}</Button>
        </div></td></tr>)}
    </tbody></table></div></div>)}
    <h3>Add a choice</h3>
    <p className="ops-muted">New choices start retired, so they are not selectable until you reactivate them.</p>
    <div className="ops-create-form" style={{ gridTemplateColumns: "1fr" }}>
      <label>Grouping<select value={add.category} onChange={(e) => setAdd({ ...add, category: e.target.value })}><option value="">Choose</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
      <label>Permanent ID (lowercase, underscores)<input value={add.id} onChange={(e) => setAdd({ ...add, id: e.target.value })} /></label>
      <label>Label<input value={add.label} onChange={(e) => setAdd({ ...add, label: e.target.value })} /></label>
      <label>Description<textarea rows={2} value={add.description} onChange={(e) => setAdd({ ...add, description: e.target.value })} /></label>
      <label>Search terms<input value={add.aliases} onChange={(e) => setAdd({ ...add, aliases: e.target.value })} /></label>
      <div className="ops-actions"><Button disabled={!add.category || !/^[a-z0-9]+(_[a-z0-9]+)*$/.test(add.id) || !add.label.trim() || !add.description.trim()} onClick={() => run(create({ data: { ...add, aliases: add.aliases.split(",").map((a) => a.trim()) } }), "Choice added as retired.").then(() => setAdd({ id: "", category: "", label: "", description: "", aliases: "" }))}>Add choice</Button></div>
    </div>
  </section>;
}
