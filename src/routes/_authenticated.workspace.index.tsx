import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Building2, Clock3, Users } from "lucide-react";
import { OperatingShell } from "@/components/workspace/OperatingShell";
import { Button } from "@/components/ui/button";
import { ListEmpty, ListPager, ListSummary, ListToolbar, useListControls } from "@/components/shared/ListControls";
import { createCompanyWorkspace, getCompanyWorkspaces, renameCompanyWorkspace, setCompanyMember, setCompanyStaffGrant } from "@/lib/workspace.functions";

export const Route = createFileRoute("/_authenticated/workspace/")({
  head: () => ({ meta: [
    { title: "Company Workspaces | Opsirix OS" },
    { name: "description", content: "Create and manage your private Opsirix company workspaces." },
    { property: "og:title", content: "Company Workspaces | Opsirix OS" },
    { property: "og:description", content: "Create and manage your private Opsirix company workspaces." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: CompanyWorkspaces,
});

type WorkspaceData = Awaited<ReturnType<typeof getCompanyWorkspaces>>;

function CompanyWorkspaces() {
  const load = useServerFn(getCompanyWorkspaces);
  const createWorkspace = useServerFn(createCompanyWorkspace);
  const renameWorkspace = useServerFn(renameCompanyWorkspace);
  const setStaffGrant = useServerFn(setCompanyStaffGrant);
  const setMember = useServerFn(setCompanyMember);
  const [data, setData] = useState<WorkspaceData>();
  const [message, setMessage] = useState("");
  const refresh = useCallback(async () => setData(await load()), [load]);
  useEffect(() => { void refresh(); }, [refresh]);

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = String(new FormData(form).get("name") ?? "").trim();
    const result = await createWorkspace({ data: { name } });
    setMessage(result.success ? "Company workspace created." : result.error);
    if (result.success) form.reset();
    await refresh();
  }

  async function rename(e: FormEvent<HTMLFormElement>, organizationId: string) {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get("name") ?? "").trim();
    const result = await renameWorkspace({ data: { organizationId, name } });
    setMessage(result.success ? "Company name updated." : result.error);
    await refresh();
  }

  async function updateStaffGrant(e: FormEvent<HTMLFormElement>, organizationId: string) {
    e.preventDefault();
    const form = e.currentTarget;
    const values = new FormData(form, (e.nativeEvent as SubmitEvent).submitter);
    const expires = String(values.get("expires") ?? "");
    const result = await setStaffGrant({ data: {
      organizationId,
      email: String(values.get("email") ?? ""),
      enabled: values.get("action") === "grant",
      expiresAt: expires ? new Date(`${expires}T23:59:59.000Z`).toISOString() : null,
    } });
    setMessage(result.success ? (values.get("action") === "grant" ? "Staff workspace access granted." : "Staff workspace access revoked.") : result.error);
    if (result.success) form.reset();
    await refresh();
  }

  async function updateMember(e: FormEvent<HTMLFormElement>, organizationId: string) {
    e.preventDefault();
    const form = e.currentTarget;
    const values = new FormData(form, (e.nativeEvent as SubmitEvent).submitter);
    const remove = values.get("action") === "remove";
    const role = remove ? "remove" : (String(values.get("role")) === "member" ? "member" : "viewer");
    const result = await setMember({ data: { organizationId, email: String(values.get("email") ?? ""), role } });
    setMessage(result.success ? (remove ? "Person removed from this company." : "Company access saved.") : result.error);
    if (result.success) form.reset();
    await refresh();
  }

  return <OperatingShell mode="company" eyebrow="Founder workspace" title="Company workspaces">
    <p className="ops-lead">Your company identity, membership, and history live here. Internal Opsirix notes and staff discussions never appear in this workspace.</p>
    <form className="ops-panel ops-create-form" onSubmit={create}>
      <div><p className="ops-panel-kicker">New workspace</p><h2>Create a company workspace</h2></div>
      <label>Company name<input name="name" required minLength={2} maxLength={160} placeholder="Your company name" /></label>
      <Button type="submit">Create workspace</Button>
    </form>
    {message && <p className="ops-feedback" role="status">{message}</p>}
    {!data ? <p className="ops-muted">Loading your companies.</p> : !data.organizations.length ? <section className="ops-empty"><Building2 /><h2>No company workspace yet</h2><p>Create one when you are ready. This does not start Launch or collect sensitive founder information.</p></section> :
      <div className="ops-company-list">{data.organizations.map((organization) => {
        const members = data.members.filter((item) => item.organization_id === organization.id);
        const events = data.events.filter((item) => item.organization_id === organization.id);
        const grants = data.grants.filter((item) => item.organization_id === organization.id);
        const own = members.find((item) => item.user_id === data.userId);
        return <section className="ops-panel" key={organization.id}>
          <div className="ops-panel-heading"><div><p className="ops-panel-kicker">{own?.role ?? "staff access"}</p><h2>{organization.name}</h2>{data.opx[organization.id] && <span className="opx-ref" aria-label="Opsirix reference">{data.opx[organization.id]}</span>}</div><span className="ops-count"><Users />{members.length}</span></div>
          {own?.role === "owner" && <form className="ops-inline-form" onSubmit={(event) => rename(event, organization.id)}><label><span className="sr-only">Company name</span><input name="name" defaultValue={organization.name} minLength={2} maxLength={160} /></label><Button variant="outline" type="submit">Rename</Button></form>}
          {own?.role === "owner" && <div className="ops-access-section"><h3>People in this company</h3><p className="ops-muted">Add someone who already has a free Opsirix account. Viewers can see the company summary and history only; members can also take part in company work. They never see Opsirix staff notes.</p><form className="ops-access-form" onSubmit={(event) => updateMember(event, organization.id)}><label>Their account email<input name="email" type="email" required placeholder="name@company.com" /></label><label>Access<select name="role" defaultValue="viewer"><option value="viewer">Viewer</option><option value="member">Member</option></select></label><div className="ops-actions"><Button name="action" value="add" type="submit">Add or update</Button><Button name="action" value="remove" variant="outline" type="submit">Remove</Button></div></form><MemberList members={members} userId={data.userId} /></div>}
          {own?.role === "owner" && <div className="ops-access-section"><h3>Opsirix staff access</h3><p className="ops-muted">Grant an approved staff account access to this workspace summary. This never grants access to Vault or client content.</p><form className="ops-access-form" onSubmit={(event) => updateStaffGrant(event, organization.id)}><label>Staff account email<input name="email" type="email" required placeholder="staff@opsirix.com" /></label><label>Access ends (optional)<input name="expires" type="date" /></label><div className="ops-actions"><Button name="action" value="grant" type="submit">Grant access</Button><Button name="action" value="revoke" variant="outline" type="submit">Revoke access</Button></div></form>{grants.length > 0 && <div className="ops-history">{grants.map((grant) => <div className="ops-history-row" key={grant.staff_user_id}><Users /><span>{grant.person?.full_name || grant.person?.email || "Approved staff account"} · {grant.revoked_at ? "Revoked" : grant.expires_at && new Date(grant.expires_at) <= new Date() ? "Expired" : "Active"}</span><time>{grant.expires_at ? `Ends ${new Date(grant.expires_at).toLocaleDateString()}` : "No end date"}</time></div>)}</div>}</div>}
          <CompanyHistory events={events} />
        </section>;
      })}</div>}
    <p className="ops-muted">Need a professional? <Link to="/nexus/help">Ask for help</Link>, then follow it on <Link to="/nexus/requests">your Nexus requests</Link>.</p>
  </OperatingShell>;
}

type Member = { user_id: string; role: string; created_at: string; person: { full_name: string; email: string } | null };
const ROLE_LABEL: Record<string, string> = { owner: "Owner", member: "Member", viewer: "Viewer" };

function MemberList({ members, userId }: { members: Member[]; userId: string }) {
  const who = (m: Member) => m.user_id === userId ? "You" : m.person?.full_name || m.person?.email || "Company account";
  const c = useListControls(members, {
    text: (m) => `${who(m)} ${m.person?.email ?? ""} ${m.role}`,
    sorts: [
      { key: "role", label: "Access level", compare: (a, b) => ["owner", "member", "viewer"].indexOf(a.role) - ["owner", "member", "viewer"].indexOf(b.role) || who(a).localeCompare(who(b)) },
      { key: "name", label: "Name A to Z", compare: (a, b) => who(a).localeCompare(who(b)) },
      { key: "new", label: "Recently added", compare: (a, b) => b.created_at.localeCompare(a.created_at) },
    ],
    filters: [{ key: "role", label: "Access", options: Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label })), match: (m, v) => m.role === v }],
    pageSize: 10,
  });
  return <div className="ops-history" aria-label="Company members">
    {members.length > 3 && <ListToolbar c={c} label="Search company members" placeholder="Name, email or access" />}
    <ListSummary c={c} noun={["person", "people"]} />
    <ListEmpty c={c}><p className="ops-muted">No one else has been added yet.</p></ListEmpty>
    {c.visible.map((m, n) => <div className="ops-history-row" key={m.user_id}><Users /><span><span className="list-rownum">#{c.start + n + 1}</span>{who(m)}{m.person?.email && m.user_id !== userId ? ` (${m.person.email})` : ""} · {ROLE_LABEL[m.role] ?? m.role}</span><time>Added {new Date(m.created_at).toLocaleDateString()}</time></div>)}
    <ListPager c={c} />
  </div>;
}

type CompanyEvent = { id: string; summary: string; created_at: string; event_type: string; actor: string; details?: { label: string; value: string }[] };
const kindLabel = (t: string) => t.replace(/^workspace\./, "").replaceAll(/[._]/g, " ");

function CompanyHistory({ events }: { events: CompanyEvent[] }) {
  const c = useListControls(events, {
    text: (e) => `${e.summary} ${kindLabel(e.event_type)} ${e.actor} ${(e.details ?? []).map((d) => d.value).join(" ")}`,
    date: (e) => e.created_at,
    sorts: [
      { key: "new", label: "Newest first", compare: (a, b) => b.created_at.localeCompare(a.created_at) },
      { key: "old", label: "Oldest first", compare: (a, b) => a.created_at.localeCompare(b.created_at) },
    ],
    filters: [{ key: "kind", label: "Kind of change", options: [...new Set(events.map((e) => e.event_type))].map((t) => ({ value: t, label: kindLabel(t) })), match: (e, v) => e.event_type === v }],
    pageSize: 8,
  });
  return <div className="ops-history">
    <h3>History</h3>
    {events.length > 0 && <ListToolbar c={c} label="Search this company history" placeholder="For example: member, renamed" />}
    <ListSummary c={c} noun={["entry", "entries"]} />
    <ListEmpty c={c}><p className="ops-muted">No activity yet.</p></ListEmpty>
    {c.visible.map((event, n) => <div className="ops-history-row" key={event.id} data-testid="history-row"><Clock3 /><span><span className="list-rownum">#{c.start + n + 1}</span>{event.summary}<small className="ops-muted" style={{ display: "block" }}>{kindLabel(event.event_type)} · by {event.actor}</small>{event.details && event.details.length > 0 && <dl className="ops-history-details">{event.details.map((d) => <div key={d.label}><dt>{d.label}</dt><dd>{d.value}</dd></div>)}</dl>}</span><time>{new Date(event.created_at).toLocaleString()}</time></div>)}
    <ListPager c={c} />
  </div>;
}
