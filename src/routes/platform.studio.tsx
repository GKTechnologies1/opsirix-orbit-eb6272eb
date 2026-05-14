import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { CTASection } from "@/components/shared/CTASection";
import { RelatedModules } from "@/components/shared/RelatedModules";

export const Route = createFileRoute("/platform/studio")({
  head: () => ({
    meta: [
      { title: "Opsirix Studio | Venture Readiness Layer for Founders" },
      { name: "description", content: "Opsirix Studio is a selective venture readiness layer for operationally mature founders. Investor documentation, business refinement, strategic coordination, and growth preparation — for companies that have already built operational foundations." },
      { property: "og:title", content: "Opsirix Studio | Venture Readiness Layer for Founders" },
      { property: "og:description", content: "Opsirix Studio is a selective venture readiness layer for operationally mature founders. Investor documentation, business refinement, strategic coordination, and growth preparation — for companies that have already built operational foundations." },
      { property: "og:url", content: "https://opsirix-orbit.lovable.app/platform/studio" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix-orbit.lovable.app/platform/studio" }],
  }),
  component: Page,
});

const FEATURES = [
  { t: "Venture readiness review", d: "A structured review of the company's operational, financial, and business maturity against venture-stage requirements." },
  { t: "Investor documentation preparation", d: "Data room organization, founder narrative support, and investor-ready document preparation — coordinated through Vault." },
  { t: "Business model review", d: "Structured review of the business model, unit economics, and growth assumptions with the Opsirix team and relevant advisors." },
  { t: "Strategic partner coordination", d: "Introductions and coordination with strategic advisors, potential investors, and ecosystem partners through Nexus." },
  { t: "Operational maturity review", d: "A deep Grid review assessing readiness across all operational categories with recommendations for investor-readiness gaps." },
  { t: "Growth roadmap support", d: "A structured growth planning process to align operational capacity with business growth targets." },
];

const REQUIREMENTS = [
  "Organized company documentation in Vault or equivalent",
  "Active Opsirix Grid score of 35 or above, or equivalent operational maturity",
  "Clear business model with demonstrated or projected revenue",
  "No open compliance or legal issues requiring resolution first",
  "Serious commitment to venture-level operational discipline",
];

const NOT_DOES = [
  "Opsirix Studio does not guarantee investment or funding.",
  "Opsirix does not invest in every company that applies.",
  "Studio is not an accelerator with guaranteed program placement.",
  "Legal, immigration, tax, and financial advice are handled by independent licensed professionals — not Opsirix Studio.",
  "Studio is a selective operational and strategic support engagement — not a commitment of capital or resources beyond the scope agreed in engagement.",
];

function Page() {
  return (
    <div className="inner-page">
      <PageHeader
        pageName="Platform → Opsirix Studio"
        label="Selective Program"
        title="For founders who have built a solid foundation and are ready for what comes next."
        subtitle="Opsirix Studio is a selective engagement for founders with strong operational foundations, clear documentation, and serious execution capability. It supports the transition from structured early-stage company to venture-ready growth."
      />

      <section className="inner-section">
        <div className="inner-wrap">
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            <span
              style={{
                display: "inline-block",
                padding: "6px 14px",
                background: "#FEF3C7",
                color: "#92400E",
                border: "1px solid #F59E0B",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Selective Program
            </span>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 24 }}>
            <a href="/contact?type=studio" className="btn-primary">
              Apply for Studio Evaluation
            </a>
            <Link to="/platform" className="btn-secondary">See All Modules</Link>
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Positioning</p>
          <h2 className="inner-h2">This is not a standard incubator.</h2>
          <p className="inner-lead">
            Opsirix Studio is selective. Not every founder qualifies. Founders who enter Studio
            already have organized operations, clear documentation, demonstrated execution, and a
            serious business. Studio helps them prepare for the next level — not build the
            foundation they should already have.
          </p>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">What's Included</p>
          <h2 className="inner-h2">What Opsirix Studio covers.</h2>
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
          <p className="inner-eyebrow">Qualification Criteria</p>
          <h2 className="inner-h2">Who qualifies for Opsirix Studio.</h2>
          <p className="inner-lead">
            Founders must demonstrate operational maturity — organized documents, active workflows,
            professional relationships in place, and a serious business with real traction or clear
            growth potential.
          </p>
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 10 }}>
            {REQUIREMENTS.map((r) => (
              <div
                key={r}
                className="inner-card"
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
              >
                <span style={{ color: "#0057D9", fontFamily: "var(--font-mono)", fontWeight: 700, flexShrink: 0 }}>
                  ✓
                </span>
                <p style={{ margin: 0 }}>{r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Important Disclaimer</p>
          <h2 className="inner-h2">What Opsirix Studio does not do.</h2>
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 10 }}>
            {NOT_DOES.map((n) => (
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
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-lead">
            <strong>Connects to:</strong> Grid (readiness assessment), Vault (investor
            documentation), OS (company overview), Nexus (strategic partner introductions), and
            Core (operational support during the Studio engagement if needed).
          </p>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap" style={{ textAlign: "center" }}>
          <h2 className="inner-h2">Apply for Studio evaluation.</h2>
          <p className="inner-lead" style={{ maxWidth: 720, margin: "16px auto 0" }}>
            Applications are reviewed based on operational maturity, business stage, and strategic
            fit. If you believe your company is ready, book a discovery call and indicate you are
            interested in Studio evaluation.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 28 }}>
            <a href="/contact?type=studio" className="btn-primary">
              Apply for Studio Evaluation
            </a>
            <Link to="/contact" className="btn-secondary">Book a Discovery Call</Link>
          </div>
        </div>
      </section>

      <RelatedModules currentSlug="studio" />
      <CTASection />
    </div>
  );
}
