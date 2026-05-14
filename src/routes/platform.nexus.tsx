import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { CTASection } from "@/components/shared/CTASection";
import { RelatedModules } from "@/components/shared/RelatedModules";

export const Route = createFileRoute("/platform/nexus")({
  head: () => ({
    meta: [
      { title: "Opsirix Nexus | Professional Partner Coordination Network" },
      { name: "description", content: "Opsirix Nexus connects founders to attorneys, CPAs, insurance, and banking partners with organized intake, warm introductions, and clear professional boundaries." },
      { property: "og:title", content: "Opsirix Nexus | Professional Partner Coordination Network" },
      { property: "og:description", content: "Opsirix Nexus connects founders to attorneys, CPAs, insurance, and banking partners with organized intake, warm introductions, and clear professional boundaries." },
      { property: "og:url", content: "https://opsirix-orbit.lovable.app/platform/nexus" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix-orbit.lovable.app/platform/nexus" }],
  }),
  component: Page,
});

const FOUNDER_FEATURES = [
  { t: "Professional introductions", d: "Nexus matches founders to the right licensed professional based on their company type, needs, and operational stage." },
  { t: "Document preparation", d: "Before a professional engagement, relevant documents from Vault are organized into a packet so the founder arrives prepared." },
  { t: "Scheduling and follow-up", d: "Meeting scheduling, follow-up reminders, and handoff tracking are handled through Flow." },
  { t: "Status visibility", d: "Active and upcoming professional engagements visible in the OS dashboard." },
];

const PARTNER_FEATURES = [
  { t: "Organized founder referrals", d: "Partners receive introductions to founders with completed intake forms, organized documents, and clear context." },
  { t: "Clear scope from the start", d: "Every Nexus introduction clarifies that Opsirix handles operations coordination. The professional handles licensed advice." },
  { t: "Less administrative friction", d: "Founders in the Nexus network have organized records, reducing back-and-forth before work can begin." },
];

const PARTNER_TYPES = [
  "Attorneys (general business)",
  "Immigration attorneys",
  "CPAs and tax professionals",
  "Bookkeepers",
  "Insurance brokers",
  "Payroll providers",
  "Business bankers",
  "Startup advisors",
  "University and incubator partners",
];

function Page() {
  return (
    <div className="inner-page">
      <PageHeader
        pageName="Platform → Opsirix Nexus"
        label="Platform Module"
        title="The right professional, at the right time, with the right information."
        subtitle="Opsirix Nexus coordinates the relationship between founders and their licensed professional partners. Scheduling, document preparation, and follow-through, so founders arrive prepared and professionals receive organized clients."
      />

      <section className="inner-section">
        <div className="inner-wrap">
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link to="/contact" className="btn-primary">Book a Discovery Call</Link>
            <Link to="/for-partners" className="btn-secondary">Become a Nexus Partner</Link>
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">The Problem</p>
          <h2 className="inner-h2">Why founder-professional relationships often fail.</h2>
          <p className="inner-lead">
            Founders reach out to attorneys or CPAs without context. Meetings happen without the
            right documents. Follow-up gets lost in email. Relationships start with friction that
            shouldn't exist. The result: slower progress, higher cost, and a founder who doesn't
            know what to do between professional engagements.
          </p>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">What Nexus Does</p>
          <h2 className="inner-h2">What Opsirix Nexus coordinates.</h2>
          <div className="inner-cols" style={{ marginTop: 36 }}>
            <div className="inner-col-card included">
              <h3>For Founders</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
                {FOUNDER_FEATURES.map((f) => (
                  <div key={f.t}>
                    <h4 style={{ fontFamily: "var(--font-sora)", fontWeight: 700, fontSize: 15, color: "#071B33", margin: "0 0 4px" }}>
                      {f.t}
                    </h4>
                    <p style={{ margin: 0, fontSize: 14, color: "#64748B", lineHeight: 1.65 }}>
                      {f.d}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="inner-col-card routed">
              <h3>For Partners</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
                {PARTNER_FEATURES.map((f) => (
                  <div key={f.t}>
                    <h4 style={{ fontFamily: "var(--font-sora)", fontWeight: 700, fontSize: 15, color: "#071B33", margin: "0 0 4px" }}>
                      {f.t}
                    </h4>
                    <p style={{ margin: 0, fontSize: 14, color: "#64748B", lineHeight: 1.65 }}>
                      {f.d}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Partner Types</p>
          <h2 className="inner-h2">Who is in the Nexus network.</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
              marginTop: 36,
            }}
          >
            {PARTNER_TYPES.map((p) => (
              <div key={p} className="inner-card">
                <p style={{ margin: 0 }}>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Compliance Boundary</p>
          <h2 className="inner-h2">What Opsirix Nexus does not do.</h2>
          <p className="inner-lead">
            Opsirix Nexus coordinates the introduction and logistics. It does not provide legal
            advice, immigration advice, tax advice, or any regulated professional service. Every
            partner in the Nexus network serves founders independently under their own engagement
            terms. Opsirix does not supervise, direct, or participate in licensed professional
            work.
          </p>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap" style={{ textAlign: "center" }}>
          <h2 className="inner-h2">Ready to connect?</h2>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 28 }}>
            <Link to="/contact" className="btn-primary">Book a Discovery Call</Link>
            <Link to="/for-partners" className="btn-secondary">Apply to Join Nexus</Link>
          </div>
        </div>
      </section>

      <RelatedModules currentSlug="nexus" />
      <CTASection />
    </div>
  );
}
