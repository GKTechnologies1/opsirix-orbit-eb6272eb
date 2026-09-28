import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Building2, FileText, History, Inbox, LayoutDashboard, ListChecks, LogOut, Menu, Repeat, ShieldCheck, X } from "lucide-react";
import { OpsirixLogo } from "@/components/layout/OpsirixLogo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type ShellMode = "company" | "staff";

export function OperatingShell({ mode, title, eyebrow, children }: { mode: ShellMode; title: string; eyebrow: string; children: ReactNode }) {
  const navigate = useNavigate();
  const [staff, setStaff] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: allowed } = await supabase.rpc("has_staff_role", { _user_id: data.user.id });
      if (active) setStaff(Boolean(allowed));
      const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
      if (active) setAdmin(Boolean(isAdmin));
    });
    return () => { active = false; };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }

  return <div className={`ops-workspace ops-workspace--${mode}`}>
    <a href="#workspace-content" className="nexus-skip">Skip to content</a>
    <aside className="ops-sidebar">
      <Link to="/" aria-label="Opsirix home"><OpsirixLogo /></Link>
      <div className="ops-product-mark">{mode === "staff" ? "Staff Console" : "Opsirix OS"}</div>
      <Button className="workspace-menu-toggle" variant="ghost" size="icon" aria-label={menuOpen ? "Close workspace menu" : "Open workspace menu"} aria-expanded={menuOpen} aria-controls="ops-workspace-nav" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X /> : <Menu />}</Button>
      <nav id="ops-workspace-nav" className={menuOpen ? "is-open" : ""} aria-label={mode === "staff" ? "Staff Console" : "Company workspace"} onClick={() => setMenuOpen(false)}>
        {mode === "company" && <Link to="/os" activeProps={{ "aria-current": "page" }}><LayoutDashboard />Overview</Link>}
        <Link to="/workspace" activeOptions={{ exact: true }} activeProps={{ "aria-current": "page" }}><Building2 />Companies &amp; history</Link>
        <Link to="/flow" activeProps={{ "aria-current": "page" }}><ListChecks />Flow</Link>
        <Link to="/core" activeProps={{ "aria-current": "page" }}><Inbox />Core</Link>
        <Link to="/grid" activeProps={{ "aria-current": "page" }}><FileText />Grid</Link>
        {mode === "company" && <Link to="/nexus/requests" activeProps={{ "aria-current": "page" }}><Inbox />Nexus requests</Link>}
        {staff && <Link to="/staff" activeOptions={{ exact: true }} activeProps={{ "aria-current": "page" }}><ShieldCheck />Staff Console</Link>}
        {staff && mode === "staff" && <Link to="/staff/inquiries"><Inbox />Nexus inquiries</Link>}
        {staff && mode === "staff" && <Link to="/staff/access"><ShieldCheck />Access</Link>}
        {admin && mode === "staff" && <Link to="/staff/content"><FileText />Content & Catalog</Link>}
        {admin && mode === "staff" && <Link to="/staff/features"><History />Features & Releases</Link>}
        <Link to="/account"><Repeat />Switch workspace</Link>
      </nav>
      <Button variant="ghost" onClick={signOut}><LogOut />Sign out</Button>
    </aside>
    <main id="workspace-content" className="ops-workspace-main">
      <header><p className="ops-kicker">{eyebrow}</p><h1>{title}</h1></header>
      {children}
    </main>
  </div>;
}