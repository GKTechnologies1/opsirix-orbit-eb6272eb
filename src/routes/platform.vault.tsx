import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { CTASection } from "@/components/shared/CTASection";
import { RelatedModules } from "@/components/shared/RelatedModules";

export const Route = createFileRoute("/platform/vault")({
  head: () => ({
    meta: [
      { title: "Opsirix Vault | Founder Document Organization System" },
      { name: "description", content: "Organize company documents, formation records, partner handoff packets, and business files in one structured document vault built for early-stage and immigrant founders." },
      { property: "og:title", content: "Opsirix Vault | Founder Document Organization System" },
      { property: "og:description", content: "Organize company documents, formation records, partner handoff packets, and business files in one structured document vault built for early-stage and immigrant founders." },
      { property: "og:url", content: "https://opsirix-orbit.lovable.app/platform/vault" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix-orbit.lovable.app/platform/vault" }],
  }),
  component: Page,
});

const CATEGORIES = [
  { t: "Company Formation Records", d: "Articles of incorporation, operating agreement, founder agreements, EIN letter, state registration documents." },
  { t: "Financial and Banking Documents", d: "Business bank account records, bookkeeping setup, tax identification documents, financial statements when available." },
  { t: "Attorney and Legal Correspondence", d: "Engagement letters, correspondence, legal opinions (held by founder — not provided by Opsirix), contracts and agreements." },
  { t: "Compliance-Related Documentation", d: "Compliance calendar events, important notices, renewal documents, filing confirmations. No legal advice provided." },
  { t: "Vendor and Service Provider Records", d: "Software subscriptions, service agreements, vendor contracts, insurance certificates." },
  { t: "Partner Handoff Packets", d: "Document sets prepared for attorney or CPA engagements — organized by Opsirix, reviewed by the relevant licensed professional." },
  { t: "Employment and People Documents", d: "Offer letters, contractor agreements, non-disclosure agreements, HR records when applicable." },
];

const AUDIENCE = [
  "Founders who can't find their formation documents when asked",
  "Immigrant founders with visa-related correspondence that must be organized",
  "Companies preparing for investor due diligence or banking review",
  "Founders who have had attorneys or CPAs ask for documents and couldn't find them",
  "Startups with growing document complexity and no organization system",
];

const CAPABILITIES = [
  { t: "Document status labels", d: "Documents marked as current, expiring, missing, or under review." },
  { t: "Missing document alerts", d: "When expected documents are absent from a folder, the gap is visible." },
  { t: "Partner-ready document packets", d: "Before an attorney or CPA engagement, relevant documents are organized into a packet for their review." },
  { t: "Audit-readiness tracking", d: "Document completeness visible as part of the monthly Grid review." },
];

function Page() {
  return (
    <div className="inner-page">
      <PageHeader
        pageName="Platform → Opsirix Vault"
        label="Platform Module"
        title="Stop losing documents across email and random folders."
        subtitle="Opsirix Vault is the document organization layer of the platform. Formation papers, attorney correspondence, financial records, and operational documents — organized, labeled, and ready when you need them."
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
          <h2 className="inner-h2">What most founders experience.</h2>
          <p className="inner-lead">
            Formation documents are in a Google Drive folder nobody organized. The EIN letter is
            in an old email. The attorney engagement letter might be in Downloads. The operating
            agreement was signed somewhere. When a bank, investor, or attorney asks for a document,
            the founder spends two hours looking for it.
          </p>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Document Categories</p>
          <h2 className="inner-h2">What Opsirix Vault organizes.</h2>
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 14 }}>
            {CATEGORIES.map((c) => (
              <div key={c.t} className="inner-card">
                <h3>{c.t}</h3>
                <p>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Who It's For</p>
          <h2 className="inner-h2">Who needs Opsirix Vault.</h2>
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
          <p className="inner-eyebrow">Capabilities</p>
          <h2 className="inner-h2">Key Vault capabilities.</h2>
          <div className="inner-grid-2" style={{ marginTop: 36 }}>
            {CAPABILITIES.map((c) => (
              <div key={c.t} className="inner-card">
                <h3>{c.t}</h3>
                <p>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-lead" style={{ fontSize: 14, color: "#64748B" }}>
            Opsirix Vault organizes documents. It does not review, interpret, or advise on the
            content of legal documents. It does not provide immigration document preparation,
            USCIS filing assistance, legal opinions, or tax advice. All regulated document review
            is handled by independently retained licensed professionals.
          </p>
          <p className="inner-lead" style={{ marginTop: 20 }}>
            <strong>Connects to:</strong> OS (document status in dashboard), Flow (document tasks
            and handoffs), Nexus (partner packets), Grid (documentation readiness score), and AI
            (missing document detection).
          </p>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap" style={{ textAlign: "center" }}>
          <h2 className="inner-h2">Get your documents organized.</h2>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 28 }}>
            <Link to="/contact" className="btn-primary">Book a Discovery Call</Link>
            <Link to="/platform" className="btn-secondary">Explore Other Modules</Link>
          </div>
        </div>
      </section>

      <RelatedModules currentSlug="vault" />
      <CTASection />
    </div>
  );
}
