import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { CTASection } from "@/components/shared/CTASection";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Opsirix Platform Services | Founder Operations Overview" },
      { name: "description", content: "The Opsirix platform gives founders nine connected modules for documents, workflows, partner coordination, and operational readiness. No pricing on this page." },
      { property: "og:title", content: "Opsirix Platform Services | Founder Operations Overview" },
      { property: "og:description", content: "The Opsirix platform gives founders nine connected modules for documents, workflows, partner coordination, and operational readiness. No pricing on this page." },
      { property: "og:url", content: "https://opsirix.com/services" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix.com/services" }],
  }),
  component: Page,
});

const MODULES: { t: string; d: string; href: string }[] = [
  { t: "Opsirix OS", d: "The connective layer. Founder dashboard, compliance calendar, and unified view of every module in one place.", href: "/platform/os" },
  { t: "Opsirix Launch", d: "Onboarding and formation coordination. Stand up a company, organize the first documents, and meet your professional partners.", href: "/platform/launch" },
  { t: "Opsirix Flow", d: "Weekly operational project board. Every task has an owner, a due date, and a status, your week, run on rails.", href: "/platform/flow" },
  { t: "Opsirix Vault", d: "Centralized operational document repository. Formation docs, contracts, employment paperwork, versioned, tagged, audit-ready.", href: "/platform/vault" },
  { t: "Opsirix Nexus", d: "Coordination layer for your independently retained licensed professionals, attorneys, CPAs, bankers, insurers.", href: "/platform/nexus" },
  { t: "Opsirix Grid", d: "Monthly Operational Readiness Score across documentation, compliance, financial coordination, workflow, and startup readiness.", href: "/platform/grid" },
  { t: "Opsirix AI", d: "Intelligent support across the platform, pattern recognition, risk surfacing, and proactive operational guidance.", href: "/platform/ai" },
  { t: "Opsirix Core", d: "Embedded operational backbone for funded or scaling companies. Higher coordination volume, dedicated weekly cadence.", href: "/platform/core" },
  { t: "Opsirix Studio", d: "Founder-facing workspace for templates, playbooks, and operational artifacts you build alongside the Opsirix team.", href: "/platform/studio" },
];

const INCLUDED = [
  "Document organization & Vault management",
  "Weekly Flow board operation",
  "Administrative coordination with your professionals",
  "Monthly Grid review & Status Report",
  "Compliance calendar & reminder cadence",
  "Audit evidence trail for every task",
  "Founder Dashboard access",
];
const ROUTED = [
  "Immigration advice & visa strategy",
  "Tax advice & filings",
  "Legal opinions & contract drafting",
  "USCIS filings & petitions",
  "Banking decisions & loan structuring",
  "Insurance underwriting & coverage advice",
  "Any opinion on regulated subject matter",
];

const PATHS: { name: string; d: string }[] = [
  { name: "Launch Support", d: "For founders setting up their first company. Formation coordination, document organization, professional introductions, and operational baseline." },
  { name: "Managed Operations", d: "For active companies that need ongoing operational structure, monthly reviews, workflow management, and partner coordination running continuously." },
  { name: "Venture Readiness", d: "For founders preparing for investment. Data room support, operational audit, investor documentation, and readiness reviews." },
  { name: "University and Partner Programs", d: "For campus entrepreneurship programs, accelerators, and professional partners joining the Opsirix Nexus network." },
];

const FAQS = [
  { q: "Is Opsirix a service or a software platform?", a: "Both. The platform (Vault, Flow, Grid, Dashboard) is the system. The service is the human coordination layer that runs Nexus, monthly Grid reviews, and the operational rhythm." },
  { q: "Do all engagements include Nexus coordination?", a: "Yes. Nexus coordination is the core of the platform. Engagements differ in coordination volume, monthly cadence, and depth of readiness work." },
  { q: "Do I need to bring my own attorney and CPA?", a: "If you have them, Opsirix coordinates with them. If you don't, Opsirix Nexus introduces you to vetted licensed professionals who engage you under their own engagement letters." },
  { q: "Is anything in Opsirix legal, immigration, or tax advice?", a: "No. Nothing in any module or report constitutes legal, immigration, or tax advice. Every regulated question is routed to a licensed professional through Nexus." },
];

function Page() {
  return (
    <div className="inner-page">
      <PageHeader
        pageName="Services"
        label="Platform Services"
        title="Nine modules. One connected platform."
        subtitle="The Opsirix platform covers the full operational layer of an early-stage company. Documents, workflows, partner coordination, readiness scoring, and intelligent support, organized into nine connected modules."
      />

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Platform Modules</p>
          <h2 className="inner-h2">All nine platform modules.</h2>
          <div className="inner-grid-2">
            {MODULES.map((m) => (
              <a key={m.t} href={m.href} className="inner-card module-card-link">
                <h3>{m.t}</h3>
                <p>{m.d}</p>
                <span className="module-card-cta">Explore Module →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">The Boundary</p>
          <h2 className="inner-h2">What's included vs. what routes to licensed professionals.</h2>
          <div className="inner-cols">
            <div className="inner-col-card included">
              <h3>Included in the platform</h3>
              <ul>{INCLUDED.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
            <div className="inner-col-card routed">
              <h3>Routed to licensed professionals via Nexus</h3>
              <ul>{ROUTED.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Engagement Paths</p>
          <h2 className="inner-h2">Choose your Opsirix path.</h2>
          <p className="inner-lead">
            Pricing is customized after a discovery call. We review your founder stage,
            documentation needs, operational complexity, and support level, then recommend the
            right Opsirix path.
          </p>
          <div className="tier-grid" style={{ marginTop: 36 }}>
            {PATHS.map((p) => (
              <div key={p.name} className="tier-card">
                <div className="tier-name">{p.name}</div>
                <div className="tier-desc">{p.d}</div>
              </div>
            ))}
          </div>
          <p className="inner-lead" style={{ marginTop: 36 }}>
            Pricing depends on your company stage, documentation readiness, existing professional
            relationships, number of workflows, and support level. Book a discovery call so we can
            understand your situation.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 24 }}>
            <Link to="/contact" className="btn-primary">Book a Discovery Call</Link>
            <Link to="/contact" className="btn-secondary">Start Founder Intake</Link>
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Service FAQ</p>
          <h2 className="inner-h2">Questions about platform services.</h2>
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14 }}>
            {FAQS.map((f) => <div key={f.q} className="inner-card"><h3>{f.q}</h3><p>{f.a}</p></div>)}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
