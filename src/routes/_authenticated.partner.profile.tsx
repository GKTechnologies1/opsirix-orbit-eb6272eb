import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AlertCircle, Eye, Lock } from "lucide-react";
import { WorkspaceShell } from "@/components/nexus/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { STATUS_LABELS, splitList } from "@/lib/nexus-tracks";

type T = Database["public"]["Tables"];
type Profile = T["partner_profiles"]["Row"];
type Revision = T["partner_profile_revisions"]["Row"];
type Claim = T["partner_listing_types"]["Row"];
type Decision = T["partner_review_decisions"]["Row"];

export const Route = createFileRoute("/_authenticated/partner/profile")({
  head: () => ({ meta: [
    { title: "Your Public Profile | Opsirix Nexus" },
    { name: "description", content: "Compare your approved Nexus profile with pending changes." },
    { property: "og:title", content: "Your Public Profile | Opsirix Nexus" },
    { property: "og:description", content: "Compare your approved Nexus profile with pending changes." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ProfilePage,
});

type State = { userId: string; appId: string | null; profile: Profile | null; revision: Revision | null; isPublic: boolean; claims: (Claim & { isPublic: boolean })[]; types: Record<string, string>; decisions: Decision[] };

function ProfilePage() {
  const [s, setS] = useState<State | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser(); if (!auth.user) return;
    const uid = auth.user.id;
    const [app, profile, revision, claims, types, isPublic] = await Promise.all([
      supabase.from("partner_applications").select("id").eq("user_id", uid).maybeSingle(),
      supabase.from("partner_profiles").select("*").eq("user_id", uid).maybeSingle(),
      supabase.from("partner_profile_revisions").select("*").eq("user_id", uid).in("status", ["draft", "submitted", "changes_requested"]).maybeSingle(),
      supabase.from("partner_listing_types").select("*").eq("user_id", uid),
      supabase.from("service_partner_types").select("id,label"),
      supabase.rpc("profile_is_public", { _user: uid }),
    ]);
    const withPublic = await Promise.all((claims.data ?? []).map(async (c) => ({ ...c, isPublic: Boolean((await supabase.rpc("listing_type_is_public", { _user: uid, _type: c.partner_type_id })).data) })));
    const decisions = app.data ? (await supabase.from("partner_review_decisions").select("*").eq("application_id", app.data.id).in("subject_type", ["profile_revision", "listing", "listing_type"]).order("created_at", { ascending: false })).data ?? [] : [];
    setS({ userId: uid, appId: app.data?.id ?? null, profile: profile.data, revision: revision.data, isPublic: Boolean(isPublic.data), claims: withPublic, types: Object.fromEntries((types.data ?? []).map((t) => [t.id, t.label])), decisions });
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!s) return;
    const f = new FormData(e.currentTarget); const intent = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value");
    const v = (k: string) => String(f.get(k) ?? "").trim();
    const next: Record<string, string> = {};
    if (!v("organization")) next.organization = "Add the organization name.";
    if (v("summary").length < 40) next.summary = "Write at least 40 characters.";
    setErrors(next); if (Object.keys(next).length) return;
    const fields = { display_name: v("organization"), organization_name: v("organization"), city: v("city") || null, state_region: v("state") || null, service_areas: splitList(v("areas")), professional_summary: v("summary"), status: intent === "submit" ? "submitted" : "draft" };
    const res = s.revision
      ? await supabase.from("partner_profile_revisions").update(fields).eq("id", s.revision.id)
      : await supabase.from("partner_profile_revisions").insert({ ...fields, user_id: s.userId, application_id: s.appId });
    setMsg(res.error ? res.error.message : intent === "submit" ? "Sent for review. Visitors keep seeing your approved version until Opsirix approves the change." : "Draft saved. Your approved version is unchanged.");
    await load();
  }
  async function discard() { if (!s?.revision) return; const res = await supabase.from("partner_profile_revisions").delete().eq("id", s.revision.id); setMsg(res.error ? res.error.message : "Draft discarded."); await load(); }
  async function withdraw(c: Claim) {
    if (!window.confirm(`Withdraw ${s?.types[c.partner_type_id] ?? c.partner_type_id}? It will stop appearing publicly right away.`)) return;
    const res = await supabase.from("partner_listing_types").update({ review_status: "withdrawn" }).eq("id", c.id);
    setMsg(res.error ? res.error.message : "Withdrawn. It is no longer public."); await load();
  }

  if (!s) return <WorkspaceShell eyebrow="Partner workspace" title="Your profile"><p className="nexus-muted">Loading.</p></WorkspaceShell>;
  const base = s.revision ?? s.profile;
  const changed = (k: keyof Revision & keyof Profile) => s.revision && s.profile && JSON.stringify(s.revision[k]) !== JSON.stringify(s.profile[k]);
  const editable = !s.revision || s.revision.status !== "submitted";

  return <WorkspaceShell eyebrow="Partner workspace" title="Your profile">
    {msg && <p className="nx-notice-line" role="status">{msg}</p>}
    <div className="nx-versions">
      <section className="nexus-work-card"><h2><Eye aria-hidden />Approved version</h2>
        <p className="nexus-muted">{!s.profile ? "Nothing approved yet." : s.profile.is_suspended ? "Suspended by Opsirix. Not visible to visitors." : s.isPublic ? "This is what visitors see now." : "Approved, but not visible to visitors yet. Every part must be approved and the partner type must be open."}</p>
        {s.profile && <dl className="nx-review-list"><div><dt>Name</dt><dd>{s.profile.organization_name}</dd></div><div><dt>Location</dt><dd>{[s.profile.city, s.profile.state_region].filter(Boolean).join(", ") || "Not shown"}</dd></div><div><dt>Service areas</dt><dd>{s.profile.service_areas.join(", ") || "Not shown"}</dd></div><div><dt>Summary</dt><dd>{s.profile.professional_summary}</dd></div></dl>}
      </section>
      <section className="nexus-work-card"><h2><Lock aria-hidden />Pending changes</h2>
        <p className="nexus-muted">{!s.revision ? "No pending changes." : `${STATUS_LABELS[s.revision.status]}. Only you and Opsirix can see this.`}</p>
        {s.revision && s.profile && <ul className="nx-list">{(["organization_name", "city", "state_region", "service_areas", "professional_summary"] as const).filter((k) => changed(k)).map((k) => <li key={k}>Changed: {k.replaceAll("_", " ")}</li>)}</ul>}
      </section>
    </div>
    {s.decisions.length > 0 && <section className="nexus-work-card nx-messages"><h2>Messages from Opsirix</h2><ul>{s.decisions.map((m) => <li key={m.id}><span className={`nexus-status ${m.decision}`}>{STATUS_LABELS[m.decision] ?? m.decision}</span><strong>{m.subject_label ?? m.subject_type}</strong>{m.applicant_message && <p>{m.applicant_message}</p>}</li>)}</ul></section>}
    <form className="nexus-application-form nexus-work-card" onSubmit={save} noValidate key={base?.updated_at ?? "new"}>
      <h2>Edit your profile</h2>
      <p>Edits are saved as a new draft. Your approved version stays public until Opsirix approves the change.</p>
      <div className="nexus-form-grid">
        <label>Organization name<input name="organization" defaultValue={base?.organization_name ?? ""} maxLength={160} aria-invalid={Boolean(errors.organization) || undefined} aria-describedby={errors.organization ? "organization-error" : undefined} disabled={!editable} />{errors.organization && <span className="nx-error" id="organization-error" role="alert"><AlertCircle aria-hidden />{errors.organization}</span>}</label>
        <label>City<input name="city" defaultValue={base?.city ?? ""} maxLength={100} disabled={!editable} /></label>
        <label>State or region<input name="state" defaultValue={base?.state_region ?? ""} maxLength={100} disabled={!editable} /></label>
        <label>Service areas, comma separated<input name="areas" defaultValue={base?.service_areas.join(", ") ?? ""} maxLength={500} disabled={!editable} /></label>
      </div>
      <label>Public summary<textarea name="summary" defaultValue={base?.professional_summary ?? ""} maxLength={1500} aria-invalid={Boolean(errors.summary) || undefined} aria-describedby={errors.summary ? "summary-error" : undefined} disabled={!editable} />{errors.summary && <span className="nx-error" id="summary-error" role="alert"><AlertCircle aria-hidden />{errors.summary}</span>}</label>
      {editable ? <div className="nexus-form-actions">{s.revision && <Button type="button" variant="ghost" onClick={discard}>Discard draft</Button>}<Button type="submit" name="intent" value="draft" variant="outline">Save draft</Button><Button type="submit" name="intent" value="submit">Submit changes for review</Button></div> : <p className="nexus-muted">Your changes are with Opsirix. You can edit again if a reviewer asks for changes.</p>}
    </form>
    <section className="nexus-work-card"><h2>Partner types</h2><p>Each type is reviewed on its own. Withdrawing a type removes it from public view immediately.</p>
      {s.claims.length ? <ul className="nx-list">{s.claims.map((c) => <li key={c.id}>{s.types[c.partner_type_id] ?? c.partner_type_id}<span className={`nexus-status ${c.review_status}`}>{STATUS_LABELS[c.review_status]}</span><span className="nexus-muted">{c.isPublic ? "Public" : "Not public"}</span>{c.review_status !== "withdrawn" && <Button size="sm" variant="ghost" onClick={() => withdraw(c)}>Withdraw</Button>}</li>)}</ul> : <p className="nexus-muted">No partner types claimed yet.</p>}
    </section>
  </WorkspaceShell>;
}
