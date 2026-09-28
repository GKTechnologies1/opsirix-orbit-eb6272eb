import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { OperatingShell } from "@/components/workspace/OperatingShell";
import { Button } from "@/components/ui/button";
import { getMyCoreNotifications, markCoreNotificationsRead } from "@/lib/core-notifications.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [
    { title: "Notifications | Opsirix" },
    { name: "description", content: "Your personal Opsirix Core request updates." },
    { property: "og:title", content: "Notifications | Opsirix" },
    { property: "og:description", content: "Your personal Opsirix Core request updates." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const load = useServerFn(getMyCoreNotifications);
  const mark = useServerFn(markCoreNotificationsRead);
  const qc = useQueryClient();
  const [mode, setMode] = useState<"company" | "staff">("company");
  const [error, setError] = useState("");
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["core-notifications"], queryFn: () => load() });

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: u }) => {
      if (!u.user) return;
      const { data: staff } = await supabase.rpc("has_staff_role", { _user_id: u.user.id });
      if (staff) setMode("staff");
    });
  }, []);

  async function markRead(ids: string[] | null) {
    setError("");
    try { await mark({ data: { ids } }); await qc.invalidateQueries({ queryKey: ["core-notifications"] }); }
    catch { setError("Could not update notifications. Try again."); }
  }

  const unread = (data ?? []).filter((n) => !n.read_at).length;
  return (
    <OperatingShell mode={mode} eyebrow="Your updates" title="Notifications">
      <section className="ops-panel" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-muted-foreground">{isLoading ? "Loading notifications." : `${unread} unread of ${data?.length ?? 0}`}. Read status is personal to you. Opening a link checks your current access again.</p>
          {unread > 0 && <Button variant="secondary" onClick={() => markRead(null)}>Mark all as read</Button>}
        </div>
        {error && <p role="alert" className="text-destructive">{error}</p>}
        {isError ? <div><p>Notifications could not be loaded.</p><Button onClick={() => refetch()}>Try again</Button></div>
          : !isLoading && !data?.length ? <div><h2>No notifications yet</h2><p className="text-muted-foreground">You will see Core request updates here, such as a request being submitted, accepted, ready for review or reopened, and changes to your access.</p></div>
          : <ol className="mt-3 space-y-2">{(data ?? []).map((n) => (
            <li key={n.id} className="rounded border border-border p-3" data-unread={!n.read_at}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{!n.read_at && <span className="sr-only">Unread: </span>}{!n.read_at && <span aria-hidden className="mr-2 inline-block h-2 w-2 rounded-full bg-primary" />}{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.ref} · {new Date(n.created_at).toISOString().slice(0, 16).replace("T", " ")} UTC</p>
                </div>
                <div className="flex gap-2">
                  <Link to="/core" hash={`core-${n.request_id}`} className="nx-link" onClick={() => { if (!n.read_at) void markRead([n.id]); }}>Open request</Link>
                  {!n.read_at && <Button variant="ghost" size="sm" onClick={() => markRead([n.id])}>Mark read</Button>}
                </div>
              </div>
            </li>))}</ol>}
      </section>
    </OperatingShell>
  );
}
