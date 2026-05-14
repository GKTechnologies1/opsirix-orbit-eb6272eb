import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { CTASection } from "@/components/shared/CTASection";
import { RelatedModules } from "@/components/shared/RelatedModules";

export const Route = createFileRoute("/platform/grid")({
  head: () => ({
    meta: [
      { title: "Opsirix Grid | Operational Readiness Score for Founders" },
      { name: "description", content: "Monthly operational readiness score across ten categories. Know where your company is strong, where it needs attention, and what to prioritize next." },
      { property: "og:title", content: "Opsirix Grid | Operational Readiness Score for Founders" },
      { property: "og:description", content: "Monthly operational readiness score across ten categories. Know where your company is strong, where it needs attention, and what to prioritize next." },
      { property: "og:url", content: "https://opsirix-orbit.lovable.app/platform/grid" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix-orbit.lovable.app/platform/grid" }],
  }),
  component: Page,
});

const CATEGORIES = [
  { t: "Entity and company setup", d: "Is the business properly formed, registered, and documented?" },
  { t: "Documentation readiness", d: "Are key documents organized, current, and accessible in Vault?" },
  { t: "Financial operations", d: "Are bookkeeping, banking, payroll, and financial records in order?" },
  { t: "Partner coordination", d: "Are attorney, CPA, and service partner relationships active and current?" },
  { t: "Workflow discipline", d: "Are tasks tracked, followed up, and completed within reasonable timeframes?" },
  { t: "Compliance calendar", d: "Are upcoming deadlines, renewals, and filing windows tracked and visible?" },
  { t: "Founder role clarity", d: "Is the founder's operational role documented and clear?" },
  { t: "Vendor and account setup", d: "Are business software, vendors, and service accounts set up and documented?" },
  { t: "Insurance and risk readiness", d: "Does the company have appropriate business insurance for its stage?" },
  { t: "Growth readiness", d: "Is the company operationally ready for the next phase — hiring, fundraising, or expansion?" },
];

const STEPS = [
  { t: "Review session (45-60 minutes)", d: "Founder and Opsirix team review each category against current documentation, workflows, and activities." },
  { t: "Score calculated", d: "Each category is scored. Areas of strength and areas needing attention are identified." },
  { t: "Status report delivered", d: "The Founder Status Report summarizes the session: score, key findings, priorities for the next month, and open action items." },
  { t: "Action items enter Flow", d: "Improvement actions become tasks in Opsirix Flow with owners and due dates." },
  { t: "Progress tracked month over month", d: "Score history visible in Opsirix OS. Improvement over time is clear." },
];

const DELIVERABLES = [
  "Monthly operational readiness score (total and by category)",
  "Written Founder Status Report",
  "Priority list for the coming month",
  "Updated task list in Flow",
  "Score history tracked in OS",
];

function Page() {
  return (
    <div className="inner-page">
      <PageHeader
        pageName="Platform → Opsirix Grid"
        label="Platform Module"
        title="A monthly score for every area of your operations."
        subtitle="Opsirix Grid reviews your company across ten operational categories each month. The result is a structured readiness score, a written status report, and a clear picture of what needs attention next."
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
          <h2 className="inner-h2">What most founders don't know about their own company.</h2>
          <p className="inner-lead">
            Ask a founder how their operations are doing. Most will say "fine" or "pretty good."
            Ask them to show you their document readiness, compliance calendar, vendor setup, or
            insurance status. Most won't have a clear answer. Without structure, founders have
            opinions about their operational health — not data.
          </p>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">The 10 Categories</p>
          <h2 className="inner-h2">What the Grid scores each month.</h2>
          <p className="inner-lead">Each category is reviewed and scored as part of the monthly Grid session.</p>
          <ol style={{ marginTop: 32, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
            {CATEGORIES.map((c, i) => (
              <li key={c.t} className="inner-card" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
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
                  <h3 style={{ margin: "0 0 4px" }}>{c.t}</h3>
                  <p style={{ margin: 0 }}>{c.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="inner-lead" style={{ marginTop: 28, fontSize: 14, color: "#64748B" }}>
            The Grid score is an internal operational readiness indicator. It is not a legal
            compliance certification, a regulatory audit, or a guarantee of compliance. Regulatory
            and legal compliance matters are handled by licensed professionals.
          </p>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Monthly Review</p>
          <h2 className="inner-h2">The monthly Grid review process.</h2>
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

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Deliverables</p>
          <h2 className="inner-h2">What comes out of every Grid review.</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 18,
              marginTop: 36,
            }}
          >
            {DELIVERABLES.map((d) => (
              <div key={d} className="inner-card">
                <p style={{ margin: 0 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-lead">
            <strong>Connects to:</strong> Vault (documentation score), Flow (task score and action
            items), Nexus (partner coordination score), OS (score visible in dashboard), AI
            (patterns across monthly reviews).
          </p>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap" style={{ textAlign: "center" }}>
          <h2 className="inner-h2">Get a clear picture of your operational health.</h2>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 28 }}>
            <Link to="/contact" className="btn-primary">Book a Discovery Call</Link>
            <Link to="/platform" className="btn-secondary">Explore Other Modules</Link>
          </div>
        </div>
      </section>

      <RelatedModules currentSlug="grid" />
      <CTASection />
    </div>
  );
}
