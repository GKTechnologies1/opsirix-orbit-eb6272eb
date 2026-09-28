import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { OperatingShell } from "@/components/workspace/OperatingShell";
import { Button } from "@/components/ui/button";
import { getCore, saveCoreTask, submitCoreRequest, transitionCoreRequest } from "@/lib/grid-core.functions";

export const Route = createFileRoute("/_authenticated/core")({
  head: () => ({ meta: [
    { title: "Core requests | Opsirix" },
    { name: "description", content: "Operational requests handled by Opsirix staff, tracked as Flow tasks and closed by the company." },
    { property: "og:title", content: "Core requests | Opsirix" },
    { property: "og:description", content: "Operational requests handled by Opsirix staff, tracked as Flow tasks and closed by the company." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: CorePage,
});

type Data = Awaited<ReturnType<typeof getCore>>;
type Company = Data["companies"][number];
type Req = Company["requests"][number];
const STATUS: Record<string, string> = { submitted: "Submitted", accepted: "In progress", awaiting_owner: "Ready for your review", closed: "Closed", declined: "Declined", withdrawn: "Withdrawn" };
const TASK: Record<string, string> = { todo: "To do", in_progress: "In progress", blocked: "Blocked", done: "Done" };
type OnDone = (r: { success: boolean; error?: string }, ok: string) => Promise<void>;

function CorePage() {
  const load = useServerFn(getCore);
  const [data, setData] = useState<Data>();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [orgId, setOrgId] = useState<string>();
  const refresh = useCallback(async () => { try { setData(await load()); setError(""); } catch { setError("Core could not load. Try again."); } }, [load]);
  useEffect(() => { void refresh(); }, [refresh]);
  const company = useMemo(() => data?.companies.find((c) => c.id === orgId) ?? data?.companies.find((c) => c.requests.length) ?? data?.companies[0], [data, orgId]);
  const done: OnDone = async (r, ok) => { setMessage(r.success ? ok : r.error ?? "Something went wrong."); await refresh(); };

  return (
    <OperatingShell mode="company" eyebrow="Opsirix Core" title="Operational requests">
      <p className="text-muted-foreground max-w-2xl">Ask Opsirix to handle an operational job. Staff can only see and act on requests while you have given them company access (Companies → staff access), and removing that access stops them immediately. Accepted work runs as tasks on its own Flow board. You close the request when you're satisfied. Core does not open Vault files.</p>
      {message && <p role="status" className="rounded-md border border-border p-3 text-sm">{message}</p>}
      {error && <div role="alert" className="text-sm">{error} <Button size="sm" variant="secondary" onClick={() => void refresh()}>Retry</Button></div>}
      {!data && !error && <p>Loading Core…</p>}
      {data && !data.companies.length && <p>You don't have access to any company workspace yet.</p>}
      {data && company && (
        <>
          {data.companies.length > 1 && (
            <label className="ops-panel flex max-w-sm flex-col gap-1 text-sm">Company
              <select className="w-full" value={company.id} onChange={(e) => setOrgId(e.target.value)}>
                {data.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          )}
          <p className="text-sm text-muted-foreground">Your access: <strong>{company.role ? company.role[0].toUpperCase() + company.role.slice(1) : "Opsirix staff"}</strong>{company.canEdit ? " · can submit and close requests" : company.isStaff ? " · can accept and work on requests" : " · read only"}</p>
          {company.canEdit && <NewRequest company={company} onDone={done} />}
          {!company.requests.length && <p className="rounded-md border border-dashed border-border p-4 text-sm">No Core requests yet.</p>}
          <ol className="space-y-3">{company.requests.map((r) => <RequestCard key={r.id} req={r} company={company} onDone={done} />)}</ol>
        </>
      )}
    </OperatingShell>
  );
}

function NewRequest({ company, onDone }: { company: Company; onDone: OnDone }) {
  const submit = useServerFn(submitCoreRequest);
  async function go(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = e.currentTarget; const v = new FormData(f);
    const r = await submit({ data: { organizationId: company.id, title: String(v.get("title")), description: String(v.get("description") ?? "") } });
    if (r.success) f.reset(); await onDone(r, "Request submitted to Opsirix.");
  }
  return (
    <form onSubmit={go} className="ops-panel grid gap-2 text-sm">
      <label>What do you need handled?<input name="title" required minLength={3} maxLength={200} className="w-full" /></label>
      <label>Details (don't include passwords or confidential documents)<textarea name="description" maxLength={4000} rows={3} className="w-full" /></label>
      <div><Button type="submit">Submit request</Button></div>
    </form>
  );
}

function RequestCard({ req, company, onDone }: { req: Req; company: Company; onDone: OnDone }) {
  const move = useServerFn(transitionCoreRequest);
  const saveTask = useServerFn(saveCoreTask);
  async function act(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = e.currentTarget; const v = new FormData(f, (e.nativeEvent as SubmitEvent).submitter);
    const action = String(v.get("action")) as "accept";
    const r = await move({ data: { requestId: req.id, action, note: String(v.get("note") ?? "") } });
    if (r.success) f.reset(); await onDone(r, `Request ${req.ref}: ${action} recorded.`);
  }
  async function addTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = e.currentTarget; const v = new FormData(f);
    const r = await saveTask({ data: { requestId: req.id, taskId: null, title: String(v.get("title")), dueOn: String(v.get("due") || "") || null, status: "todo" } });
    if (r.success) f.reset(); await onDone(r, "Task added to the request's Flow board.");
  }
  async function setStatus(taskId: string, title: string, due: string | null, status: string) {
    const r = await saveTask({ data: { requestId: req.id, taskId, title, dueOn: due, status: status as "todo" } });
    await onDone(r, "Task updated.");
  }
  const staffWorking = company.isStaff && req.handledByMe && req.status === "accepted";
  return (
    <li className="ops-panel space-y-2 text-sm" aria-label={`Request ${req.ref}`}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <strong className="text-base">{req.title}</strong>
        <span className="text-muted-foreground">{req.ref}</span>
        <span className="rounded border border-border px-2">{STATUS[req.status]}</span>
        <span>Submitted {req.created_at.slice(0, 10)}</span>
      </div>
      {req.description && <p className="whitespace-pre-wrap text-muted-foreground">{req.description}</p>}
      {req.status_note && <p>Latest note: {req.status_note}</p>}
      {req.board_id && (
        <div className="rounded border border-border p-2">
          <p className="font-medium">Tasks ({req.tasks.length}) <Link to="/flow" className="ml-2 underline">Open in Flow</Link></p>
          {!req.tasks.length && <p className="text-muted-foreground">No tasks yet.</p>}
          <ul className="mt-1 space-y-1">{req.tasks.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-2">
              <span>{t.title}</span><span className="rounded border border-border px-2">{TASK[t.status]}</span>{t.due_on && <span>Due {t.due_on}</span>}
              {t.hold && <span className="font-semibold">On hold ({t.hold})</span>}
              {staffWorking && !t.hold && t.status !== "done" && <Button size="sm" variant="secondary" onClick={() => void setStatus(t.id, t.title, t.due_on, "done")}>Mark done</Button>}
            </li>
          ))}</ul>
          {staffWorking && (
            <form onSubmit={addTask} className="mt-2 flex flex-wrap items-end gap-2">
              <label className="flex-1 min-w-[10rem]">New task<input name="title" required minLength={2} maxLength={200} className="w-full" /></label>
              <label>Due<input name="due" type="date" className="w-full" /></label>
              <Button size="sm" type="submit">Add task</Button>
            </form>
          )}
        </div>
      )}
      <Actions req={req} company={company} onSubmit={act} />
      <details><summary className="cursor-pointer">Status history ({req.events.length})</summary>
        <ol className="mt-1 space-y-1">{req.events.map((e) => (
          <li key={e.id} className="rounded border border-border p-2">{e.created_at.slice(0, 16).replace("T", " ")} UTC · {e.from_status ? `${STATUS[e.from_status]} → ` : ""}{STATUS[e.to_status]} · {e.actor}{e.note && <span className="block text-muted-foreground">{e.note}</span>}</li>
        ))}</ol>
      </details>
    </li>
  );
}

function Actions({ req, company, onSubmit }: { req: Req; company: Company; onSubmit: (e: FormEvent<HTMLFormElement>) => void }) {
  const staff = company.isStaff; const editor = company.canEdit;
  const buttons: { action: string; label: string; note?: string; min?: number; variant?: "secondary" }[] = [];
  if (staff && req.status === "submitted") buttons.push({ action: "accept", label: "Accept and start" }, { action: "decline", label: "Decline", note: "Reason for declining (10+ characters)", min: 10, variant: "secondary" });
  if (staff && req.status === "accepted" && req.handledByMe) buttons.push({ action: "ready", label: "Ready for company review", note: "Summary for the company (optional)" });
  if (editor && req.status === "submitted") buttons.push({ action: "withdraw", label: "Withdraw", variant: "secondary" });
  if (editor && req.status === "awaiting_owner") buttons.push({ action: "close", label: "Close request", note: "Closing note", min: 3 }, { action: "reopen", label: "Reopen", note: "What still needs doing", min: 3, variant: "secondary" });
  if (!buttons.length) return null;
  const noteLabel = buttons.find((b) => b.note)?.note;
  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2">
      {noteLabel && <label className="flex-1 min-w-[12rem]">Note<textarea name="note" maxLength={1000} rows={2} className="w-full" placeholder={buttons.map((b) => b.note).filter(Boolean).join(" / ")} /></label>}
      {buttons.map((b) => <Button key={b.action} size="sm" type="submit" name="action" value={b.action} variant={b.variant}>{b.label}</Button>)}
    </form>
  );
}
