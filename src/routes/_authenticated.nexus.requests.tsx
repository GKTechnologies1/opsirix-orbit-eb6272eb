import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { founderDecide, founderRequests, type FounderRequest } from "@/lib/nexus-intro.functions";
import { NEXUS_CATEGORY_COPY } from "@/lib/nexus-discovery";

export const Route = createFileRoute("/_authenticated/nexus/requests")({
  head: () => ({ meta: [
    { title: "Your Nexus Requests | Opsirix" },
    { name: "description", content: "See your Opsirix Nexus help requests, review proposed introductions and decide what to share." },
    { property: "og:title", content: "Your Nexus Requests | Opsirix" },
    { property: "og:description", content: "Review proposed introductions and decide what to share." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: RequestsPage,
});

type Data = Awaited<ReturnType<typeof founderRequests>>;
type Intro = FounderRequest["introductions"][number];
const FIELD_LABEL: Record<string, string> = { name: "Your name", email: "Your email address", phone: "Your phone number", location: "Your location or jurisdiction", description: "Your request description" };
const STATUS: Record<string, string> = { proposed: "Waiting for your decision", authorized: "Authorized, waiting for Opsirix staff to review and send", declined: "Declined. Nothing was shared.", withdrawn: "Withdrawn. Nothing was shared.", cancelled: "Cancelled by Opsirix. Nothing was shared.", sent: "Sent to the partner", reconsent_required: "Details changed. Please review again." };
const EVENT: Record<string, string> = { proposed: "Opsirix proposed this introduction", authorized: "You authorized it", declined: "You declined", withdrawn: "You withdrew", cancelled: "Opsirix cancelled it", sent: "Shared with the partner in their Opsirix portal", shared_in_partner_portal: "Shared with the partner in their Opsirix portal", send_failed: "A send attempt failed. Nothing was sent", reconsent_required: "Details changed; new authorization needed", partner_emailed: "Partner notified", partner_email_failed: "Partner notice email failed", partner_email_skipped: "Partner can see it in their workspace" };

function RequestsPage() {
  const load = useServerFn(founderRequests);
  const [data, setData] = useState<Data>();
  const [failed, setFailed] = useState(false);
  const refresh = useCallback(async () => { try { setData(await load()); setFailed(false); } catch { setFailed(true); } }, [load]);
  useEffect(() => { void refresh(); }, [refresh]);

  return <main className="nx-page"><div className="nx-wrap nx-narrow">
    <p className="nexus-kicker">Opsirix Nexus</p>
    <h1>Your help requests</h1>
    <p className="nx-intro">Requests sent with the email address you signed in with appear here. Nothing about you is shared with a partner unless you authorize a specific introduction.</p>
    {failed ? <p className="nx-error nx-error--block" role="alert">Your requests could not be loaded. <button className="nx-link-btn" onClick={() => refresh()}>Try again</button></p>
      : !data ? <p className="nx-note">Loading your requests.</p>
      : data.requests.length === 0 ? <p className="nx-note">No requests found for this email address. <Link to="/nexus/help">Tell us what kind of help you need</Link>.</p>
      : data.requests.map((r) => <section key={r.id} className="nx-request">
          <h2>{NEXUS_CATEGORY_COPY[r.category_id]?.title ?? r.category_id}</h2>
          <p className="nx-help">Sent {new Date(r.created_at).toLocaleString()}</p>
          {r.introductions.length === 0 ? <p className="nx-note">Opsirix is reviewing this request. No introduction has been proposed.</p>
            : r.introductions.map((i) => <IntroCard key={i.id} req={r} intro={i} consent={data.consent} onDone={refresh} />)}
        </section>)}
  </div></main>;
}

function IntroCard({ req, intro, consent, onDone }: { req: FounderRequest; intro: Intro; consent: Data["consent"]; onDone: () => Promise<void> }) {
  const decide = useServerFn(founderDecide);
  const [sel, setSel] = useState<string[]>([]);
  const [agree, setAgree] = useState(false);
  const [msg, setMsg] = useState("");
  const [pending, setPending] = useState(false);
  const open = intro.status === "proposed" || intro.status === "reconsent_required";
  const values: [string, string | null][] = [["name", req.full_name], ["email", req.email], ["phone", req.phone], ["location", req.location || null], ["description", req.description]];
  const hasContact = sel.includes("email") || sel.includes("phone");
  const categoryLine = consent?.category_lines[req.category_id] ?? "";
  const toggle = (k: string) => setSel((s) => s.includes(k) ? s.filter((x) => x !== k) : [...s, k]);

  async function act(action: "authorize" | "decline" | "withdraw") {
    setPending(true); setMsg("");
    const r = await decide({ data: { id: intro.id, action, fields: action === "authorize" ? sel as ("name" | "email" | "phone" | "location" | "description")[] : undefined, version: consent?.version } });
    setPending(false);
    if (!r.success) { setMsg(r.error); await onDone(); return; }
    setMsg(action === "authorize" ? "Authorized. Opsirix staff will review the details before anything is sent. You can withdraw until it is sent." : action === "decline" ? "You declined this introduction. Nothing was shared." : "Withdrawn. Nothing was shared.");
    await onDone();
  }

  return <article className="nx-consent" aria-labelledby={`intro-${intro.id}`}>
    <h3 id={`intro-${intro.id}`}>Proposed introduction: {intro.partner_name}, {NEXUS_CATEGORY_COPY[req.category_id]?.title ?? req.category_id}</h3>
    <p className="nx-status">{STATUS[intro.status] ?? intro.status}</p>
    {msg && <p className="nx-feedback" role="status">{msg}</p>}
    {open && consent && <>
      <p>Opsirix reviewed your request and suggests introducing you to <strong>{intro.partner_name}</strong>, a partner in the Opsirix Nexus {NEXUS_CATEGORY_COPY[req.category_id]?.title ?? req.category_id} category.</p>
      <p><strong>Why we're suggesting this:</strong> your request asked for help in this category, and this partner offers services in it. This is not an endorsement or a promise of a response, eligibility, quote, coverage, admission or outcome. Opsirix does not give legal, tax, banking, insurance or immigration advice.</p>
      {categoryLine && <p>{categoryLine}</p>}
      <fieldset className="nx-fieldset"><legend>Choose what Opsirix may share with {intro.partner_name}. Nothing is shared unless you tick it.</legend>
        {values.map(([k, v]) => v ? <label key={k} className="nx-check"><input type="checkbox" checked={sel.includes(k)} onChange={() => toggle(k)} /><span>{FIELD_LABEL[k]}{k === "name" || k === "location" || k === "description" ? " (optional)" : ""}: "{v}"</span></label>
          : k === "phone" ? <p key={k} className="nx-help">You did not give a phone number.</p> : null)}
      </fieldset>
      <p className="nx-help">You must select your email address or phone number so the partner can reply. Your name is optional.{!req.phone ? " If you did not give a phone number, select your email address." : ""}</p>
      <p className="nx-help">The partner will also see the category and a line saying this is an Opsirix introduction. They will not see anything else: no other requests, no staff notes and no documents.</p>
      <label className="nx-check"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /><span>{consent.consent_template.replaceAll("{partner}", intro.partner_name).replace("{category_line}", "").trim()}</span></label>
      {sel.length > 0 && !hasContact && <p className="nx-error" role="alert">Select your email address or phone number before authorizing.</p>}
      <div className="nx-actions">
        <button className="nx-btn nx-btn--primary" disabled={pending || !agree || !hasContact} onClick={() => act("authorize")}>Authorize this introduction</button>
        <button className="nx-btn" disabled={pending} onClick={() => act("decline")}>Decline</button>
      </div>
      <p className="nx-help">Authorizing does not send anything by itself. Opsirix staff review the final details and send them separately. If you decline, nothing is shared and your request stays with Opsirix. You can withdraw your authorization until the introduction has been sent. After that, the partner already has what you chose to share.</p>
    </>}
    {intro.status === "authorized" && <>
      <p>You chose to share: {intro.selected_fields.map((f) => FIELD_LABEL[f]).join(", ")}.</p>
      <button className="nx-btn" disabled={pending} onClick={() => act("withdraw")}>Withdraw authorization</button>
    </>}
    {intro.status === "sent" && <p>Shared: {intro.selected_fields.map((f) => FIELD_LABEL[f]).join(", ")}.</p>}
    <details className="nx-history"><summary>Status history</summary><ol>{(intro.events ?? []).filter((e) => !e.event.startsWith("partner_email") && !e.event.startsWith("notification_")).map((e, n) => <li key={n}>{new Date(e.at).toLocaleString()}: {EVENT[e.event] ?? e.event}</li>)}</ol>
      {intro.consent_version && <p className="nx-help">Consent wording version {intro.consent_version}.</p>}</details>
  </article>;
}
