import { createFileRoute } from "@tanstack/react-router";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CTASection } from "@/components/shared/CTASection";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ | Opsirix Founder Operations Platform" },
      { name: "description", content: "Common questions about Opsirix, our platform, immigrant founder support, compliance architecture, and how founders get started." },
      { property: "og:title", content: "FAQ | Opsirix Founder Operations Platform" },
      { property: "og:description", content: "Common questions about Opsirix, our platform, immigrant founder support, compliance architecture, and how founders get started." },
      { property: "og:url", content: "https://opsirix-orbit.lovable.app/faq" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix-orbit.lovable.app/faq" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [],
      }),
    }],
  }),
  component: Page,
});

type QA = { q: string; a: string };

const ABOUT: QA[] = [
  { q: "What is Opsirix?", a: "Opsirix is a Founder Infrastructure & Operations Platform. We run the operational layer of early-stage and immigrant-founder companies — Vault, Flow, Nexus coordination, and a monthly Grid readiness review." },
  { q: "Is Opsirix a law firm or immigration consultancy?", a: "No. Opsirix is not a law firm, immigration consultancy, CPA firm, or licensed professional services organization of any kind. Every regulated question routes to an independently retained licensed professional through Opsirix Nexus." },
  { q: "Who founded Opsirix and why?", a: "Opsirix was founded to give early-stage and immigrant founders the operational backbone that funded companies take for granted — without crossing into regulated professional advice." },
  { q: "Where is Opsirix based?", a: "Opsirix operates as a U.S.-based platform. Founders we serve operate U.S. entities; coordination is delivered remotely with Nexus partners across the country." },
  { q: "How does Opsirix make money?", a: "Founders pay a platform tier fee for the Opsirix system and coordination service. Opsirix does not take referral fees on regulated professional work performed by Nexus partners." },
];

const IMMIGRANT: QA[] = [
  { q: "Does Opsirix give immigration advice?", a: "Never. Opsirix provides zero immigration advice, visa opinions, or work authorization determinations. Every immigration question routes to a licensed immigration attorney through Nexus." },
  { q: "Will Opsirix help me pick a visa?", a: "No. Visa selection is a legal opinion that only a licensed immigration attorney can provide. Opsirix coordinates the logistical layer around your attorney's work." },
  { q: "Can Opsirix help with USCIS filings?", a: "Filings are prepared and submitted by your independently retained immigration attorney. Opsirix organizes and stores the supporting documentation." },
  { q: "What does Opsirix actually do for immigrant founders?", a: "We organize your documentation in Vault, run your weekly operational board in Flow, coordinate the administrative logistics with your attorney, CPA, and banker through Nexus, and score your operational readiness every month with Grid." },
  { q: "I don't have an immigration attorney yet — can Opsirix help?", a: "Yes. Opsirix Nexus introduces you to vetted licensed immigration attorneys in the partner network. The attorney engages you under their own engagement letter; Opsirix coordinates logistics." },
  { q: "Is Opsirix safe for F-1, OPT, H-1B, or H-4 founders?", a: "Opsirix is an operational platform, not a legal product. It does not affect your status. Whether and how to operate a company on any given visa is a question only your immigration attorney can answer." },
  { q: "Is anything Opsirix says or stores considered legal advice?", a: "No. Nothing in Opsirix — including documents, dashboards, reports, or communications — constitutes legal, immigration, or tax advice. All advice comes from independently retained licensed professionals." },
];

const SERVICES: QA[] = [
  { q: "What is the Opsirix Vault?", a: "A centralized operational document repository — formation, EIN, banking, contracts, employment paperwork — versioned, tagged, and audit-ready." },
  { q: "What is Opsirix Flow?", a: "Your weekly operational project board. Every task has an owner, a due date, and a status. Flow runs your operational rhythm between meetings." },
  { q: "What is Opsirix Nexus?", a: "The coordination layer for your independently retained licensed professionals — attorneys, CPAs, bankers, insurers. Opsirix handles scheduling, document delivery, and follow-through." },
  { q: "What is the Opsirix Grid?", a: "A monthly Operational Readiness Score (out of 50) across 5 dimensions: documentation, compliance, financial coordination, workflow, and startup readiness. 40+ means investor-ready operations." },
  { q: "How often is the Grid review?", a: "Every month. A 45–60 minute session, followed by a written Founder Status Report delivered within 48 hours." },
  { q: "What's in the Founder Status Report?", a: "Your current Grid score, deltas from last month, priorities for the next 30 days, and a clear action list owned by you, Opsirix, and any Nexus partners." },
  { q: "What are the platform tiers?", a: "Four tiers — Launch, Flow, Grid+, and Core. They differ in coordination volume, monthly cadence, and depth of readiness work, but every tier shares the same coordination engine." },
  { q: "Can I export my data?", a: "Yes. Your Vault contents, Flow history, and Grid records are yours. Export rights are documented in the Vault & Data Handling Consent signed during onboarding." },
];

const GETTING_STARTED: QA[] = [
  { q: "How do I get started?", a: "Complete the 15-minute Founder Intake Form. We review within 1 business day and schedule your 30-minute Discovery Call. From there, four onboarding documents and a Launch session within 5 business days." },
  { q: "How long does onboarding take?", a: "From intake to a fully active platform: typically 1–2 weeks. The four onboarding documents take under 30 minutes. The Launch session is 60–90 minutes." },
  { q: "Do I need to bring my own attorney and CPA?", a: "If you have them, Opsirix coordinates with them through Nexus. If you don't, Nexus introduces you to vetted licensed professionals who engage you directly." },
  { q: "What if I'm not ready for a paid tier yet?", a: "Start with the Discovery Call. We'll tell you honestly whether Opsirix fits your stage — and if it doesn't, we'll point you to resources that do." },
  { q: "What happens after the Discovery Call?", a: "If we're a fit, you receive the four onboarding documents to sign, a Launch session is scheduled within 5 business days, and your Vault is created. From there, the platform turns on." },
];

function Section({ title, items }: { title: string; items: QA[] }) {
  return (
    <>
      <h2 className="faq-cat">{title}</h2>
      <Accordion.Root type="single" collapsible className="faq-list">
        {items.map((item, i) => (
          <Accordion.Item key={item.q} value={`${title}-${i}`} className="faq-item">
            <Accordion.Header>
              <Accordion.Trigger className="faq-trigger">
                <span className="faq-question">{item.q}</span>
                <span className="faq-chevron" aria-hidden><ChevronDown size={11} /></span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="faq-content">
              <div className="faq-answer">{item.a}</div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </>
  );
}

function Page() {
  return (
    <div className="inner-page">
      <PageHeader pageName="FAQ" label="Frequently Asked" title="Answers to everything founders and partners ask." subtitle="25+ questions across four categories. Zero legal, immigration, or tax advice — that's what your attorney and CPA are for." />

      <section className="inner-section alt">
        <div className="inner-wrap" style={{ maxWidth: 820 }}>
          <Section title="About Opsirix" items={ABOUT} />
          <Section title="For Immigrant Founders" items={IMMIGRANT} />
          <Section title="Platform & Services" items={SERVICES} />
          <Section title="Getting Started" items={GETTING_STARTED} />
        </div>
      </section>

      <CTASection />
    </div>
  );
}
