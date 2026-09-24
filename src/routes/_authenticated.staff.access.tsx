import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CircleX } from "lucide-react";
import { OperatingShell } from "@/components/workspace/OperatingShell";
import { Button } from "@/components/ui/button";
import { getStaffConsole, setStaffAccess } from "@/lib/workspace.functions";

export const Route = createFileRoute("/_authenticated/staff/access")({
  head: () => ({ meta: [
    { title: "Staff Access | Opsirix" },
    { name: "description", content: "Manage approved Opsirix staff roles and review access history." },
    { property: "og:title", content: "Staff Access | Opsirix" },
    { property: "og:description", content: "Manage approved Opsirix staff roles and review access history." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: StaffAccess,
});

function StaffAccess() {
  const getConsole = useServerFn(getStaffConsole);
  const setAccess = useServerFn(setStaffAccess);
  const [data, setData] = useState<Awaited<ReturnType<typeof getStaffConsole>>>();
  const [message, setMessage] = useState("");
  const refresh = useCallback(async () => setData(await getConsole()), [getConsole]);
  useEffect(() => { void refresh(); }, [refresh]);

  async function update(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const values = new FormData(form);
    const result = await setAccess({ data: { email: String(values.get("email") ?? ""), role: String(values.get("role")) as "operations_lead" | "compliance_coordinator", enabled: values.get("action") === "grant" } });
    setMessage(result.success ? "Staff access updated." : result.error);
    if (result.success) form.reset();
    await refresh();
  }

  return <OperatingShell mode="staff" eyebrow="Admin / CEO" title="Staff access">
    {!data ? <p className="ops-muted">Checking access.</p> : !data.isAdmin ? <section className="ops-empty"><CircleX /><h2>Access restricted</h2><p>Only Admin/CEO can assign staff roles.</p></section> : <>
      <p className="ops-lead">Operations Lead and Compliance Coordinator are the only assignable Phase 1 roles. Staff cannot assign or elevate themselves.</p>
      <form className="ops-panel ops-access-form" onSubmit={update}>
        <label>Account email<input name="email" type="email" required maxLength={255} placeholder="person@company.com" /></label>
        <label>Role<select name="role" defaultValue="operations_lead"><option value="operations_lead">Operations Lead</option><option value="compliance_coordinator">Compliance Coordinator</option></select></label>
        <div className="ops-actions"><Button name="action" value="grant" type="submit">Grant access</Button><Button name="action" value="revoke" variant="outline" type="submit">Revoke access</Button></div>
        {message && <p className="ops-feedback" role="status">{message}</p>}
      </form>
      <section className="ops-panel"><h2>Current staff</h2><div className="ops-table-wrap"><table><thead><tr><th>Person</th><th>Role</th><th>Granted</th></tr></thead><tbody>{data.team.map((item) => <tr key={`${item.user_id}-${item.role}`}><td>{item.person?.full_name || item.person?.email || "Account"}</td><td>{item.role === "admin" ? "Admin / CEO" : item.role === "operations_lead" ? "Operations Lead" : "Compliance Coordinator"}</td><td>{new Date(item.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div></section>
      <section className="ops-panel"><h2>Access history</h2><div className="ops-history">{data.history.map((event) => <div className="ops-history-row" key={event.id}><span>{event.summary}</span><span>{String(event.metadata.role ?? "")}</span><time>{new Date(event.created_at).toLocaleString()}</time></div>)}</div></section>
    </>}
  </OperatingShell>;
}