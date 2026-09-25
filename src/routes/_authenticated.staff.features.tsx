import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowRight, CircleX } from "lucide-react";
import { OperatingShell } from "@/components/workspace/OperatingShell";
import { FEATURE_INVENTORY } from "@/lib/feature-inventory";
import { getReleaseRecords } from "@/lib/release.functions";

export const Route = createFileRoute("/_authenticated/staff/features")({
  head: () => ({ meta: [
    { title: "Features & Releases | Opsirix Staff" },
    { name: "description", content: "Admin/CEO inventory of held Opsirix features and the release record of activations." },
    { property: "og:title", content: "Features & Releases | Opsirix Staff" },
    { property: "og:description", content: "Admin/CEO inventory of held Opsirix features and the release record of activations." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: FeaturesPage,
});

const fmt = (s: string) => new Date(s).toISOString().slice(0, 16).replace("T", " ") + " UTC";

function FeaturesPage() {
  const load = useServerFn(getReleaseRecords);
  const [records, setRecords] = useState<Awaited<ReturnType<typeof getReleaseRecords>> | undefined>();
  const [filter, setFilter] = useState("All");
  useEffect(() => { load().then(setRecords).catch(() => setRecords(null)); }, [load]);
  const states = ["All", ...Array.from(new Set(FEATURE_INVENTORY.map((i) => i.state)))];
  const items = FEATURE_INVENTORY.filter((i) => filter === "All" || i.state === filter);
  return <OperatingShell mode="staff" eyebrow="Admin / CEO" title="Features & Releases">
    {records === undefined ? <p className="ops-muted">Checking access.</p> : records === null ? <section className="ops-empty"><CircleX /><h2>Access restricted</h2><p>Only Admin/CEO can view the feature inventory and release record.</p></section> : <>
      <p className="ops-lead">Activating a feature never publishes a partner listing or the redesigned website. Each of those needs its own authorization.</p>
      <section className="ops-panel"><h2>Release record</h2>
        {records.length ? <div className="ops-table-wrap"><table><thead><tr><th>Activated</th><th>Feature</th><th>Authorized / activated by</th><th>End-to-end result</th><th>Preview</th><th>opsirix.lovable.app</th><th>Shared backend</th></tr></thead><tbody>
          {records.map((r) => <tr key={r.id}><td>{fmt(r.activated_at)}</td><td>{r.title}</td><td>{r.authorized_by}<br /><span className="ops-muted">{r.activated_by}</span></td><td>{r.test_result}</td><td>{r.effect_preview}</td><td>{r.effect_live_site}</td><td>{r.effect_backend}</td></tr>)}
        </tbody></table></div> : <p className="ops-muted">No activations recorded.</p>}
      </section>
      <section className="ops-panel"><h2>Feature inventory</h2>
        <label>Show<select value={filter} onChange={(e) => setFilter(e.target.value)}>{states.map((s) => <option key={s}>{s}</option>)}</select></label>
        <div className="ops-table-wrap"><table><thead><tr><th>Module</th><th>Item</th><th>State</th><th>Why held</th><th>Missing requirement or approval</th><th>Shared-backend effect</th><th>Test before activation</th><th></th></tr></thead><tbody>
          {items.map((i) => <tr key={i.module + i.item}><td>{i.module}</td><td>{i.item}</td><td><strong>{i.state}</strong></td><td>{i.why}</td><td>{i.missing}</td><td>{i.backend}</td><td>{i.test}</td><td>{i.link ? <a href={i.link}>Open <ArrowRight size={14} /></a> : <span className="ops-muted">No screen yet</span>}</td></tr>)}
        </tbody></table></div>
      </section>
      <Link to="/staff">Back to overview <ArrowRight /></Link>
    </>}
  </OperatingShell>;
}
