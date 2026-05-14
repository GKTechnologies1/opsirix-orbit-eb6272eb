import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { CTASection } from "@/components/shared/CTASection";

export const Route = createFileRoute("/platform/launch")({
  head: () => ({
    meta: [
      { title: "Opsirix Launch | Startup Formation Workflow Coordination" },
      { name: "description", content: "Opsirix Launch helps founders coordinate the operational side of starting a company. Formation checklists, document collection, banking setup, and professional introductions — organized and tracked." },
      { property: "og:title", content: "Opsirix Launch | Startup Formation Workflow Coordination" },
      { property: "og:description", content: "Opsirix Launch helps founders coordinate the operational side of starting a company. Formation checklists, document collection, banking setup, and professional introductions — organized and tracked." },
      { property: "og:url", content: "https://opsirix-orbit.lovable.app/platform/launch" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix-orbit.lovable.app/platform/launch" }],
  }),
  component: Page,
});

const FEATURES = [
  { t: "Founder intake and profile setup", d: "Your company details, founder background, and operational goals are documented at the start — not figured out later." },
  { t: "Entity setup checklist", d: "Formation steps are organized into a tracked checklist. Opsirix does not provide formation services — it coordinates the documentation and professional handoff." },
  { t: "EIN and banking readiness", d: "Checklists for EIN application and business banking setup are organized and tracked. Next steps are clear." },
  { t: "Attorney and CPA handoff preparation", d: "Documents prepared for your first attorney and CPA engagement. Opsirix coordinates the introduction through Nexus — professionals serve you independently." },
  { t: "Initial document collection", d: "Formation documents, operating agreements, founder agreements, and initial contracts collected and organized in Vault." },
  { t: "Business profile in Opsirix OS", d: "Company details, contact list, and setup status available in the central dashboard from day one." },
  { t: "Launch timeline", d: "A structured timeline for the first 30 days of operational setup. Each task has a status and an owner." },
  { t: "Vendor and account setup tracker", d: "Business software, tools, accounts, and service providers tracked as they are set up." },
];

const AUDIENCE = [
  "Pre-launch founders with an idea but no entity yet",
  "Founders who recently formed their company and have not organized the follow-up steps",
  "Immigrant founders who need structured setup before connecting with attorneys or CPAs",
  "Student founders with limited startup operations experience",
  "Solo founders with no operations support",
];

const STEPS = [
  { t: "Complete founder intake", d: "Company details, founder background, current setup status." },
  { t: "Receive your launch checklist", d: "Organized operational checklist based on your company stage and type." },
  { t: "Begin document collection", d: "Formation documents, agreements, and important records added to Vault." },
  { t: "Professional introductions", d: "Attorney and CPA introductions made through Opsirix Nexus." },
  { t: "Launch timeline activated", d: "30-day operational setup timeline begins in Flow." },
  { t: "Baseline Grid score", d: "First Opsirix Grid review establishes your operational baseline." },
];

function Page() {
  return (
    <div className="inner-page">
      <PageHeader
        pageName="Platform → Opsirix Launch"
        label="Platform Module"
        title="Get your startup structured from the beginning."
        subtitle="Opsirix Launch organizes the operational side of going from idea to running company. Formation checklists, document collection, professional handoffs, and operational baseline — coordinated so nothing is missed."
      />

      <section className="inner-section">
        <div className="inner-wrap">
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link to="/contact" className="btn-primary">Book a Discovery Call</Link>
            <Link to="/platform" className="btn-secondary">See All Modules</Link>
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">The Problem</p>
          <h2 className="inner-h2">What happens without a structured launch.</h2>
          <p className="inner-lead">
            Most founders set up their company by figuring it out as they go. Entity filed.
            Bank account opened. Attorney contacted once. And then a pile of follow-up items that
            nobody tracks. Six months later, documents are missing, accounts aren't properly set up,
            and the operational foundation has gaps.
          </p>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">What It Does</p>
          <h2 className="inner-h2">What Opsirix Launch coordinates.</h2>
          <div className="inner-grid-2" style={{ marginTop: 36 }}>
            {FEATURES.map((f) => (
              <div key={f.t} className="inner-card">
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Who It's For</p>
          <h2 className="inner-h2">Who Opsirix Launch is built for.</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 18,
              marginTop: 36,
            }}
          >
            {AUDIENCE.map((a) => (
              <div key={a} className="inner-card">
                <p style={{ margin: 0 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Step by Step</p>
          <h2 className="inner-h2">How Opsirix Launch works.</h2>
          <ol style={{ marginTop: 32, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
            {STEPS.map((s, i) => (
              <li key={s.t} className="inner-card" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <span
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "rgba(0,87,217,0.08)", color: "#0057D9",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13, flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <div>
                  <h3 style={{ margin: "0 0 4px" }}>{s.t}</h3>
                  <p style={{ margin: 0 }}>{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-lead" style={{ fontSize: 14, color: "#64748B" }}>
            Opsirix Launch organizes the operational and documentation side of starting a company.
            It does not provide legal advice, tax advice, immigration advice, or formation services.
            Entity formation, legal opinions, tax filings, and immigration guidance are handled by
            independently retained licensed professionals.
          </p>
          <p className="inner-lead" style={{ marginTop: 20 }}>
            <strong>Connects to:</strong> Vault (documents), Flow (tasks), Nexus (professional
            introductions), OS (dashboard), and Grid (readiness baseline).
          </p>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap" style={{ textAlign: "center" }}>
          <h2 className="inner-h2">Start with a structured foundation.</h2>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 28 }}>
            <Link to="/contact" className="btn-primary">Book a Discovery Call</Link>
            <Link to="/contact" className="btn-secondary">Start Founder Intake</Link>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
