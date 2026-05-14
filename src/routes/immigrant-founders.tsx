import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/immigrant-founders")({
  head: () => ({
    meta: [
      { title: "Opsirix for Immigrant Founders | F-1, H-1B, OPT Operations Support" },
      { name: "description", content: "Opsirix helps F-1, OPT, H-1B, and international founders organize their startup operations. Documentation, workflow clarity, and partner coordination, not immigration advice." },
      { property: "og:title", content: "Opsirix for Immigrant Founders | F-1, H-1B, OPT Operations Support" },
      { property: "og:description", content: "Opsirix helps F-1, OPT, H-1B, and international founders organize their startup operations. Documentation, workflow clarity, and partner coordination, not immigration advice." },
      { property: "og:url", content: "https://opsirix-orbit.lovable.app/immigrant-founders" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix-orbit.lovable.app/immigrant-founders" }],
  }),
  component: Page,
});

const FOUNDER_TYPES = [
  { tag: "F-1 / OPT / STEM OPT", t: "F-1, OPT & STEM OPT", d: "Documentation depth and timing matter. Opsirix organizes records and coordinates with your independently retained immigration attorney." },
  { tag: "H-1B", t: "H-1B Professionals", d: "Side-venture documentation and clean record-keeping matter. Opsirix keeps the operational paper trail organized." },
  { tag: "Green Card", t: "Green Card Holders", d: "You move faster, Opsirix gives you the same operational backbone the rest of your team gets." },
  { tag: "International", t: "International Entrepreneurs", d: "Forming a U.S. entity from abroad is paperwork-heavy. Opsirix coordinates the moving pieces with your attorney and CPA." },
  { tag: "Early-Stage", t: "Early-Stage Founders", d: "Build the operational backbone from day one. Opsirix keeps documents, workflows, and partner coordination organized as you grow." },
];

const FEATURES = [
  { icon: "📁", t: "Documents organized and accessible", d: "Formation papers, banking documents, attorney correspondence, and operating records organized in Opsirix Vault. Available when you need them." },
  { icon: "🗓️", t: "Deadlines tracked in advance", d: "Important dates, renewal timelines, filing deadlines, and review schedules maintained as part of your operational calendar, never discovered after the fact." },
  { icon: "🔗", t: "Attorneys and CPAs coordinated", d: "Opsirix Nexus coordinates scheduling, document delivery, and communication between founders and their licensed professionals. Opsirix does not provide legal or immigration advice." },
  { icon: "📊", t: "Monthly operational health check", d: "The Opsirix Grid scores your operational readiness across five areas each month. You know exactly where you stand and what needs attention." },
];

const HANDLES = [
  "Operational document organization",
  "Workflow and task coordination",
  "Partner scheduling and logistics",
  "Business readiness checklists",
  "Monthly operational reviews",
  "Founder status reports",
  "Calendar and deadline tracking",
  "Professional coordination (not advice)",
];

const PROFESSIONALS = [
  "Immigration legal advice",
  "Visa strategy and applications",
  "Work authorization opinions",
  "Tax advice and filings",
  "CPA services and accounting",
  "Legal document drafting",
  "USCIS filings and correspondence",
  "Regulated compliance decisions",
];

function Page() {
  return (
    <div className="inner-page">
      <PageHeader
        pageName="Immigrant Founders"
        label="For Immigrant Founders"
        title="Operational support for immigrant founders building U.S. companies."
        subtitle="Managing a startup and a visa status at the same time creates real operational complexity. Opsirix organizes the non-legal operational layer so you can focus on building."
      />

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Why It's Operationally Complex</p>
          <h2 className="inner-h2">Why immigrant founders face a different operational reality.</h2>
          <p className="inner-lead">Running a startup means managing entity formation, banking, bookkeeping, payroll, contracts, and partner relationships. Every founder faces this. Immigrant founders face all of this plus documentation requirements, professional coordination timelines, and the discipline of keeping organized records for multiple purposes.</p>
          <p className="inner-lead">This creates operational pressure that compounds. When documents are disorganized and professionals are uncoordinated, small gaps become bigger problems. Opsirix exists to close those gaps on the operational side.</p>
          <p className="inner-lead">Opsirix does not provide immigration advice, visa strategy, or legal guidance. Those matters belong with licensed attorneys. Opsirix handles the operational layer, documents, workflows, coordination, and readiness.</p>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">What Opsirix Organizes</p>
          <h2 className="inner-h2">What Opsirix organizes for immigrant founders.</h2>
          <div className="inner-grid-3">
            {FEATURES.map((c) => (
              <div key={c.t} className="inner-card">
                <div style={{ fontSize: 28, marginBottom: 12 }}>{c.icon}</div>
                <h3>{c.t}</h3>
                <p>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Who Opsirix Serves</p>
          <h2 className="inner-h2">Founder types on Opsirix.</h2>
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
          <p className="inner-eyebrow">Scope Boundary</p>
          <h2 className="inner-h2">What Opsirix does not do.</h2>
          <div className="inner-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginTop: 28 }}>
            <div className="inner-card">
              <h3>Opsirix handles:</h3>
              <ul className="inner-list">
                {HANDLES.map((i) => <li key={i}>{i}</li>)}
              </ul>
            </div>
            <div className="inner-card">
              <h3>Handled by licensed professionals:</h3>
              <ul className="inner-list">
                {PROFESSIONALS.map((i) => <li key={i}>{i}</li>)}
              </ul>
            </div>
          </div>
          <p className="inner-lead" style={{ marginTop: 28, fontSize: 14, opacity: 0.8 }}>
            Opsirix is an operations coordination platform. It is not a law firm, immigration consultancy, CPA firm, or licensed professional services provider. All regulated matters are handled by independently retained licensed professionals.
          </p>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Licensed Professionals</p>
          <h2 className="inner-h2">When to work with a licensed professional.</h2>
          <p className="inner-lead">
            Any question about immigration status, work authorization, visa eligibility, tax
            obligations, accounting, or legal structure requires a licensed professional. Your
            documents stay organized in <Link to="/platform/vault" className="inline-link">Opsirix Vault</Link>,
            and Opsirix can help coordinate your access to the right professional through{" "}
            <Link to="/platform/nexus" className="inline-link">Opsirix Nexus</Link>, but cannot advise on those matters directly.
          </p>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap" style={{ textAlign: "center" }}>
          <h2 className="inner-h2">Ready to get your operations organized?</h2>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
            <Link to="/contact" className="btn-primary">Start Founder Intake</Link>
            <Link to="/how-it-works" className="btn-secondary">Learn how Opsirix works →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
