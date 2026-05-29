import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { CTASection } from "@/components/shared/CTASection";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How Opsirix Works | Founder Operations Platform" },
      { name: "description", content: "See how Opsirix coordinates documents, workflows, and professional partners for early-stage founders. From intake to operational readiness." },
      { property: "og:title", content: "How Opsirix Works | Founder Operations Platform" },
      { property: "og:description", content: "See how Opsirix coordinates documents, workflows, and professional partners for early-stage founders. From intake to operational readiness." },
      { property: "og:url", content: "https://opsirix.com/how-it-works" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix.com/how-it-works" }],
  }),
  component: Page,
});

const PILLARS = [
  { n: "01", t: "Attorney Gate", d: "Every immigration, legal, or tax question is automatically routed to a licensed professional. Opsirix never opines on substance." },
  { n: "02", t: "Stop-Work Protocol", d: "If any matter approaches a regulated boundary, work pauses until a licensed professional confirms the path forward in writing." },
  { n: "03", t: "Risk Classification", d: "Every workflow is classified as administrative, coordination, or licensed-professional. Each tier has its own routing rule." },
  { n: "04", t: "7-Day SLA", d: "Founder requests receive an action or routing decision within 7 calendar days. The audit log records every step." },
  { n: "05", t: "Audit Evidence Trail", d: "Each task generates a timestamped record, request, classification, action, professional sign-off, preserved in the Vault." },
  { n: "06", t: "Nexus Independence", d: "Every Nexus partner serves you under their own engagement letter. Opsirix never controls the substance of their advice." },
];

const ONBOARDING = [
  ["01", "Platform Service Agreement", "Defines what Opsirix is and is not, administrative coordination only.", "Day 1 of onboarding"],
  ["02", "Scope & Boundary Acknowledgment", "Founder confirms understanding that Opsirix provides no legal, immigration, or tax advice.", "Day 1 of onboarding"],
  ["03", "Nexus Coordination Authorization", "Authorizes Opsirix to coordinate logistics with your independently retained professionals.", "Before first Nexus intro"],
  ["04", "Vault & Data Handling Consent", "Defines how documents are stored, who can access them, and your rights to export.", "Before Vault activation"],
];

function Page() {
  return (
    <div className="inner-page">
      <PageHeader pageName="How It Works" label="The Model" title="Operational infrastructure, explained." subtitle="How Opsirix coordinates the layer between founders and licensed professionals." />

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">The Problem We Solve</p>
          <h2 className="inner-h2">Founders don't fail from bad ideas. They fail from operational chaos.</h2>
          <div className="inner-grid-3">
            {[
              { t: "Documents scattered everywhere", d: "Cap tables in Notion, contracts in Gmail, EIN letter on someone's desktop. When you need it, you can't find it." },
              { t: "Professionals who don't talk to each other", d: "Your attorney, CPA, and bank operate in silos. You become the human integration layer between them." },
              { t: "No system, no rhythm, no record", d: "There's no monthly review, no readiness score, no audit trail. Just a constant background hum of things slipping." },
            ].map((p) => (
              <div key={p.t} className="inner-card"><h3>{p.t}</h3><p>{p.d}</p></div>
            ))}
          </div>
          <p className="inner-lead" style={{ marginTop: 28 }}><strong style={{ color: "#071B33" }}>The solution:</strong> a coordination layer that runs the operational rhythm of your company every week, so you can run the business.</p>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">The Opsirix Model</p>
          <h2 className="inner-h2">Three layers. One coordination engine in the middle.</h2>
          <div className="layer-diagram">
            <div className="layer-row pro">
              <div className="layer-label">Layer 1</div>
              <div className="layer-name">Professional Layer</div>
              <div className="layer-desc">Licensed attorneys, CPAs, bankers, independently retained, providing all substantive advice.</div>
            </div>
            <div className="layer-connector" />
            <div className="layer-row ops">
              <div className="layer-label">Layer 2</div>
              <div className="layer-name">Opsirix Orchestration</div>
              <div className="layer-desc">
                <Link to="/platform/vault" className="inline-link">Vault</Link>,{" "}
                <Link to="/platform/flow" className="inline-link">Flow</Link>,{" "}
                <Link to="/platform/nexus" className="inline-link">Nexus</Link>,{" "}
                <Link to="/platform/grid" className="inline-link">Grid</Link>{" "}
               , the coordination layer that organizes documents, runs workflows, and routes requests.
              </div>
            </div>
            <div className="layer-connector" />
            <div className="layer-row fnd">
              <div className="layer-label">Layer 3</div>
              <div className="layer-name">Founder</div>
              <div className="layer-desc">You, building the company, with one operational backbone instead of ten disconnected tools.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">The Six Compliance Pillars</p>
          <h2 className="inner-h2">The structural rules that keep Opsirix in its lane.</h2>
          <div className="inner-grid-3">
            {PILLARS.map((p) => (
              <div key={p.n} className="inner-card">
                <div className="num-badge">{p.n}</div>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Onboarding</p>
          <h2 className="inner-h2">Four documents. Then the platform turns on.</h2>
          <table className="inner-table">
            <thead><tr><th>Doc #</th><th>Name</th><th>What It Does</th><th>When Signed</th></tr></thead>
            <tbody>{ONBOARDING.map((r) => (<tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>))}</tbody>
          </table>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Monthly Rhythm</p>
          <h2 className="inner-h2">Every month, the same seven-part Grid review.</h2>
          <ul className="inner-list">
            <li>Documentation completeness, what's in the <Link to="/platform/vault" className="inline-link">Vault</Link>, what's missing.</li>
            <li>Compliance status, every recurring deadline, filing window, and renewal.</li>
            <li>Financial coordination, bookkeeping cadence, CPA touchpoints, payroll status.</li>
            <li>Operational workflow, <Link to="/platform/flow" className="inline-link">Flow</Link> board health, blockers, owner accountability.</li>
            <li><Link to="/platform/nexus" className="inline-link">Nexus</Link> coordination, open threads with your attorney, CPA, banker, insurer.</li>
            <li>Startup readiness, investor-grade documentation and data-room status.</li>
            <li>Founder Status Report, a written summary delivered to you within 48 hours of the <Link to="/platform/grid" className="inline-link">Grid</Link> review.</li>
          </ul>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
