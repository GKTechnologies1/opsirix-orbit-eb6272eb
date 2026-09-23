import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, CircleX, Eye, RefreshCw } from "lucide-react";
import { WorkspaceShell } from "@/components/nexus/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { reviewPartnerApplication } from "@/lib/partner-review.functions";

type Application = Database["public"]["Tables"]["partner_applications"]["Row"];
export const Route = createFileRoute("/_authenticated/admin/applications")({
  head: () => ({ meta: [{ title: "Application Review | Opsirix Nexus" }, { name: "description", content: "Authorized Opsirix partner application review workspace." }, { property: "og:title", content: "Application Review | Opsirix Nexus" }, { property: "og:description", content: "Authorized Opsirix partner application review workspace." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: AdminApplications,
});

function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [selected, setSelected] = useState<Application | null>(null);
  const [message, setMessage] = useState("");
  async function load() {
    const { data: auth } = await supabase.auth.getUser(); if (!auth.user) return;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: auth.user.id, _role: "admin" }); setAuthorized(Boolean(isAdmin));
    if (isAdmin) { const { data } = await supabase.from("partner_applications").select("*").order("created_at", { ascending: false }); setApplications(data ?? []); }
  }
  useEffect(() => { void load(); }, []);
  async function review(status: "under_review" | "changes_requested" | "approved" | "declined") {
    if (!selected) return; setMessage(""); const note = (document.getElementById("review-note") as HTMLTextAreaElement | null)?.value;
    try { await reviewPartnerApplication({ data: { applicationId: selected.id, status, note } }); setMessage("Review saved."); await load(); setSelected(null); } catch (error) { setMessage(error instanceof Error ? error.message : "Review could not be saved."); }
  }
  return <WorkspaceShell eyebrow="Authorized review" title="Partner applications" admin>{authorized === null ? <p className="nexus-muted">Checking access.</p> : !authorized ? <div className="nexus-empty"><CircleX /><h2>Access restricted</h2><p>This workspace is available only to authorized Opsirix reviewers.</p></div> : <div className="nexus-admin-layout"><section className="nexus-work-card"><div className="nexus-card-heading"><div><h2>Review queue</h2><p>{applications.length} applications visible to you</p></div><Button variant="ghost" size="icon" onClick={load} aria-label="Refresh applications"><RefreshCw /></Button></div><div className="nexus-table-wrap"><table><thead><tr><th>Organization</th><th>Type</th><th>Status</th><th>Submitted</th><th><span className="sr-only">Action</span></th></tr></thead><tbody>{applications.map((item) => <tr key={item.id}><td>{item.organization_name || "Incomplete"}</td><td>{item.professional_type || "Not selected"}</td><td><span className={`nexus-status ${item.status}`}>{item.status.replaceAll("_", " ")}</span></td><td>{item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : "Draft"}</td><td><Button variant="ghost" size="icon" onClick={() => setSelected(item)} aria-label={`Review ${item.organization_name}`}><Eye /></Button></td></tr>)}</tbody></table></div></section>{selected && <aside className="nexus-work-card nexus-review-panel"><h2>{selected.organization_name}</h2><p className="nexus-muted">{selected.professional_type} · {[selected.city, selected.state_region].filter(Boolean).join(", ") || "Location not supplied"}</p><h3>Professional summary</h3><p>{selected.professional_summary || "No summary supplied."}</p><label>Reviewer note<textarea id="review-note" maxLength={2000} /></label><div className="nexus-review-actions"><Button variant="outline" onClick={() => review("under_review")}>Mark in review</Button><Button variant="outline" onClick={() => review("changes_requested")}>Request changes</Button><Button onClick={() => review("approved")}><CheckCircle2 />Approve</Button><Button variant="destructive" onClick={() => review("declined")}><CircleX />Decline</Button></div></aside>}</div>}{message && <p className="nexus-form-message" role="status">{message}</p>}</WorkspaceShell>;
}