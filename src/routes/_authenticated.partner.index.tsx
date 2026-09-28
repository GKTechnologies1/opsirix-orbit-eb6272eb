import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMyOpxReferences } from "@/lib/workspace.functions";
import { ArrowRight, Clock3, FileCheck2 } from "lucide-react";
import { WorkspaceShell } from "@/components/nexus/WorkspaceShell";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Application = Database["public"]["Tables"]["partner_applications"]["Row"];
export const Route = createFileRoute("/_authenticated/partner/")({
  head: () => ({ meta: [{ title: "Partner Dashboard | Opsirix Nexus" }, { name: "description", content: "View your Opsirix Nexus application and profile status." }, { property: "og:title", content: "Partner Dashboard | Opsirix Nexus" }, { property: "og:description", content: "View your Opsirix Nexus application and profile status." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: PartnerDashboard,
});
function PartnerDashboard() {
  const loadOpx = useServerFn(getMyOpxReferences);
  const [opx, setOpx] = useState<Awaited<ReturnType<typeof getMyOpxReferences>>>();
  useEffect(() => { loadOpx().then(setOpx).catch(() => undefined); }, [loadOpx]);
  const [application, setApplication] = useState<Application | null | undefined>(undefined);
  useEffect(() => { supabase.auth.getUser().then(async ({ data }) => { if (!data.user) return; const result = await supabase.from("partner_applications").select("*").eq("user_id", data.user.id).maybeSingle(); setApplication(result.data); }); }, []);
  const labels: Record<string, string> = { draft: "Draft", submitted: "Submitted", under_review: "Under review", changes_requested: "Changes requested", approved: "Approved", declined: "Not approved" };
  return <WorkspaceShell eyebrow="Partner workspace" title="Your Nexus profile">
    {application === undefined ? <p className="nexus-muted">Loading your application.</p> : !application ? <div className="nexus-empty"><FileCheck2 /><h2>Start your partner application</h2><p>Tell us about your work and credentials. You can save a draft before submitting.</p><Link to="/partner/apply">Start application <ArrowRight /></Link></div> : <>
      <div className="nexus-status-grid"><article className="nexus-work-card"><span className={`nexus-status ${application.status}`}>{labels[application.status]}</span><h2>{application.organization_name || "Partner application"}</h2>{opx?.application ? <p><span className="opx-ref" aria-label="Opsirix reference">{opx.application}</span></p> : application.status === "draft" ? <p className="nexus-muted">Your Opsirix reference number is assigned when you submit.</p> : null}<p>{application.status === "submitted" || application.status === "under_review" ? "Thanks for taking the time to apply. A person on our team will review your details." : application.status === "changes_requested" ? "A reviewer has requested updates. Open your application to make changes." : application.status === "approved" ? "Your application has been approved. Publication remains under your control and Opsirix review." : application.status === "declined" ? "This application was not approved. Open it to review the recorded decision." : "Complete your details when you are ready."}</p><Link to="/partner/apply">View application <ArrowRight /></Link></article><article className="nexus-work-card"><Clock3 /><h2>{application.status === "approved" ? "Your approved profile" : application.status === "changes_requested" ? "Updates needed" : application.status === "declined" ? "Review decision" : application.status === "draft" ? "Complete your application" : "Review in progress"}</h2><p>{application.status === "approved" ? "Your approved details are available in your profile. Any new edits remain private until they are reviewed." : application.status === "changes_requested" ? "Open your application to review the requested changes and submit an updated version." : application.status === "declined" ? "The recorded decision and any message from the reviewer are available in your application." : application.status === "draft" ? "Finish the required details and submit when you are ready for a human review." : "A person on our team is reviewing your submitted details and supporting credentials."}</p></article></div>
    </>}
  </WorkspaceShell>;
}