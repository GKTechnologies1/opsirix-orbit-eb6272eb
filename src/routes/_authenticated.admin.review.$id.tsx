import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { AlertCircle, ArrowLeft, CircleX, FileText, Lock } from "lucide-react";
import { WorkspaceShell } from "@/components/nexus/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { reviewSubject, type ReviewInput } from "@/lib/nexus-review.functions";
import { EVIDENCE_METHODS, STATUS_LABELS, TRACK_TYPES, typeIdFromLabel } from "@/lib/nexus-tracks";

type T = Database["public"]["Tables"];
type Row<K extends keyof T> = T[K]["Row"];

export const Route = createFileRoute("/_authenticated/admin/review/$id")({
  head: () => ({ meta: [
    { title: "Review Application | Opsirix Nexus" },
    { name: "description", content: "Authorized Opsirix review of a Nexus partner application." },
    { property: "og:title", content: "Review Application | Opsirix Nexus" },
    { property: "og:description", content: "Authorized Opsirix review of a Nexus partner application." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ReviewPage,
});

type Loaded = {
  app: Row<"partner_applications">; applicant: Row<"profiles"> | null; details: Row<"partner_track_details"> | null;
  licenses: Row<"partner_licenses">[]; claims: (Row<"partner_listing_types"> & { evidenceOk: boolean; isPublic: boolean })[];
  revision: Row<"partner_profile_revisions"> | null; profile: Row<"partner_profiles"> | null; profilePublic: boolean;
  selections: Row<"partner_service_selections">[]; suggestions: Row<"partner_service_suggestions">[]; credentials: Row<"partner_credentials">[];
  decisions: Row<"partner_review_decisions">[]; notes: Row<"partner_review_internal_notes">[]; events: Row<"partner_review_events">[];
  catalog: Record<string, { label: string; client_label: string | null; qualification_note: string | null }>; types: Record<string, { label: string; open: boolean }>;
};

function ReviewPage() {
  const { id } = Route.useParams();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [data, setData] = useState<Loaded | null>(null);
  const [missing, setMissing] = useState(false);
  const [flash, setFlash] = useState<{ ok: boolean; text: string; subject: string } | null>(null);
  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser(); if (!auth.user) return;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: auth.user.id, _role: "admin" });
    setAllowed(Boolean(isAdmin)); if (!isAdmin) return;
    const { data: app } = await supabase.from("partner_applications").select("*").eq("id", id).maybeSingle();
    if (!app) { setMissing(true); return; }
    const uid = app.user_id;
    const [applicant, details, licenses, claims, revision, profile, selections, suggestions, credentials, decisions, notes, events, types, profilePublic] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("partner_track_details").select("*").eq("application_id", id).maybeSingle(),
      supabase.from("partner_licenses").select("*").eq("application_id", id).order("created_at"),
      supabase.from("partner_listing_types").select("*").eq("user_id", uid),
      supabase.from("partner_profile_revisions").select("*").eq("user_id", uid).in("status", ["submitted", "changes_requested", "draft"]).maybeSingle(),
      supabase.from("partner_profiles").select("*").eq("user_id", uid).maybeSingle(),
      supabase.from("partner_service_selections").select("*").eq("user_id", uid).order("created_at"),
      supabase.from("partner_service_suggestions").select("*").eq("user_id", uid).order("created_at"),
      supabase.from("partner_credentials").select("*").eq("application_id", id).order("created_at"),
      supabase.from("partner_review_decisions").select("*").eq("application_id", id).order("created_at", { ascending: false }),
      supabase.from("partner_review_internal_notes").select("*").eq("application_id", id).order("created_at", { ascending: false }),
      supabase.from("partner_review_events").select("*").eq("application_id", id).order("created_at", { ascending: false }),
      supabase.from("service_partner_types").select("id,label,is_open_for_registration"),
      supabase.rpc("profile_is_public", { _user: uid }),
    ]);
    const ids = [...new Set((selections.data ?? []).map((s) => s.service_id))];
    const cat = ids.length ? (await supabase.from("service_catalog").select("id,label,client_label,qualification_note").in("id", ids)).data ?? [] : [];
    const claimRows = await Promise.all((claims.data ?? []).map(async (c) => ({
      ...c,
      evidenceOk: Boolean((await supabase.rpc("type_evidence_ok", { _application: c.application_id, _type: c.partner_type_id })).data),
      isPublic: Boolean((await supabase.rpc("listing_type_is_public", { _user: uid, _type: c.partner_type_id })).data),
    })));
    setData({
      app, applicant: applicant.data, details: details.data, licenses: licenses.data ?? [], claims: claimRows, revision: revision.data, profile: profile.data,
      profilePublic: Boolean(profilePublic.data), selections: selections.data ?? [], suggestions: suggestions.data ?? [], credentials: credentials.data ?? [],
      decisions: decisions.data ?? [], notes: notes.data ?? [], events: events.data ?? [],
      catalog: Object.fromEntries(cat.map((c) => [c.id, c])), types: Object.fromEntries((types.data ?? []).map((t) => [t.id, { label: t.label, open: t.is_open_for_registration }])),
    });
  }, [id]);
  useEffect(() => { void load(); }, [load]);

  if (allowed === false) return <WorkspaceShell eyebrow="Authorized review" title="Access restricted"><div className="nexus-empty"><CircleX /><h2>Access restricted</h2><p>This workspace is available only to authorized Opsirix reviewers.</p></div></WorkspaceShell>;
  if (missing) return <WorkspaceShell eyebrow="Authorized review" title="Not found"><div className="nexus-empty"><h2>Application not found</h2><Link to="/admin/applications">Back to the queue</Link></div></WorkspaceShell>;
  if (!data) return <WorkspaceShell eyebrow="Authorized review" title="Loading"><p className="nexus-muted">Loading application.</p></WorkspaceShell>;

  const { app, details } = data;
  const typeId = typeIdFromLabel(app.professional_type);
  const eoi = app.application_kind === "expression_of_interest";
  const history = (type: string, subjectId?: string) => data.decisions.filter((d) => d.subject_type === type && (!subjectId || d.subject_id === subjectId));
  const common = { applicationId: app.id, onDone: load, notes: data.notes, onResult: setFlash };
  const flashLine = (subject?: string) => flash && (!subject || flash.subject === subject)
    ? <p className={flash.ok ? "nx-ok" : "nx-error"} role={flash.ok ? "status" : "alert"}>{!flash.ok && <AlertCircle aria-hidden />}{flash.text}</p> : null;

  async function openFile(path: string) {
    const { data: signed, error } = await supabase.storage.from("partner-credentials").createSignedUrl(path, 120);
    if (error) window.alert(error.message); else window.open(signed.signedUrl, "_blank", "noopener");
  }

  return <WorkspaceShell eyebrow="Authorized review" title={app.organization_name || "Untitled application"}>
    <Link to="/admin/applications" className="nx-back"><ArrowLeft aria-hidden />Back to the queue</Link>
    <div aria-live="polite" className="nx-flash">{flashLine()}</div>
    <p className="nx-notice-line">Every decision here runs through the same database rules as the rest of Nexus. A decision the rules don't allow is refused and nothing changes.</p>

    <Section title="Application" status={app.status}>
      <dl className="nx-review-list">
        <div><dt>Applied as</dt><dd>{app.professional_type || "Not chosen"}{eoi && " (private expression of interest: cannot become a listing)"}</dd></div>
        <div><dt>Applicant account</dt><dd>{data.applicant?.full_name} · {data.applicant?.email}</dd></div>
        <div><dt>Website and location</dt><dd>{app.website ?? "No website"} · {[app.city, app.state_region].filter(Boolean).join(", ") || "No location"}</dd></div>
        <div><dt>Submitted</dt><dd>{app.submitted_at ? new Date(app.submitted_at).toLocaleString() : "Not submitted"}</dd></div>
        {eoi && <div><dt>Interest</dt><dd>{app.professional_summary}</dd></div>}
      </dl>
      <History items={history("application")} notes={data.notes} events={data.events} />
      <DecisionForm {...common} subjectType="application" subjectId={app.id} subjectLabel="Application" actions={eoi ? [["approved", "Acknowledge"], ["changes_requested", "Request changes"], ["declined", "Decline"]] : [["approved", "Approve application"], ["changes_requested", "Request changes"], ["declined", "Decline"]]} />
    </Section>

    {details && <Section title="Representative and authority" status={details.authority_review_status}>
      <dl className="nx-review-list">
        <div><dt>Representative</dt><dd>{details.representative_name}{details.representative_title ? `, ${details.representative_title}` : ""}</dd></div>
        <div><dt>Contact</dt><dd>{details.representative_email} {details.representative_phone ? `· ${details.representative_phone}` : ""}</dd></div>
        <div><dt>Says they are authorized</dt><dd>{details.representative_authorized ? "Yes" : "No"}</dd></div>
        <div><dt>Public name permission</dt><dd>Person: {details.rep_public_consent ? "yes" : "no"} · Organization: {details.org_public_consent ? "yes" : "no"} {details.rep_public_consent && details.org_public_consent ? "(name may show once authority is verified)" : "(name stays private)"}</dd></div>
        <div><dt>Evidence offered</dt><dd>{EVIDENCE_METHODS.find((m) => m.id === details.authority_evidence_method)?.label ?? "None yet"}</dd></div>
        <div><dt>Evidence detail</dt><dd>{details.authority_evidence_detail ?? "None"}</dd></div>
        <div><dt>Type details</dt><dd>{[details.campus_or_program, details.geographic_reach, details.service_areas.join(", "), details.industries.join(", ")].filter(Boolean).join(" · ") || "None"}</dd></div>
        <div><dt>Serves</dt><dd>{[...details.audiences, ...details.segments_served].join(", ") || "None"} {details.languages.length ? `· Languages: ${details.languages.join(", ")}` : ""}</dd></div>
        {(details.introduction_method || details.response_time || details.carriers_markets) && <div><dt>Private preferences</dt><dd>{[details.introduction_method, details.response_time, details.carriers_markets].filter(Boolean).join(" · ")}</dd></div>}
      </dl>
      <Files files={data.credentials} open={openFile} />
      <History items={history("authority")} notes={data.notes} />
      {!eoi && <DecisionForm {...common} subjectType="authority" subjectId={app.id} subjectLabel="Your role and authority" actions={[["verified", "Verify authority"], ["changes_requested", "Request changes"], ["declined", "Decline"]]} />}
    </Section>}

    {typeId === "university" && !eoi && details && <Section title="Institutional authorization" status={details.agreement_status}>
      <p>An official university listing needs documented authorization from the institution. Record where the written agreement or approval is kept.</p>
      {details.agreement_reference && <p className="nexus-muted">Recorded reference: {details.agreement_reference}</p>}
      <History items={history("agreement")} notes={data.notes} />
      <DecisionForm {...common} subjectType="agreement" subjectId={app.id} subjectLabel="Institutional authorization" actions={[["recorded", "Record agreement"], ["changes_requested", "Request documents"]]} agreement />
    </Section>}

    {data.licenses.length > 0 && <Section title="Insurance licenses">
      {data.licenses.map((l) => <div key={l.id} className="nx-subject">
        <h3>{l.state_code} · {l.line_of_authority} <span className={`nexus-status ${l.review_status}`}>{STATUS_LABELS[l.review_status]}</span></h3>
        <p className="nexus-muted">License {l.license_number}{l.producer_id ? ` · Producer ID ${l.producer_id}` : ""}{l.expires_on ? ` · Expires ${l.expires_on}` : " · No expiry given"}. Check against the state regulator's records before verifying.</p>
        <History items={history("license", l.id)} notes={data.notes} />
        <DecisionForm {...common} subjectType="license" subjectId={l.id} subjectLabel={`License ${l.state_code} ${l.line_of_authority}`} actions={[["verified", "Verify"], ["changes_requested", "Request changes"], ["declined", "Reject"]]} />
      </div>)}
    </Section>}

    <Section title="Claimed partner types">
      {data.claims.length ? data.claims.map((c) => <div key={c.id} className="nx-subject">
        <h3>{data.types[c.partner_type_id]?.label ?? c.partner_type_id} <span className={`nexus-status ${c.review_status}`}>{STATUS_LABELS[c.review_status]}</span></h3>
        <p className="nexus-muted">Type is {data.types[c.partner_type_id]?.open ? "open" : "closed to sign-up"} · Evidence for approval: {c.evidenceOk ? "complete" : "incomplete (approval will be refused)"} · Public now: {c.isPublic ? "yes" : "no"}</p>
        <History items={history("listing_type", c.id)} notes={data.notes} />
        <DecisionForm {...common} subjectType="listing_type" subjectId={c.id} subjectLabel={`${data.types[c.partner_type_id]?.label ?? c.partner_type_id} claim`} actions={[["approved", "Approve type"], ["changes_requested", "Request changes"], ["declined", "Decline"], ["suspended", "Suspend"]]} />
      </div>) : <p className="nexus-muted">{eoi ? "Expressions of interest cannot claim a type." : "No type claimed yet."}</p>}
    </Section>

    {!eoi && <Section title="Profile" status={data.revision?.status}>
      {flashLine("profile_revision")}
      <div className="nx-versions">
        <div><h3>Approved version</h3>{data.profile ? <><p>{data.profile.organization_name}</p><p className="nexus-muted">{data.profile.professional_summary}</p><p className="nexus-muted">Published: {data.profile.is_published ? "yes" : "no"} · Suspended: {data.profile.is_suspended ? "yes" : "no"} · Visible to visitors: {data.profilePublic ? "yes" : "no"}</p></> : <p className="nexus-muted">None yet.</p>}</div>
        <div><h3>Proposed version</h3>{data.revision ? <><p>{data.revision.organization_name}</p><p className="nexus-muted">{data.revision.professional_summary}</p><p className="nexus-muted">{[data.revision.city, data.revision.state_region].filter(Boolean).join(", ")} · {data.revision.service_areas.join(", ")}</p></> : <p className="nexus-muted">No pending changes.</p>}</div>
      </div>
      {data.revision && <><History items={history("profile_revision", data.revision.id)} notes={data.notes} />
        <DecisionForm {...common} subjectType="profile_revision" subjectId={data.revision.id} subjectLabel="Profile changes" actions={[["approved", "Approve changes"], ["changes_requested", "Request changes"], ["declined", "Decline"]]} /></>}
      {data.profile && <><h3>Listing</h3><History items={history("listing")} notes={data.notes} />
        <DecisionForm {...common} subjectType="listing" subjectId={data.profile.id} subjectLabel="Public listing" actions={[["published", "Publish"], ["unpublished", "Unpublish"], ["suspended", "Suspend"], ["reinstated", "Lift suspension"]]} /></>}
    </Section>}

    <Section title="Selected choices">
      {data.selections.length ? data.selections.map((s) => { const c = data.catalog[s.service_id]; return <div key={s.id} className="nx-subject">
        <h3>{c?.label ?? s.service_id} <span className={`nexus-status ${s.review_status}`}>{STATUS_LABELS[s.review_status]}</span></h3>
        <p className="nexus-muted">{data.types[s.partner_type]?.label} · Founders would see: {c?.client_label ?? c?.label} · Accepting inquiries: {s.accepting_inquiries ? "yes" : "no"}</p>
        {s.offering_description && <p>{s.offering_description}</p>}
        {c?.qualification_note && <p className="nx-hint"><Lock aria-hidden />{c.qualification_note}</p>}
        <History items={history("service", s.id)} notes={data.notes} />
        <DecisionForm {...common} subjectType="service" subjectId={s.id} subjectLabel={c?.label ?? s.service_id} actions={[["approved", "Approve"], ["changes_requested", "Request changes"], ["declined", "Decline"]]} />
      </div>; }) : <p className="nexus-muted">No choices selected.</p>}
    </Section>

    {data.suggestions.length > 0 && <Section title="Suggested other items">
      {data.suggestions.map((s) => <div key={s.id} className="nx-subject">
        <h3>{s.label} <span className={`nexus-status ${s.status}`}>{STATUS_LABELS[s.status]}</span></h3><p>{s.description}</p>
        <p className="nx-hint">Accepting a suggestion does not add it to the catalog or anyone's profile. A catalog change is a separate step.</p>
        <History items={history("suggestion", s.id)} notes={data.notes} />
        <DecisionForm {...common} subjectType="suggestion" subjectId={s.id} subjectLabel={`Suggested: ${s.label}`} actions={[["approved", "Accept for catalog review"], ["declined", "Decline"]]} />
      </div>)}
    </Section>}
  </WorkspaceShell>;
}

function Section({ title, status, children }: { title: string; status?: string | null; children: ReactNode }) {
  return <section className="nexus-work-card nx-review-section"><div className="nexus-card-heading"><h2>{title}</h2>{status && <span className={`nexus-status ${status}`}>{STATUS_LABELS[status] ?? status}</span>}</div>{children}</section>;
}

function Files({ files, open }: { files: Row<"partner_credentials">[]; open: (p: string) => void }) {
  if (!files.length) return <p className="nexus-muted">No uploaded documents.</p>;
  return <ul className="nx-list">{files.map((f) => <li key={f.id}><FileText aria-hidden />{f.original_filename}<span className="nexus-muted">{f.credential_type}</span><Button size="sm" variant="ghost" onClick={() => open(f.storage_path)}>Open privately</Button></li>)}</ul>;
}

function History({ items, notes, events = [] }: { items: Row<"partner_review_decisions">[]; notes: Row<"partner_review_internal_notes">[]; events?: Row<"partner_review_events">[] }) {
  if (!items.length && !events.length) return <p className="nexus-muted nx-history-empty">No decisions yet.</p>;
  return <details className="nx-history"><summary>Review history ({items.length + events.length})</summary><ul>
    {items.map((d) => { const n = notes.filter((x) => x.decision_id === d.id); return <li key={d.id}>
      <span className={`nexus-status ${d.decision}`}>{STATUS_LABELS[d.decision] ?? d.decision}</span> <time>{new Date(d.created_at).toLocaleString()}</time>
      {d.applicant_message && <p>To applicant: {d.applicant_message}</p>}
      {n.map((x) => <p key={x.id} className="nx-internal"><Lock aria-hidden />Private note: {x.note}</p>)}
    </li>; })}
    {events.map((e) => <li key={e.id}><span className="nexus-status">{e.from_status ?? "new"} to {e.to_status}</span> <time>{new Date(e.created_at).toLocaleString()}</time>{e.note && <p>{e.note}</p>}</li>)}
  </ul></details>;
}

function DecisionForm({ applicationId, subjectType, subjectId, subjectLabel, actions, onDone, onResult, agreement }: { applicationId: string; subjectType: ReviewInput["subjectType"]; subjectId: string; subjectLabel: string; actions: [ReviewInput["decision"], string][]; onDone: () => Promise<void>; onResult: (r: { ok: boolean; text: string; subject: string }) => void; notes: Row<"partner_review_internal_notes">[]; agreement?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const base = `${subjectType}-${subjectId}`;
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget; const f = new FormData(form);
    const decision = String(f.get("decision") ?? "") as ReviewInput["decision"];
    if (!decision) { setError("Choose a decision."); return; }
    const applicantMessage = String(f.get("applicantMessage") ?? "").trim();
    if (decision === "changes_requested" && applicantMessage.length < 10) { setError("Tell the applicant specifically what to change (at least 10 characters)."); return; }
    setBusy(true); setError(""); setOk("");
    try {
      const res = await reviewSubject({ data: { applicationId, subjectType, subjectId, subjectLabel, decision, applicantMessage: applicantMessage || undefined, internalNote: String(f.get("internalNote") ?? "").trim() || undefined, agreementReference: String(f.get("agreementReference") ?? "").trim() || undefined } });
      const label = actions.find(([v]) => v === decision)?.[1] ?? decision;
      if (!res.success) { setError(res.error); onResult({ ok: false, text: `${subjectLabel}: "${label}" was not saved. ${res.error}`, subject: subjectType }); }
      else { setOk("Decision saved."); form.reset(); onResult({ ok: true, text: `${subjectLabel}: "${label}" saved.`, subject: subjectType }); await onDone(); }
    } catch (err) { const m = err instanceof Error ? err.message : "The decision could not be saved."; setError(m); onResult({ ok: false, text: `${subjectLabel}: not saved. ${m}`, subject: subjectType }); }
    setBusy(false);
  }
  return <form className="nx-decision" onSubmit={submit} noValidate aria-label={`Decision for ${subjectLabel}`}>
    <fieldset><legend>Decision</legend><div className="nx-decision-actions">{actions.map(([value, label]) => <label key={value} className="nx-check"><input type="radio" name="decision" value={value} />{label}</label>)}</div></fieldset>
    {agreement && <label htmlFor={`${base}-ref`}>Where the agreement is recorded<input id={`${base}-ref`} name="agreementReference" maxLength={300} placeholder="Document name, date, and where it is filed" /></label>}
    <label htmlFor={`${base}-msg`}>Message to the applicant <span className="nx-vis public">They will see this</span><textarea id={`${base}-msg`} name="applicantMessage" maxLength={2000} rows={2} /></label>
    <label htmlFor={`${base}-note`}>Private reviewer note <span className="nx-vis private"><Lock aria-hidden />Never shown to the applicant</span><textarea id={`${base}-note`} name="internalNote" maxLength={4000} rows={2} /></label>
    {error && <p className="nx-error" role="alert"><AlertCircle aria-hidden />{error}</p>}
    {ok && <p className="nx-ok" role="status">{ok}</p>}
    <Button type="submit" size="sm" disabled={busy}>Save decision</Button>
  </form>;
}
