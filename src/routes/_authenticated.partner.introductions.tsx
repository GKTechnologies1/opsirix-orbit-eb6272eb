import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ListEmpty, ListPager, ListSummary, ListToolbar, useListControls } from "@/components/shared/ListControls";
import { Inbox } from "lucide-react";
import { WorkspaceShell } from "@/components/nexus/WorkspaceShell";
import { addPartnerIntroNote, deletePartnerIntroNote, partnerIntroWorkspace, setPartnerIntroState } from "@/lib/nexus-intro.functions";
import { NEXUS_CATEGORY_COPY } from "@/lib/nexus-discovery";

export const Route = createFileRoute("/_authenticated/partner/introductions")({
  head: () => ({ meta: [
    { title: "Introductions | Opsirix Nexus Partner" },
    { name: "description", content: "Introductions Opsirix has sent to your organization with the person's recorded consent." },
    { property: "og:title", content: "Introductions | Opsirix Nexus Partner" },
    { property: "og:description", content: "Consent-based introductions sent through Opsirix Nexus." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: PartnerIntros,
});

const LABEL: Record<string, string> = { name: "Name", email: "Email", phone: "Phone", location: "Location or jurisdiction", description: "Request description" };
type Data = Awaited<ReturnType<typeof partnerIntroWorkspace>>;
type Row = Data["rows"][number];
const cat = (r: Row) => NEXUS_CATEGORY_COPY[r.payload.category]?.title ?? r.payload.category;

function PartnerIntros() {
  const load = useServerFn(partnerIntroWorkspace);
  const [data, setData] = useState<Data>();
  const [failed, setFailed] = useState(false);
  const refresh = useCallback(async () => { try { setData(await load()); setFailed(false); } catch { setFailed(true); } }, [load]);
  useEffect(() => { void refresh(); }, [refresh]);
  const rows = data?.rows ?? [];
  const c = useListControls(rows, {
    text: (r) => `${cat(r)} ${Object.values(r.payload.fields).join(" ")} ${r.notes.map((n) => n.body).join(" ")}`,
    sorts: [
      { key: "new", label: "Newest first", compare: (a, b) => b.sent_at.localeCompare(a.sent_at) },
      { key: "old", label: "Oldest first", compare: (a, b) => a.sent_at.localeCompare(b.sent_at) },
      { key: "unread", label: "Unread first", compare: (a, b) => Number(!!a.read_at) - Number(!!b.read_at) || b.sent_at.localeCompare(a.sent_at) },
      { key: "follow", label: "Follow-up first", compare: (a, b) => Number(b.follow_up) - Number(a.follow_up) || b.sent_at.localeCompare(a.sent_at) },
    ],
    filters: [
      { key: "read", label: "Read status", options: [{ value: "unread", label: "Unread" }, { value: "read", label: "Read" }], match: (r, v) => (v === "read") === !!r.read_at },
      { key: "follow", label: "Follow-up", options: [{ value: "yes", label: "Flagged" }, { value: "no", label: "Not flagged" }], match: (r, v) => (v === "yes") === r.follow_up },
      { key: "cat", label: "Category", options: [...new Set(rows.map((r) => r.payload.category))].map((k) => ({ value: k, label: NEXUS_CATEGORY_COPY[k]?.title ?? k })), match: (r, v) => r.payload.category === v },
    ],
  });
  const unread = rows.filter((r) => !r.read_at).length;
  return <WorkspaceShell eyebrow="Partner workspace" title="Introductions">
    {failed ? <p className="nexus-muted">Introductions could not be loaded. <button className="list-link" onClick={() => refresh()}>Try again</button></p> : !data ? <p className="nexus-muted">Loading introductions.</p> : <>
      {rows.length > 0 && <><p className="nexus-muted">{unread} unread. Read status and follow-up flags are personal to your account. Notes are private to your partner workspace: they are never shown to the person introduced, to Opsirix staff, to other partners, or included in emails.</p>
        <ListToolbar c={c} label="Search introductions" placeholder="Name, email, words in the request or your notes" /><ListSummary c={c} noun={["introduction", "introductions"]} /></>}
      <ListEmpty c={c}><div className="nexus-empty"><Inbox /><h2>No introductions yet</h2><p>When a person authorizes an introduction to your organization and Opsirix sends it, it appears here.</p></div></ListEmpty>
      {c.visible.map((r, n) => <IntroItem key={r.id} r={r} num={c.start + n + 1} userId={data.userId} onDone={refresh} />)}
      <ListPager c={c} />
    </>}
  </WorkspaceShell>;
}

function IntroItem({ r, num, userId, onDone }: { r: Row; num: number; userId: string; onDone: () => Promise<void> }) {
  const setState = useServerFn(setPartnerIntroState);
  const addNote = useServerFn(addPartnerIntroNote);
  const delNote = useServerFn(deletePartnerIntroNote);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  async function run(p: Promise<{ success: boolean; error?: string }>, ok: string) {
    setBusy(true); const res = await p; setBusy(false);
    setMsg(res.success ? ok : res.error ?? "Something went wrong."); if (res.success) await onDone();
  }
  return <article className={`nexus-work-card${r.read_at ? "" : " intro-unread"}`} style={{ marginBottom: 16 }} aria-label={`Introduction ${num}`}>
    <p className="nexus-muted"><span className="list-rownum">#{num}</span>{r.read_at ? "Read" : "Unread"}{r.follow_up ? " · Follow-up" : ""} · Opsirix introduction · {cat(r)} · {new Date(r.sent_at).toLocaleString()}</p>
    <p>This person consented to share the details below with your organization for this introduction only. This is not a referral guarantee.</p>
    <dl>{Object.entries(r.payload.fields).map(([k, v]) => <div key={k}><dt><strong>{LABEL[k] ?? k}</strong></dt><dd style={{ margin: "0 0 8px", whiteSpace: "pre-wrap" }}>{v}</dd></div>)}</dl>
    <div className="nx-actions" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Button variant="outline" size="sm" disabled={busy} onClick={() => run(setState({ data: { id: r.id, read: !r.read_at } }), r.read_at ? "Marked unread." : "Marked read.")}>{r.read_at ? "Mark unread" : "Mark read"}</Button>
      <Button variant="outline" size="sm" disabled={busy} onClick={() => run(setState({ data: { id: r.id, followUp: !r.follow_up } }), r.follow_up ? "Follow-up flag removed." : "Flagged for follow-up.")}>{r.follow_up ? "Remove follow-up" : "Flag for follow-up"}</Button>
    </div>
    <section aria-label="Private notes" style={{ marginTop: 12 }}>
      <h3 style={{ fontSize: 15 }}>Private notes ({r.notes.length})</h3>
      {r.notes.map((n) => <p key={n.id} style={{ whiteSpace: "pre-wrap" }}>{n.body} <span className="nexus-muted">{new Date(n.created_at).toLocaleString()}</span>{n.author_id === userId && <> <button className="list-link" disabled={busy} onClick={() => run(delNote({ data: { noteId: n.id } }), "Note removed.")}>Remove</button></>}</p>)}
      <form onSubmit={(e) => { e.preventDefault(); if (note.trim()) void run(addNote({ data: { id: r.id, body: note } }), "Note saved.").then(() => setNote("")); }} className="nexus-form">
        <label>Add a private note<textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} rows={2} /></label>
        <Button type="submit" size="sm" disabled={busy || !note.trim()}>Save note</Button>
      </form>
    </section>
    {msg && <p className="nexus-muted" role="status">{msg}</p>}
  </article>;
}
