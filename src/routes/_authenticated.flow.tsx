import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, Share2 } from "lucide-react";
import { OperatingShell } from "@/components/workspace/OperatingShell";
import { Button } from "@/components/ui/button";
import { createFlowBoard, getFlow, previewFlowShare, saveFlowTask, setFlowEditor, setFlowEscalation, shareFlowTask } from "@/lib/flow.functions";

export const Route = createFileRoute("/_authenticated/flow")({
  head: () => ({ meta: [
    { title: "Flow | Opsirix" },
    { name: "description", content: "Company task boards with owners, due dates and status." },
    { property: "og:title", content: "Flow | Opsirix" },
    { property: "og:description", content: "Company task boards with owners, due dates and status." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: FlowPage,
});

type Data = Awaited<ReturnType<typeof getFlow>>;
type Company = Data["companies"][number];
type Task = Company["boards"][number]["tasks"][number];
const STATUS: Record<string, string> = { todo: "To do", in_progress: "In progress", blocked: "Blocked", done: "Done" };
const today = new Date().toISOString().slice(0, 10);

function FlowPage() {
  const load = useServerFn(getFlow);
  const [data, setData] = useState<Data>();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [orgId, setOrgId] = useState<string>();
  const refresh = useCallback(async () => {
    try { setData(await load()); setError(""); } catch { setError("Flow could not load. Try again."); }
  }, [load]);
  useEffect(() => { void refresh(); }, [refresh]);
  const company = useMemo(() => data?.companies.find((c) => c.id === orgId) ?? data?.companies.find((c) => c.boards.length) ?? data?.companies[0], [data, orgId]);
  const done = async (r: { success: boolean; error?: string }, ok: string) => { setMessage(r.success ? ok : r.error ?? "Something went wrong."); await refresh(); };

  return (
    <OperatingShell mode="company" eyebrow="Opsirix Flow" title="Company tasks">
      <p className="text-muted-foreground max-w-2xl">Boards hold the work your company is coordinating. Owners and delegated members edit; viewers can read. Opsirix staff with company access can flag a task for attention. Partners see only tasks an owner shares with them.</p>
      {message && <p role="status" className="rounded-md border border-border p-3 text-sm">{message}</p>}
      {error && <div role="alert" className="text-sm">{error} <Button size="sm" variant="secondary" onClick={() => void refresh()}>Retry</Button></div>}
      {!data && !error && <p>Loading Flow…</p>}
      {data && !data.companies.length && <p>You don't have access to any company workspace yet. Create one under Companies first.</p>}
      {data && company && (
        <>
          {data.companies.length > 1 && (
            <label className="ops-panel flex max-w-sm flex-col gap-1 text-sm">Company
              <select className="w-full" value={company.id} onChange={(e) => setOrgId(e.target.value)}>
                {data.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          )}
          <p className="text-sm text-muted-foreground">Your access: <strong>{company.role ? company.role[0].toUpperCase() + company.role.slice(1) : "Opsirix staff"}</strong>{company.canEdit ? " · can edit" : " · read only"}</p>
          {company.canEdit && <BoardForm company={company} onDone={done} />}
          {company.isOwner && <EditorForm company={company} onDone={done} />}
          {!company.boards.length && <p className="rounded-md border border-dashed border-border p-4 text-sm">No boards yet.{company.canEdit ? " Create the first one above." : ""}</p>}
          {company.boards.map((b) => (
            <section key={b.id} className="ops-panel space-y-3" aria-label={`Board ${b.name}`}>
              <h2 className="text-lg font-semibold">{b.name} <span className="text-sm font-normal text-muted-foreground">({b.tasks.length} {b.tasks.length === 1 ? "task" : "tasks"})</span></h2>
              {company.canEdit && <TaskForm company={company} boardId={b.id} onDone={done} />}
              {!b.tasks.length && <p className="text-sm text-muted-foreground">No tasks on this board.</p>}
              <ol className="space-y-2">
                {b.tasks.map((t, i) => <TaskRow key={t.id} n={i + 1} task={t} company={company} boardId={b.id} onDone={done} />)}
              </ol>
            </section>
          ))}
        </>
      )}
    </OperatingShell>
  );
}

type OnDone = (r: { success: boolean; error?: string }, ok: string) => Promise<void>;
const input = "w-full";

function BoardForm({ company, onDone }: { company: Company; onDone: OnDone }) {
  const create = useServerFn(createFlowBoard);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = e.currentTarget;
    const r = await create({ data: { organizationId: company.id, name: String(new FormData(f).get("name")) } });
    if (r.success) f.reset(); await onDone(r, "Board created.");
  }
  return (
    <form onSubmit={submit} className="ops-panel flex flex-wrap items-end gap-2">
      <label className="flex-1 min-w-[12rem] text-sm">New board name<input name="name" required minLength={2} maxLength={120} className={input} /></label>
      <Button type="submit">Create board</Button>
    </form>
  );
}

function EditorForm({ company, onDone }: { company: Company; onDone: OnDone }) {
  const set = useServerFn(setFlowEditor);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = e.currentTarget;
    const v = new FormData(f, (e.nativeEvent as SubmitEvent).submitter);
    const r = await set({ data: { organizationId: company.id, email: String(v.get("email")), enabled: v.get("action") === "grant" } });
    if (r.success) f.reset(); await onDone(r, v.get("action") === "grant" ? "Member can now edit Flow." : "Flow editing removed.");
  }
  return (
    <details className="ops-panel text-sm">
      <summary className="cursor-pointer">Delegate editing ({company.editors.length} delegated)</summary>
      {company.editors.length > 0 && <p className="mt-2 text-muted-foreground">Delegated: {company.editors.join(", ")}</p>}
      <form onSubmit={submit} className="mt-2 flex flex-wrap items-end gap-2">
        <label className="flex-1 min-w-[12rem]">Member email<input name="email" type="email" required className={input} /></label>
        <Button type="submit" name="action" value="grant">Allow editing</Button>
        <Button type="submit" name="action" value="remove" variant="secondary">Remove</Button>
      </form>
    </details>
  );
}

function TaskForm({ company, boardId, task, onDone, onClose }: { company: Company; boardId: string; task?: Task; onDone: OnDone; onClose?: () => void }) {
  const save = useServerFn(saveFlowTask);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = e.currentTarget; const v = new FormData(f);
    const r = await save({ data: {
      boardId, taskId: task?.id ?? null, title: String(v.get("title")), details: String(v.get("details") ?? ""),
      assigneeId: String(v.get("assignee") || "") || null, dueOn: String(v.get("due") || "") || null,
      status: String(v.get("status")) as "todo",
    } });
    if (r.success) { f.reset(); onClose?.(); } await onDone(r, task ? "Task updated." : "Task added.");
  }
  return (
    <form onSubmit={submit} className="grid gap-2 sm:grid-cols-2 rounded-md border border-border p-3 text-sm">
      <label className="sm:col-span-2">Task<input name="title" required minLength={2} maxLength={200} defaultValue={task?.title} className={input} /></label>
      <label className="sm:col-span-2">Details (optional)<textarea name="details" maxLength={2000} defaultValue={task?.details ?? ""} className="w-full" rows={2} /></label>
      <label>Owner<select name="assignee" defaultValue={task?.assignee_id ?? ""} className={input}><option value="">Unassigned</option>{company.members.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}</select></label>
      <label>Due date<input name="due" type="date" defaultValue={task?.due_on ?? ""} className={input} /></label>
      <label>Status{task?.hold && <span className="block text-xs text-muted-foreground">On hold ({task.hold.ref}) until Opsirix records written clearance</span>}{task?.hold && <input type="hidden" name="status" value={task.status} />}<select name={task?.hold ? "status_locked" : "status"} disabled={Boolean(task?.hold)} defaultValue={task?.status ?? "todo"} className={input}>{Object.entries(STATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
      <div className="flex items-end gap-2"><Button type="submit">{task ? "Save task" : "Add task"}</Button>{onClose && <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>}</div>
    </form>
  );
}

function TaskRow({ n, task, company, boardId, onDone }: { n: number; task: Task; company: Company; boardId: string; onDone: OnDone }) {
  const [editing, setEditing] = useState(false);
  const escalate = useServerFn(setFlowEscalation);
  const share = useServerFn(shareFlowTask);
  const preview = useServerFn(previewFlowShare);
  const [pv, setPv] = useState<{ email: string; data: NonNullable<Extract<Awaited<ReturnType<typeof previewFlowShare>>, { success: true }>["preview"]> } | null>(null);
  const [pvErr, setPvErr] = useState("");
  const overdue = task.due_on && task.due_on < today && task.status !== "done";
  if (editing) return <li><TaskForm company={company} boardId={boardId} task={task} onDone={onDone} onClose={() => setEditing(false)} /></li>;
  async function esc(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = e.currentTarget; const v = new FormData(f, (e.nativeEvent as SubmitEvent).submitter);
    const raise = v.get("action") === "raise";
    const r = await escalate({ data: { taskId: task.id, note: String(v.get("note") ?? ""), raise } });
    if (r.success) f.reset(); await onDone(r, raise ? "Task placed on hold." : "Clearance recorded. The task is released.");
  }
  async function doShare(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = e.currentTarget; const v = new FormData(f, (e.nativeEvent as SubmitEvent).submitter);
    const email = String(v.get("email")); const action = v.get("action");
    if (action === "preview") {
      setPvErr(""); setPv(null);
      const r = await preview({ data: { taskId: task.id, email } });
      if (!r.success || !r.preview) setPvErr(r.success ? "Nothing to preview." : r.error); else setPv({ email, data: r.preview });
      return;
    }
    const on = action === "share";
    const r = await share({ data: { taskId: task.id, email, enabled: on } });
    if (r.success) { f.reset(); setPv(null); } await onDone(r, on ? "Task shared with the partner." : "Sharing removed. The partner can no longer see this task.");
  }
  return (
    <li className="rounded-md border border-border p-3 text-sm space-y-2">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-muted-foreground">#{n}</span>
        <strong className="text-base">{task.title}</strong>
        <span className="rounded border border-border px-2">{STATUS[task.status]}</span>
        <span>Owner: {task.assignee}</span>
        <span className={overdue ? "font-semibold text-destructive" : ""}>{task.due_on ? `Due ${task.due_on}${overdue ? " (overdue)" : ""}` : "No due date"}</span>
        {company.isOwner && task.shared > 0 && <span className="inline-flex items-center gap-1"><Share2 className="h-3 w-3" />Shared with {task.shared}</span>}
      </div>
      {task.details && <p className="whitespace-pre-wrap text-muted-foreground">{task.details}</p>}
      {task.hold && <p role="note" className="flex items-start gap-2 rounded border border-destructive p-2"><AlertTriangle className="h-4 w-4 shrink-0" /><span><strong>On hold · {task.hold.ref}</strong>. Opsirix raised this on {task.hold.raised_at.slice(0, 10)}: {task.hold.reason}. Status stays Blocked until Opsirix records written clearance.</span></p>}
      {task.escalations.length > 0 && (
        <details><summary className="cursor-pointer">Escalation history ({task.escalations.length})</summary>
          <ol className="mt-1 space-y-1">{task.escalations.map((x) => (
            <li key={x.id} className="rounded border border-border p-2"><strong>{x.ref}</strong> · raised {x.raised_at.slice(0, 16).replace("T", " ")} UTC · {x.reason}
              {x.cleared_at ? <span className="block">Cleared {x.cleared_at.slice(0, 16).replace("T", " ")} UTC: {x.clearance_note}</span> : <span className="block font-semibold">Open, awaiting written clearance</span>}</li>
          ))}</ol>
        </details>
      )}
      <div className="flex flex-wrap gap-2">
        {company.canEdit && <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>Edit</Button>}
      </div>
      {company.canEscalate && (
        <form onSubmit={esc} className="flex flex-wrap items-end gap-2">
          {task.hold
            ? <label className="flex-1 min-w-[10rem]">Written clearance (at least 10 characters)<textarea name="note" required minLength={10} maxLength={1000} rows={2} className="w-full" /></label>
            : <label className="flex-1 min-w-[10rem]">Reason to place on hold<input name="note" required minLength={3} maxLength={500} className={input} /></label>}
          {task.hold ? <Button size="sm" type="submit" name="action" value="clear" variant="secondary">Record clearance</Button> : <Button size="sm" type="submit" name="action" value="raise">Place on hold</Button>}
        </form>
      )}
      {company.isOwner && (
        <details><summary className="cursor-pointer">Share with a partner</summary>
          <form onSubmit={doShare} className="mt-2 flex flex-wrap items-end gap-2">
            <label className="flex-1 min-w-[10rem]">Partner account email<input name="email" type="email" required className={input} /></label>
            <Button size="sm" type="submit" name="action" value="preview">Preview what they see</Button>
            <Button size="sm" type="submit" name="action" value="unshare" variant="secondary">Stop sharing</Button>
            {pv && (
              <div className="basis-full rounded border border-border p-3" aria-label="Partner preview">
                <p className="text-muted-foreground">Exactly what {pv.data.partner_name} ({pv.email}) will see under Shared tasks:</p>
                <div className="mt-2 rounded border border-dashed border-border p-2">
                  <span className="text-muted-foreground">{pv.data.company}</span>
                  <p className="text-base font-semibold">{pv.data.title}</p>
                  <p>{STATUS[pv.data.status] ?? pv.data.status} · {pv.data.due_on ? `Due ${pv.data.due_on}` : "No due date"}</p>
                  {pv.data.details && <p className="whitespace-pre-wrap text-muted-foreground">{pv.data.details}</p>}
                </div>
                <p className="mt-1 text-muted-foreground">Not included: task owner, other tasks, board name, notes, escalations, company members.</p>
                {pv.data.already_shared ? <p className="mt-2 font-semibold">Already shared with this partner.</p> : (
                  <div className="mt-2 flex gap-2"><Button size="sm" type="submit" name="action" value="share">Share this task</Button><Button size="sm" type="button" variant="secondary" onClick={() => setPv(null)}>Cancel</Button></div>
                )}
              </div>
            )}
            {pvErr && <p role="alert" className="basis-full">{pvErr}</p>}
          </form>
        </details>
      )}
    </li>
  );
}
