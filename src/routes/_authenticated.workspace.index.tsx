import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Building2, Clock3, Users } from "lucide-react";
import { OperatingShell } from "@/components/workspace/OperatingShell";
import { Button } from "@/components/ui/button";
import { createCompanyWorkspace, getCompanyWorkspaces, renameCompanyWorkspace, setCompanyStaffGrant } from "@/lib/workspace.functions";

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
    const values = new FormData(form);
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
          <div className="ops-panel-heading"><div><p className="ops-panel-kicker">{own?.role ?? "staff access"}</p><h2>{organization.name}</h2></div><span className="ops-count"><Users />{members.length}</span></div>
          {own?.role === "owner" && <form className="ops-inline-form" onSubmit={(event) => rename(event, organization.id)}><label><span className="sr-only">Company name</span><input name="name" defaultValue={organization.name} minLength={2} maxLength={160} /></label><Button variant="outline" type="submit">Rename</Button></form>}
          {own?.role === "owner" && <div className="ops-access-section"><h3>Opsirix staff access</h3><p className="ops-muted">Grant an approved staff account access to this workspace summary. This never grants access to Vault or client content.</p><form className="ops-access-form" onSubmit={(event) => updateStaffGrant(event, organization.id)}><label>Staff account email<input name="email" type="email" required placeholder="staff@opsirix.com" /></label><label>Access ends (optional)<input name="expires" type="date" /></label><div className="ops-actions"><Button name="action" value="grant" type="submit">Grant access</Button><Button name="action" value="revoke" variant="outline" type="submit">Revoke access</Button></div></form>{grants.length > 0 && <div className="ops-history">{grants.map((grant) => <div className="ops-history-row" key={grant.staff_user_id}><Users /><span>{grant.person?.full_name || grant.person?.email || "Approved staff account"} · {grant.revoked_at ? "Revoked" : grant.expires_at && new Date(grant.expires_at) <= new Date() ? "Expired" : "Active"}</span><time>{grant.expires_at ? `Ends ${new Date(grant.expires_at).toLocaleDateString()}` : "No end date"}</time></div>)}</div>}</div>}
          <div className="ops-history"><h3>Recent history</h3>{events.length ? events.slice(0, 8).map((event) => <div className="ops-history-row" key={event.id}><Clock3 /><span>{event.summary}</span><time>{new Date(event.created_at).toLocaleString()}</time></div>) : <p className="ops-muted">No activity yet.</p>}</div>
        </section>;
      })}</div>}
  </OperatingShell>;
}