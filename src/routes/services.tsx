import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { CTASection } from "@/components/shared/CTASection";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Opsirix Platform Services | Founder Operations Modules" },
      { name: "description", content: "Opsirix Launch, Flow, Vault, Nexus, Grid, Core, and AI — the full suite of founder operations tools built for early-stage and immigrant startups." },
      { property: "og:title", content: "Opsirix Platform Services | Founder Operations Modules" },
      { property: "og:description", content: "Opsirix Launch, Flow, Vault, Nexus, Grid, Core, and AI — the full suite of founder operations tools built for early-stage and immigrant startups." },
      { property: "og:url", content: "https://opsirix-orbit.lovable.app/services" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix-orbit.lovable.app/services" }],
  }),
  component: Page,
});

const MODULES = [
  { t: "Opsirix Vault", d: "Centralized operational document repository. Formation docs, EIN letter, banking records, contracts, employment paperwork — versioned, tagged, and audit-ready." },
  { t: "Opsirix Flow", d: "Weekly operational project board. Every task has an owner, a due date, and a status. The board runs your week so nothing slips between meetings." },
  { t: "Opsirix Nexus", d: "Coordination layer for your independently retained licensed professionals — attorneys, CPAs, bankers, insurers. Opsirix handles scheduling, document delivery, and follow-through." },
  { t: "Opsirix Grid", d: "Monthly Operational Readiness Score (out of 50) across 5 dimensions: documentation, compliance, financial coordination, workflow, and startup readiness." },
  { t: "Founder Status Report", d: "Written summary delivered after every monthly Grid review. Score, deltas, priorities for the next month, and a clear action list." },
  { t: "Compliance Calendar", d: "Every recurring deadline, filing window, and renewal tracked and surfaced before it becomes urgent. Automated reminders to you and to Nexus partners." },
  { t: "Onboarding & Discovery", d: "Structured 15-minute intake, 30-minute Discovery Call, four onboarding documents, and a Launch session within 5 business days." },
  { t: "Founder Dashboard", d: "One screen — Vault status, Flow board, Nexus activity, Grid score, and recent activity. The operational state of your company at a glance." },
];

const INCLUDED = ["Document organization & Vault management", "Weekly Flow board operation", "Administrative coordination with your professionals", "Monthly Grid review & Status Report", "Compliance calendar & reminder cadence", "Audit evidence trail for every task", "Founder Dashboard access"];
const ROUTED = ["Immigration advice & visa strategy", "Tax advice & filings", "Legal opinions & contract drafting", "USCIS filings & petitions", "Banking decisions & loan structuring", "Insurance underwriting & coverage advice", "Any opinion on regulated subject matter"];

const TIERS = [
  { name: "Launch", tag: "Starter", d: "Onboarding, Vault setup, baseline Grid score, and your first month of Flow operation. Built for founders standing things up for the first time." },
  { name: "Flow", tag: "Active Ops", d: "Continuous Flow operation, full Vault, monthly Grid reviews, and active Nexus coordination. The default tier for operating companies." },
  { name: "Grid+", tag: "Investor-Ready", d: "Everything in Flow plus deep readiness work — data-room build-out, audit-ready evidence, and quarterly readiness reviews." },
  { name: "Core", tag: "Embedded", d: "Embedded operational backbone for funded or scaling companies. Higher Nexus coordination volume, dedicated weekly cadence." },
];

const FAQS = [
  { q: "Is Opsirix a service or a software platform?", a: "Both. The platform (Vault, Flow, Grid, Dashboard) is the system. The service is the human coordination layer that runs Nexus, monthly Grid reviews, and the operational rhythm." },
  { q: "Do all tiers include Nexus coordination?", a: "Yes. Nexus coordination is the core of the platform. Tiers differ in coordination volume, monthly cadence, and depth of readiness work." },
  { q: "Can I switch tiers later?", a: "Yes. Most founders begin in Launch or Flow, then move to Grid+ or Core as the company matures. Tier changes happen during the monthly Grid review." },
  { q: "Do I need to bring my own attorney and CPA?", a: "If you have them, Opsirix coordinates with them. If you don't, Opsirix Nexus introduces you to vetted licensed professionals who engage you under their own engagement letters." },
  { q: "Is anything in Opsirix legal, immigration, or tax advice?", a: "No. Nothing in any tier, module, or report constitutes legal, immigration, or tax advice. Every regulated question is routed to a licensed professional through Nexus." },
];

function Page() {
  return (
    <div className="inner-page">
      <PageHeader pageName="Services" label="Platform Services" title="Everything your operational infrastructure needs." subtitle="Eight modules. Four tiers. One coordinated platform that runs the operational layer of your company." />

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Platform Modules</p>
          <h2 className="inner-h2">All eight modules, expanded.</h2>
          <div className="inner-grid-2">
            {MODULES.map((m) => <div key={m.t} className="inner-card"><h3>{m.t}</h3><p>{m.d}</p></div>)}
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
          <p className="inner-eyebrow">Platform Tiers</p>
          <h2 className="inner-h2">Four tiers. One coordination engine underneath.</h2>
          <div className="tier-grid">
            {TIERS.map((t) => (
              <div key={t.name} className="tier-card">
                <div className="tier-name">{t.name}</div>
                <div className="tier-tag">{t.tag}</div>
                <div className="tier-desc">{t.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Monthly Rhythm</p>
          <h2 className="inner-h2">How platform tiers actually run.</h2>
          <p className="inner-lead">Every tier follows the same monthly rhythm: continuous Flow operation across the month, a 45–60 minute Grid review session, a Founder Status Report delivered within 48 hours, and Nexus coordination running in the background the whole time. Higher tiers add quarterly readiness reviews, deeper data-room work, and increased coordination volume.</p>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Service FAQ</p>
          <h2 className="inner-h2">5 questions about platform services.</h2>
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14 }}>
            {FAQS.map((f) => <div key={f.q} className="inner-card"><h3>{f.q}</h3><p>{f.a}</p></div>)}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
