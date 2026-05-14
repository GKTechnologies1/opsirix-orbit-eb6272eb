import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { CTASection } from "@/components/shared/CTASection";

export const Route = createFileRoute("/immigrant-founders")({
  head: () => ({
    meta: [
      { title: "Opsirix for Immigrant Founders | F-1, H-1B, OPT Operations Support" },
      { name: "description", content: "Opsirix helps F-1, OPT, H-1B, and international founders organize their startup operations. Documentation, workflow clarity, and partner coordination — not immigration advice." },
      { property: "og:title", content: "Opsirix for Immigrant Founders | F-1, H-1B, OPT Operations Support" },
      { property: "og:description", content: "Opsirix helps F-1, OPT, H-1B, and international founders organize their startup operations. Documentation, workflow clarity, and partner coordination — not immigration advice." },
      { property: "og:url", content: "https://opsirix-orbit.lovable.app/immigrant-founders" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix-orbit.lovable.app/immigrant-founders" }],
  }),
  component: Page,
});

const FOUNDER_TYPES = [
  { tag: "F-1 / OPT", t: "Student & OPT founders", d: "Documentation depth and timing matter. Opsirix organizes records and coordinates with your independently retained immigration attorney." },
  { tag: "STEM OPT", t: "STEM OPT founders", d: "Reporting cadences create operational pressure. Opsirix runs the administrative rhythm so nothing slips between your team and your attorney." },
  { tag: "H-1B", t: "H-1B professional founders", d: "Side-venture documentation and clean record-keeping matter. Opsirix keeps the operational paper trail organized." },
  { tag: "H-4 EAD", t: "H-4 EAD founders", d: "Coordination across spouse status, EAD timing, and company formation requires structure. Opsirix handles the logistics." },
  { tag: "International", t: "International entrepreneurs", d: "Forming a U.S. entity from abroad is paperwork-heavy. Opsirix coordinates the moving pieces with your attorney and CPA." },
  { tag: "Green Card", t: "Green card holder founders", d: "You move faster — Opsirix gives you the same operational backbone the rest of your team gets." },
];

const FAQS = [
  { q: "Does Opsirix give immigration advice?", a: "No. Opsirix is a Founder Infrastructure & Operations Platform. Every immigration question is routed to a licensed immigration attorney through Opsirix Nexus. We handle administrative coordination only." },
  { q: "Will Opsirix tell me which visa to use?", a: "Never. Visa strategy is a legal opinion that only a licensed immigration attorney can provide. Opsirix coordinates the logistical layer around your attorney's work." },
  { q: "Does Opsirix help with USCIS filings?", a: "Filings are prepared and submitted by your independently retained licensed immigration attorney. Opsirix organizes and stores the documentation that supports their work." },
  { q: "What does Opsirix actually do for me?", a: "Vault keeps every operational document organized and audit-ready. Flow runs your weekly project board. Nexus coordinates the administrative logistics with your attorney, CPA, and banker. Grid scores your readiness every month." },
  { q: "What if I don't have an immigration attorney yet?", a: "Opsirix Nexus introduces you to vetted licensed immigration attorneys in the partner network. The attorney engages you under their own engagement letter; Opsirix coordinates logistics." },
];

function Page() {
  return (
    <div className="inner-page">
      <PageHeader pageName="Immigrant Founders" label="For Immigrant Founders" title="Operational infrastructure built for founders navigating the U.S. system." subtitle="Documentation organized. Professional coordination handled. Compliance calendar running. Zero immigration advice — that's what your attorney is for." />

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Why It Matters More</p>
          <h2 className="inner-h2">Operational infrastructure matters more for immigrant founders.</h2>
          <p className="inner-lead">When your status, your company, and your professional team all generate independent documentation requirements, the operational load compounds. Records must be organized. Coordination across attorney, CPA, banker, and university must be tight. Timing matters. Opsirix runs that operational layer — so your attorney can do legal work, your CPA can do tax work, and you can build the company.</p>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">What Opsirix Organizes</p>
          <h2 className="inner-h2">The administrative layer your team has been missing.</h2>
          <div className="inner-grid-3">
            {[
              { t: "Vault", d: "Every operational document — formation, EIN, banking, contracts, employment paperwork — organized, versioned, and audit-ready." },
              { t: "Compliance Calendar", d: "Every recurring deadline tracked. Renewals, filing windows, and reporting cadences surfaced before they become urgent." },
              { t: "Nexus Coordination", d: "Administrative logistics with your independently retained attorney, CPA, banker, and insurer — handled, scheduled, and recorded." },
            ].map((c) => <div key={c.t} className="inner-card"><h3>{c.t}</h3><p>{c.d}</p></div>)}
          </div>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Founder Types We Serve</p>
          <h2 className="inner-h2">Built for the operational reality of every founder background.</h2>
          <div className="inner-grid-3">
            {FOUNDER_TYPES.map((f) => (
              <div key={f.t} className="inner-card">
                <div className="num-badge" style={{ width: "auto", padding: "0 10px", fontSize: 11 }}>{f.tag}</div>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">The Compliance Architecture</p>
          <h2 className="inner-h2">Structure is protection.</h2>
          <p className="inner-lead">Opsirix protects founders through structure, not advice. The Attorney Gate routes every regulated question to a licensed professional. The Stop-Work Protocol pauses any task that approaches a regulated boundary. The Audit Evidence Trail preserves a timestamped record of every action. Nexus Independence guarantees that your attorney's advice is theirs alone — Opsirix never controls the substance.</p>
          <ul className="inner-list">
            <li><strong>Attorney Gate</strong> — every immigration, legal, or tax question routes to a licensed professional automatically.</li>
            <li><strong>Stop-Work Protocol</strong> — work pauses at any regulated boundary until a licensed professional confirms the path forward.</li>
            <li><strong>Audit Evidence Trail</strong> — every action is timestamped and preserved in the Vault for as long as you need it.</li>
            <li><strong>Nexus Independence</strong> — your attorney works under their own engagement letter; Opsirix coordinates logistics only.</li>
          </ul>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Common Questions</p>
          <h2 className="inner-h2">5 questions immigrant founders ask.</h2>
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14 }}>
            {FAQS.map((f) => (
              <div key={f.q} className="inner-card">
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
