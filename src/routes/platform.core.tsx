import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { CTASection } from "@/components/shared/CTASection";

export const Route = createFileRoute("/platform/core")({
  head: () => ({
    meta: [
      { title: "Opsirix Core | Managed Founder Operations Support" },
      { name: "description", content: "Opsirix Core provides managed operational support for founders who need more than tools. Monthly reviews, task follow-up, document coordination, and partner management — actively handled." },
      { property: "og:title", content: "Opsirix Core | Managed Founder Operations Support" },
      { property: "og:description", content: "Opsirix Core provides managed operational support for founders who need more than tools. Monthly reviews, task follow-up, document coordination, and partner management — actively handled." },
      { property: "og:url", content: "https://opsirix-orbit.lovable.app/platform/core" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix-orbit.lovable.app/platform/core" }],
  }),
  component: Page,
});

const FEATURES = [
  { t: "Monthly founder operations review", d: "A dedicated monthly session covering all operational areas — documents, workflows, partner coordination, and readiness score." },
  { t: "Task follow-up management", d: "Open tasks are actively followed up by the Opsirix team — not just tracked." },
  { t: "Document follow-up", d: "Missing, expiring, or outdated documents are identified and founders are guided through collection." },
  { t: "Partner coordination support", d: "Attorney, CPA, and partner scheduling and follow-up handled by the Opsirix team through Nexus." },
  { t: "Operating checklist management", d: "Formation, financial, and ongoing operating checklists are managed and updated based on company progress." },
  { t: "Founder Status Report", d: "Written monthly report covering operational score, key activities, open items, and priorities for the coming month." },
  { t: "Meeting preparation", d: "Before attorney, CPA, or investor meetings, relevant documents and context are organized and a preparation summary is prepared." },
  { t: "Communication coordination", d: "Professional correspondence tracked and followed up so nothing is missed." },
  { t: "Business process organization", d: "Core business processes documented in Flow so the founder isn't the only system holding things together." },
];

const AUDIENCE = [
  "Active founders who don't have time to self-manage an operational platform",
  "Immigrant founders with complex documentation and coordination needs",
  "Companies in active growth, hiring, or fundraising that need operational support running continuously",
  "Founders transitioning from unstructured to structured operations",
  "Companies preparing for investor due diligence or regulatory review",
];

const NOT_INCLUDED = [
  "Legal advice, immigration advice, or legal document preparation",
  "Tax advice, accounting services, or CPA work",
  "USCIS filings or immigration case management",
  "Executive or strategic decision-making",
  "Equity, investment, or venture services",
];

function Page() {
  return (
    <div className="inner-page">
      <PageHeader
        pageName="Platform → Opsirix Core"
        label="Platform Module"
        title="Operational support that actually runs alongside your startup."
        subtitle="Opsirix Core is the managed operations layer. Instead of tools to manage yourself, you get a dedicated operational support structure: task follow-up, document coordination, partner management, and monthly reporting — actively handled."
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
          <h2 className="inner-h2">When self-managed tools aren't enough.</h2>
          <p className="inner-lead">
            Some founders have the discipline to use a workflow system. Others are building a
            company, managing a team, talking to investors, and handling customers — and there is
            simply no time to self-manage an operational platform. Opsirix Core is built for those
            founders. It runs the operational layer so you don't have to.
          </p>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">What's Included</p>
          <h2 className="inner-h2">What Opsirix Core provides.</h2>
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
          <h2 className="inner-h2">Who Opsirix Core is built for.</h2>
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
          <p className="inner-eyebrow">Boundaries</p>
          <h2 className="inner-h2">What Opsirix Core does not provide.</h2>
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 10 }}>
            {NOT_INCLUDED.map((n) => (
              <div
                key={n}
                className="inner-card"
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
              >
                <span style={{ color: "#0057D9", fontFamily: "var(--font-mono)", fontWeight: 700, flexShrink: 0 }}>
                  ×
                </span>
                <p style={{ margin: 0 }}>{n}</p>
              </div>
            ))}
          </div>
          <p className="inner-lead" style={{ marginTop: 24, fontSize: 14, color: "#64748B" }}>
            All regulated matters are handled by independently retained licensed professionals
            through Opsirix Nexus.
          </p>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-lead">
            <strong>Connects to:</strong> Vault (document management), Flow (task management),
            Nexus (partner coordination), Grid (monthly review), OS (dashboard and status), AI
            (alerts and detection).
          </p>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap" style={{ textAlign: "center" }}>
          <h2 className="inner-h2">Get operational support running alongside your startup.</h2>
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
