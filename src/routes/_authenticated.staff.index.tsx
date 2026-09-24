import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowRight, CircleX, ShieldCheck } from "lucide-react";
import { OperatingShell } from "@/components/workspace/OperatingShell";
import { getStaffConsole } from "@/lib/workspace.functions";

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
      <section className="ops-panel"><ShieldCheck /><p className="ops-panel-kicker">Foundation only</p><h2>Staff workflows are not active yet</h2><p>This release establishes separate access and audit history. It does not add the CRM pipeline, Launch intake, Grid reviews, Vault, AI, or pricing records.</p>{data.isAdmin && <Link to="/staff/access">Manage staff access <ArrowRight /></Link>}</section>
    </>}
  </OperatingShell>;
}