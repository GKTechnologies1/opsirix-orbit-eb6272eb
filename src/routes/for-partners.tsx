import { createFileRoute, Link } from "@tanstack/react-router";
import { getPublishedContent } from "@/lib/content.functions";
import { PageHeader } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/for-partners")({
  head: () => ({
    meta: [
      { title: "Partner With Opsirix | Nexus Partner Network for Attorneys and CPAs" },
      { name: "description", content: "Join the Opsirix Nexus partner network. Get referrals to organized, prepared founders. Work with clients who have their operational documents ready." },
      { property: "og:title", content: "Partner With Opsirix | Nexus Partner Network for Attorneys and CPAs" },
      { property: "og:description", content: "Join the Opsirix Nexus partner network. Get referrals to organized, prepared founders. Work with clients who have their operational documents ready." },
      { property: "og:url", content: "https://opsirix.com/for-partners" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix.com/for-partners" }],
  }),
  loader: async () => (await getPublishedContent({ data: { keys: ["partners.intro"] } }))["partners.intro"] ?? null,
  errorComponent: () => <main className="inner-page"><h1>This page is temporarily unavailable.</h1></main>,
  notFoundComponent: () => <main className="inner-page"><h1>Page not found.</h1></main>,
  component: Page,
});

const BENEFITS = [
  { t: "Prepared founders", d: "Founders who come through Opsirix have organized documents, completed intake forms, and a clear picture of their operational situation before the first conversation." },
  { t: "Clear referral scope", d: "Opsirix routes founders to the right professional based on their specific operational situation. No cold referrals. Context is provided upfront." },
  { t: "Less back-and-forth", d: "Because Opsirix organizes documents and operational context before the professional introduction, less time is spent on basic administrative setup." },
  { t: "Clear professional boundaries", d: "Opsirix handles operations coordination. Partners provide licensed professional advice. The separation is clear in every engagement." },
];

const TYPES = [
  { t: "Immigration Attorneys", d: "Founders with organized documentation and clear context." },
  { t: "CPAs and Bookkeepers", d: "Financial coordination handled. Accounting work ready to begin." },
  { t: "Banking Partners", d: "Startup-ready founders who need business banking setup." },
  { t: "Insurance Brokers", d: "Founders who need GL, E&O, or Cyber Liability coverage." },
  { t: "Technology Partners", d: "Founders who need software development, AI, or MVP builds." },
  { t: "University Partners", d: "Campus programs seeking operational resources for student founders." },
];

const STEPS = [
  "Founder completes intake, operational situation documented.",
  "Opsirix identifies the right professional based on founder's needs.",
  "Warm introduction made with context, documents prepared.",
  "Professional engagement begins. Opsirix coordinates logistics.",
  "Ongoing coordination continues. Clear scope maintained.",
];

function Page() {
  const intro = Route.useLoaderData();
  return (
    <div className="inner-page">
      <PageHeader
        pageName="For Partners"
        label="Nexus Partner Network"
        title={intro?.heading ?? "Join the Opsirix Nexus partner network."}
        subtitle={intro?.body ?? "Opsirix connects founders to attorneys, CPAs, insurance, banking, and technology partners at the right moment in their operational journey. Every partner serves founders independently. Opsirix handles the coordination."}
      />

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Why Partners Join Nexus</p>
          <h2 className="inner-h2">What partners gain from Nexus.</h2>
          <div className="inner-grid-3">
            {BENEFITS.map((c) => <div key={c.t} className="inner-card"><h3>{c.t}</h3><p>{c.d}</p></div>)}
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Partner Types</p>
          <h2 className="inner-h2">Who joins the Nexus network.</h2>
          <div className="inner-grid-3">
            {TYPES.map((t) => (
              <div key={t.t} className="inner-card">
                <h3>{t.t}</h3>
                <p>{t.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">How Nexus Works</p>
          <h2 className="inner-h2">How Opsirix Nexus works.</h2>
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14 }}>
            {STEPS.map((s, i) => (
              <div key={i} className="inner-card" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div className="num-badge" style={{ flexShrink: 0 }}>{i + 1}</div>
                <p style={{ margin: 0 }}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Scope Boundary</p>
          <h2 className="inner-h2">Clear scope, what Opsirix does not provide.</h2>
          <p className="inner-lead">Opsirix does not provide legal advice, immigration advice, tax advice, accounting services, or any licensed professional services. Partners provide the professional advice. Opsirix provides the operational coordination layer. This boundary is maintained in every founder engagement.</p>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Apply</p>
          <h2 className="inner-h2">Apply to join the Nexus network.</h2>

          <div style={{ maxWidth: 640, marginTop: 32 }} className="contact-card">
            <h3 className="contact-h3">Tell us what you do best.</h3>
            <p className="contact-sub">We'll review your details and help you set up a profile that makes it easier for the right people to find you.</p>
            <Link to="/auth" search={{ next: "/partner/apply" }} className="contact-submit">
              Start Partner Registration
            </Link>
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap" style={{ textAlign: "center" }}>
          <h2 className="inner-h2">Ready to join the Nexus network?</h2>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
            <Link to="/auth" search={{ next: "/partner/apply" }} className="btn-primary">Become a Nexus Partner →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
