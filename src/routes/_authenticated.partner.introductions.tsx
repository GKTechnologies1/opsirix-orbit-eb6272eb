import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import { WorkspaceShell } from "@/components/nexus/WorkspaceShell";
import { partnerIntroductions } from "@/lib/nexus-intro.functions";
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

function PartnerIntros() {
  const load = useServerFn(partnerIntroductions);
  const [rows, setRows] = useState<Awaited<ReturnType<typeof partnerIntroductions>>>();
  const [failed, setFailed] = useState(false);
  useEffect(() => { load().then(setRows).catch(() => setFailed(true)); }, [load]);
  return <WorkspaceShell eyebrow="Partner workspace" title="Introductions">
    {failed ? <p className="nexus-muted">Introductions could not be loaded. Please refresh.</p> : !rows ? <p className="nexus-muted">Loading introductions.</p> : rows.length === 0 ? <div className="nexus-empty"><Inbox /><h2>No introductions yet</h2><p>When a person authorizes an introduction to your organization and Opsirix sends it, it appears here.</p></div> :
      rows.map((r) => <article key={r.id} className="nexus-work-card" style={{ marginBottom: 16 }}>
        <p className="nexus-muted">Opsirix introduction · {NEXUS_CATEGORY_COPY[r.payload.category]?.title ?? r.payload.category} · {new Date(r.sent_at).toLocaleString()}</p>
        <p>This person consented to share the details below with your organization for this introduction only. This is not a referral guarantee.</p>
        <dl>{Object.entries(r.payload.fields).map(([k, v]) => <div key={k}><dt><strong>{LABEL[k] ?? k}</strong></dt><dd style={{ margin: "0 0 8px", whiteSpace: "pre-wrap" }}>{v}</dd></div>)}</dl>
      </article>)}
  </WorkspaceShell>;
}
