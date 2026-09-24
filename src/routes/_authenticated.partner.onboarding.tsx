import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { z } from "zod";
import { AlertCircle, Check, Eye, FileUp, Lock, RotateCcw, Search, Trash2, X } from "lucide-react";
import { WorkspaceShell } from "@/components/nexus/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { EVIDENCE_METHODS, ONBOARDING_STEPS, REACH_OPTIONS, STATUS_LABELS, TRACK_TYPES, TRACK_TYPE_IDS, splitList, typeIdFromLabel, type StepId, type TrackTypeId } from "@/lib/nexus-tracks";

type T = Database["public"]["Tables"];
type Application = T["partner_applications"]["Row"];
type Details = T["partner_track_details"]["Row"];
type License = T["partner_licenses"]["Row"];
type Selection = T["partner_service_selections"]["Row"];
type Suggestion = T["partner_service_suggestions"]["Row"];
type Revision = T["partner_profile_revisions"]["Row"];
type Claim = T["partner_listing_types"]["Row"];
type Decision = T["partner_review_decisions"]["Row"];
type Credential = T["partner_credentials"]["Row"];
type Category = T["service_categories"]["Row"];
type Service = T["service_catalog"]["Row"];

const stepIds = ONBOARDING_STEPS.map((s) => s.id) as [StepId, ...StepId[]];

export const Route = createFileRoute("/_authenticated/partner/onboarding")({
  validateSearch: z.object({ step: z.enum(stepIds).optional().catch(undefined) }),
  head: () => ({ meta: [
    { title: "Institution and Brokerage Onboarding | Opsirix Nexus" },
    { name: "description", content: "Private onboarding for university, banking, and insurance partners in Opsirix Nexus." },
    { property: "og:title", content: "Institution and Brokerage Onboarding | Opsirix Nexus" },
    { property: "og:description", content: "Private onboarding for university, banking, and insurance partners in Opsirix Nexus." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: OnboardingPage,
});

type Data = {
  userId: string;
  types: { id: string; label: string; is_open_for_registration: boolean }[];
  app: Application | null;
  details: Details | null;
  licenses: License[];
  selections: Selection[];
  suggestions: Suggestion[];
  revision: Revision | null;
  claims: Claim[];
  decisions: Decision[];
  credentials: Credential[];
  categories: Category[];
  services: Service[];
};
type Errors = Record<string, string>;

async function loadData(): Promise<Data | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const uid = auth.user.id;
  const [types, app] = await Promise.all([
    supabase.from("service_partner_types").select("id,label,is_open_for_registration").in("id", TRACK_TYPE_IDS).order("display_order"),
    supabase.from("partner_applications").select("*").eq("user_id", uid).maybeSingle(),
  ]);
  const a = app.data;
  const typeId = typeIdFromLabel(a?.professional_type);
  const [details, licenses, selections, suggestions, revision, claims, decisions, credentials, categories, services] = await Promise.all([
    a ? supabase.from("partner_track_details").select("*").eq("application_id", a.id).maybeSingle() : Promise.resolve({ data: null }),
    a ? supabase.from("partner_licenses").select("*").eq("application_id", a.id).order("created_at") : Promise.resolve({ data: [] }),
    supabase.from("partner_service_selections").select("*").eq("user_id", uid),
    supabase.from("partner_service_suggestions").select("*").eq("user_id", uid).order("created_at"),
    supabase.from("partner_profile_revisions").select("*").eq("user_id", uid).in("status", ["draft", "submitted", "changes_requested"]).maybeSingle(),
    supabase.from("partner_listing_types").select("*").eq("user_id", uid),
    a ? supabase.from("partner_review_decisions").select("*").eq("application_id", a.id).order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
    a ? supabase.from("partner_credentials").select("*").eq("application_id", a.id).order("created_at") : Promise.resolve({ data: [] }),
    typeId ? supabase.from("service_categories").select("*").eq("partner_type", typeId).eq("is_active", true).order("display_order") : Promise.resolve({ data: [] }),
    typeId ? supabase.from("service_catalog").select("*").eq("partner_type", typeId).eq("is_active", true).order("display_order") : Promise.resolve({ data: [] }),
  ]);
  return {
    userId: uid, types: types.data ?? [], app: a, details: (details.data as Details | null) ?? null,
    licenses: (licenses.data as License[]) ?? [], selections: selections.data ?? [], suggestions: suggestions.data ?? [],
    revision: revision.data ?? null, claims: claims.data ?? [], decisions: (decisions.data as Decision[]) ?? [],
    credentials: (credentials.data as Credential[]) ?? [], categories: (categories.data as Category[]) ?? [], services: (services.data as Service[]) ?? [],
  };
}

/* ---------- validation shared by step saves and the final check ---------- */
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
type Issue = { step: StepId; field: string; message: string };

function checkAll(d: Data): Issue[] {
  const issues: Issue[] = [];
  const typeId = typeIdFromLabel(d.app?.professional_type);
  const eoi = d.app?.application_kind === "expression_of_interest";
  if (!d.app || !typeId) { issues.push({ step: "type", field: "typeId", message: "Choose a partner type." }); return issues; }
  const det = d.details;
  if (!d.app.organization_name.trim()) issues.push({ step: "organization", field: "organizationName", message: "Add the organization name." });
  if (!det?.representative_name.trim()) issues.push({ step: "organization", field: "repName", message: "Add your name." });
  if (!det?.representative_email || !emailOk(det.representative_email)) issues.push({ step: "organization", field: "repEmail", message: "Add a valid work email." });
  if (!eoi && !det?.representative_authorized) issues.push({ step: "organization", field: "authorized", message: "Confirm you are authorized to represent the organization." });
  if (typeId === "university") {
    if (!det?.campus_or_program) issues.push({ step: "details", field: "campus", message: "Add the campus or program." });
    if (!det?.geographic_reach) issues.push({ step: "details", field: "reach", message: "Choose the program's reach." });
    if (!det?.audiences.length) issues.push({ step: "details", field: "audiences", message: "Choose at least one group you work with." });
  } else {
    if (!det?.segments_served.length) issues.push({ step: "details", field: "segments", message: "Choose at least one segment or client type." });
    if (!det?.service_areas.length) issues.push({ step: "details", field: "serviceAreas", message: typeId === "insurance" ? "Add the states you serve." : "Add at least one service area." });
  }
  if (!d.selections.some((s) => s.partner_type === typeId)) issues.push({ step: "choices", field: "choices", message: "Choose at least one item from the list." });
  if (!eoi) {
    if (!det?.authority_evidence_method) issues.push({ step: "evidence", field: "method", message: "Choose how we can confirm your authority." });
    else if (det.authority_evidence_method === "signed_letter" && !d.credentials.some((c) => c.credential_type === "authority_evidence")) issues.push({ step: "evidence", field: "letter", message: "Upload the signed letter, or choose another way." });
    else if (det.authority_evidence_method !== "signed_letter" && !(det.authority_evidence_detail ?? "").trim()) issues.push({ step: "evidence", field: "detail", message: "Add the detail a reviewer needs." });
    if (typeId === "insurance" && !d.licenses.length) issues.push({ step: "evidence", field: "licenses", message: "Add at least one state license." });
    if ((d.revision?.professional_summary ?? "").trim().length < 40) issues.push({ step: "preview", field: "summary", message: "Write a public summary of at least 40 characters." });
  } else if (d.app.professional_summary.trim().length < 20) issues.push({ step: "preview", field: "interest", message: "Tell us briefly what you're interested in (at least 20 characters)." });
  return issues;
}

/* ---------- small UI helpers ---------- */
function Vis({ scope }: { scope: "public" | "private" | "conditional" }) {
  const text = scope === "public" ? "Public once approved" : scope === "private" ? "Only Opsirix" : "Public only with both permissions";
  return <span className={`nx-vis ${scope}`}>{scope === "private" ? <Lock aria-hidden /> : <Eye aria-hidden />}{text}</span>;
}
function Field({ id, label, error, hint, scope, children }: { id: string; label: string; error?: string; hint?: string; scope?: "public" | "private" | "conditional"; children: ReactNode }) {
  return <div className="nx-field">
    <label htmlFor={id}>{label}{scope && <Vis scope={scope} />}</label>
    {hint && <p className="nx-hint" id={`${id}-hint`}>{hint}</p>}
    {children}
    {error && <p className="nx-error" id={`${id}-error`} role="alert"><AlertCircle aria-hidden />{error}</p>}
  </div>;
}
const aria = (id: string, errors: Errors, hint = false) => ({ id, name: id, "aria-invalid": Boolean(errors[id]) || undefined, "aria-describedby": [errors[id] ? `${id}-error` : "", hint ? `${id}-hint` : ""].filter(Boolean).join(" ") || undefined });
function CheckGroup({ id, legend, options, selected, error, scope }: { id: string; legend: string; options: string[]; selected: string[]; error?: string; scope?: "public" | "private" }) {
  return <fieldset className="nx-field nx-checkgroup" aria-invalid={Boolean(error) || undefined} aria-describedby={error ? `${id}-error` : undefined}>
    <legend>{legend}{scope && <Vis scope={scope} />}</legend>
    <div>{options.map((o) => <label key={o} className="nx-check"><input type="checkbox" name={id} value={o} defaultChecked={selected.includes(o)} />{o}</label>)}</div>
    {error && <p className="nx-error" id={`${id}-error`} role="alert"><AlertCircle aria-hidden />{error}</p>}
  </fieldset>;
}
function StepActions({ saving, last }: { saving: boolean; last?: boolean }) {
  return <div className="nexus-form-actions">
    <Button type="submit" name="intent" value="stay" variant="outline" disabled={saving}>Save draft</Button>
    {!last && <Button type="submit" name="intent" value="next" disabled={saving}>Save and continue</Button>}
  </div>;
}

/* ---------- page ---------- */
function OnboardingPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [data, setData] = useState<Data | null | undefined>(undefined);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const reload = useCallback(async () => setData(await loadData()), []);
  useEffect(() => { void reload(); }, [reload]);

  const typeId = typeIdFromLabel(data?.app?.professional_type);
  const eoi = data?.app?.application_kind === "expression_of_interest";
  const step: StepId = search.step ?? (data?.app?.onboarding_step as StepId | undefined) ?? "type";
  const editable = !data?.app || ["draft", "changes_requested"].includes(data.app.status);

  const go = (next: StepId) => { setErrors({}); setNotice(""); void navigate({ to: "/partner/onboarding", search: { step: next }, replace: false }); window.scrollTo({ top: 0 }); };
  const nextOf = (s: StepId) => ONBOARDING_STEPS[Math.min(ONBOARDING_STEPS.findIndex((x) => x.id === s) + 1, ONBOARDING_STEPS.length - 1)].id;

  async function finish(result: { error?: string; errors?: Errors }, intent: string, current: StepId) {
    setSaving(false);
    if (result.errors && Object.keys(result.errors).length) { setErrors(result.errors); setNotice("Please fix the highlighted fields."); document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus(); return; }
    if (result.error) { setErrors({}); setNotice(result.error); return; }
    setErrors({}); setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    await reload();
    if (intent === "next") go(nextOf(current)); else setNotice("Draft saved. You can leave and come back at any time.");
  }
  async function recordStep(appId: string, s: StepId) { await supabase.from("partner_applications").update({ onboarding_step: s }).eq("id", appId); }

  if (data === undefined) return <WorkspaceShell eyebrow="Nexus onboarding" title="Loading your draft"><p className="nexus-muted">Please wait.</p></WorkspaceShell>;
  if (data === null) return null;
  if (!data.types.length) return <WorkspaceShell eyebrow="Nexus onboarding" title="Not open yet"><div className="nexus-empty"><Lock /><h2>These partner types are not open yet</h2><p>University, banking, and insurance onboarding will open separately. Professional service firms can apply from the Application page.</p><Link to="/partner/apply">Go to the application</Link></div></WorkspaceShell>;
  if (data.app && !typeId) return <WorkspaceShell eyebrow="Nexus onboarding" title="Application already started"><div className="nexus-empty"><AlertCircle /><h2>This account already has a professional service application</h2><p>Each account holds one application. Use a separate account for a university, bank, or brokerage.</p><Link to="/partner/apply">Open your application</Link></div></WorkspaceShell>;

  const d = data;
  const issues = checkAll(d);
  const status = d.app ? STATUS_LABELS[d.app.status] : "Not started";
  const previewOnly = d.types.every((t) => !t.is_open_for_registration);

  /* ----- step save handlers ----- */
  async function saveType(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget); const intent = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") ?? "stay";
    const t = String(f.get("typeId") ?? "") as TrackTypeId; const role = String(f.get("role") ?? "representative");
    const errs: Errors = {};
    if (!TRACK_TYPE_IDS.includes(t)) errs.typeId = "Choose a partner type.";
    if (t === "university" && !f.get("role")) errs.role = "Choose how you're taking part.";
    if (Object.keys(errs).length) return finish({ errors: errs }, intent, "type");
    setSaving(true);
    const kind = t === "university" && role === "interest" ? "expression_of_interest" : "organization";
    const payload = { professional_type: TRACK_TYPES[t].label, application_kind: kind, onboarding_step: "organization", updated_at: new Date().toISOString() };
    const res = d.app
      ? await supabase.from("partner_applications").update(payload).eq("id", d.app.id)
      : await supabase.from("partner_applications").insert({ ...payload, user_id: d.userId, status: "draft" });
    if (!res.error && d.details && d.details.track !== TRACK_TYPES[t].track) await supabase.from("partner_track_details").update({ track: TRACK_TYPES[t].track }).eq("application_id", d.app!.id);
    return finish({ error: res.error?.message }, intent, "type");
  }

  async function saveOrganization(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget); const intent = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") ?? "stay";
    const v = (k: string) => String(f.get(k) ?? "").trim();
    const errs: Errors = {};
    if (!v("organizationName")) errs.organizationName = `Add the ${TRACK_TYPES[typeId!].orgNoun} name.`;
    if (v("website") && !/^https?:\/\/.+\..+/.test(v("website"))) errs.website = "Use a full address starting with https://";
    if (!v("repName")) errs.repName = "Add your name.";
    if (!v("repTitle")) errs.repTitle = "Add your title or office.";
    if (!emailOk(v("repEmail"))) errs.repEmail = "Add a valid work email.";
    if (!eoi && !f.get("authorized")) errs.authorized = "Confirm you are authorized, or go back and choose a private expression of interest (universities only).";
    if (Object.keys(errs).length) return finish({ errors: errs }, intent, "organization");
    setSaving(true);
    const app = d.app!;
    const a = await supabase.from("partner_applications").update({ organization_name: v("organizationName"), website: v("website") || null, city: v("city") || null, state_region: v("state") || null, onboarding_step: intent === "next" ? "details" : "organization", updated_at: new Date().toISOString() }).eq("id", app.id);
    if (a.error) return finish({ error: a.error.message }, intent, "organization");
    const r = await supabase.from("partner_track_details").upsert({
      application_id: app.id, user_id: d.userId, track: TRACK_TYPES[typeId!].track,
      representative_name: v("repName"), representative_title: v("repTitle"), representative_email: v("repEmail"), representative_phone: v("repPhone") || null,
      representative_authorized: !eoi && Boolean(f.get("authorized")), rep_public_consent: !eoi && Boolean(f.get("repConsent")), org_public_consent: !eoi && Boolean(f.get("orgConsent")),
    }, { onConflict: "application_id" });
    return finish({ error: r.error?.message }, intent, "organization");
  }

  async function saveDetails(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget); const intent = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") ?? "stay";
    const v = (k: string) => String(f.get(k) ?? "").trim(); const all = (k: string) => f.getAll(k).map(String);
    if (!d.details) return finish({ error: "Complete Organization and role first." }, intent, "details");
    const errs: Errors = {};
    const patch: Partial<Details> = { languages: splitList(v("languages")) };
    if (typeId === "university") {
      if (!v("campus")) errs.campus = "Add the campus or program."; if (!v("reach")) errs.reach = "Choose the program's reach."; if (!all("audiences").length) errs.audiences = "Choose at least one group.";
      Object.assign(patch, { campus_or_program: v("campus"), geographic_reach: v("reach"), audiences: all("audiences"), service_areas: v("reach") ? [v("reach")] : [] });
      if (!eoi) patch.agreement_status = v("agreement") === "pending" ? "pending" : "none";
    } else {
      if (!all("segments").length) errs.segments = "Choose at least one."; if (!splitList(v("serviceAreas")).length) errs.serviceAreas = typeId === "insurance" ? "Add the states you serve." : "Add at least one service area.";
      Object.assign(patch, { segments_served: all("segments"), service_areas: splitList(v("serviceAreas")), industries: splitList(v("industries")), introduction_method: v("introMethod") || null, response_time: v("responseTime") || null, carriers_markets: v("carriers") || null });
    }
    if (Object.keys(errs).length) return finish({ errors: errs }, intent, "details");
    setSaving(true);
    const r = await supabase.from("partner_track_details").update(patch).eq("application_id", d.app!.id);
    if (!r.error) { await supabase.from("partner_applications").update({ service_areas: patch.service_areas ?? [], onboarding_step: intent === "next" ? "choices" : "details" }).eq("id", d.app!.id); }
    return finish({ error: r.error?.message }, intent, "details");
  }

  async function saveEvidence(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget); const intent = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") ?? "stay";
    const method = String(f.get("method") ?? ""); const detail = String(f.get("detail") ?? "").trim();
    const errs: Errors = {};
    if (!method) errs.method = "Choose how we can confirm your authority.";
    else if (method !== "signed_letter" && !detail) errs.detail = "Add the detail a reviewer needs.";
    if (Object.keys(errs).length) return finish({ errors: errs }, intent, "evidence");
    setSaving(true);
    const r = await supabase.from("partner_track_details").update({ authority_evidence_method: method as Details["authority_evidence_method"], authority_evidence_detail: detail || null }).eq("application_id", d.app!.id);
    if (!r.error) await recordStep(d.app!.id, intent === "next" ? "preview" : "evidence");
    return finish({ error: r.error?.message }, intent, "evidence");
  }

  async function savePreview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget); const intent = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") ?? "stay";
    const app = d.app!;
    if (eoi) {
      const interest = String(f.get("interest") ?? "").trim();
      if (interest.length < 20) return finish({ errors: { interest: "Tell us briefly what you're interested in (at least 20 characters)." } }, intent, "preview");
      setSaving(true);
      const r = await supabase.from("partner_applications").update({ professional_summary: interest, onboarding_step: intent === "next" ? "submit" : "preview" }).eq("id", app.id);
      return finish({ error: r.error?.message }, intent, "preview");
    }
    const summary = String(f.get("summary") ?? "").trim();
    if (summary.length < 40) return finish({ errors: { summary: "Write a public summary of at least 40 characters." } }, intent, "preview");
    setSaving(true);
    const fields = { display_name: app.organization_name, organization_name: app.organization_name, city: app.city, state_region: app.state_region, service_areas: d.details?.service_areas ?? [], professional_summary: summary };
    const r = d.revision
      ? await supabase.from("partner_profile_revisions").update({ ...fields, status: d.revision.status === "submitted" ? "submitted" : "draft" }).eq("id", d.revision.id)
      : await supabase.from("partner_profile_revisions").insert({ ...fields, user_id: d.userId, application_id: app.id, status: "draft" });
    if (!r.error) await supabase.from("partner_applications").update({ professional_summary: summary, onboarding_step: intent === "next" ? "submit" : "preview" }).eq("id", app.id);
    return finish({ error: r.error?.message }, intent, "preview");
  }

  async function submitAll() {
    if (issues.length) { setNotice("Some steps still need attention. Each item below links to the step."); return; }
    setSaving(true);
    const app = d.app!;
    if (!eoi) {
      const claim = d.claims.find((c) => c.partner_type_id === typeId);
      const c = !claim
        ? await supabase.from("partner_listing_types").insert({ user_id: d.userId, application_id: app.id, partner_type_id: typeId! })
        : ["changes_requested", "withdrawn"].includes(claim.review_status) ? await supabase.from("partner_listing_types").update({ review_status: "pending" }).eq("id", claim.id) : { error: null };
      if (c.error) { setSaving(false); setNotice(c.error.message); return; }
      if (d.revision && d.revision.status !== "submitted") {
        const rv = await supabase.from("partner_profile_revisions").update({ status: "submitted" }).eq("id", d.revision.id);
        if (rv.error) { setSaving(false); setNotice(rv.error.message); return; }
      }
    }
    const r = await supabase.from("partner_applications").update({ status: "submitted", submitted_at: new Date().toISOString(), onboarding_step: "submit" }).eq("id", app.id);
    setSaving(false);
    if (r.error) { setNotice(r.error.message); return; }
    await reload(); setNotice(eoi ? "Thank you. Your private expression of interest was sent to Opsirix." : "Submitted. A person on our team will review each part and message you here.");
  }

  const selectionsForType = d.selections.filter((s) => s.partner_type === typeId);
  const stepIndex = ONBOARDING_STEPS.findIndex((s) => s.id === step);

  return <WorkspaceShell eyebrow={previewOnly ? "Private preview: not open to the public" : "Nexus onboarding"} title={typeId ? `${TRACK_TYPES[typeId].label} onboarding` : "Institution and brokerage onboarding"}>
    <div className="nx-statusbar" role="status">
      <span className={`nexus-status ${d.app?.status ?? "draft"}`}>{status}</span>
      {eoi && <span className="nx-vis private"><Lock aria-hidden />Private expression of interest</span>}
      {savedAt && <span className="nexus-muted">Saved at {savedAt}</span>}
      <span className="nexus-muted">Introductions to founders are not enabled yet.</span>
    </div>
    {previewOnly && <p className="nexus-notice nx-inline-notice"><Lock aria-hidden />This type is closed to public sign-up. You can see it because Opsirix gave this account private preview access. Nothing here can be published while the type is closed.</p>}
    <Messages decisions={d.decisions} />
    <nav aria-label="Onboarding steps"><ol className="nx-steps">{ONBOARDING_STEPS.map((s, i) => {
      const bad = issues.some((x) => x.step === s.id);
      return <li key={s.id}><button type="button" onClick={() => go(s.id)} aria-current={s.id === step ? "step" : undefined} disabled={!d.app && s.id !== "type"} className={s.id === step ? "active" : ""}>
        <span>{i + 1}</span>{s.label}{d.app && s.id !== "submit" && (bad ? <span className="sr-only"> (needs attention)</span> : <Check aria-label="complete" />)}</button></li>;
    })}</ol></nav>
    {notice && <p className="nx-notice-line" role="alert">{notice}</p>}
    {!editable ? <LockedSummary d={d} typeId={typeId!} eoi={eoi} /> : <div className="nexus-application-form">
      {step === "type" && <form onSubmit={saveType} noValidate className="nexus-work-card" key={`type-${d.app?.updated_at}`}>
        <h2>Which kind of partner are you?</h2>
        <p>Choose the type that matches your organization. Each type is reviewed on its own.</p>
        <fieldset className="nx-field" aria-invalid={Boolean(errors.typeId) || undefined}><legend className="sr-only">Partner type</legend>
          <div className="nx-type-grid">{d.types.map((t) => { const id = t.id as TrackTypeId; return <label key={id} className="nx-type-card"><input type="radio" name="typeId" value={id} defaultChecked={typeId === id} /><strong>{TRACK_TYPES[id].label}</strong><span>{TRACK_TYPES[id].intro}</span></label>; })}</div>
          {errors.typeId && <p className="nx-error" role="alert"><AlertCircle aria-hidden />{errors.typeId}</p>}
        </fieldset>
        <fieldset className="nx-field" aria-describedby="role-hint"><legend>For universities: how are you taking part?</legend>
          <p className="nx-hint" id="role-hint">Only needed if you chose University partner.</p>
          <label className="nx-check"><input type="radio" name="role" value="representative" defaultChecked={!eoi} />I'm authorized to represent the institution or program</label>
          <label className="nx-check"><input type="radio" name="role" value="interest" defaultChecked={eoi} />I'm interested, but I'm not speaking for the institution. Save a private expression of interest.</label>
          <p className="nx-hint">An expression of interest stays private. It does not create a listing or make the university an Opsirix partner.</p>
          {errors.role && <p className="nx-error" role="alert">{errors.role}</p>}
        </fieldset>
        <StepActions saving={saving} />
      </form>}

      {step === "organization" && typeId && <form onSubmit={saveOrganization} noValidate className="nexus-work-card" key={`org-${d.details?.updated_at}`}>
        <h2>Organization and your role</h2>
        <p>{eoi ? "You're saving a private expression of interest. You are not speaking for the institution, and nothing will be listed." : "Your organization is the listing name. Your own details stay private unless you and the organization both agree to show your name."}</p>
        <div className="nexus-form-grid">
          <Field id="organizationName" label={`${TRACK_TYPES[typeId].orgNoun[0].toUpperCase()}${TRACK_TYPES[typeId].orgNoun.slice(1)} name`} error={errors.organizationName} scope={eoi ? "private" : "public"}><input {...aria("organizationName", errors)} maxLength={160} defaultValue={d.app?.organization_name} autoComplete="organization" /></Field>
          <Field id="website" label="Website (optional)" error={errors.website} scope={eoi ? "private" : "public"}><input {...aria("website", errors)} type="url" maxLength={300} defaultValue={d.app?.website ?? ""} placeholder="https://" /></Field>
          <Field id="city" label="City (optional)" scope={eoi ? "private" : "public"}><input {...aria("city", errors)} maxLength={100} defaultValue={d.app?.city ?? ""} /></Field>
          <Field id="state" label="State or region (optional)" scope={eoi ? "private" : "public"}><input {...aria("state", errors)} maxLength={100} defaultValue={d.app?.state_region ?? ""} /></Field>
          <Field id="repName" label="Your name" error={errors.repName} scope={eoi ? "private" : "conditional"}><input {...aria("repName", errors)} maxLength={160} defaultValue={d.details?.representative_name ?? ""} autoComplete="name" /></Field>
          <Field id="repTitle" label="Your title or office" error={errors.repTitle} scope={eoi ? "private" : "conditional"}><input {...aria("repTitle", errors)} maxLength={160} defaultValue={d.details?.representative_title ?? ""} /></Field>
          <Field id="repEmail" label="Work email" error={errors.repEmail} scope="private"><input {...aria("repEmail", errors)} type="email" maxLength={200} defaultValue={d.details?.representative_email ?? ""} autoComplete="email" /></Field>
          <Field id="repPhone" label="Work phone (optional)" scope="private"><input {...aria("repPhone", errors)} type="tel" maxLength={40} defaultValue={d.details?.representative_phone ?? ""} autoComplete="tel" /></Field>
        </div>
        {!eoi && <fieldset className="nx-field nx-checkgroup"><legend>Authority and public display</legend>
          <label className="nx-check"><input type="checkbox" {...aria("authorized", errors)} defaultChecked={d.details?.representative_authorized} />I'm authorized to represent this {TRACK_TYPES[typeId].orgNoun} in Opsirix Nexus.</label>
          {errors.authorized && <p className="nx-error" id="authorized-error" role="alert"><AlertCircle aria-hidden />{errors.authorized}</p>}
          <label className="nx-check"><input type="checkbox" name="repConsent" defaultChecked={d.details?.rep_public_consent} />I agree to show my name and title on the public listing.</label>
          <label className="nx-check"><input type="checkbox" name="orgConsent" defaultChecked={d.details?.org_public_consent} />The {TRACK_TYPES[typeId].orgNoun} has agreed to show my name publicly.</label>
          <p className="nx-hint">Your name appears only if both boxes are ticked and Opsirix has confirmed your role. Otherwise the listing shows a general "Request an introduction" contact.</p>
        </fieldset>}
        <StepActions saving={saving} />
      </form>}

      {step === "details" && typeId && <form onSubmit={saveDetails} noValidate className="nexus-work-card" key={`det-${d.details?.updated_at}`}>
        <h2>{typeId === "university" ? "Campus and program" : typeId === "banking" ? "Service areas and who you serve" : "Coverage focus"}</h2>
        {!d.details && <p className="nx-error" role="alert">Complete Organization and role first.</p>}
        <div className="nexus-form-grid">
          {typeId === "university" ? <>
            <Field id="campus" label="Campus or program" error={errors.campus} scope={eoi ? "private" : "public"}><input {...aria("campus", errors)} maxLength={200} defaultValue={d.details?.campus_or_program ?? ""} /></Field>
            <Field id="reach" label="Program reach" error={errors.reach} scope={eoi ? "private" : "public"}><select {...aria("reach", errors)} defaultValue={d.details?.geographic_reach ?? ""}><option value="">Choose one</option>{REACH_OPTIONS.map((o) => <option key={o}>{o}</option>)}</select></Field>
          </> : <>
            <Field id="serviceAreas" label={typeId === "insurance" ? "States you serve, comma separated" : "Service areas, comma separated"} hint={typeId === "insurance" ? "Only states where you hold a license can be approved." : "For example branch regions or states."} error={errors.serviceAreas} scope="public"><input {...aria("serviceAreas", errors, true)} maxLength={500} defaultValue={d.details?.service_areas.join(", ") ?? ""} /></Field>
            <Field id="industries" label={typeId === "insurance" ? "Industries you focus on (optional)" : "Industries you focus on (optional)"} scope="public"><input {...aria("industries", errors)} maxLength={500} defaultValue={d.details?.industries.join(", ") ?? ""} /></Field>
          </>}
          <Field id="languages" label="Languages, comma separated (optional)" scope={eoi ? "private" : "public"}><input {...aria("languages", errors)} maxLength={300} defaultValue={d.details?.languages.join(", ") ?? ""} /></Field>
          {typeId === "banking" && <>
            <Field id="introMethod" label="Preferred introduction method" scope="private"><select {...aria("introMethod", errors)} defaultValue={d.details?.introduction_method ?? ""}><option value="">Choose one</option><option>Email</option><option>Phone call</option><option>Scheduled meeting</option></select></Field>
            <Field id="responseTime" label="Typical response time" scope="private"><select {...aria("responseTime", errors)} defaultValue={d.details?.response_time ?? ""}><option value="">Choose one</option><option>1 business day</option><option>2 to 3 business days</option><option>Within a week</option></select></Field>
          </>}
          {typeId === "insurance" && <Field id="carriers" label="Carriers or markets you work with (optional)" scope="private"><input {...aria("carriers", errors)} maxLength={500} defaultValue={d.details?.carriers_markets ?? ""} /></Field>}
        </div>
        {typeId === "university"
          ? <CheckGroup id="audiences" legend={TRACK_TYPES.university.audienceLabel} options={TRACK_TYPES.university.audiences} selected={d.details?.audiences ?? []} error={errors.audiences} scope={eoi ? "private" : "public"} />
          : <CheckGroup id="segments" legend={TRACK_TYPES[typeId].audienceLabel} options={TRACK_TYPES[typeId].audiences} selected={d.details?.segments_served ?? []} error={errors.segments} scope="public" />}
        {typeId === "university" && !eoi && <fieldset className="nx-field nx-checkgroup"><legend>Written agreement with Opsirix<Vis scope="private" /></legend>
          <label className="nx-check"><input type="radio" name="agreement" value="pending" defaultChecked={d.details?.agreement_status !== "none"} />We have, or are arranging, a written agreement or approval</label>
          <label className="nx-check"><input type="radio" name="agreement" value="none" defaultChecked={!d.details || d.details.agreement_status === "none"} />Not yet</label>
          <p className="nx-hint">An official university listing needs documented authorization from the institution, recorded by Opsirix. Current status: {STATUS_LABELS[d.details?.agreement_status ?? "none"]}.</p>
        </fieldset>}
        <StepActions saving={saving} />
      </form>}

      {step === "choices" && typeId && <ChoicesStep d={d} typeId={typeId} eoi={eoi} error={issues.find((x) => x.field === "choices") && errors.choices} onChange={reload} onNext={() => { void recordStep(d.app!.id, "evidence"); go("evidence"); }} />}

      {step === "evidence" && typeId && (eoi
        ? <section className="nexus-work-card"><h2>Authority</h2><p>No authority evidence is needed for a private expression of interest. If the institution later wants an official listing, someone authorized to represent it will apply and provide documented authorization.</p><div className="nexus-form-actions"><Button onClick={() => { void recordStep(d.app!.id, "preview"); go("preview"); }}>Continue</Button></div></section>
        : <>
          <form onSubmit={saveEvidence} noValidate className="nexus-work-card" key={`ev-${d.details?.updated_at}`}>
            <h2>How can we confirm your role?<Vis scope="private" /></h2>
            <p>Choose whichever is easiest. A formal letter is one option, not a requirement. Only Opsirix reviewers see this.</p>
            <fieldset className="nx-field" aria-invalid={Boolean(errors.method) || undefined} aria-describedby={errors.method ? "method-error" : undefined}><legend className="sr-only">Evidence method</legend>
              {EVIDENCE_METHODS.map((m) => <label key={m.id} className="nx-check nx-check-block"><input type="radio" name="method" value={m.id} defaultChecked={d.details?.authority_evidence_method === m.id} /><span><strong>{m.label}</strong><small>{m.hint}</small></span></label>)}
              {errors.method && <p className="nx-error" id="method-error" role="alert"><AlertCircle aria-hidden />{errors.method}</p>}
            </fieldset>
            <Field id="detail" label="Details for the reviewer" error={errors.detail}><textarea {...aria("detail", errors)} maxLength={1000} defaultValue={d.details?.authority_evidence_detail ?? ""} /></Field>
            <p className="nx-hint">Review status: {STATUS_LABELS[d.details?.authority_review_status ?? "pending"]}. Changing your role details sends them back for review.</p>
            <StepActions saving={saving} />
          </form>
          <UploadCard d={d} type="authority_evidence" title={typeId === "university" ? "Authority or institutional authorization documents (optional)" : "Authority documents (optional)"} onDone={reload} />
          {typeId === "insurance" && <LicensesCard d={d} onChange={reload} error={issues.find((x) => x.field === "licenses")?.message} />}
        </>)}

      {step === "preview" && typeId && <form onSubmit={savePreview} noValidate className="nexus-work-card" key={`pv-${d.revision?.updated_at}-${d.app?.updated_at}`}>
        {eoi ? <>
          <h2>Your expression of interest<Vis scope="private" /></h2>
          <p>Nothing from an expression of interest is public. Tell us what you'd like to explore with founders, students, or local businesses.</p>
          <Field id="interest" label="What you're interested in" error={errors.interest}><textarea {...aria("interest", errors)} maxLength={1500} defaultValue={d.app?.professional_summary ?? ""} /></Field>
        </> : <>
          <h2>Public profile preview</h2>
          <p>This is how the listing would look once every part is approved and the type opens. Until then, nothing is public.</p>
          <Field id="summary" label="Public summary" hint="Describe what you offer founders in plain language. Avoid promising approval, admission, or coverage." error={errors.summary} scope="public"><textarea {...aria("summary", errors, true)} maxLength={1500} defaultValue={d.revision?.professional_summary ?? ""} /></Field>
          <PreviewCard d={d} typeId={typeId} />
        </>}
        <StepActions saving={saving} />
      </form>}

      {step === "submit" && <section className="nexus-work-card">
        <h2>{eoi ? "Send your expression of interest" : "Submit for review"}</h2>
        <p>{eoi ? "Opsirix will read it privately. It will not create a listing." : "Opsirix reviews the application, your partner type, your role, any licenses, the profile, and each choice separately. You'll see messages here."}</p>
        {issues.length ? <ul className="nx-issues">{issues.map((x) => <li key={x.field}><AlertCircle aria-hidden /><button type="button" onClick={() => go(x.step)}>{ONBOARDING_STEPS.find((s) => s.id === x.step)?.label}: {x.message}</button></li>)}</ul> : <p className="nx-ok"><Check aria-hidden />Everything needed is filled in.</p>}
        <div className="nexus-form-actions"><Button onClick={submitAll} disabled={saving || Boolean(issues.length)}>{eoi ? "Send privately" : "Submit for review"}</Button></div>
      </section>}

      <div className="nx-stepnav">
        {stepIndex > 0 && <Button variant="ghost" onClick={() => go(ONBOARDING_STEPS[stepIndex - 1].id)}>Back</Button>}
        <Link to="/partner">Save and return later</Link>
      </div>
    </div>}
  </WorkspaceShell>;
}

function Messages({ decisions }: { decisions: Decision[] }) {
  if (!decisions.length) return null;
  return <section className="nexus-work-card nx-messages" aria-label="Messages from Opsirix"><h2>Messages from Opsirix</h2><ul>{decisions.map((m) => <li key={m.id}>
    <span className={`nexus-status ${m.decision}`}>{STATUS_LABELS[m.decision] ?? m.decision.replaceAll("_", " ")}</span>
    <strong>{m.subject_label ?? m.subject_type.replaceAll("_", " ")}</strong>
    {m.applicant_message && <p>{m.applicant_message}</p>}
    <time className="nexus-muted">{new Date(m.created_at).toLocaleDateString()}</time>
  </li>)}</ul></section>;
}

function PreviewCard({ d, typeId }: { d: Data; typeId: TrackTypeId }) {
  const det = d.details; const cfg = TRACK_TYPES[typeId];
  const showRep = det?.rep_public_consent && det.org_public_consent;
  const chosen = d.services.filter((s) => d.selections.some((x) => x.service_id === s.id));
  return <div className="nx-preview">
    <article className="nx-preview-card" aria-label="Public listing preview">
      <span className="nx-vis public"><Eye aria-hidden />What visitors would see</span>
      <p className="nexus-kicker">{cfg.label}</p>
      <h3>{d.app?.organization_name || "Organization name"}</h3>
      {typeId === "university" && det?.campus_or_program && <p>{det.campus_or_program} · {det.geographic_reach}</p>}
      {(d.app?.city || d.app?.state_region) && <p className="nexus-muted">{[d.app?.city, d.app?.state_region].filter(Boolean).join(", ")}</p>}
      <p>{d.revision?.professional_summary || "Your public summary appears here."}</p>
      {chosen.length > 0 && <ul className="nx-tags">{chosen.map((s) => <li key={s.id}>{s.client_label ?? s.label}</li>)}</ul>}
      <p className="nx-contact">{showRep ? <>Contact: {det?.representative_name}{det?.representative_title ? `, ${det.representative_title}` : ""} <small>(shown after Opsirix confirms your role)</small></> : "Contact: Request an introduction"}</p>
      <button type="button" disabled className="nx-disabled-cta">Request an introduction (not open yet)</button>
      <p className="nx-disclaimer">{cfg.disclaimer}</p>
    </article>
    <aside className="nx-private-panel"><h3><Lock aria-hidden />Only Opsirix sees</h3><ul>
      <li>Your work email and phone</li>{!showRep && <li>Your name and title</li>}
      <li>How we can confirm your role, and any uploaded documents</li>
      {typeId === "insurance" && <li>License numbers, producer IDs, and expiry dates</li>}
      {typeId === "university" && <li>Agreement status with Opsirix</li>}
      {typeId === "banking" && <li>Preferred introduction method and response time</li>}
      {typeId === "insurance" && <li>Carriers and markets</li>}
      <li>Descriptions you add to each choice until Opsirix approves them</li>
    </ul></aside>
  </div>;
}

function ChoicesStep({ d, typeId, eoi, onChange, onNext }: { d: Data; typeId: TrackTypeId; eoi: boolean; error?: string | false; onChange: () => Promise<void>; onNext: () => void }) {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [undo, setUndo] = useState<Selection | null>(null);
  const mine = d.selections.filter((s) => s.partner_type === typeId);
  const byService = new Map(mine.map((s) => [s.service_id, s]));
  const q = query.trim().toLowerCase();
  const visible = useMemo(() => d.services.filter((s) => !q || [s.label, s.client_label ?? "", s.description, ...s.search_aliases].join(" ").toLowerCase().includes(q)), [d.services, q]);

  async function toggle(service: Service) {
    setBusy(service.id); setMessage("");
    const existing = byService.get(service.id);
    const res = existing ? await supabase.from("partner_service_selections").delete().eq("id", existing.id) : await supabase.from("partner_service_selections").insert({ user_id: d.userId, application_id: d.app!.id, partner_type: typeId, service_id: service.id, accepting_inquiries: !eoi });
    if (res.error) setMessage(res.error.message); else { setUndo(existing ?? null); setMessage(existing ? `Removed ${service.label}.` : `Added ${service.label}.`); }
    await onChange(); setBusy(null);
  }
  async function restore() {
    if (!undo) return;
    const res = await supabase.from("partner_service_selections").insert({ user_id: undo.user_id, application_id: undo.application_id, partner_type: undo.partner_type, service_id: undo.service_id, offering_description: undo.offering_description, accepting_inquiries: undo.accepting_inquiries });
    setMessage(res.error ? res.error.message : "Restored."); setUndo(null); await onChange();
  }
  async function saveDetail(sel: Selection, form: HTMLFormElement) {
    const f = new FormData(form);
    const res = await supabase.from("partner_service_selections").update({ offering_description: String(f.get("offering") ?? "").trim() || null, accepting_inquiries: eoi ? false : Boolean(f.get("accepting")) }).eq("id", sel.id);
    setMessage(res.error ? res.error.message : "Saved. Edited choices go back to draft until Opsirix reviews them."); await onChange();
  }
  async function suggest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget; const f = new FormData(form);
    const label = String(f.get("otherLabel") ?? "").trim(); const description = String(f.get("otherDescription") ?? "").trim();
    if (label.length < 2 || description.length < 20) { setMessage("Add a name and a description of at least 20 characters for the other item."); return; }
    const res = await supabase.from("partner_service_suggestions").insert({ user_id: d.userId, partner_type: typeId, category_id: String(f.get("otherCategory") ?? "") || null, label, description });
    setMessage(res.error ? res.error.message : "Sent to Opsirix for review. It will not appear on your profile unless approved."); if (!res.error) form.reset(); await onChange();
  }
  const heading = typeId === "university" ? "Ways you'd like to collaborate" : typeId === "banking" ? "Topics you accept inquiries about" : "Coverage inquiries you handle";
  const note = typeId === "university" ? "Choose only programs your institution actually runs." : typeId === "banking" ? "Each choice is a topic you accept inquiries about, not a product offer or an eligibility statement." : "Each choice is a coverage inquiry you handle. It must match lines and states you're licensed for. It does not mean a policy is available.";
  return <section className="nexus-work-card nx-choices">
    <h2>{heading}</h2><p>{note} {eoi ? "Your choices stay private." : "Prices are not collected for this partner type."}</p>
    <div className="nx-summary" aria-live="polite"><strong>{mine.length} selected</strong>{mine.length > 0 && <ul>{mine.map((s) => { const svc = d.services.find((x) => x.id === s.service_id); return <li key={s.id}>{svc?.label ?? s.service_id}<span className={`nexus-status ${s.review_status}`}>{STATUS_LABELS[s.review_status]}</span><button type="button" onClick={() => svc && toggle(svc)} aria-label={`Remove ${svc?.label}`}><X /></button></li>; })}</ul>}
      {undo && <Button size="sm" variant="ghost" onClick={restore}><RotateCcw />Undo remove</Button>}</div>
    {message && <p className="nx-notice-line" role="status">{message}</p>}
    <label className="nexus-search nx-choice-search"><Search aria-hidden /><span className="sr-only">Search choices</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search choices" /></label>
    {d.categories.map((cat) => { const items = visible.filter((s) => s.category_id === cat.id); if (!items.length) return null; return <fieldset key={cat.id} className="nx-category"><legend>{cat.label}</legend>
      {items.map((s) => { const sel = byService.get(s.id); return <div key={s.id} className={`nx-choice ${sel ? "selected" : ""}`}>
        <label className="nx-check nx-check-block"><input type="checkbox" checked={Boolean(sel)} disabled={busy === s.id} onChange={() => toggle(s)} /><span><strong>{s.label}</strong><small>{s.description}</small>{s.client_label && s.client_label !== s.label && <small>Founders would see: {s.client_label}</small>}</span></label>
        {sel && <details><summary>Add optional detail</summary><form onSubmit={(e) => { e.preventDefault(); void saveDetail(sel, e.currentTarget); }}>
          <label>How you handle this (optional)<Vis scope="public" /><textarea name="offering" maxLength={1000} defaultValue={sel.offering_description ?? ""} /></label>
          {!eoi && <label className="nx-check"><input type="checkbox" name="accepting" defaultChecked={sel.accepting_inquiries} />Accepting inquiries on this topic</label>}
          <Button size="sm" type="submit" variant="outline">Save detail</Button></form></details>}
      </div>; })}
    </fieldset>; })}
    {!visible.length && <p className="nexus-muted">No choices match that search.</p>}
    <details className="nx-other"><summary>Something else not listed</summary><form onSubmit={suggest}>
      <p className="nx-hint">Other items are reviewed by Opsirix before they can ever appear.</p>
      <label>Category<select name="otherCategory"><option value="">Not sure</option>{d.categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
      <label>Name<input name="otherLabel" maxLength={120} /></label>
      <label>Description<textarea name="otherDescription" maxLength={1000} /></label>
      <Button size="sm" type="submit" variant="outline">Send for review</Button></form>
      {d.suggestions.filter((s) => s.partner_type === typeId).map((s) => <p key={s.id} className="nexus-muted">{s.label}: {STATUS_LABELS[s.status]}</p>)}
    </details>
    <div className="nexus-form-actions"><Button onClick={onNext} disabled={!mine.length}>Continue</Button></div>
  </section>;
}

function UploadCard({ d, type, title, onDone }: { d: Data; type: string; title: string; onDone: () => Promise<void> }) {
  const [msg, setMsg] = useState("");
  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !d.app) return;
    if (file.size > 10 * 1024 * 1024) { setMsg("Choose a file smaller than 10 MB."); return; }
    const path = `${d.userId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const up = await supabase.storage.from("partner-credentials").upload(path, file);
    if (up.error) { setMsg(up.error.message); return; }
    const ins = await supabase.from("partner_credentials").insert({ application_id: d.app.id, user_id: d.userId, credential_type: type, storage_path: path, original_filename: file.name });
    setMsg(ins.error ? ins.error.message : "Uploaded privately."); e.target.value = ""; await onDone();
  }
  const files = d.credentials.filter((c) => c.credential_type === type);
  return <section className="nexus-work-card"><h2>{title}<Vis scope="private" /></h2>
    <label className="nexus-upload"><FileUp aria-hidden /> Upload a PDF or image, up to 10 MB<input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={upload} /></label>
    {msg && <p className="nx-notice-line" role="status">{msg}</p>}
    {files.length > 0 && <ul className="nx-list">{files.map((f) => <li key={f.id}>{f.original_filename}<span className={`nexus-status ${f.status}`}>{STATUS_LABELS[f.status]}</span></li>)}</ul>}
  </section>;
}

function LicensesCard({ d, onChange, error }: { d: Data; onChange: () => Promise<void>; error?: string }) {
  const [errs, setErrs] = useState<Errors>({});
  const [msg, setMsg] = useState("");
  async function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget; const f = new FormData(form); const v = (k: string) => String(f.get(k) ?? "").trim();
    const next: Errors = {};
    if (!/^[A-Za-z]{2}$/.test(v("licState"))) next.licState = "Use the two-letter state code.";
    if (!v("licLine")) next.licLine = "Add the line of authority.";
    if (!v("licNumber")) next.licNumber = "Add the license number.";
    setErrs(next); if (Object.keys(next).length) return;
    const res = await supabase.from("partner_licenses").insert({ application_id: d.app!.id, user_id: d.userId, state_code: v("licState").toUpperCase(), line_of_authority: v("licLine"), license_number: v("licNumber"), producer_id: v("licProducer") || null, expires_on: v("licExpires") || null, review_status: "pending" });
    setMsg(res.error ? res.error.message : "License added for review."); if (!res.error) form.reset(); await onChange();
  }
  async function remove(id: string) { const res = await supabase.from("partner_licenses").delete().eq("id", id); setMsg(res.error ? res.error.message : "Removed."); await onChange(); }
  return <section className="nexus-work-card"><h2>State licenses<Vis scope="private" /></h2>
    <p>Add each state and line of authority. Opsirix checks them before any line can be listed. Expired licenses are removed from public view automatically.</p>
    {error && <p className="nx-error" role="alert"><AlertCircle aria-hidden />{error}</p>}
    {d.licenses.length > 0 && <div className="nexus-table-wrap"><table><thead><tr><th>State</th><th>Line</th><th>License</th><th>Producer ID</th><th>Expires</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{d.licenses.map((l) => <tr key={l.id}><td>{l.state_code}</td><td>{l.line_of_authority}</td><td>{l.license_number}</td><td>{l.producer_id ?? ""}</td><td>{l.expires_on ?? ""}</td><td><span className={`nexus-status ${l.review_status}`}>{STATUS_LABELS[l.review_status]}</span></td><td>{l.review_status !== "verified" && <Button size="icon" variant="ghost" onClick={() => remove(l.id)} aria-label={`Remove ${l.state_code} license`}><Trash2 /></Button>}</td></tr>)}</tbody></table></div>}
    <form onSubmit={add} noValidate className="nexus-form-grid">
      <Field id="licState" label="State code" error={errs.licState}><input {...aria("licState", errs)} maxLength={2} placeholder="TX" /></Field>
      <Field id="licLine" label="Line of authority" error={errs.licLine}><input {...aria("licLine", errs)} maxLength={120} placeholder="Property and casualty" /></Field>
      <Field id="licNumber" label="Resident license number" error={errs.licNumber}><input {...aria("licNumber", errs)} maxLength={60} /></Field>
      <Field id="licProducer" label="National producer number (optional)"><input {...aria("licProducer", errs)} maxLength={60} /></Field>
      <Field id="licExpires" label="Expiry date (optional)"><input {...aria("licExpires", errs)} type="date" /></Field>
      <div className="nexus-form-actions"><Button type="submit" variant="outline">Add license</Button></div>
    </form>
    {msg && <p className="nx-notice-line" role="status">{msg}</p>}
  </section>;
}

function LockedSummary({ d, typeId, eoi }: { d: Data; typeId: TrackTypeId; eoi: boolean }) {
  const claim = d.claims.find((c) => c.partner_type_id === typeId);
  const rows: [string, string][] = [
    ["Application", STATUS_LABELS[d.app!.status]],
    ...(!eoi ? [["Partner type claim", claim ? STATUS_LABELS[claim.review_status] : "Not submitted"], ["Your role", STATUS_LABELS[d.details?.authority_review_status ?? "pending"]], ["Profile", d.revision ? STATUS_LABELS[d.revision.status] : "No pending changes"]] as [string, string][] : []),
    ...(typeId === "university" && !eoi ? [["Written agreement", STATUS_LABELS[d.details?.agreement_status ?? "none"]]] as [string, string][] : []),
    ...(typeId === "insurance" ? d.licenses.map((l) => [`License ${l.state_code} ${l.line_of_authority}`, STATUS_LABELS[l.review_status]] as [string, string]) : []),
    ...d.selections.filter((s) => s.partner_type === typeId).map((s) => [d.services.find((x) => x.id === s.service_id)?.label ?? s.service_id, STATUS_LABELS[s.review_status]] as [string, string]),
  ];
  return <section className="nexus-work-card"><h2>{eoi ? "Expression of interest sent" : "In review"}</h2>
    <p>{eoi ? "This stays private. It does not create a listing or make the university an Opsirix partner." : "You can't edit while Opsirix is reviewing. If a reviewer asks for changes, this page opens for editing again."}</p>
    <dl className="nx-review-list">{rows.map(([k, v], i) => <div key={i}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
    {!eoi && <Link to="/partner/profile">View your profile versions</Link>}
  </section>;
}
