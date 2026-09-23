import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/nexus/WorkspaceShell";
import { ServiceSelector } from "@/components/nexus/ServiceSelector";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/partner/services")({
  head: () => ({ meta: [
    { title: "Your Services | Opsirix Nexus" },
    { name: "description", content: "Choose the services your firm provides from the Opsirix Nexus catalog." },
    { property: "og:title", content: "Your Services | Opsirix Nexus" },
    { property: "og:description", content: "Choose the services your firm provides from the Opsirix Nexus catalog." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: PartnerServicesPage,
});

function PartnerServicesPage() {
  const [ctx, setCtx] = useState<{ userId: string; applicationId: string | null; locked: boolean } | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: app } = await supabase.from("partner_applications").select("id,status").eq("user_id", data.user.id).maybeSingle();
      setCtx({ userId: data.user.id, applicationId: app?.id ?? null, locked: !!app && !["draft", "changes_requested", "submitted"].includes(app.status) && app.status !== "approved" });
    });
  }, []);
  return (
    <WorkspaceShell eyebrow="Nexus registration" title="Services you provide">
      <div className="nexus-progress" aria-label="Application progress"><span className="active">1 Account</span><span className="active">2 Professional details</span><span className="active">3 Services</span><span>4 Review</span></div>
      <p className="nexus-muted svc-intro">Tell us what you do best. Pick the specific services your firm offers today, and add details where they help clients understand your work. <Link to="/partner/apply">Back to application</Link></p>
      {ctx ? <ServiceSelector userId={ctx.userId} applicationId={ctx.applicationId} readOnly={ctx.locked} /> : <p className="nexus-muted">Loading.</p>}
    </WorkspaceShell>
  );
}
