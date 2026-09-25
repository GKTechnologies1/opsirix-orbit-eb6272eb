import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CircleX, Inbox } from "lucide-react";
import { OperatingShell } from "@/components/workspace/OperatingShell";
import { Button } from "@/components/ui/button";
import { assignNexusInquiry, listNexusInquiries, openNexusInquiry, setNexusInquiryStatus } from "@/lib/nexus.functions";
import { NEXUS_CATEGORY_COPY } from "@/lib/nexus-discovery";
import { cancelIntroduction, previewSend, proposeIntroduction, sendIntroduction, staffIntroductions } from "@/lib/nexus-intro.functions";

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
      <p className="ops-lead">Operations Lead is the default triage role, with Admin/CEO oversight. You see an inquiry only when it is assigned to you{data.isAdmin ? ", or as Admin/CEO" : ""}. Partners receive details only after the founder authorizes a named introduction and staff review and send it.</p>
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
        <p className="ops-muted">Help-form wording version {detail.disclosure_version}.</p>
        <div className="ops-actions"><Button variant="outline" className="ops-outline" onClick={() => status(detail.id, "under_review")}>Mark under review</Button><Button variant="outline" className="ops-outline" onClick={() => status(detail.id, "closed")}>Close inquiry</Button></div>
        <IntroductionsPanel key={detail.id} inquiryId={detail.id} />
        <form className="ops-access-form" onSubmit={(e) => changeAssignment(e, detail.id)}>
          <label>Staff email<input name="email" type="email" required maxLength={255} /></label>
          <label>Assignment<select name="purpose" defaultValue={data.isAdmin ? "triage" : "review_task"}>{data.isAdmin && <option value="triage">Triage (Operations Lead)</option>}<option value="review_task">Review task (Compliance Coordinator)</option></select></label>
          <div className="ops-actions"><Button name="action" value="add" type="submit">Assign</Button><Button name="action" value="remove" variant="outline" className="ops-outline" type="submit">Remove assignment</Button></div>
        </form>
      </section>}
    </>}
  </OperatingShell>;
}


const INTRO_STATUS: Record<string, string> = { proposed: "Waiting for founder", authorized: "Authorized by founder, not sent", declined: "Declined by founder", withdrawn: "Withdrawn by founder", cancelled: "Cancelled", sent: "Sent", reconsent_required: "New founder authorization required" };
const FIELD: Record<string, string> = { name: "Name", email: "Email", phone: "Phone", location: "Location", description: "Request description" };
type Preview = Extract<Awaited<ReturnType<typeof previewSend>>, { success: true }>["preview"];

function IntroductionsPanel({ inquiryId }: { inquiryId: string }) {
  const load = useServerFn(staffIntroductions);
  const propose = useServerFn(proposeIntroduction);
  const cancel = useServerFn(cancelIntroduction);
  const preview = useServerFn(previewSend);
  const send = useServerFn(sendIntroduction);
  const [data, setData] = useState<Awaited<ReturnType<typeof staffIntroductions>>>();
  const [partner, setPartner] = useState("");
  const [msg, setMsg] = useState("");
  const [review, setReview] = useState<{ id: string; p: Preview } | null>(null);
  const [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => { setData(await load({ data: { id: inquiryId } })); }, [load, inquiryId]);
  useEffect(() => { void refresh(); }, [refresh]);

  async function run(fn: () => Promise<{ success: boolean; error?: string; message?: string }>, ok: string) {
    setBusy(true);
    const r = await fn();
    setBusy(false);
    setMsg(r.success ? (r.message ?? ok) : (r.error ?? "Failed."));
    setReview(null);
    await refresh();
  }
  async function openReview(id: string) {
    const r = await preview({ data: { id } });
    if (r.success) setReview({ id, p: r.preview }); else setMsg(r.error);
  }

  if (!data) return <p className="ops-muted">Loading introductions.</p>;
  return <div className="ops-intro">
    <h3>Introductions</h3>
    {msg && <p className="ops-feedback" role="status">{msg}</p>}
    {data.candidates.length > 0 ? <form className="ops-access-form" onSubmit={(e) => { e.preventDefault(); if (partner) void run(() => propose({ data: { inquiryId, profileId: partner } }), "Introduction proposed. The founder must authorize it before anything can be sent."); }}>
      <label>Propose a named partner<select value={partner} onChange={(e) => setPartner(e.target.value)} required><option value="">Choose an eligible partner</option>{data.candidates.map((c) => <option key={c.profile_id} value={c.profile_id}>{c.organization_name}</option>)}</select></label>
      <div className="ops-actions"><Button type="submit" disabled={busy || !partner}>Propose introduction</Button></div>
    </form> : <p className="ops-muted">No eligible partner is available for this request, or you are not the assigned triage owner.</p>}
    {data.intros.map((i) => <article key={i.id} className="ops-intro-card">
      <p><strong>{i.partner_name}</strong> · {INTRO_STATUS[i.status] ?? i.status}{i.partner_notice_status ? ` · partner notice: ${i.partner_notice_status.replace("_", " ")}` : ""}</p>
      {i.selected_fields.length > 0 && <p className="ops-muted">Founder selected: {i.selected_fields.map((f) => FIELD[f]).join(", ")} · consent version {i.consent_version}</p>}
      {i.last_send_error && <p className="ops-feedback ops-error">Last send attempt failed: {i.last_send_error}</p>}
      <div className="ops-actions">
        {i.status === "authorized" && <Button disabled={busy} onClick={() => openReview(i.id)}>Review before sending</Button>}
        {["proposed", "authorized", "reconsent_required"].includes(i.status) && <Button variant="outline" className="ops-outline" disabled={busy} onClick={() => run(() => cancel({ data: { id: i.id } }), "Introduction cancelled. Nothing was sent.")}>Cancel introduction</Button>}
      </div>
      {review?.id === i.id && <div className="ops-send-review" role="region" aria-label="Final disclosure review">
        <p><strong>Recipient:</strong> {review.p.partner_name}</p>
        <p><strong>Exactly what will be sent:</strong></p>
        <ul><li>Category: {NEXUS_CATEGORY_COPY[review.p.payload?.category ?? ""]?.title ?? review.p.payload?.category}</li>{Object.entries(review.p.payload?.fields ?? {}).map(([k, v]) => <li key={k}>{FIELD[k]}: {v}</li>)}</ul>
        <p className="ops-muted">No documents, staff notes, other requests or unselected fields are included.</p>
        {!review.p.unchanged && <p className="ops-feedback ops-error">The partner or shared details changed since the founder authorized. Sending will require new founder authorization.</p>}
        {!review.p.eligible && <p className="ops-feedback ops-error">This partner is no longer eligible. Sending will fail and nothing will be sent.</p>}
        <div className="ops-actions"><Button disabled={busy} onClick={() => run(() => send({ data: { id: i.id, hash: review.p.hash ?? "" } }), "Sent.")}>Send to {review.p.partner_name}</Button><Button variant="outline" className="ops-outline" onClick={() => setReview(null)}>Close review</Button></div>
      </div>}
      <details><summary>History</summary><ol>{(i.events ?? []).map((e, n) => <li key={n}>{new Date(e.at).toLocaleString()}: {e.event.replaceAll("_", " ")}</li>)}</ol></details>
    </article>)}
  </div>;
}
