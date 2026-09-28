import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { OperatingShell } from "@/components/workspace/OperatingShell";
import { Button } from "@/components/ui/button";
import { getOsOverview } from "@/lib/os.functions";

export const Route = createFileRoute("/_authenticated/os")({
  head: () => ({ meta: [
    { title: "Overview | Opsirix OS" },
    { name: "description", content: "Your company's Flow tasks, Core requests, Grid review status and Nexus requests in one place." },
    { property: "og:title", content: "Overview | Opsirix OS" },
    { property: "og:description", content: "Your company's Flow tasks, Core requests, Grid review status and Nexus requests in one place." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: OsPage,
});

type Data = Awaited<ReturnType<typeof getOsOverview>>;
const TASK: Record<string, string> = { todo: "To do", in_progress: "In progress", blocked: "Blocked", done: "Done" };
const NEXUS: Record<string, string> = { received: "Received", under_review: "Under review", consent_requested: "Your consent requested", introduced: "Introduced", closed: "Closed" };
const month = (p: string | null) => (p ? new Date(`${p}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }) : null);
const ROLE: Record<string, string> = { owner: "Owner", member: "Member", viewer: "Viewer" };
const companyIsEmpty = (c: Data["companies"][number]) =>
  c.flow.open === 0 && c.core.open === 0 && !c.grid.self && !c.grid.staff && !c.grid.selfDraft;

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded border border-border p-2"><div className="text-xl font-semibold">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>;
}

function OsPage() {
  const load = useServerFn(getOsOverview);
  const [data, setData] = useState<Data>();
  const [error, setError] = useState(false);
  const refresh = useCallback(async () => { try { setData(await load()); setError(false); } catch { setError(true); } }, [load]);
  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <OperatingShell mode="company" eyebrow="Opsirix OS" title="Overview">
      <p className="text-muted-foreground max-w-2xl">What needs attention across your companies, built from your real Flow, Core, Grid and Nexus records. You only see what your role allows.</p>
      {error && <div role="alert" className="text-sm">The overview could not load. <Button size="sm" variant="secondary" onClick={() => void refresh()}>Retry</Button></div>}
      {!data && !error && <p role="status">Loading your overview…</p>}
      {data && !data.companies.length && (
        <section className="ops-panel text-sm">
          <h2 className="font-semibold">No company workspace yet</h2>
          <p className="text-muted-foreground">Create a company workspace to use Flow, Core and Grid, or ask a company owner to add you.</p>
          <Link to="/workspace" className="underline">Set up a company workspace</Link>
        </section>
      )}
      {data?.companies.map((c) => (
        <section key={c.id} className={`ops-panel space-y-3 text-sm${companyIsEmpty(c) ? " ops-company-compact" : ""}`} aria-label={`Overview for ${c.name}`}>
          <div className="flex flex-wrap items-baseline gap-2"><h2 className="text-lg font-semibold">{c.name}</h2><span className="rounded border border-border px-2">{ROLE[c.role] ?? c.role}</span></div>
          {companyIsEmpty(c) ? (
            <div className="ops-compact-empty">
              <p className="text-muted-foreground">No active Flow tasks, Core requests, or Grid reviews.</p>
              <div><Link to="/flow" className="underline">Open Flow</Link><Link to="/core" className="underline">Open Core</Link><Link to="/grid" className="underline">Open Grid</Link></div>
            </div>
          ) : (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="font-medium">Flow tasks</h3>
              <div className="grid grid-cols-2 gap-2">
                <Stat label="Open" value={c.flow.open} /><Stat label="Overdue" value={c.flow.overdue} />
                <Stat label="Due in 7 days" value={c.flow.dueSoon} /><Stat label="On hold" value={c.flow.onHold} />
              </div>
              {c.flow.next.length ? (
                <ul className="space-y-1">{c.flow.next.map((t) => <li key={t.id}>{t.title} · {TASK[t.status]}{t.due_on ? ` · due ${t.due_on}` : ""}{t.hold ? " · on hold" : ""}</li>)}</ul>
              ) : <p className="text-muted-foreground">No open tasks.{c.canEdit ? " Add one in Flow." : ""}</p>}
              <Link to="/flow" className="underline">Open Flow</Link>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Core requests</h3>
              <div className="grid grid-cols-2 gap-2"><Stat label="Waiting for Opsirix" value={c.core.submitted} /><Stat label="In progress" value={c.core.inProgress} /></div>
              {c.core.awaitingYou.length ? (
                <div><p className="font-medium">Ready for company review</p><ul>{c.core.awaitingYou.map((r) => <li key={r.id}>{r.ref}: {r.title}</li>)}</ul></div>
              ) : <p className="text-muted-foreground">{c.core.open ? "Nothing waiting on your company." : `No open requests.${c.canEdit ? " Ask Opsirix to handle an operational job in Core." : ""}`}</p>}
              <Link to="/core" className="underline">Open Core</Link>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Grid review status</h3>
              <p className="rounded border border-border p-2">Grid is not scored. Scoring stays off while its criteria and specialist review are pending.</p>
              <p>Latest self-assessment: {month(c.grid.self) ?? "none submitted yet"}</p>
              <p>Latest Opsirix evidence review: {month(c.grid.staff) ?? "none submitted yet"}</p>
              {c.grid.selfDraft && <p>Draft in progress for {month(c.grid.selfDraft)}</p>}
              <Link to="/grid" className="underline">Open Grid</Link>
            </div>
          </div>
          )}
        </section>
      ))}
      {data && (
        <section className="ops-panel space-y-2 text-sm" aria-label="Your Nexus requests">
          <h2 className="text-lg font-semibold">Your Nexus help requests</h2>
          <p className="text-muted-foreground">These are linked to your own email, not to a company, so co-members don't see them.</p>
          {data.nexus.total ? (
            <>
              <div className="grid max-w-md grid-cols-3 gap-2"><Stat label="Total" value={data.nexus.total} /><Stat label="Open" value={data.nexus.open} /><Stat label="Need your consent" value={data.nexus.needsConsent} /></div>
              <ul>{data.nexus.latest.map((n) => <li key={n.id}>{n.created_at.slice(0, 10)} · {NEXUS[n.status] ?? n.status}</li>)}</ul>
              <Link to="/nexus/requests" className="underline">View requests</Link>
            </>
          ) : <p>No help requests yet. <Link to="/nexus/help" className="underline">Ask for help finding a professional</Link>.</p>}
        </section>
      )}
      <p className="text-xs text-muted-foreground">Vault and AI are not part of Opsirix OS yet. They are waiting on privacy and security review.</p>
    </OperatingShell>
  );
}
