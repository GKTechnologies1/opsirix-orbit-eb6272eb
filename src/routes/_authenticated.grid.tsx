import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useState } from "react";
import { OperatingShell } from "@/components/workspace/OperatingShell";
import { Button } from "@/components/ui/button";
import { GRID_DIMENSIONS, getGrid, saveGridCriteria } from "@/lib/grid-core.functions";
import {
  CHOICE_HELP, CHOICE_LABEL, GRID_CRITERIA, GRID_CRITERIA_VERSION, PENDING_SPECIALIST, RESP_AREAS, RESP_LABEL, RETRIEVAL_TYPES,
  critByKey, describeAnswer, type Answer, type Choice, type Criterion,
} from "@/lib/grid-criteria";

export const Route = createFileRoute("/_authenticated/grid")({
  head: () => ({ meta: [
    { title: "Grid reviews | Opsirix" },
    { name: "description", content: "Monthly Grid records: founder self-assessment and Opsirix evidence review, kept separate." },
    { property: "og:title", content: "Grid reviews | Opsirix" },
    { property: "og:description", content: "Monthly Grid records: founder self-assessment and Opsirix evidence review, kept separate." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: GridPage,
});

type Data = Awaited<ReturnType<typeof getGrid>>;
type Company = Data["companies"][number];
type Review = Company["reviews"][number];
type Kind = "self_assessment" | "staff_evidence_review";
const KIND: Record<Kind, string> = { self_assessment: "Founder self-assessment", staff_evidence_review: "Opsirix evidence review" };
const thisMonth = new Date().toISOString().slice(0, 7);
const versionLabel = (v: string) => (v === GRID_CRITERIA_VERSION ? "Criteria version 3" : "Earlier format (five free-text areas)");

function GridPage() {
  const load = useServerFn(getGrid);
  const [data, setData] = useState<Data>();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [orgId, setOrgId] = useState<string>();
  const refresh = useCallback(async () => { try { setData(await load()); setError(""); } catch { setError("Grid could not load. Try again."); } }, [load]);
  useEffect(() => { void refresh(); }, [refresh]);
  const company = useMemo(() => data?.companies.find((c) => c.id === orgId) ?? data?.companies[0], [data, orgId]);
  const periods = useMemo(() => [...new Set((company?.reviews ?? []).map((r) => r.period.slice(0, 7)))], [company]);

  return (
    <OperatingShell mode="company" eyebrow="Opsirix Grid" title="Monthly reviews">
      <p className="text-muted-foreground max-w-2xl">Each month can hold two separate records: the company's own self-assessment and Opsirix's evidence review. They use the same checks but are never blended.</p>
      <p role="note" className="rounded-md border border-border p-3 text-sm max-w-2xl"><strong>No scores.</strong> Grid records answers and counts only. There is no total, percentage, band or readiness label. A Grid record is an operational note, not a legal, immigration, tax, employment, insurance or investment-readiness determination. "Evidence not shown" and "Not yet" never mean a compliance failure.</p>
      {message && <p role="status" className="rounded-md border border-border p-3 text-sm">{message}</p>}
      {error && <div role="alert" className="text-sm">{error} <Button size="sm" variant="secondary" onClick={() => void refresh()}>Retry</Button></div>}
      {!data && !error && <p>Loading Grid…</p>}
      {data && !data.companies.length && <p>You don't have access to any company workspace yet.</p>}
      {data && company && (
        <>
          {data.companies.length > 1 && (
            <label className="ops-panel flex max-w-sm flex-col gap-1 text-sm">Company
              <select className="w-full" value={company.id} onChange={(e) => { setOrgId(e.target.value); setMessage(""); }}>
                {data.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          )}
          <p className="text-sm text-muted-foreground">Your access: <strong>{company.role ? company.role[0].toUpperCase() + company.role.slice(1) : "Opsirix staff"}</strong>{company.canSelf ? " · can write the self-assessment" : company.canStaff ? " · can write the evidence review" : " · read only"}</p>
          {(company.canSelf || company.canStaff) && (
            <Editor key={company.id + (company.canSelf ? "s" : "e")} company={company} kind={company.canSelf ? "self_assessment" : "staff_evidence_review"}
              onDone={async (ok, text) => { setMessage(text); if (ok) await refresh(); }} />
          )}
          {!periods.length && <p className="rounded-md border border-dashed border-border p-4 text-sm">No Grid records you can see yet.</p>}
          {periods.map((p) => (
            <section key={p} className="ops-panel space-y-3" aria-label={`Grid ${p}`}>
              <h2 className="text-lg font-semibold">{p}</h2>
              <div className="grid gap-3 lg:grid-cols-2">
                {(["self_assessment", "staff_evidence_review"] as Kind[]).map((k) => {
                  const r = company.reviews.find((x) => x.period.startsWith(p) && x.kind === k);
                  return <ReviewCard key={k} kind={k} review={r} />;
                })}
              </div>
            </section>
          ))}
          <details className="ops-panel text-sm">
            <summary className="cursor-pointer font-semibold">Checks not in use: waiting on specialist review (11)</summary>
            <p className="mt-2 text-muted-foreground">These are not shown in forms and nothing is collected for them.</p>
            <ul className="mt-2 space-y-1">{PENDING_SPECIALIST.map((s) => <li key={s.n}>{s.title}: {s.discipline} review</li>)}</ul>
          </details>
        </>
      )}
    </OperatingShell>
  );
}

function ReviewCard({ kind, review }: { kind: Kind; review?: Review }) {
  const v3 = review?.criteria_version === GRID_CRITERIA_VERSION;
  return (
    <article className="min-w-0 rounded-md border border-border p-3 text-sm space-y-2" aria-label={KIND[kind]}>
      <h3 className="font-semibold">{KIND[kind]} {review && <span className="ml-1 rounded border border-border px-2 text-xs font-normal">{review.status === "submitted" ? `Submitted ${review.submitted_at?.slice(0, 10)}` : "Draft"}</span>}</h3>
      {review && <p className="text-xs text-muted-foreground">{versionLabel(review.criteria_version)}</p>}
      {!review && <p className="text-muted-foreground">No record for this month.</p>}
      {review && v3 && (
        <dl className="space-y-2">
          {GRID_CRITERIA.filter((c) => !(c.staffOnly && kind === "self_assessment")).map((c) => {
            const a = review.answers.find((x) => x.criterion === c.key);
            return (
              <div key={c.key}>
                <dt className="font-medium">{c.n}. {c.title}</dt>
                <dd className="text-muted-foreground break-words">{a ? describeAnswer(a).map((l, i) => <span key={i} className="block">{l}</span>) : "Not answered."}</dd>
              </div>
            );
          })}
        </dl>
      )}
      {review && !v3 && (
        <dl className="space-y-2">
          {GRID_DIMENSIONS.map((d) => {
            const e = review.entries.find((x) => x.dimension === d.key);
            return (
              <div key={d.key}>
                <dt className="font-medium">{d.label}</dt>
                <dd className="whitespace-pre-wrap text-muted-foreground">{e?.observation || "No observation."}{e?.evidence && <span className="block">Evidence: {e.evidence}</span>}</dd>
              </div>
            );
          })}
        </dl>
      )}
    </article>
  );
}

type Draft = { answer: Choice | ""; counts: Record<string, string>; detail: Record<string, unknown>; note: string };
const emptyDraft = (): Draft => ({ answer: "", counts: {}, detail: {}, note: "" });

function toDraft(a?: Answer): Draft {
  if (!a) return emptyDraft();
  return { answer: a.answer ?? "", counts: Object.fromEntries(Object.entries(a.counts ?? {}).map(([k, v]) => [k, String(v)])), detail: { ...(a.detail ?? {}) }, note: a.note ?? "" };
}

function Editor({ company, kind, onDone }: { company: Company; kind: Kind; onDone: (ok: boolean, text: string) => Promise<void> }) {
  const save = useServerFn(saveGridCriteria);
  const [period, setPeriod] = useState(thisMonth);
  const existing = company.reviews.find((r) => r.period.startsWith(period) && r.kind === kind);
  const locked = existing?.status === "submitted";
  const oldFormat = existing && existing.criteria_version !== GRID_CRITERIA_VERSION;
  const foreignDraft = kind === "staff_evidence_review" && existing && !existing.mine;
  const criteria = GRID_CRITERIA.filter((c) => !(c.staffOnly && kind === "self_assessment"));
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  useEffect(() => {
    setDrafts(Object.fromEntries(criteria.map((c) => [c.key, toDraft(existing?.answers.find((a) => a.criterion === c.key))])));
    setFormError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, existing?.updated_at, kind]);
  const set = (k: string, patch: Partial<Draft>) => setDrafts((d) => ({ ...d, [k]: { ...(d[k] ?? emptyDraft()), ...patch } }));

  function build(): Answer[] {
    const out: Answer[] = [];
    for (const c of criteria) {
      const d = drafts[c.key]; if (!d) continue;
      const counts: Record<string, number> = {};
      for (const [k, v] of Object.entries(d.counts)) if (v !== "" && v !== undefined) counts[k] = Number(v);
      const detail = { ...d.detail };
      if (c.type === "choice" && !d.answer) continue;
      if (c.type === "count" && !detail.status) continue;
      if (c.type === "count" && detail.status !== "counted" && detail.status !== "run") { for (const k of Object.keys(counts)) delete counts[k]; }
      if (c.key === "business_account") { out.push({ criterion: c.key, answer: d.answer as Choice, counts: {}, detail: {}, note: "" }); continue; }
      if (c.key === "doc_locations" && detail.labelsText !== undefined) detail.labels = String(detail.labelsText).split(",").map((s) => s.trim()).filter(Boolean);
      delete detail.labelsText;
      out.push({ criterion: c.key, answer: c.type === "choice" ? (d.answer as Choice) : null, counts, detail, note: d.note.trim() });
    }
    return out;
  }

  async function submit(submitNow: boolean) {
    setBusy(true); setFormError("");
    try {
      const r = await save({ data: { organizationId: company.id, period, kind, submit: submitNow, answers: build() } });
      if (!r.success) setFormError(r.error);
      await onDone(r.success, r.success ? (submitNow ? `${KIND[kind]} for ${period} submitted with criteria version 3. It is now final.` : "Draft saved.") : "");
    } finally { setBusy(false); }
  }

  return (
    <details className="ops-panel text-sm" open>
      <summary className="cursor-pointer font-semibold">Write the {KIND[kind].toLowerCase()}</summary>
      <label className="mt-2 flex max-w-xs flex-col">Month<input type="month" max={thisMonth} value={period} onChange={(e) => setPeriod(e.target.value || thisMonth)} className="w-full" /></label>
      <p className="mt-1 text-xs text-muted-foreground">Criteria version 3. Answer every check (13) to submit.{kind === "staff_evidence_review" ? " The retrieval exercise is optional." : ""}</p>
      {locked ? <p className="mt-2">This month's {KIND[kind].toLowerCase()} was submitted and is final.</p>
        : oldFormat ? <p className="mt-2">This month already has a record in the earlier Grid format. Choose another month.</p>
        : foreignDraft ? <p className="mt-2">Another Opsirix staff member is drafting this month's evidence review.</p> : (
        <form onSubmit={(e) => e.preventDefault()} className="mt-3 space-y-3">
          {criteria.map((c) => <CriterionField key={c.key} c={c} d={drafts[c.key] ?? emptyDraft()} set={(p) => set(c.key, p)} drafts={drafts} />)}
          {formError && <p role="alert" className="rounded-md border border-destructive p-2 text-sm">{formError}</p>}
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={busy} variant="secondary" onClick={() => void submit(false)}>Save draft</Button>
            <Button type="button" disabled={busy} onClick={() => void submit(true)}>Submit (final)</Button>
          </div>
        </form>
      )}
    </details>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex min-w-0 flex-col text-xs">{label}
      <input type="number" inputMode="numeric" min={0} max={10000} step={1} value={value} onChange={(e) => onChange(e.target.value)} className="w-full" />
    </label>
  );
}

function SourceField({ d, set }: { d: Draft; set: (p: Partial<Draft>) => void }) {
  return (
    <label className="flex max-w-sm flex-col text-xs">Board source
      <select value={String(d.detail.source ?? "")} onChange={(e) => set({ detail: { ...d.detail, source: e.target.value || undefined } })} className="w-full">
        <option value="">Choose…</option>
        <option value="flow">Read from Opsirix Flow</option>
        <option value="external">External board (founder-reported)</option>
      </select>
    </label>
  );
}

function CriterionField({ c, d, set, drafts }: { c: Criterion; d: Draft; set: (p: Partial<Draft>) => void; drafts: Record<string, Draft> }) {
  const counts = (k: string) => d.counts[k] ?? "";
  const setCount = (k: string, v: string) => set({ counts: { ...d.counts, [k]: v } });
  const status = String(d.detail.status ?? "");
  return (
    <fieldset className="min-w-0 space-y-2 rounded-md border border-border p-3" aria-label={`${c.n}. ${c.title}`}>
      <legend className="px-1 font-medium">{c.n}. {c.title}</legend>
      <p className="text-muted-foreground">{c.wording}</p>
      {c.type === "choice" && (
        <div role="radiogroup" aria-label={`${c.title} answer`} className="flex flex-wrap gap-x-4 gap-y-1">
          {c.choices!.map((ch) => (
            <label key={ch} className="inline-flex items-center gap-1" title={CHOICE_HELP[ch]}>
              <input type="radio" name={`a_${c.key}`} checked={d.answer === ch} onChange={() => set({ answer: ch })} /> {CHOICE_LABEL[ch]}
            </label>
          ))}
        </div>
      )}
      {c.naWhen && <p className="text-xs text-muted-foreground">Not applicable only when: {c.naWhen}</p>}
      {c.key === "business_account" && <p className="text-xs text-muted-foreground">Only whether an account was shown is recorded. Do not enter the account name, number, statement or balance.</p>}

      {c.key === "overdue_status" && (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{c.counts!.map((f) => <NumberField key={f.key} label={f.label} value={counts(f.key)} onChange={(v) => setCount(f.key, v)} />)}</div>
          <p className="text-xs text-muted-foreground">"Referred to a professional" stays an unresolved overdue item. It does not change or extend any deadline.</p>
          {Number(counts("extended") || 0) > 0 && (
            <label className="inline-flex items-center gap-2 text-xs"><input type="checkbox" checked={d.detail.extended_dates_recorded === "true"} onChange={(e) => set({ detail: { ...d.detail, extended_dates_recorded: e.target.checked ? "true" : undefined } })} /> A new date is recorded in the calendar for each Extended entry</label>
          )}
        </>
      )}
      {c.counts && c.type === "choice" && c.key !== "overdue_status" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{c.counts.map((f) => <NumberField key={f.key} label={f.label} value={counts(f.key)} onChange={(v) => setCount(f.key, v)} />)}</div>
      )}
      {(c.key === "board_updated" || c.key === "tasks_owner_due") && <SourceField d={d} set={set} />}
      {c.key === "board_updated" && (
        <label className="flex max-w-xs flex-col text-xs">Last update date<input type="date" max={new Date().toISOString().slice(0, 10)} value={String(d.detail.last_update ?? "")} onChange={(e) => set({ detail: { ...d.detail, last_update: e.target.value || undefined } })} className="w-full" /></label>
      )}
      {c.key === "responsibilities" && (
        <div className="grid gap-2 sm:grid-cols-3">
          {RESP_AREAS.map((r) => (
            <label key={r.key} className="flex flex-col text-xs">{r.label}
              <select value={String(d.detail[r.key] ?? "")} onChange={(e) => set({ detail: { ...d.detail, [r.key]: e.target.value || undefined } })} className="w-full">
                <option value="">Choose…</option>
                {Object.entries(RESP_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </label>
          ))}
          <p className="text-xs text-muted-foreground sm:col-span-3">Record a role or team only. Do not enter anyone's name.</p>
        </div>
      )}
      {c.key === "doc_locations" && (
        <label className="flex flex-col text-xs">Location types or labels (comma separated, up to 5)
          <input type="text" maxLength={320} placeholder="e.g. Company cloud drive, Opsirix Vault, Office filing cabinet" value={String(d.detail.labelsText ?? (Array.isArray(d.detail.labels) ? (d.detail.labels as string[]).join(", ") : ""))} onChange={(e) => set({ detail: { ...d.detail, labelsText: e.target.value } })} className="w-full" />
          <span className="text-muted-foreground">No links, file paths, usernames or passwords. Vault is not required.</span>
        </label>
      )}
      {c.key === "major_contracts" && <p className="text-xs text-muted-foreground">Do not enter contract text or terms.</p>}

      {(c.key === "tasks_by_due" || c.key === "long_overdue") && (
        <>
          <div role="radiogroup" aria-label={`${c.title} result`} className="flex flex-wrap gap-x-4 gap-y-1">
            {(c.key === "tasks_by_due" ? [["counted", "Enter counts"], ["no_tasks_due", "No tasks due"], ["no_data", "No data"]] : [["counted", "Enter count"], ["no_data", "No data"]]).map(([k, l]) => (
              <label key={k} className="inline-flex items-center gap-1"><input type="radio" name={`s_${c.key}`} checked={status === k} onChange={() => set({ detail: { ...d.detail, status: k } })} /> {l}</label>
            ))}
          </div>
          {status === "counted" && (
            <>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">{c.counts!.map((f) => <NumberField key={f.key} label={f.label} value={counts(f.key)} onChange={(v) => setCount(f.key, v)} />)}</div>
              <SourceField d={d} set={set} />
            </>
          )}
          {c.key === "tasks_by_due" && <p className="text-xs text-muted-foreground">Tasks due: tasks with a due date in the last 30 days, not counting tasks cancelled before their due date. An update is never counted as completion.</p>}
        </>
      )}
      {c.key === "retrieval" && (
        <Retrieval d={d} set={set} drafts={drafts} />
      )}
      {(c.type === "choice" && c.key !== "business_account") && (
        <label className="flex flex-col text-xs">{d.answer === "not_applicable" ? "Reason (required for Not applicable)" : "Note (optional)"}
          <input type="text" maxLength={300} value={d.note} onChange={(e) => set({ note: e.target.value })} className="w-full" />
        </label>
      )}
    </fieldset>
  );
}

function Retrieval({ d, set, drafts }: { d: Draft; set: (p: Partial<Draft>) => void; drafts: Record<string, Draft> }) {
  const eligible = RETRIEVAL_TYPES.filter((t) => drafts[t]?.answer && drafts[t]?.answer !== "not_applicable");
  const types = (d.detail.types as string[] | undefined) ?? [];
  const status = String(d.detail.status ?? "");
  return (
    <div className="space-y-2">
      <div role="radiogroup" aria-label="Retrieval result" className="flex flex-wrap gap-x-4 gap-y-1">
        <label className="inline-flex items-center gap-1"><input type="radio" name="s_retrieval" checked={status === "run"} disabled={!eligible.length} onChange={() => set({ detail: { ...d.detail, status: "run" } })} /> Run</label>
        <label className="inline-flex items-center gap-1"><input type="radio" name="s_retrieval" checked={status === "not_run"} onChange={() => set({ detail: { status: "not_run" }, counts: {} })} /> Not run</label>
        {status && <button type="button" className="text-xs underline" onClick={() => set({ detail: {}, counts: {} })}>Clear</button>}
      </div>
      {!eligible.length && <p className="text-xs text-muted-foreground">No eligible document types yet. Answer checks 1, 6 or 13 (not as Not applicable) to enable. Checks waiting on specialist review are never used.</p>}
      {status === "run" && (
        <>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {eligible.map((t) => (
              <label key={t} className="inline-flex items-center gap-1 text-xs">
                <input type="checkbox" checked={types.includes(t)} onChange={(e) => set({ detail: { ...d.detail, types: e.target.checked ? [...types, t] : types.filter((x) => x !== t) } })} /> {critByKey(t)?.title}
              </label>
            ))}
          </div>
          <div className="max-w-[10rem]"><NumberField label={`Found (of ${types.length})`} value={d.counts.found ?? ""} onChange={(v) => set({ counts: { ...d.counts, found: v } })} /></div>
        </>
      )}
    </div>
  );
}
