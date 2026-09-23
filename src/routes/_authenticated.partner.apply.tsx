import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Check, FileUp, Save } from "lucide-react";
import { WorkspaceShell } from "@/components/nexus/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Application = Database["public"]["Tables"]["partner_applications"]["Row"];

export const Route = createFileRoute("/_authenticated/partner/apply")({
  validateSearch: z.object({ ref: z.string().max(120).optional().catch(undefined) }),
  head: () => ({ meta: [
    { title: "Partner Application | Opsirix Nexus" },
    { name: "description", content: "Complete your private Opsirix Nexus partner application." },
    { property: "og:title", content: "Partner Application | Opsirix Nexus" },
    { property: "og:description", content: "Complete your private Opsirix Nexus partner application." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: PartnerApplicationPage,
});

function PartnerApplicationPage() {
  const navigate = useNavigate();
  const { ref } = Route.useSearch();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: existing } = await supabase.from("partner_applications").select("*").eq("user_id", data.user.id).maybeSingle();
      setApplication(existing);
      setLoading(false);
    });
  }, []);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const submit = form.get("intent") === "submit";
    const payload = {
      user_id: auth.user.id,
      organization_name: String(form.get("organizationName") ?? "").trim(),
      professional_type: String(form.get("professionalType") ?? "").trim(),
      website: String(form.get("website") ?? "").trim() || null,
      phone: String(form.get("phone") ?? "").trim() || null,
      city: String(form.get("city") ?? "").trim() || null,
      state_region: String(form.get("stateRegion") ?? "").trim() || null,
      years_experience: Number(form.get("yearsExperience")) || null,
      license_number: String(form.get("licenseNumber") ?? "").trim() || null,
      license_jurisdiction: String(form.get("licenseJurisdiction") ?? "").trim() || null,
      professional_summary: String(form.get("summary") ?? "").trim(),
      service_areas: String(form.get("serviceAreas") ?? "").split(",").map((v) => v.trim()).filter(Boolean),
      referral_code: ref ?? application?.referral_code ?? null,
      status: submit ? "submitted" as const : "draft" as const,
      submitted_at: submit ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };
    const query = application
      ? supabase.from("partner_applications").update(payload).eq("id", application.id).select().single()
      : supabase.from("partner_applications").insert(payload).select().single();
    const { data, error } = await query;
    if (error) setMessage(error.message);
    else if (data) {
      setApplication(data);
      if (ref) {
        const { data: campaign } = await supabase.from("partner_campaigns").select("id").eq("code", ref).eq("is_active", true).maybeSingle();
        if (campaign) await supabase.from("partner_attributions").upsert({ user_id: auth.user.id, application_id: data.id, campaign_id: campaign.id }, { onConflict: "user_id,campaign_id" });
      }
      if (submit) await navigate({ to: "/partner" });
      else setMessage("Draft saved.");
    }
    setPending(false);
  }

  async function uploadCredential(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !application) return;
    if (file.size > 10 * 1024 * 1024) { setMessage("Choose a file smaller than 10 MB."); return; }
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    setPending(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${auth.user.id}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from("partner-credentials").upload(path, file);
    if (!uploadError) {
      const { error } = await supabase.from("partner_credentials").insert({ application_id: application.id, user_id: auth.user.id, credential_type: "professional credential", storage_path: path, original_filename: file.name });
      setMessage(error ? error.message : "Credential uploaded privately.");
    } else setMessage(uploadError.message);
    setPending(false);
  }

  if (loading) return <WorkspaceShell eyebrow="Nexus registration" title="Loading your application"><p className="nexus-muted">Please wait.</p></WorkspaceShell>;
  const locked = application && !["draft", "changes_requested"].includes(application.status);
  return (
    <WorkspaceShell eyebrow="Nexus registration" title="Partner application">
      <div className="nexus-progress" aria-label="Application progress"><span className="active">1 Account</span><span className="active">2 Professional details</span><span>3 Credentials</span><span>4 Review</span></div>
      {locked ? <div className="nexus-notice"><Check />Your application is in review. You can monitor its status from your dashboard.</div> : (
        <form className="nexus-application-form" onSubmit={save}>
          <section className="nexus-work-card"><h2>Organization and practice</h2><div className="nexus-form-grid">
            <label>Organization name<input name="organizationName" required maxLength={160} defaultValue={application?.organization_name} /></label>
            <label>Professional type<select name="professionalType" required defaultValue={application?.professional_type}><option value="">Select one</option>{["Attorney","Immigration Attorney","CPA","Bookkeeper","Insurance Broker","Banking Partner","Technology Partner","University Partner","Other"].map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Website<input name="website" type="url" maxLength={300} defaultValue={application?.website ?? ""} /></label>
            <label>Phone<input name="phone" type="tel" maxLength={40} defaultValue={application?.phone ?? ""} /></label>
            <label>City<input name="city" maxLength={100} defaultValue={application?.city ?? ""} /></label>
            <label>State or region<input name="stateRegion" maxLength={100} defaultValue={application?.state_region ?? ""} /></label>
            <label>Years of experience<input name="yearsExperience" type="number" min="0" max="80" defaultValue={application?.years_experience ?? ""} /></label>
            <label>Service areas, comma separated<input name="serviceAreas" maxLength={500} defaultValue={application?.service_areas.join(", ") ?? ""} /></label>
          </div></section>
          <section className="nexus-work-card"><h2>Professional credentials</h2><div className="nexus-form-grid"><label>License or credential number<input name="licenseNumber" maxLength={120} defaultValue={application?.license_number ?? ""} /></label><label>Jurisdiction<input name="licenseJurisdiction" maxLength={120} defaultValue={application?.license_jurisdiction ?? ""} /></label></div>{application && <label className="nexus-upload"><FileUp />Upload supporting credential<input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={uploadCredential} /></label>}<p className="nexus-muted">PDF, PNG, or JPG. Maximum 10 MB. Files are private and available only to you and authorized reviewers.</p></section>
          <section className="nexus-work-card"><h2>About your work</h2><label>Professional summary<textarea name="summary" required minLength={80} maxLength={1500} defaultValue={application?.professional_summary} placeholder="Describe your work, the clients you support, and where you are licensed or qualified." /></label></section>
          <section className="nexus-work-card"><h2>Services you provide</h2><p>Choose specific services from the catalog for each type of firm you operate.</p><a href="/partner/services">Choose services</a></section>
          {message && <p className="nexus-form-message" role="status">{message}</p>}
          <div className="nexus-form-actions"><Button name="intent" value="draft" variant="outline" disabled={pending}><Save />Save draft</Button><Button name="intent" value="submit" disabled={pending}>Submit for review</Button></div>
        </form>
      )}
    </WorkspaceShell>
  );
}