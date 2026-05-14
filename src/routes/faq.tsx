import { createFileRoute, Link } from "@tanstack/react-router";
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

type QA = { q: string; a: string; link?: { to: string; label: string } };

const ABOUT: QA[] = [
  { q: "What is Opsirix?", a: "Opsirix is a founder operations platform that helps early-stage and immigrant founders organize documents, manage workflows, coordinate professional partners, and track operational readiness. Opsirix is not a law firm, CPA firm, immigration consultancy, or licensed professional services provider." },
  { q: "Who is Opsirix for?", a: "Opsirix serves first-time founders, immigrant founders, F-1 and OPT students building companies, H-1B professionals exploring business ownership, green card holders, international entrepreneurs, solo founders, and small business operators who need operational structure. If you are building a U.S. company and your documents, workflows, and professional coordination are disorganized — Opsirix is built for you." },
  { q: "Is Opsirix a law firm?", a: "No. Opsirix is not a law firm, immigration consultancy, CPA firm, accounting firm, tax advisor, or licensed professional services provider. Opsirix provides operational coordination services only. All legal, immigration, tax, and accounting matters are handled by independently retained licensed professionals." },
  { q: "How is Opsirix different from an accelerator or incubator?", a: "Accelerators provide education, community, and sometimes funding. Opsirix provides ongoing operational infrastructure — document organization, workflow management, professional coordination, and monthly readiness reviews. Accelerator cohorts end. Opsirix works alongside your startup continuously." },
];

const IMMIGRANT: QA[] = [
  { q: "Does Opsirix provide immigration advice?", a: "No. Opsirix does not provide immigration advice, visa strategy, work authorization guidance, or immigration legal opinions of any kind. If you have immigration questions, you need a licensed immigration attorney. Opsirix can coordinate your access to a licensed attorney through Opsirix Nexus, but cannot advise on immigration matters directly." },
  { q: "Can Opsirix help H-1B or F-1 founders?", a: "Opsirix can help H-1B and F-1 founders with operational organization — document management, workflow setup, professional coordination, and operational readiness tracking. Opsirix does not advise on H-1B or F-1 status, work authorization, or immigration compliance. Those matters require a licensed immigration attorney." },
  { q: "Can Opsirix replace my immigration attorney?", a: "No. Opsirix coordinates operational workflows and document organization. It does not and cannot replace an immigration attorney. If you need immigration advice, visa strategy, or work authorization guidance, you need a licensed immigration attorney. Opsirix can coordinate your introduction to one through Opsirix Nexus." },
];

const SERVICES: QA[] = [
  { q: "What is Opsirix Vault?", a: "Opsirix Vault is the document organization system within the Opsirix platform. It helps founders store, organize, and access formation documents, operating agreements, attorney correspondence, financial records, and other business documents in one structured location." },
  { q: "What is Opsirix Flow?", a: "Opsirix Flow is the workflow management component of the platform. It organizes tasks, tracks deadlines, manages escalations, and maintains the operational cadence of your startup week to week." },
  { q: "What is Opsirix Nexus?", a: "Opsirix Nexus is the professional coordination network within the platform. It connects founders to attorneys, CPAs, insurance providers, and banking partners at the right moment in their operational journey. Opsirix coordinates the introduction and logistics — each professional serves founders independently." },
  { q: "What is Opsirix Grid?", a: "Opsirix Grid is the monthly operational readiness scoring system. It measures your startup's operational health across five areas — documentation, compliance tracking, financial coordination, workflow operations, and startup readiness — on a 50-point scale. Your Grid score is delivered in your monthly Founder Status Report." },
  { q: "What is the Founder Status Report?", a: "The Founder Status Report is a monthly summary delivered to every Opsirix founder. It includes your current Grid score, what was completed this month, what is coming up next month, and any open action items. It gives you a clear operational picture every 30 days." },
];

const GETTING_STARTED: QA[] = [
  { q: "How does Opsirix work with licensed professionals?", a: "Opsirix coordinates the administrative and logistical relationship between founders and their licensed professionals — scheduling, document preparation, follow-up. Opsirix does not supervise, direct, or provide the professional advice itself. Attorneys, CPAs, and other licensed professionals serve founders independently." },
  { q: "How do I get started with Opsirix?", a: "Complete the founder intake form at opsirix.com/contact. We review your intake within one business day and schedule a free 30-minute Discovery Call to understand your operational situation and match you to the right platform tier." },
  { q: "What happens after I book a discovery call?", a: "After the Discovery Call, you receive four onboarding documents to review and sign. Once signed, your Opsirix Launch session is scheduled within five business days. During Launch: Vault is created, Flow is activated, Nexus introductions are made, and your Grid baseline is established." },
];

function Section({ title, items }: { title: string; items: QA[] }) {
  return (
    <>
      <h3 className="faq-cat">{title}</h3>
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
  const allFaqs = [...ABOUT, ...IMMIGRANT, ...SERVICES, ...GETTING_STARTED];
  return (
    <div className="inner-page">
      <PageHeader pageName="FAQ" label="Frequently Asked" title="Common questions about Opsirix." subtitle="Answers across four categories — what Opsirix is, how it serves immigrant founders, the platform itself, and how to get started." />

      <section className="inner-section alt">
        <div className="inner-wrap" style={{ maxWidth: 820 }}>
          <Section title="About Opsirix" items={ABOUT} />
          <Section title="Immigrant and International Founders" items={IMMIGRANT} />
          <Section title="Platform and Services" items={SERVICES} />
          <Section title="Getting Started" items={GETTING_STARTED} />
        </div>
      </section>

      <CTASection />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: allFaqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </div>
  );
}
