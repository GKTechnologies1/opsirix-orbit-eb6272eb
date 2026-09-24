import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CircleX, Lock, Trash2 } from "lucide-react";
import { WorkspaceShell } from "@/components/nexus/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { TRACK_TYPES, TRACK_TYPE_IDS } from "@/lib/nexus-tracks";

export const Route = createFileRoute("/_authenticated/admin/preview")({
  head: () => ({ meta: [
    { title: "Private Preview Access | Opsirix Nexus" },
    { name: "description", content: "Give chosen accounts private access to closed Nexus partner types for testing." },
    { property: "og:title", content: "Private Preview Access | Opsirix Nexus" },
    { property: "og:description", content: "Give chosen accounts private access to closed Nexus partner types for testing." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: PreviewAccessPage,
});

type Grant = { user_id: string; partner_type_id: string; note: string | null; created_at: string; email?: string };

function PreviewAccessPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState("");
  const [me, setMe] = useState("");
  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser(); if (!auth.user) return; setMe(auth.user.id);
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: auth.user.id, _role: "admin" }); setAllowed(Boolean(isAdmin)); if (!isAdmin) return;
    const [g, t] = await Promise.all([supabase.from("partner_type_preview_access").select("*").order("created_at"), supabase.from("service_partner_types").select("id,is_open_for_registration").in("id", TRACK_TYPE_IDS)]);
    const ids = [...new Set((g.data ?? []).map((x) => x.user_id))];
    const people = ids.length ? (await supabase.from("profiles").select("id,email").in("id", ids)).data ?? [] : [];
    setGrants((g.data ?? []).map((x) => ({ ...x, email: people.find((p) => p.id === x.user_id)?.email })));
    setOpen(Object.fromEntries((t.data ?? []).map((x) => [x.id, x.is_open_for_registration])));
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function grant(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget; const f = new FormData(form);
    const email = String(f.get("email") ?? "").trim().toLowerCase(); const types = f.getAll("types").map(String);
    if (!email || !types.length) { setMsg("Add an email and choose at least one type."); return; }
    const { data: person } = await supabase.from("profiles").select("id").ilike("email", email).maybeSingle();
    if (!person) { setMsg("No account with that email. The person must create an account through the normal sign-in page first."); return; }
    const { error } = await supabase.from("partner_type_preview_access").upsert(types.map((t) => ({ user_id: person.id, partner_type_id: t, granted_by: me, note: String(f.get("note") ?? "").trim() || null })), { onConflict: "user_id,partner_type_id" });
    setMsg(error ? error.message : "Preview access granted."); if (!error) form.reset(); await load();
  }
  async function revoke(g: Grant) {
    const { error } = await supabase.from("partner_type_preview_access").delete().eq("user_id", g.user_id).eq("partner_type_id", g.partner_type_id);
    setMsg(error ? error.message : "Access removed."); await load();
  }

  if (allowed === false) return <WorkspaceShell eyebrow="Authorized review" title="Access restricted"><div className="nexus-empty"><CircleX /><h2>Access restricted</h2><p>Only Opsirix reviewers can manage preview access.</p></div></WorkspaceShell>;
  return <WorkspaceShell eyebrow="Authorized review" title="Private preview access">
    <p className="nexus-notice nx-inline-notice"><Lock aria-hidden />These types stay closed to the public. Preview access lets a chosen account walk through onboarding. It cannot publish anything: listings of a closed type are refused by the database.</p>
    <section className="nexus-work-card"><h2>Current status</h2><ul className="nx-list">{TRACK_TYPE_IDS.map((t) => <li key={t}>{TRACK_TYPES[t].label}<span className={`nexus-status ${open[t] ? "approved" : "declined"}`}>{open[t] ? "Open" : "Closed"}</span></li>)}</ul>
      <p className="nexus-muted">Opsirix reviewers can open the onboarding themselves: <Link to="/partner/onboarding">view the onboarding</Link>.</p></section>
    <form className="nexus-work-card nexus-application-form" onSubmit={grant}>
      <h2>Grant preview access</h2>
      <label>Account email<input name="email" type="email" required maxLength={200} /></label>
      <fieldset className="nx-field nx-checkgroup"><legend>Types</legend><div>{TRACK_TYPE_IDS.map((t) => <label key={t} className="nx-check"><input type="checkbox" name="types" value={t} />{TRACK_TYPES[t].label}</label>)}</div></fieldset>
      <label>Note (optional)<input name="note" maxLength={300} placeholder="Why this account needs access" /></label>
      <div className="nexus-form-actions"><Button type="submit">Grant access</Button></div>
      {msg && <p className="nx-notice-line" role="status">{msg}</p>}
    </form>
    <section className="nexus-work-card"><h2>Accounts with preview access</h2>
      {grants.length ? <div className="nexus-table-wrap"><table><thead><tr><th>Account</th><th>Type</th><th>Note</th><th><span className="sr-only">Remove</span></th></tr></thead><tbody>{grants.map((g) => <tr key={`${g.user_id}-${g.partner_type_id}`}><td>{g.email ?? g.user_id}</td><td>{TRACK_TYPES[g.partner_type_id as keyof typeof TRACK_TYPES]?.label ?? g.partner_type_id}</td><td>{g.note ?? ""}</td><td><Button size="icon" variant="ghost" onClick={() => revoke(g)} aria-label={`Remove access for ${g.email}`}><Trash2 /></Button></td></tr>)}</tbody></table></div> : <p className="nexus-muted">No accounts yet.</p>}
    </section>
  </WorkspaceShell>;
}
