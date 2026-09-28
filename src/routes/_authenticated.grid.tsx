import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { OperatingShell } from "@/components/workspace/OperatingShell";
import { Button } from "@/components/ui/button";
import { GRID_DIMENSIONS, getGrid, saveGridReview } from "@/lib/grid-core.functions";

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
      <p className="text-muted-foreground max-w-2xl">Each month can hold two separate records: the company's own self-assessment and Opsirix's evidence review. They are never blended.</p>
      <p role="note" className="rounded-md border border-border p-3 text-sm max-w-2xl"><strong>Scoring is turned off.</strong> The five areas and any 50-point scale are provisional. No score is recorded or shown until the rewritten criteria are approved and specialist review is complete. A Grid record is an operational note, not a legal, immigration, tax, insurance or investment-readiness determination.</p>
      {message && <p role="status" className="rounded-md border border-border p-3 text-sm">{message}</p>}
      {error && <div role="alert" className="text-sm">{error} <Button size="sm" variant="secondary" onClick={() => void refresh()}>Retry</Button></div>}
      {!data && !error && <p>Loading Grid…</p>}
      {data && !data.companies.length && <p>You don't have access to any company workspace yet.</p>}
      {data && company && (
        <>
          {data.companies.length > 1 && (
            <label className="ops-panel flex max-w-sm flex-col gap-1 text-sm">Company
              <select className="w-full" value={company.id} onChange={(e) => setOrgId(e.target.value)}>
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
        </>
      )}
    </OperatingShell>
  );
}

function ReviewCard({ kind, review }: { kind: Kind; review?: Review }) {
  return (
    <article className="rounded-md border border-border p-3 text-sm space-y-2" aria-label={KIND[kind]}>
      <h3 className="font-semibold">{KIND[kind]} {review && <span className="ml-1 rounded border border-border px-2 text-xs font-normal">{review.status === "submitted" ? `Submitted ${review.submitted_at?.slice(0, 10)}` : "Draft"}</span>}</h3>
      {!review && <p className="text-muted-foreground">No record for this month.</p>}
      {review && (
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

function Editor({ company, kind, onDone }: { company: Company; kind: Kind; onDone: (ok: boolean, text: string) => Promise<void> }) {
  const save = useServerFn(saveGridReview);
  const [period, setPeriod] = useState(thisMonth);
  const existing = company.reviews.find((r) => r.period.startsWith(period) && r.kind === kind);
  const locked = existing?.status === "submitted";
  const foreignDraft = kind === "staff_evidence_review" && existing && !existing.mine;
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    const submitNow = v.get("action") === "submit";
    const r = await save({ data: { organizationId: company.id, period, kind, submit: submitNow,
      entries: GRID_DIMENSIONS.map((d) => ({ dimension: d.key, observation: String(v.get(`o_${d.key}`) ?? ""), evidence: String(v.get(`e_${d.key}`) ?? "") })) } });
    await onDone(r.success, r.success ? (submitNow ? `${KIND[kind]} submitted. It is now final.` : "Draft saved.") : r.error);
  }
  return (
    <details className="ops-panel text-sm" open>
      <summary className="cursor-pointer font-semibold">Write the {KIND[kind].toLowerCase()}</summary>
      <label className="mt-2 flex max-w-xs flex-col">Month<input type="month" max={thisMonth} value={period} onChange={(e) => setPeriod(e.target.value || thisMonth)} className="w-full" /></label>
      {locked ? <p className="mt-2">This month's {KIND[kind].toLowerCase()} was submitted and is final.</p>
        : foreignDraft ? <p className="mt-2">Another Opsirix staff member is drafting this month's evidence review.</p> : (
        <form key={period + (existing?.updated_at ?? "")} onSubmit={submit} className="mt-2 space-y-3">
          {GRID_DIMENSIONS.map((d) => {
            const e = existing?.entries.find((x) => x.dimension === d.key);
            return (
              <fieldset key={d.key} className="grid gap-2 sm:grid-cols-2 rounded-md border border-border p-2">
                <legend className="px-1 font-medium">{d.label}</legend>
                <label>Observation<textarea name={`o_${d.key}`} maxLength={2000} rows={2} defaultValue={e?.observation ?? ""} className="w-full" /></label>
                <label>{kind === "self_assessment" ? "What supports this (optional)" : "Evidence checked"}<textarea name={`e_${d.key}`} maxLength={1000} rows={2} defaultValue={e?.evidence ?? ""} className="w-full" /></label>
              </fieldset>
            );
          })}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" name="action" value="draft" variant="secondary">Save draft</Button>
            <Button type="submit" name="action" value="submit">Submit (final)</Button>
          </div>
        </form>
      )}
    </details>
  );
}
