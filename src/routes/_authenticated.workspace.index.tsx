import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Building2, Clock3, Users } from "lucide-react";
import { OperatingShell } from "@/components/workspace/OperatingShell";
import { Button } from "@/components/ui/button";
import { createCompanyWorkspace, getCompanyWorkspaces, renameCompanyWorkspace } from "@/lib/workspace.functions";

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
        const own = members.find((item) => item.user_id === data.userId);
        return <section className="ops-panel" key={organization.id}>
          <div className="ops-panel-heading"><div><p className="ops-panel-kicker">{own?.role ?? "staff access"}</p><h2>{organization.name}</h2></div><span className="ops-count"><Users />{members.length}</span></div>
          {own?.role === "owner" && <form className="ops-inline-form" onSubmit={(event) => rename(event, organization.id)}><label><span className="sr-only">Company name</span><input name="name" defaultValue={organization.name} minLength={2} maxLength={160} /></label><Button variant="outline" type="submit">Rename</Button></form>}
          <div className="ops-history"><h3>Recent history</h3>{events.length ? events.slice(0, 8).map((event) => <div className="ops-history-row" key={event.id}><Clock3 /><span>{event.summary}</span><time>{new Date(event.created_at).toLocaleString()}</time></div>) : <p className="ops-muted">No activity yet.</p>}</div>
        </section>;
      })}</div>}
  </OperatingShell>;
}