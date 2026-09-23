import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Info, RotateCcw, Save, Search, Star, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { matchesService, type CatalogCategoryRow, type CatalogServiceRow, type CatalogTypeRow } from "@/lib/service-catalog";

type SelectionRow = Database["public"]["Tables"]["partner_service_selections"]["Row"];
type SuggestionRow = Database["public"]["Tables"]["partner_service_suggestions"]["Row"];
type Details = Pick<SelectionRow, "offering_description" | "client_types" | "industries" | "geography" | "delivery_mode" | "engagement" | "pricing" | "price_min" | "price_max" | "accepting_inquiries" | "is_featured" | "responsible_professional" | "professional_jurisdiction">;
type State = { types: string[]; picks: Record<string, Details> };

const key = (type: string, service: string) => `${type}:${service}`;
const blank = (): Details => ({ offering_description: null, client_types: null, industries: null, geography: null, delivery_mode: null, engagement: null, pricing: null, price_min: null, price_max: null, accepting_inquiries: true, is_featured: false, responsible_professional: null, professional_jurisdiction: null });
const MAX_FEATURED = 3;

export function ServiceSelector({ userId, applicationId, readOnly = false }: { userId: string; applicationId: string | null; readOnly?: boolean }) {
  const [types, setTypes] = useState<CatalogTypeRow[]>([]);
  const [categories, setCategories] = useState<CatalogCategoryRow[]>([]);
  const [services, setServices] = useState<CatalogServiceRow[]>([]);
  const [state, setState] = useState<State>({ types: [], picks: {} });
  const [saved, setSaved] = useState<State>({ types: [], picks: {} });
  const [history, setHistory] = useState<State[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>([]);
  const [queries, setQueries] = useState<Record<string, string>>({});
  const [openDetails, setOpenDetails] = useState<string | null>(null);
  const [showIndividual, setShowIndividual] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const [t, c, s, sel, sug] = await Promise.all([
        supabase.from("service_partner_types").select("*").eq("is_active", true).eq("is_open_for_registration", true).eq("track", "professional_service").order("display_order"),
        supabase.from("service_categories").select("*").order("display_order"),
        supabase.from("service_catalog").select("*").order("display_order"),
        supabase.from("partner_service_selections").select("*").eq("user_id", userId),
        supabase.from("partner_service_suggestions").select("*").eq("user_id", userId).order("created_at"),
      ]);
      setTypes(t.data ?? []); setCategories(c.data ?? []); setServices(s.data ?? []); setSuggestions(sug.data ?? []);
      const picks: Record<string, Details> = {};
      for (const row of sel.data ?? []) {
        const { offering_description, client_types, industries, geography, delivery_mode, engagement, pricing, price_min, price_max, accepting_inquiries, is_featured, responsible_professional, professional_jurisdiction } = row;
        picks[key(row.partner_type, row.service_id)] = { offering_description, client_types, industries, geography, delivery_mode, engagement, pricing, price_min, price_max, accepting_inquiries, is_featured, responsible_professional, professional_jurisdiction };
      }
      const typeIds = [...new Set([...(sel.data ?? []).map((r) => r.partner_type), ...(sug.data ?? []).map((r) => r.partner_type)])];
      const initial = { types: typeIds, picks };
      setState(initial); setSaved(initial); setLoading(false);
    })();
  }, [userId]);

  const serviceById = useMemo(() => new Map(services.map((s) => [s.id, s])), [services]);
  const featuredCount = Object.values(state.picks).filter((d) => d.is_featured).length;
  const totalSelected = Object.keys(state.picks).length;
  const dirty = JSON.stringify(state) !== JSON.stringify(saved);

  function update(next: State) { setHistory((h) => [...h.slice(-19), state]); setState(next); setMessage(null); }
  function undo() { const prev = history[history.length - 1]; if (!prev) return; setHistory((h) => h.slice(0, -1)); setState(prev); }
  function toggleType(id: string) {
    if (state.types.includes(id)) {
      const picks = Object.fromEntries(Object.entries(state.picks).filter(([k]) => !k.startsWith(`${id}:`)));
      update({ types: state.types.filter((t) => t !== id), picks });
    } else update({ ...state, types: [...state.types, id] });
  }
  function toggleService(type: string, id: string) {
    const k = key(type, id);
    const picks = { ...state.picks };
    if (picks[k]) { delete picks[k]; if (openDetails === k) setOpenDetails(null); } else picks[k] = blank();
    update({ ...state, picks });
  }
  function clearType(type: string) { update({ ...state, picks: Object.fromEntries(Object.entries(state.picks).filter(([k]) => !k.startsWith(`${type}:`))) }); }
  function setDetail<K extends keyof Details>(k: string, field: K, value: Details[K]) {
    if (field === "is_featured" && value === true && featuredCount >= MAX_FEATURED) { setMessage({ tone: "error", text: `You can feature up to ${MAX_FEATURED} services. Remove one first.` }); return; }
    setState((s) => ({ ...s, picks: { ...s.picks, [k]: { ...s.picks[k], [field]: value } } }));
  }

  function validate(): string | null {
    for (const [k, d] of Object.entries(state.picks)) {
      const label = serviceById.get(k.split(":")[1])?.label ?? k;
      if (d.price_min != null && d.price_max != null && d.price_max < d.price_min) return `${label}: the upper price must be at least the starting price.`;
      if (d.pricing === "custom_quote" && (d.price_min != null || d.price_max != null)) return `${label}: remove prices or choose a price option other than custom quote.`;
    }
    return null;
  }

  async function save() {
    const problem = validate();
    if (problem) { setMessage({ tone: "error", text: problem }); return; }
    setPending(true); setMessage(null);
    const removed = Object.keys(saved.picks).filter((k) => !state.picks[k]);
    for (const k of removed) {
      const [type, service] = k.split(":");
      const { error } = await supabase.from("partner_service_selections").delete().eq("user_id", userId).eq("partner_type", type).eq("service_id", service);
      if (error) { setPending(false); setMessage({ tone: "error", text: error.message }); return; }
    }
    // Unfeature first so the three-featured limit is never exceeded mid-save.
    const rows = Object.entries(state.picks).map(([k, d]) => { const [partner_type, service_id] = k.split(":"); return { user_id: userId, application_id: applicationId, partner_type, service_id, ...d }; });
    const sorted = [...rows.filter((r) => !r.is_featured), ...rows.filter((r) => r.is_featured)];
    if (sorted.length) {
      const { error } = await supabase.from("partner_service_selections").upsert(sorted, { onConflict: "user_id,partner_type,service_id" });
      if (error) { setPending(false); setMessage({ tone: "error", text: error.message }); return; }
    }
    setSaved(state); setHistory([]); setPending(false);
    setMessage({ tone: "ok", text: `Saved ${rows.length} service${rows.length === 1 ? "" : "s"} as a draft. Nothing is published until Opsirix completes your review.` });
  }

  async function suggest(event: React.FormEvent<HTMLFormElement>, type: string) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const label = String(data.get("label") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    if (label.length < 2 || description.length < 20) { setMessage({ tone: "error", text: "Name the service and describe it in at least 20 characters." }); return; }
    const { data: row, error } = await supabase.from("partner_service_suggestions").insert({ user_id: userId, partner_type: type, category_id: String(data.get("category") || "") || null, label, description }).select().single();
    if (error) { setMessage({ tone: "error", text: error.message }); return; }
    setSuggestions((s) => [...s, row]); form.reset();
    setMessage({ tone: "ok", text: `“${label}” was sent to Opsirix for review. It will not appear on your profile unless it is approved.` });
  }
  async function removeSuggestion(id: string) {
    const { error } = await supabase.from("partner_service_suggestions").delete().eq("id", id);
    if (!error) setSuggestions((s) => s.filter((x) => x.id !== id));
  }

  if (loading) return <section className="nexus-work-card"><p>Loading the service catalog.</p></section>;

  return (
    <div className="svc-layout">
      <div className="svc-main">
        <fieldset className="nexus-work-card svc-types" disabled={readOnly}>
          <legend><h2>Which of these describe your firm?</h2></legend>
          <p>Choose every type your organization genuinely offers. Each type keeps its own service list. Choosing a type is a self-reported description, not a license check. These are the professional service types open now. More Nexus partner types will open separately.</p>
          <div className="svc-type-grid">
            {types.map((t) => (
              <label key={t.id} className={`svc-type ${state.types.includes(t.id) ? "is-on" : ""}`}>
                <input type="checkbox" checked={state.types.includes(t.id)} onChange={() => toggleType(t.id)} />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {state.types.length === 0 && <p className="svc-empty">Select a firm type to see the services that apply to it.</p>}

        {types.filter((t) => state.types.includes(t.id)).map((t) => {
          const query = queries[t.id] ?? "";
          const typeCats = categories.filter((c) => c.partner_type === t.id && c.is_active);
          const count = Object.keys(state.picks).filter((k) => k.startsWith(`${t.id}:`)).length;
          const visible = typeCats.map((c) => ({ c, items: services.filter((s) => s.category_id === c.id && (s.is_active || state.picks[key(t.id, s.id)]) && matchesService(s, query, c.label)) })).filter((g) => g.items.length);
          const matchCount = visible.reduce((n, g) => n + g.items.length, 0);
          const typeSuggestions = suggestions.filter((s) => s.partner_type === t.id);
          return (
            <section key={t.id} className="nexus-work-card svc-panel" aria-labelledby={`svc-${t.id}`}>
              <header className="svc-panel-head">
                <div><p className="nexus-kicker">{count} selected</p><h2 id={`svc-${t.id}`}>{t.label}</h2></div>
                {count > 0 && !readOnly && <Button type="button" variant="ghost" size="sm" onClick={() => clearType(t.id)}><X />Clear selections</Button>}
              </header>
              <label className="svc-search">
                <Search aria-hidden />
                <span className="sr-only">Search {t.label} services</span>
                <input type="search" value={query} onChange={(e) => setQueries((q) => ({ ...q, [t.id]: e.target.value }))} placeholder="Search services, for example “contracts” or “payroll”" />
              </label>
              <p className="svc-count" aria-live="polite">{query ? `${matchCount} matching service${matchCount === 1 ? "" : "s"}` : "Select only the services you provide today."}</p>

              {visible.map(({ c, items }) => {
                const hiddenByDefault = !c.is_prominent && !query && !showIndividual[t.id];
                if (hiddenByDefault) return (
                  <button key={c.id} type="button" className="svc-reveal" onClick={() => setShowIndividual((v) => ({ ...v, [t.id]: true }))}>
                    Show {c.label.toLowerCase()} services <ChevronDown aria-hidden />
                  </button>
                );
                const picked = items.filter((s) => state.picks[key(t.id, s.id)]).length;
                return (
                  <details key={c.id} className="svc-group" open={!!query || picked > 0 || c.display_order <= 2}>
                    <summary><span>{c.label}</span><span className="svc-group-meta">{picked ? `${picked} of ${items.length}` : `${items.length} services`}</span><ChevronDown aria-hidden /></summary>
                    <ul>
                      {items.map((s) => {
                        const k = key(t.id, s.id);
                        const on = !!state.picks[k];
                        return (
                          <li key={s.id} className={on ? "is-on" : ""}>
                            <label className="svc-option">
                              <input type="checkbox" checked={on} disabled={readOnly || (!s.is_active && !on)} onChange={() => toggleService(t.id, s.id)} />
                              <span><strong>{s.label}{!s.is_active && " (retired)"}</strong><small>{s.description}</small>{s.qualification_note && <small className="svc-qual"><Info aria-hidden />Reviewer checks: {s.qualification_note.toLowerCase()}</small>}</span>
                            </label>
                            {on && <button type="button" className="svc-details-toggle" aria-expanded={openDetails === k} aria-controls={`d-${k}`} onClick={() => setOpenDetails(openDetails === k ? null : k)}>{openDetails === k ? "Hide details" : "Add details"}</button>}
                            {on && openDetails === k && <DetailsForm id={`d-${k}`} service={s} details={state.picks[k]} onChange={(f, v) => setDetail(k, f, v)} featuredFull={featuredCount >= MAX_FEATURED} readOnly={readOnly} />}
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                );
              })}
              {query && matchCount === 0 && <p className="svc-empty">No services match “{query}”. Try a broader word, or suggest the service below.</p>}

              <details className="svc-group svc-other">
                <summary><span>Other service</span><span className="svc-group-meta">Requires Opsirix review</span><ChevronDown aria-hidden /></summary>
                <p>If you provide something not listed, describe it here. Suggestions stay private and are never published automatically.</p>
                {typeSuggestions.length > 0 && <ul className="svc-suggestions">{typeSuggestions.map((s) => <li key={s.id}><span><strong>{s.label}</strong><small>{s.status === "pending" ? "Pending Opsirix review" : s.status === "approved" ? "Approved" : "Not added"}</small></span>{s.status === "pending" && !readOnly && <Button type="button" variant="ghost" size="sm" onClick={() => removeSuggestion(s.id)} aria-label={`Withdraw ${s.label}`}><Trash2 /></Button>}</li>)}</ul>}
                {!readOnly && <form className="svc-suggest" onSubmit={(e) => suggest(e, t.id)}>
                  <label>Service name<input name="label" required minLength={2} maxLength={120} /></label>
                  <label>Closest category<select name="category"><option value="">Not sure</option>{typeCats.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
                  <label className="svc-wide">Description<textarea name="description" required minLength={20} maxLength={1000} placeholder="What the service includes and who it is for." /></label>
                  <div><Button type="submit" variant="outline">Send for review</Button></div>
                </form>}
              </details>
            </section>
          );
        })}
      </div>

      <aside className="svc-summary" aria-label="Selected services summary">
        <div className="nexus-work-card">
          <p className="nexus-kicker">Your services</p>
          <h2>{totalSelected} selected</h2>
          <p className="svc-featured-note">{featuredCount} of {MAX_FEATURED} featured</p>
          {totalSelected === 0 ? <p>Nothing selected yet.</p> : types.filter((t) => state.types.includes(t.id)).map((t) => {
            const items = Object.keys(state.picks).filter((k) => k.startsWith(`${t.id}:`));
            if (!items.length) return null;
            return <div key={t.id} className="svc-summary-group"><h3>{t.label}</h3><ul>{items.map((k) => { const s = serviceById.get(k.split(":")[1]); return <li key={k}><span>{state.picks[k].is_featured && <Star aria-label="Featured" className="svc-star" />}{s?.label}</span>{!readOnly && <button type="button" onClick={() => toggleService(t.id, k.split(":")[1])} aria-label={`Remove ${s?.label}`}><X /></button>}</li>; })}</ul></div>;
          })}
          {message && <p className={`svc-message ${message.tone}`} role={message.tone === "error" ? "alert" : "status"}>{message.text}</p>}
          {!readOnly && <div className="svc-actions">
            <Button type="button" variant="outline" onClick={undo} disabled={!history.length}><RotateCcw />Undo</Button>
            <Button type="button" onClick={save} disabled={pending || !dirty}><Save />{pending ? "Saving" : dirty ? "Save services" : "Saved"}</Button>
          </div>}
          <p className="svc-fine">Selections stay in draft until your profile and credentials are reviewed. Selecting a service does not verify a license or qualification.</p>
        </div>
      </aside>
    </div>
  );
}

function DetailsForm({ id, service, details, onChange, featuredFull, readOnly }: { id: string; service: CatalogServiceRow; details: Details; onChange: <K extends keyof Details>(f: K, v: Details[K]) => void; featuredFull: boolean; readOnly: boolean }) {
  const text = (f: keyof Details) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(f, (e.target.value || null) as never);
  const num = (f: "price_min" | "price_max") => (e: React.ChangeEvent<HTMLInputElement>) => onChange(f, e.target.value === "" ? null : Number(e.target.value));
  return (
    <fieldset id={id} className="svc-details" disabled={readOnly}>
      <legend className="sr-only">Details for {service.label}</legend>
      <p className="svc-fine">All details are optional.</p>
      <label className="svc-wide">How you offer this service<textarea maxLength={1000} value={details.offering_description ?? ""} onChange={text("offering_description")} /></label>
      <label>Client types<input maxLength={300} value={details.client_types ?? ""} onChange={text("client_types")} placeholder="Startups, family businesses" /></label>
      <label>Industries<input maxLength={300} value={details.industries ?? ""} onChange={text("industries")} placeholder="Retail, healthcare" /></label>
      <label className="svc-wide">Geography or jurisdiction<input maxLength={300} value={details.geography ?? ""} onChange={text("geography")} placeholder="Texas; federal matters nationwide" /></label>
      <label>Delivery<select value={details.delivery_mode ?? ""} onChange={(e) => onChange("delivery_mode", (e.target.value || null) as Details["delivery_mode"])}><option value="">Not specified</option><option value="remote">Remote</option><option value="in_person">In person</option><option value="both">Remote or in person</option></select></label>
      <label>Engagement<select value={details.engagement ?? ""} onChange={(e) => onChange("engagement", (e.target.value || null) as Details["engagement"])}><option value="">Not specified</option><option value="project">Project</option><option value="ongoing">Ongoing</option><option value="both">Project or ongoing</option></select></label>
      <label>Pricing<select value={details.pricing ?? ""} onChange={(e) => onChange("pricing", (e.target.value || null) as Details["pricing"])}><option value="">Not shown</option><option value="starting_price">Starting price</option><option value="price_range">Price range</option><option value="custom_quote">Custom quote</option></select></label>
      {(details.pricing === "starting_price" || details.pricing === "price_range") && <label>{details.pricing === "price_range" ? "From (USD)" : "Starting at (USD)"}<input type="number" min={0} step="1" value={details.price_min ?? ""} onChange={num("price_min")} /></label>}
      {details.pricing === "price_range" && <label>To (USD)<input type="number" min={0} step="1" value={details.price_max ?? ""} onChange={num("price_max")} /></label>}
      <label className="svc-check"><input type="checkbox" checked={details.accepting_inquiries} onChange={(e) => onChange("accepting_inquiries", e.target.checked)} />Accepting new inquiries</label>
      <label className="svc-check"><input type="checkbox" checked={details.is_featured} disabled={!details.is_featured && featuredFull} onChange={(e) => onChange("is_featured", e.target.checked)} />Feature this service{!details.is_featured && featuredFull && " (limit reached)"}</label>
      {service.qualification_note && <div className="svc-wide svc-private">
        <p><strong>Private review details.</strong> This service normally requires: {service.qualification_note.toLowerCase()}. Only Opsirix reviewers see these fields. Nothing is verified until a reviewer checks it.</p>
        <div className="nexus-form-grid">
          <label>Responsible professional<input maxLength={200} value={details.responsible_professional ?? ""} onChange={text("responsible_professional")} /></label>
          <label>License or registration jurisdiction<input maxLength={200} value={details.professional_jurisdiction ?? ""} onChange={text("professional_jurisdiction")} /></label>
        </div>
      </div>}
    </fieldset>
  );
}
