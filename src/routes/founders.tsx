import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderOpen, CalendarClock, Link2, BarChart3 } from "lucide-react";
import { getPublishedContent } from "@/lib/content.functions";
import { PageHeader } from "@/components/shared/PageHeader";

const TITLE = "Opsirix for Founders and Business Owners | Operations Support";
const DESC = "Opsirix helps founders and business owners organize documents, workflows, and professional coordination, with dedicated support for immigrant founders. Not legal or immigration advice.";

export const Route = createFileRoute("/founders")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "https://opsirix.com/founders" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix.com/founders" }],
  }),
  loader: async () => (await getPublishedContent({ data: { keys: ["founders.intro"] } }))["founders.intro"] ?? null,
  errorComponent: () => <main className="inner-page"><h1>This page is temporarily unavailable.</h1></main>,
  notFoundComponent: () => <main className="inner-page"><h1>Page not found.</h1></main>,
  component: Page,
});

const WHO = [
  { t: "Early-stage founders", d: "Setting up an entity, bank account, bookkeeping, and first contracts, and wanting one organized place for all of it." },
  { t: "Small business owners", d: "Running an existing business and tired of documents, deadlines, and professional contacts scattered across inboxes." },
  { t: "Technical and solo founders", d: "Building the product and needing the operational side kept in order without hiring an operations team yet." },
  { t: "Immigrant and international founders", d: "Everything above, plus extra documentation discipline and professional coordination. See the dedicated section below." },
];

const PROBLEMS = [
  "Formation, banking, and operating documents spread across email and drives",
  "Filing dates, renewals, and review deadlines tracked from memory",
  "Attorneys, CPAs, and other professionals working without shared context",
  "No clear picture of what is done, what is pending, and what needs attention",
];

const FOUNDER_TYPES = [
  { tag: "F-1 / OPT / STEM OPT", t: "F-1, OPT & STEM OPT", d: "Documentation depth and timing matter. Opsirix organizes records and coordinates with your independently retained immigration attorney." },
  { tag: "H-1B", t: "H-1B Professionals", d: "Side-venture documentation and clean record-keeping matter. Opsirix keeps the operational paper trail organized." },
  { tag: "Green Card", t: "Green Card Holders", d: "You move faster, Opsirix gives you the same operational backbone the rest of your team gets." },
  { tag: "International", t: "International Entrepreneurs", d: "Forming a U.S. entity from abroad is paperwork-heavy. Opsirix coordinates the moving pieces with your attorney and CPA." },
  { tag: "Early-Stage", t: "Early-Stage Founders", d: "Build the operational backbone from day one. Opsirix keeps documents, workflows, and partner coordination organized as you grow." },
];

const FEATURES = [
  { icon: FolderOpen, t: "Documents organized and accessible", d: "Formation papers, banking documents, attorney correspondence, and operating records organized in Opsirix Vault. Available when you need them." },
  { icon: CalendarClock, t: "Deadlines tracked in advance", d: "Important dates, renewal timelines, filing deadlines, and review schedules maintained as part of your operational calendar, never discovered after the fact." },
  { icon: Link2, t: "Attorneys and CPAs coordinated", d: "Opsirix Nexus coordinates scheduling, document delivery, and communication between founders and their licensed professionals. Opsirix does not provide legal or immigration advice." },
  { icon: BarChart3, t: "Monthly operational health check", d: "The Opsirix Grid scores your operational readiness across five areas each month. You know exactly where you stand and what needs attention." },
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
  const intro = Route.useLoaderData();
  return (
    <div className="inner-page">
      <PageHeader
        pageName="Founders"
        label="For Founders"
        title={intro?.heading ?? "Operational support for founders and business owners."}
        subtitle={intro?.body ?? "Opsirix helps founders and business owners organize documents, workflows, and professional coordination so they can focus on building. Every founder is welcome, whatever their background."}
      />

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Who Opsirix Serves</p>
          <h2 className="inner-h2">Built for founders at every stage.</h2>
          <div className="inner-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginTop: 28 }}>
            {WHO.map((w) => (
              <div key={w.t} className="inner-card"><h3>{w.t}</h3><p>{w.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">What Opsirix Organizes</p>
          <h2 className="inner-h2">The operational problems Opsirix helps organize.</h2>
          <ul className="inner-list" style={{ marginTop: 20 }}>
            {PROBLEMS.map((p) => <li key={p}>{p}</li>)}
          </ul>
          <p className="inner-lead" style={{ marginTop: 20 }}>Opsirix handles the operational layer: documents, workflows, coordination, and readiness. Legal, tax, immigration, and other regulated matters stay with licensed professionals you choose.</p>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Ways to Get Help</p>
          <h2 className="inner-h2">Choose the path that fits.</h2>
          <div className="inner-grid-3">
            <div className="inner-card"><h3>Book a discovery call</h3><p>Talk through your company stage and operational needs with Opsirix.</p><Link to="/contact" className="inline-link">Book a call</Link></div>
            <div className="inner-card"><h3>Find professional help</h3><p>Ask Opsirix Nexus for a human-reviewed introduction to an attorney, CPA, software firm, university program, banking partner, or insurance broker. No other purchase is required.</p><Link to="/nexus/help" className="inline-link">Find help through Nexus</Link></div>
            <div className="inner-card"><h3>See how it works</h3><p>Follow the founder journey from first call to organized operations.</p><Link to="/how-it-works" className="inline-link">How Opsirix works</Link></div>
          </div>
        </div>
      </section>

      <div id="immigrant-founders" style={{ scrollMarginTop: 120 }}>
      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Dedicated Support</p>
          <h2 className="inner-h2">Support for immigrant founders.</h2>
          <p className="inner-lead">F-1, OPT, H-1B, green card holders, and international entrepreneurs building U.S. companies get dedicated operational support. You do not need any particular immigration background to use Opsirix; this section covers the extra operational work some founders face.</p>
        </div>
      </section>
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
                <div style={{ marginBottom: 12, color: "var(--color-brand-blue, #0057D9)" }}><c.icon size={26} strokeWidth={1.75} aria-hidden /></div>
                <h3>{c.t}</h3>
                <p>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Founder Types</p>
          <h2 className="inner-h2">Immigrant and international founder types.</h2>
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

      </div>

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
