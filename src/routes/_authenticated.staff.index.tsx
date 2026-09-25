import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowRight, CircleX, ShieldCheck } from "lucide-react";
import { OperatingShell } from "@/components/workspace/OperatingShell";
import { getAdminOverview, getStaffConsole } from "@/lib/workspace.functions";

export const Route = createFileRoute("/_authenticated/staff/")({
  head: () => ({ meta: [
    { title: "Staff Console | Opsirix" },
    { name: "description", content: "Private Opsirix operational workspace for authorized staff." },
    { property: "og:title", content: "Staff Console | Opsirix" },
    { property: "og:description", content: "Private Opsirix operational workspace for authorized staff." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: StaffHome,
});

function StaffHome() {
  const getConsole = useServerFn(getStaffConsole);
  const [data, setData] = useState<Awaited<ReturnType<typeof getStaffConsole>>>();
  useEffect(() => { void getConsole().then(setData); }, [getConsole]);
  return <OperatingShell mode="staff" eyebrow="Internal operations" title="Staff Console">
    {!data ? <p className="ops-muted">Checking access.</p> : !data.allowed ? <section className="ops-empty"><CircleX /><h2>Access restricted</h2><p>Company membership does not grant access to internal Opsirix operations.</p></section> : <>
      <p className="ops-lead">A separate internal workspace for approved Opsirix roles. Pipeline notes, risk discussions, and pricing negotiations will remain outside founder workspaces.</p>
      <div className="ops-stat-grid"><article><span>Current role</span><strong>{data.roles.includes("admin") ? "Admin / CEO" : data.roles.includes("operations_lead") ? "Operations Lead" : "Compliance Coordinator"}</strong></article><article><span>Phase 1</span><strong>Access boundaries active</strong></article><article><span>Sensitive records</span><strong>Not collected</strong></article></div>
      {data.isAdmin ? <AdminOverview /> : <section className="ops-panel"><ShieldCheck /><p className="ops-panel-kicker">Your duties</p><h2>Assigned work only</h2><p>You see Nexus help requests only when Admin/CEO assigns them to you.</p><Link to="/staff/inquiries">Open my assigned requests <ArrowRight /></Link></section>}
    </>}
  </OperatingShell>;
}
type Overview = NonNullable<Awaited<ReturnType<typeof getAdminOverview>>>;
type QueueTo = "/admin/applications" | "/staff/inquiries" | "/staff/content";

function Queue({ label, value, to, note }: { label: string; value: number; to: QueueTo; note?: string }) {
  return <article><span>{label}</span><strong>{value}</strong>{note && <small className="ops-muted" style={{ display: "block" }}>{note}</small>}<Link to={to}>Open <ArrowRight /></Link></article>;
}

function AdminOverview() {
  const load = useServerFn(getAdminOverview);
  const [o, setO] = useState<Overview | null | undefined>();
  const [err, setErr] = useState(false);
  useEffect(() => { load().then(setO).catch(() => setErr(true)); }, [load]);
  if (err) return <p className="ops-muted" role="alert">The overview could not load. Refresh to try again.</p>;
  if (o === undefined) return <p className="ops-muted">Loading overview.</p>;
  if (!o) return null;
  return <>
    <section className="ops-panel"><h2>Partner review queues</h2><div className="ops-stat-grid">
      <Queue label="Applications waiting" value={o.applications.submitted} to="/admin/applications" note={`${o.applications.changes} awaiting applicant changes, ${o.applications.draft} drafts`} />
      <Queue label="Credentials to check" value={o.credentialsPending} to="/admin/applications" />
      <Queue label="Representative authority to check" value={o.authorityPending} to="/admin/applications" />
      <Queue label="University agreements not recorded" value={o.universityAgreementMissing} to="/admin/applications" />
      <Queue label="Insurance licenses to check" value={o.licensesPending} to="/admin/applications" note={`${o.licensesExpired} expired records`} />
      <Queue label="Profile edits to review" value={o.profileEditsPending} to="/admin/applications" />
      <Queue label="Services to review" value={o.servicesPending} to="/admin/applications" />
      <Queue label="Other service suggestions" value={o.suggestionsPending} to="/admin/applications" />
    </div></section>
    <section className="ops-panel"><h2>Content & Catalog</h2><div className="ops-stat-grid">
      <Queue label="Pending content drafts" value={o.content.drafts} to="/staff/content" />
      <Queue label="Published content sections" value={o.content.published} to="/staff/content" />
      <Queue label="Service suggestions" value={o.suggestionsPending} to="/admin/applications" />
    </div>{o.content.catalogChanges.length > 0 && <ul className="ops-list">{o.content.catalogChanges.map((c) => <li key={c.id}><strong>{c.change_type}</strong> {c.service_id} <span className="ops-muted">{new Date(c.created_at).toISOString().slice(0, 16).replace("T", " ")} UTC</span></li>)}</ul>}<Link to="/staff/content">Open Content & Catalog <ArrowRight /></Link></section>
    <section className="ops-panel"><h2>Help requests</h2><div className="ops-stat-grid">
      <Queue label="Open requests" value={o.inquiriesOpen} to="/staff/inquiries" />
      <Queue label="Unassigned" value={o.inquiriesUnassigned} to="/staff/inquiries" note="Assign to a named Operations Lead" />
      <Queue label="Compliance review tasks" value={o.complianceTasks} to="/staff/inquiries" />
      <Queue label="Introductions awaiting founder" value={o.intros?.awaiting_founder ?? 0} to="/staff/inquiries" />
      <Queue label="Authorized, ready to review and send" value={o.intros?.ready_to_send ?? 0} to="/staff/inquiries" />
      <Queue label="Introductions sent" value={o.intros?.sent ?? 0} to="/staff/inquiries" />
      <Queue label="Partner notices failed" value={o.intros?.notice_failed ?? 0} to="/staff/inquiries" note="Introduction was sent; notify the partner again" />
    </div></section>
    <section className="ops-panel"><h2>Categories and publication</h2><div className="ops-table-wrap"><table><thead><tr><th>Category</th><th>Applications</th><th>Claims pending</th><th>Claims approved</th><th>Published listings</th></tr></thead><tbody>
      {o.types.map((t) => <tr key={t.id}><td>{t.label}</td><td>{t.open ? "Open" : "Closed"}</td><td>{t.claimsPending}</td><td>{t.claimsApproved}</td><td>{t.published}</td></tr>)}
    </tbody></table></div><Link to="/admin/preview">Manage closed-category preview access <ArrowRight /></Link></section>
    <section className="ops-panel"><h2>Recent audit history</h2>{o.audit.length ? <ul className="ops-list">{o.audit.map((a) => <li key={a.id}><strong>{a.event_type}</strong> {a.summary} <span className="ops-muted">{new Date(a.created_at).toISOString().slice(0, 16).replace("T", " ")} UTC</span></li>)}</ul> : <p className="ops-muted">No events yet.</p>}<Link to="/staff/access">Manage staff access <ArrowRight /></Link></section>
    <AuditSearch />
  </>;
}

function AuditSearch() {
  const search = useServerFn(searchAuditHistory);
  const [result, setResult] = useState<Awaited<ReturnType<typeof searchAuditHistory>>>();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ text: "", eventType: "", from: "", to: "" });
  const run = useCallback(async (values: typeof form) => {
    setBusy(true);
    try {
      setResult(await search({ data: {
        text: values.text || undefined,
        eventType: values.eventType || undefined,
        from: values.from || undefined,
        to: values.to || undefined,
      } }));
    } finally { setBusy(false); }
  }, [search]);
  useEffect(() => { void run({ text: "", eventType: "", from: "", to: "" }); }, [run]);

  if (result && !result.allowed) return null;
  return <section className="ops-panel" aria-labelledby="audit-search-title">
    <h2 id="audit-search-title">Search history</h2>
    <p className="ops-muted">Search the internal record of staff actions. Help request wording and founder details are never shown here.</p>
    <form className="ops-access-form" onSubmit={(e) => { e.preventDefault(); void run(form); }}>
      <label>Words in the record<input name="text" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} maxLength={120} placeholder="For example: access, published" /></label>
      <label>Kind of action<select name="eventType" value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })}><option value="">All kinds</option>{(result?.types ?? []).map((t) => <option key={t} value={t}>{t.replaceAll("_", " ")}</option>)}</select></label>
      <label>From<input type="date" name="from" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} /></label>
      <label>To<input type="date" name="to" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} /></label>
      <div className="ops-actions">
        <Button type="submit" disabled={busy}>Search</Button>
        <Button type="button" variant="outline" className="ops-outline" disabled={busy} onClick={() => { const empty = { text: "", eventType: "", from: "", to: "" }; setForm(empty); void run(empty); }}>Clear</Button>
      </div>
    </form>
    {busy && <p className="ops-muted" role="status">Searching.</p>}
    {result && !busy && (result.events.length
      ? <><p className="ops-muted" role="status">{result.events.length} matching {result.events.length === 1 ? "record" : "records"}.</p>
        <ul className="ops-list">{result.events.map((a) => <li key={a.id}><strong>{a.event_type.replaceAll("_", " ")}</strong> {a.summary} <span className="ops-muted">{a.actor?.email ?? "System"} · {new Date(a.created_at).toISOString().slice(0, 16).replace("T", " ")} UTC</span></li>)}</ul></>
      : <p className="ops-muted" role="status">No records match this search.</p>)}
  </section>;
}

