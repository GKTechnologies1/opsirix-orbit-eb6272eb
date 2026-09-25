import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CircleX, Inbox } from "lucide-react";
import { OperatingShell } from "@/components/workspace/OperatingShell";
import { Button } from "@/components/ui/button";
import { assignNexusInquiry, listNexusInquiries, openNexusInquiry, setNexusInquiryStatus } from "@/lib/nexus.functions";
import { NEXUS_CATEGORY_COPY } from "@/lib/nexus-discovery";

export const Route = createFileRoute("/_authenticated/staff/inquiries")({
  head: () => ({ meta: [
    { title: "Nexus Inquiries | Opsirix Staff Console" },
    { name: "description", content: "Assigned Nexus inquiry triage for authorized Opsirix staff." },
    { property: "og:title", content: "Nexus Inquiries | Opsirix Staff Console" },
    { property: "og:description", content: "Assigned Nexus inquiry triage for authorized Opsirix staff." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: StaffInquiries,
});

type ListData = Awaited<ReturnType<typeof listNexusInquiries>>;
type Detail = Extract<Awaited<ReturnType<typeof openNexusInquiry>>, { success: true }>["inquiry"];
const STATUS: Record<string, string> = { received: "Received", under_review: "Under review", consent_requested: "Consent requested", introduced: "Introduced", closed: "Closed" };

function StaffInquiries() {
  const list = useServerFn(listNexusInquiries);
  const open = useServerFn(openNexusInquiry);
  const assign = useServerFn(assignNexusInquiry);
  const setStatus = useServerFn(setNexusInquiryStatus);
  const [data, setData] = useState<ListData>();
  const [loadError, setLoadError] = useState(false);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [message, setMessage] = useState("");
  const refresh = useCallback(async () => {
    try { setData(await list()); setLoadError(false); } catch { setLoadError(true); }
  }, [list]);
  useEffect(() => { void refresh(); }, [refresh]);

  async function view(id: string) {
    setMessage("");
    const r = await open({ data: { id } });
    if (r.success) setDetail(r.inquiry); else { setDetail(null); setMessage(r.error); }
  }
  async function changeAssignment(e: FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    const form = e.currentTarget;
    const v = new FormData(form, (e.nativeEvent as SubmitEvent).submitter);
    const r = await assign({ data: { id, email: String(v.get("email") ?? ""), purpose: String(v.get("purpose")) as "triage" | "review_task", enabled: v.get("action") !== "remove" } });
    setMessage(r.success ? "Assignment updated." : r.error);
    if (r.success) form.reset();
    await refresh();
  }
  async function status(id: string, s: "under_review" | "closed") {
    const r = await setStatus({ data: { id, status: s } });
    setMessage(r.success ? "Status updated." : r.error);
    await refresh();
    if (r.success) await view(id);
  }

  return <OperatingShell mode="staff" eyebrow="Nexus" title="Nexus inquiries">
    {loadError ? <section className="ops-empty"><CircleX /><h2>Inquiries could not be loaded</h2><Button variant="outline" className="ops-outline" onClick={() => refresh()}>Try again</Button></section> :
     !data ? <p className="ops-muted">Checking access.</p> : !data.allowed ? <section className="ops-empty"><CircleX /><h2>Access restricted</h2><p>Nexus inquiries are available only to assigned Opsirix staff.</p></section> : <>
      <p className="ops-lead">Operations Lead is the default triage role, with Admin/CEO oversight. You see an inquiry only when it is assigned to you{data.isAdmin ? ", or as Admin/CEO" : ""}. Introduction disclosure to partners is turned off.</p>
      {message && <p className="ops-feedback" role="status">{message}</p>}
      <section className="ops-panel"><h2>{data.isAdmin ? "All inquiries" : "Assigned to you"}</h2>
        {data.inquiries.length === 0 ? <div className="ops-empty"><Inbox /><p>No inquiries {data.isAdmin ? "yet" : "are assigned to you"}.</p></div> :
        <div className="ops-table-wrap"><table><thead><tr><th>Received</th><th>Category</th><th>Status</th><th>Assigned</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
          {data.inquiries.map((q) => {
            const a = data.assignments.filter((x) => x.inquiry_id === q.id);
            return <tr key={q.id}><td>{new Date(q.created_at).toLocaleString()}{q.is_test ? " · TEST" : ""}</td><td>{NEXUS_CATEGORY_COPY[q.category_id]?.title ?? q.category_id}</td><td>{STATUS[q.status]}</td><td>{a.length ? a.map((x) => `${x.person?.email ?? "Staff"} (${x.purpose === "triage" ? "triage" : "review task"})`).join(", ") : "Unassigned: Operations Lead queue"}</td><td><Button variant="outline" className="ops-outline" size="sm" onClick={() => view(q.id)}>Open</Button></td></tr>;
          })}
        </tbody></table></div>}
      </section>
      {detail && <section className="ops-panel" aria-labelledby="inq-detail">
        <p className="ops-panel-kicker">{detail.is_test ? "TEST record" : "Inquiry"} · {STATUS[detail.status]}</p>
        <h2 id="inq-detail">{detail.full_name}</h2>
        <p className="ops-muted">{detail.email}{detail.phone ? ` · ${detail.phone}` : ""}{detail.location ? ` · ${detail.location}` : ""}</p>
        <p>{detail.description}</p>
        <p className="ops-muted">Consent text version {detail.disclosure_version}. Partner disclosure is disabled until the recipient-specific consent flow is approved.</p>
        <div className="ops-actions"><Button variant="outline" className="ops-outline" onClick={() => status(detail.id, "under_review")}>Mark under review</Button><Button variant="outline" className="ops-outline" onClick={() => status(detail.id, "closed")}>Close inquiry</Button><Button disabled title="Disabled until consent flow is approved">Request introduction consent</Button></div>
        <form className="ops-access-form" onSubmit={(e) => changeAssignment(e, detail.id)}>
          <label>Staff email<input name="email" type="email" required maxLength={255} /></label>
          <label>Assignment<select name="purpose" defaultValue={data.isAdmin ? "triage" : "review_task"}>{data.isAdmin && <option value="triage">Triage (Operations Lead)</option>}<option value="review_task">Review task (Compliance Coordinator)</option></select></label>
          <div className="ops-actions"><Button name="action" value="add" type="submit">Assign</Button><Button name="action" value="remove" variant="outline" className="ops-outline" type="submit">Remove assignment</Button></div>
        </form>
      </section>}
    </>}
  </OperatingShell>;
}
