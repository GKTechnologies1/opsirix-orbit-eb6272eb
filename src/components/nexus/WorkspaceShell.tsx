import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { FileText, LayoutDashboard, ListChecks, LogOut, Search, ShieldCheck } from "lucide-react";
import { OpsirixLogo } from "@/components/layout/OpsirixLogo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function WorkspaceShell({ title, eyebrow, children, admin = false }: { title: string; eyebrow: string; children: ReactNode; admin?: boolean }) {
  const navigate = useNavigate();
  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/auth" });
  }
  return (
    <div className="nexus-workspace">
      <a href="#workspace-content" className="nexus-skip">Skip to content</a>
      <aside className="nexus-sidebar">
        <Link to="/" aria-label="Opsirix home"><OpsirixLogo /></Link>
        <nav aria-label="Workspace">
          <Link to="/partner"><LayoutDashboard />Overview</Link>
          <Link to="/partner/apply"><FileText />Application</Link>
          <Link to="/partner/services"><ListChecks />Services</Link>
          <Link to="/directory"><Search />Directory</Link>
          {admin && <Link to="/admin/applications"><ShieldCheck />Review queue</Link>}
        </nav>
        <Button variant="ghost" onClick={signOut}><LogOut />Sign out</Button>
      </aside>
      <main id="workspace-content" className="nexus-workspace-main">
        <header><p className="nexus-kicker">{eyebrow}</p><h1>{title}</h1></header>
        {children}
      </main>
    </div>
  );
}