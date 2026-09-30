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
      { property: "og:url", content: "https://opsirix.com/faq" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix.com/faq" }],
  }),
  component: Page,
});

type QA = { q: string; a: string; link?: { to: string; label: string } };

const ABOUT: QA[] = [
  { q: "What is Opsirix?", a: "Opsirix is a founder operations platform that helps early-stage and immigrant founders organize documents, manage workflows, coordinate professional partners, and record monthly operational reviews. Opsirix is not a law firm, CPA firm, immigration consultancy, or licensed professional services provider of any kind." },
  { q: "Who is Opsirix for?", a: "Opsirix serves first-time founders, immigrant founders, F-1 and OPT students building companies, H-1B professionals exploring business ownership, green card holders, international entrepreneurs, solo founders, and early-stage operators who need operational structure. If you are building a U.S. company and your documents, workflows, and professional coordination are disorganized, Opsirix is built for you." },
  { q: "Is Opsirix a law firm?", a: "No. Opsirix is not a law firm, immigration consultancy, CPA firm, accounting firm, tax advisor, or licensed professional services provider. Opsirix provides operational coordination services only. All legal, immigration, tax, and accounting matters are handled by independently retained licensed professionals." },
  { q: "How is Opsirix different from an accelerator or incubator?", a: "Accelerators provide education, community, and sometimes funding. Opsirix provides ongoing operational infrastructure: document organization, workflow management, professional coordination, and monthly readiness reviews. Accelerator cohorts end. Opsirix works alongside your startup continuously." },
];

const IMMIGRANT: QA[] = [
  { q: "Does Opsirix provide immigration advice?", a: "No. Opsirix does not provide immigration advice, visa strategy, work authorization guidance, or immigration legal opinions of any kind. If you have immigration questions, you need a licensed immigration attorney. Opsirix can coordinate your access to a licensed attorney through Opsirix Nexus, but cannot advise on immigration matters directly." },
  { q: "Can Opsirix help H-1B or F-1 founders?", a: "Opsirix can help H-1B and F-1 founders with operational organization: document management, workflow setup, professional coordination, and monthly operational review records. Opsirix does not advise on H-1B or F-1 status, work authorization, or immigration compliance. Those matters require a licensed immigration attorney." },
  { q: "Can Opsirix replace my immigration attorney?", a: "No. Opsirix coordinates operational workflows and document organization. It cannot replace an immigration attorney. If you need immigration advice, visa strategy, or work authorization guidance, you need a licensed immigration attorney. Opsirix can coordinate your introduction to one through Opsirix Nexus." },
];

const SERVICES: QA[] = [
  { q: "What is Opsirix Vault?", a: "Opsirix Vault is the document organization system within the platform. Vault is planned and not yet available. It is designed to help founders store, organize, and access formation documents, operating agreements, attorney correspondence, financial records, and other business documents in one structured location once its security review is complete.", link: { to: "/platform/vault", label: "Learn more" } },
  { q: "What is Opsirix Flow?", a: "Opsirix Flow is the workflow management component of the platform. It organizes tasks, tracks deadlines, manages partner handoffs, and maintains the operational cadence of your startup week to week.", link: { to: "/platform/flow", label: "Learn more" } },
  { q: "What is Opsirix Nexus?", a: "Opsirix Nexus is the professional coordination network within the platform. It connects founders to attorneys, CPAs, insurance providers, and banking partners at the right moment. Opsirix coordinates the introduction and logistics. Each professional serves founders independently.", link: { to: "/platform/nexus", label: "Learn more" } },
  { q: "What is Opsirix Grid?", a: "Opsirix Grid is the monthly operational review. Each month can hold two separate records: your own self-assessment and an Opsirix evidence review, using the same checks. Grid records answers only; scoring is not yet available. A Grid record is an internal operational note, not a legal compliance certification.", link: { to: "/platform/grid", label: "Learn more" } },
  { q: "What is the Founder Status Report?", a: "The Founder Status Report is planned and not yet available. Today, your submitted monthly Grid records, including any notes, stay viewable in your company workspace, and open work is tracked on your Flow board." },
];

const GETTING_STARTED: QA[] = [
  { q: "How does Opsirix work with licensed professionals?", a: "Opsirix coordinates the administrative and logistical relationship between founders and their licensed professionals: scheduling, document preparation, and follow-up. Opsirix does not supervise or provide the professional advice itself. Attorneys, CPAs, and other licensed professionals serve founders independently." },
  { q: "How do I get started with Opsirix?", a: "Complete the founder intake form at opsirix.com/contact. We review your intake and contact you to schedule a free 30-minute Discovery Call to understand your operational situation and recommend the right Opsirix path." },
  { q: "What happens after I book a discovery call?", a: "After the Discovery Call, you receive four onboarding documents to review and sign. Once signed, your Opsirix Launch session is scheduled within five business days. Your Launch intake stays private to you while it is a draft. Once you send it, Opsirix Admin/CEO and the Operations Lead assigned to it can read and review it. Launch does not create anything automatically: Flow tasks are added separately by members who can edit your workspace, each Nexus introduction needs your consent, and a Grid review is started as its own monthly record. Vault is planned and not yet available." },
  { q: "How much does Opsirix cost?", a: "Opsirix works on custom quotes only, with no published fixed prices. Every founder's situation is different, so after a discovery call we first review your company stage, documentation needs, operational complexity, partner coordination needs, and support level. After that, we recommend the right Opsirix path and send your quote directly." },
];

function Section({ title, items }: { title: string; items: QA[] }) {
  return (
    <>
      <h3 className="faq-cat">{title}</h3>
      <Accordion.Root
        type="single"
        collapsible
        defaultValue={`${title}-0`}
        className="faq-list"
      >
        {items.map((item, i) => (
          <Accordion.Item key={item.q} value={`${title}-${i}`} className="faq-item">
            <Accordion.Header>
              <Accordion.Trigger className="faq-trigger">
                <span className="faq-question">{item.q}</span>
                <span className="faq-chevron" aria-hidden><ChevronDown size={11} /></span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="faq-content">
              <div className="faq-answer">
                {item.a}
                {item.link && (
                  <>
                    {" "}
                    <Link to={item.link.to} className="inline-link">
                      {item.link.label} →
                    </Link>
                  </>
                )}
              </div>
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
      <PageHeader
        pageName="FAQ"
        label="Frequently Asked"
        title="Common questions about Opsirix."
        subtitle="Answers across four categories: about Opsirix, immigrant founders, the platform, and getting started."
      />

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
