import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { OperatingShell } from "@/components/workspace/OperatingShell";
import { Button } from "@/components/ui/button";
import { assignLaunch, getLaunchQueue, recordLaunchReview, LAUNCH_OUTCOMES } from "@/lib/launch.functions";

export const Route = createFileRoute("/_authenticated/staff/launch")({
  head: () => ({ meta: [
    { title: "Launch intake review | Opsirix Staff Console" },
    { name: "description", content: "Staff review queue for submitted Launch intakes." },
    { property: "og:title", content: "Launch intake review | Opsirix Staff Console" },
    { property: "og:description", content: "Staff review queue for submitted Launch intakes." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: StaffLaunch,
});

type Data = Awaited<ReturnType<typeof getLaunchQueue>>;
type Intake = Data["intakes"][number];
type Outcome = keyof typeof LAUNCH_OUTCOMES;

function StaffLaunch() {
  const load = useServerFn(getLaunchQueue);
  const [data, setData] = useState<Data>();
  const [error, setError] = useState("");
  const refresh = useCallback(async () => { try { setData(await load()); setError(""); } catch { setError("The Launch queue could not load."); } }, [load]);
  useEffect(() => { void refresh(); }, [refresh]);
  const waiting = data?.intakes.filter((i) => i.status === "submitted") ?? [];
  const other = data?.intakes.filter((i) => i.status !== "submitted") ?? [];

  return <OperatingShell mode="staff" eyebrow="Staff Console" title="Launch intake review (preview)">
    {error && <div role="alert" className="ops-panel"><p>{error}</p><Button onClick={() => void refresh()}>Try again</Button></div>}
    {!data && !error && <p aria-live="polite">Loading the queue.</p>}
    {data && !data.allowed && <div className="ops-panel" role="alert"><h2>Access restricted</h2><p>Launch review is limited to the Admin/CEO and Operations Lead.</p></div>}
    {data?.allowed && <>
      <p className="text-muted-foreground max-w-2xl">{data.isAdmin ? "You see every submitted intake and assign each to an Operations Lead." : "You see only intakes the Admin/CEO has assigned to you."} Outcome labels and reasons are internal. The founder sees only the message you write. Answers never set an outcome automatically, and an immigration-related answer is never a reason for "Outside current Opsirix scope".</p>
      <h2>Waiting for review ({waiting.length})</h2>
      {waiting.length === 0 && <p className="ops-panel">{data.isAdmin ? "No intakes are waiting." : "No intakes are assigned to you."}</p>}
      {waiting.map((i) => <IntakeCard key={i.id} intake={i} onDone={refresh} isAdmin={data.isAdmin} leads={data.leads} />)}
      <h2>Reviewed or returned ({other.length})</h2>
      {other.length === 0 && <p className="ops-panel">Nothing yet.</p>}
      {other.map((i) => <IntakeCard key={i.id} intake={i} onDone={refresh} isAdmin={data.isAdmin} leads={data.leads} />)}
    </>}
  </OperatingShell>;
}

function IntakeCard({ intake: i, onDone, isAdmin, leads }: { intake: Intake; onDone: () => Promise<void>; isAdmin: boolean; leads: { id: string; name: string }[] }) {
  const record = useServerFn(recordLaunchReview);
  const assign = useServerFn(assignLaunch);
  async function changeAssignee(id: string) {
    setMsg(""); const r = await assign({ data: { intakeId: i.id, assigneeId: id || null } });
    if (!r.success) setMsg(r.error); else await onDone();
  }
  const [kind, setKind] = useState<"outcome" | "changes_requested">("outcome");
  const [outcome, setOutcome] = useState<Outcome | "">("");
  const [reason, setReason] = useState("");
  const [founderMessage, setFounderMessage] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const a = i.answers;
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    try {
      const r = await record({ data: { intakeId: i.id, kind, outcome: kind === "outcome" ? (outcome || null) : null, reason, founderMessage } });
      if (!r.success) setMsg(r.error); else await onDone();
    } catch { setMsg("Check that an outcome is chosen and both texts have at least 10 characters."); }
    setBusy(false);
  }
  return <article className="ops-panel" aria-label={i.ref ?? "Launch intake"}>
    <h3>{i.ref} · {i.name || "Name not given"} · {i.status.replace(/_/g, " ")}</h3>
    <p className="text-sm">Assigned to: {i.assignee ? i.assignee.name : "Nobody yet"}</p>
    {isAdmin && i.status === "submitted" && <label className="nexus-form">Assign to Operations Lead<select value={i.assignee?.id ?? ""} onChange={(e) => void changeAssignee(e.target.value)}>
      <option value="">Unassigned</option>{leads.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
    </select></label>}
    <p className="text-sm text-muted-foreground">{i.email} · sent {i.submitted_at ? new Date(i.submitted_at).toLocaleString() : ""}</p>
    <dl className="grid gap-1 text-sm">
      <div><dt className="inline font-semibold">Business: </dt><dd className="inline">{a.not_formed ? "Not formed yet" : a.business_name}</dd></div>
      <div><dt className="inline font-semibold">Stage / team: </dt><dd className="inline">{a.stage} / {a.team_size}</dd></div>
      <div><dt className="inline font-semibold">Registration: </dt><dd className="inline">{a.registration_status} · {[a.registration_region, a.registration_country].filter(Boolean).join(", ")}</dd></div>
      <div><dt className="inline font-semibold">Help with: </dt><dd className="inline">{a.help_with?.join(", ")}{a.help_other ? ` (${a.help_other})` : ""}</dd></div>
      <div><dt className="inline font-semibold">Attorney / tax professional / Nexus: </dt><dd className="inline">{a.attorney} / {a.cpa} / {a.nexus_help}</dd></div>
      <div><dt className="inline font-semibold">Immigration attorney introduction requested: </dt><dd className="inline">{a.immigration_attorney_intro ?? "not answered"}</dd></div>
      <div><dt className="inline font-semibold">Contact: </dt><dd className="inline">{a.preferred_contact}{a.phone ? `, ${a.phone}` : ""}</dd></div>
    </dl>
    {i.reviews.length > 0 && <><h4>Review history</h4><ul className="text-sm">{i.reviews.map((r, n) => <li key={n}>{new Date(r.created_at).toLocaleString()} · {r.reviewer} · {r.kind === "outcome" ? LAUNCH_OUTCOMES[r.outcome as Outcome] : "Correction requested"}: {r.reason} <em>(founder saw: {r.founder_message})</em></li>)}</ul></>}
    <h4>Audit</h4><ul className="text-sm text-muted-foreground">{i.events.map((e, n) => <li key={n}>{new Date(e.created_at).toLocaleString()} · {e.actor} · {e.event.replace(/_/g, " ")}</li>)}</ul>
    {i.status === "submitted" && <form className="nexus-form" onSubmit={submit}>
      <fieldset><legend>Action</legend>
        <label className="mr-4"><input type="radio" checked={kind === "outcome"} onChange={() => setKind("outcome")} /> Record outcome</label>
        <label><input type="radio" checked={kind === "changes_requested"} onChange={() => setKind("changes_requested")} /> Ask founder for a correction</label>
      </fieldset>
      {kind === "outcome" && <label>Outcome (internal)<select value={outcome} onChange={(e) => setOutcome(e.target.value as Outcome)} required>
        <option value="">Choose</option>{(Object.keys(LAUNCH_OUTCOMES) as Outcome[]).map((k) => <option key={k} value={k}>{LAUNCH_OUTCOMES[k]}</option>)}
      </select></label>}
      <label>Reason (internal, required)<textarea value={reason} onChange={(e) => setReason(e.target.value)} minLength={10} maxLength={1000} required /></label>
      <label>Message the founder will see (required)<textarea value={founderMessage} onChange={(e) => setFounderMessage(e.target.value)} minLength={10} maxLength={1000} required /></label>
      {msg && <p role="status">{msg}</p>}
      <Button type="submit" disabled={busy}>{busy ? "Saving" : "Save review"}</Button>
    </form>}
  </article>;
}
