import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/nexus/WorkspaceShell";
import { getPartnerFlowTasks } from "@/lib/flow.functions";

export const Route = createFileRoute("/_authenticated/partner/tasks")({
  head: () => ({ meta: [
    { title: "Shared tasks | Opsirix Partner" },
    { name: "description", content: "Tasks companies have shared with your partner account." },
    { property: "og:title", content: "Shared tasks | Opsirix Partner" },
    { property: "og:description", content: "Tasks companies have shared with your partner account." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: PartnerTasks,
});

const STATUS: Record<string, string> = { todo: "To do", in_progress: "In progress", blocked: "Blocked", done: "Done" };

function PartnerTasks() {
  const load = useServerFn(getPartnerFlowTasks);
  const [tasks, setTasks] = useState<Awaited<ReturnType<typeof getPartnerFlowTasks>>["tasks"]>();
  useEffect(() => { load().then((r) => setTasks(r.tasks)).catch(() => setTasks([])); }, [load]);
  return (
    <WorkspaceShell eyebrow="Partner workspace" title="Shared tasks">
      <p className="text-muted-foreground max-w-2xl">Company owners can share individual tasks with you. You see only what they share, and it disappears here if they stop sharing.</p>
      {!tasks && <p>Loading…</p>}
      {tasks && !tasks.length && <p className="rounded-md border border-dashed border-border p-4 text-sm">No tasks have been shared with you.</p>}
      {tasks && tasks.length > 0 && <p className="text-sm">{tasks.length} shared {tasks.length === 1 ? "task" : "tasks"}</p>}
      <ol className="space-y-2">
        {tasks?.map((t, i) => (
          <li key={t.task_id} className="rounded-md border border-border p-3 text-sm">
            <span className="text-muted-foreground">#{i + 1} · {t.company}</span>
            <p className="text-base font-semibold">{t.title}</p>
            <p>{STATUS[t.status] ?? t.status} · {t.due_on ? `Due ${t.due_on}` : "No due date"}</p>
            {t.details && <p className="whitespace-pre-wrap text-muted-foreground">{t.details}</p>}
          </li>
        ))}
      </ol>
    </WorkspaceShell>
  );
}
