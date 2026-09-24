import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Building2, FileText, KeyRound, LayoutDashboard, ListChecks, LogOut, Search, ShieldCheck, UserRound } from "lucide-react";
import { OpsirixLogo } from "@/components/layout/OpsirixLogo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { TRACK_TYPE_IDS } from "@/lib/nexus-tracks";

export function WorkspaceShell({ title, eyebrow, children, admin = false }: { title: string; eyebrow: string; children: ReactNode; admin?: boolean }) {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(admin);
  const [canOnboard, setCanOnboard] = useState(false);
  useEffect(() => {
    let alive = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const [role, types] = await Promise.all([
        supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" }),
        supabase.from("service_partner_types").select("id").in("id", TRACK_TYPE_IDS),
      ]);
      if (!alive) return;
      setIsAdmin(Boolean(role.data));
      setCanOnboard(Boolean(types.data?.length));
    });
    return () => { alive = false; };
  }, []);
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
          <Link to="/partner/profile"><UserRound />Profile</Link>
          {canOnboard && <Link to="/partner/onboarding"><Building2 />Institutions and brokerages</Link>}
          <Link to="/directory"><Search />Directory</Link>
          {isAdmin && <Link to="/admin/applications"><ShieldCheck />Review queue</Link>}
          {isAdmin && <Link to="/admin/preview"><KeyRound />Preview access</Link>}
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
