import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { OperatingShell } from "@/components/workspace/OperatingShell";
import { Button } from "@/components/ui/button";
import { getMyLaunch, saveMyLaunch, LAUNCH_SCOPE_NOTICE, missingForSubmit, type LaunchAnswers } from "@/lib/launch.functions";

export const Route = createFileRoute("/_authenticated/launch")({
  head: () => ({ meta: [
    { title: "Launch intake | Opsirix" },
    { name: "description", content: "Tell Opsirix about your business so a person can review how we can help coordinate your launch." },
    { property: "og:title", content: "Launch intake | Opsirix" },
    { property: "og:description", content: "Tell Opsirix about your business so a person can review how we can help coordinate your launch." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: LaunchPage,
});

type Data = Awaited<ReturnType<typeof getMyLaunch>>;
const HELP: [NonNullable<LaunchAnswers["help_with"]>[number], string][] = [
  ["operations", "Operations setup"], ["documents", "Organizing documents"], ["tasks", "Task tracking"],
  ["professional", "Finding a professional"], ["bookkeeping", "Bookkeeping or payroll coordination"], ["other", "Something else"],
];
const STAGE = { idea: "Idea", forming: "Forming the business", operating_lt1: "Operating, under 1 year", operating_1plus: "Operating, 1 year or more" };
const YN3 = { yes: "Yes", no: "No", prefer_not: "Prefer not to say" };
const STATUS: Record<string, string> = { draft: "Draft, not sent", submitted: "Sent, waiting for Opsirix review", changes_requested: "Opsirix asked for a correction", reviewed: "Reviewed" };

function Choice<T extends string>({ name, label, value, options, onChange }: { name: string; label: string; value?: T; options: Record<T, string>; onChange: (v: T) => void }) {
  return <fieldset className="nexus-form"><legend>{label}</legend>
    <div className="launch-options">{(Object.keys(options) as T[]).map((k) => <label key={k} className="launch-option"><input type="radio" name={name} checked={value === k} onChange={() => onChange(k)} />{options[k]}</label>)}</div>
  </fieldset>;
}

function LaunchPage() {
  const load = useServerFn(getMyLaunch);
  const save = useServerFn(saveMyLaunch);
  const [data, setData] = useState<Data>();
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [a, setA] = useState<LaunchAnswers>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const d = await load(); setData(d); setError("");
      const open = d.intakes.find((i) => i.status === "draft" || i.status === "changes_requested");
      setA(open?.answers ?? {}); setName(open?.name_override || d.account.name); setEmail(open?.email_override || d.account.email);
    } catch { setError("Your Launch intake could not load."); }
  }, [load]);
  useEffect(() => { void refresh(); }, [refresh]);
  const set = <K extends keyof LaunchAnswers>(k: K, v: LaunchAnswers[K]) => setA((p) => ({ ...p, [k]: v }));

  const latest = data?.intakes[0];
  const editable = !latest || latest.status === "draft" || latest.status === "changes_requested";
  const missing = missingForSubmit(a, email);

  async function persist(submit: boolean) {
    setBusy(true); setMsg("");
    try {
      const r = await save({ data: { answers: a, name, email, submit } });
      if (!r.success) setMsg(r.error);
      else { setMsg(submit ? "Sent. A person at Opsirix will review your intake." : "Draft saved. You can come back to it any time."); setReviewing(false); await refresh(); }
    } catch { setMsg("That did not save. Check your connection and try again."); }
    setBusy(false);
  }

  return <OperatingShell mode="member" eyebrow="Opsirix Launch (preview)" title="Launch intake">
    <p className="text-muted-foreground max-w-2xl">Tell us about your business. A person at Opsirix reviews every intake. Nothing is decided automatically from your answers.</p>
    {error && <div role="alert" className="ops-panel"><p>{error}</p><Button onClick={() => void refresh()}>Try again</Button></div>}
    {!data && !error && <p aria-live="polite">Loading your intake.</p>}
    {data && latest && latest.status !== "draft" && <section className="ops-panel" aria-label="Intake status">
      <h2>{latest.ref ?? "Your intake"}: {STATUS[latest.status]}</h2>
      {latest.founder_message && <p><strong>Message from Opsirix:</strong> {latest.founder_message}</p>}
      {latest.status === "submitted" && <p>You will see a message here once it has been reviewed. You can't edit it while it is waiting.</p>}
      <ol className="text-sm text-muted-foreground">{latest.events.map((e, i) => <li key={i}>{new Date(e.created_at).toLocaleString()}: {e.event.replace(/_/g, " ")}</li>)}</ol>
    </section>}
    {data && editable && !reviewing && <form className="ops-panel nexus-form" onSubmit={(e) => { e.preventDefault(); setReviewing(true); }}>
      <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" /></label>
      <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} autoComplete="email" required /></label>
      <p className="text-sm text-muted-foreground">Filled in from your account. Change them only if we should use different details for this intake.</p>
      <Choice name="contact" label="How should we contact you?" value={a.preferred_contact} options={{ email: "Email", phone: "Phone" }} onChange={(v) => set("preferred_contact", v)} />
      <label>Phone (optional unless you choose phone)<input value={a.phone ?? ""} onChange={(e) => set("phone", e.target.value)} maxLength={40} autoComplete="tel" /></label>
      <label>Business name<input value={a.business_name ?? ""} disabled={a.not_formed} onChange={(e) => set("business_name", e.target.value)} maxLength={160} /></label>
      <label className="launch-option"><input type="checkbox" checked={!!a.not_formed} onChange={(e) => set("not_formed", e.target.checked)} />Not formed yet</label>
      <Choice name="stage" label="Stage" value={a.stage} options={STAGE} onChange={(v) => set("stage", v)} />
      <Choice name="reg" label="Is the registration location current or planned?" value={a.registration_status} options={{ current: "Current (already registered)", planned: "Planned" }} onChange={(v) => set("registration_status", v)} />
      <label>Country<input value={a.registration_country ?? ""} onChange={(e) => set("registration_country", e.target.value)} maxLength={80} /></label>
      <label>State or region (optional)<input value={a.registration_region ?? ""} onChange={(e) => set("registration_region", e.target.value)} maxLength={80} /></label>
      <Choice name="team" label="People working in the business" value={a.team_size} options={{ "0": "None yet", "1-5": "1 to 5", "6-20": "6 to 20", "20+": "More than 20" }} onChange={(v) => set("team_size", v)} />
      <fieldset className="nexus-form"><legend>What would you like help with? Choose any.</legend>
        <div className="launch-options">{HELP.map(([k, l]) => <label key={k} className="launch-option"><input type="checkbox" checked={a.help_with?.includes(k) ?? false} onChange={(e) => set("help_with", e.target.checked ? [...(a.help_with ?? []), k] : (a.help_with ?? []).filter((x) => x !== k))} />{l}</label>)}</div>
      </fieldset>
      {a.help_with?.includes("other") && <label>Briefly, what else? Please don't include confidential details.<input value={a.help_other ?? ""} onChange={(e) => set("help_other", e.target.value)} maxLength={300} /></label>}
      <Choice name="attorney" label="Are you already working with an attorney for this business matter?" value={a.attorney} options={YN3} onChange={(v) => set("attorney", v)} />
      <Choice name="cpa" label="Are you working with a CPA or tax professional?" value={a.cpa} options={YN3} onChange={(v) => set("cpa", v)} />
      <Choice name="nexus" label="Would you like help finding a professional through Nexus?" value={a.nexus_help} options={{ yes: "Yes", no: "No" }} onChange={(v) => set("nexus_help", v)} />
      <Choice name="imm" label="Optional: would you like help requesting an introduction to an independent immigration attorney?" value={a.immigration_attorney_intro} options={{ yes: "Yes", no: "No" }} onChange={(v) => set("immigration_attorney_intro", v)} />
      <aside className="ops-panel" aria-label="Scope notice"><h2>About Opsirix Launch</h2><p>{LAUNCH_SCOPE_NOTICE}</p></aside>
      {msg && <p role="status" className="nexus-form-message">{msg}</p>}
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" disabled={busy} onClick={() => void persist(false)}>{busy ? "Saving" : "Save draft"}</Button>
        <Button type="submit" disabled={busy}>Review before sending</Button>
      </div>
    </form>}
    {data && editable && reviewing && <section className="ops-panel" aria-label="Review before sending">
      <h2>Check your answers</h2>
      <dl className="grid gap-2">
        <div><dt>Name</dt><dd>{name || "Not given"}</dd></div>
        <div><dt>Email</dt><dd>{email || "Missing"}</dd></div>
        <div><dt>Contact by</dt><dd>{a.preferred_contact ?? "Missing"}{a.phone ? `, ${a.phone}` : ""}</dd></div>
        <div><dt>Business</dt><dd>{a.not_formed ? "Not formed yet" : a.business_name || "Missing"}</dd></div>
        <div><dt>Stage</dt><dd>{a.stage ? STAGE[a.stage] : "Missing"}</dd></div>
        <div><dt>Registration</dt><dd>{a.registration_status ? `${a.registration_status === "current" ? "Current" : "Planned"}: ` : ""}{[a.registration_region, a.registration_country].filter(Boolean).join(", ") || "Missing"}</dd></div>
        <div><dt>Help with</dt><dd>{a.help_with?.map((k) => HELP.find((h) => h[0] === k)?.[1]).join(", ") || "Missing"}</dd></div>
        <div><dt>Working with an attorney</dt><dd>{a.attorney ? YN3[a.attorney] : "Missing"}</dd></div>
        <div><dt>Working with a tax professional</dt><dd>{a.cpa ? YN3[a.cpa] : "Missing"}</dd></div>
        <div><dt>Nexus help</dt><dd>{a.nexus_help ?? "Missing"}</dd></div>
        <div><dt>Immigration attorney introduction</dt><dd>{a.immigration_attorney_intro ?? "Not answered"}</dd></div>
      </dl>
      {missing.length > 0 && <p role="alert">Still needed: {missing.join(", ")}.</p>}
      {msg && <p role="status" className="nexus-form-message">{msg}</p>}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => setReviewing(false)}>Edit answers</Button>
        <Button disabled={busy || missing.length > 0} onClick={() => void persist(true)}>{busy ? "Sending" : "Send to Opsirix"}</Button>
      </div>
    </section>}
    {data && !editable && msg && <p role="status">{msg}</p>}
  </OperatingShell>;
}
