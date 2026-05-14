import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type QA = { q: string; a: string };

const FAQS: QA[] = [
  {
    q: "Is Opsirix a law firm or immigration consultancy?",
    a: "No. Opsirix is a Founder Infrastructure & Operations Platform. We are not a law firm, immigration consultancy, CPA firm, or licensed professional services organization of any kind. We never give immigration advice, visa opinions, tax advice, or legal conclusions. All matters requiring a licensed professional are routed to independently retained attorneys and CPAs through Opsirix Nexus.",
  },
  {
    q: "Do you provide immigration advice or visa strategy?",
    a: "Never. Opsirix provides zero immigration advice, visa opinions, or work authorization determinations. Any question touching immigration law is immediately routed to a licensed immigration attorney through Opsirix Nexus. We handle the administrative coordination; licensed attorneys handle the legal substance. This boundary is non-negotiable and built into every layer of the platform.",
  },
  {
    q: "Can you help coordinate my attorney and CPA?",
    a: "Yes — administrative coordination is one of Opsirix's core functions. We handle scheduling, document delivery, logistical follow-through, and the ongoing administrative relationship between you and your licensed professionals. They provide advice; we make working with them seamless. If you don't have an attorney or CPA yet, Opsirix Nexus will introduce you to the right partner.",
  },
  {
    q: "Who is Opsirix for?",
    a: "Opsirix serves early-stage founders, immigrant founders (F-1, OPT, H-1B, and international entrepreneurs), technical founders who are operationally overwhelmed, and any founder who needs their startup's operational layer organized, coordinated, and running properly. If you're building a U.S. company and your documentation, workflows, and professional team are not organized — Opsirix is built for you.",
  },
  {
    q: "How do founders get started?",
    a: "Complete the Opsirix Intake Flow (15 minutes). We review within 1 business day and schedule your 30-minute Discovery Call. After that, four onboarding documents to sign, and your Opsirix Launch onboarding session happens within 5 business days. From there: Vault created, Flow activated, Nexus introductions made, Grid baseline set.",
  },
  {
    q: "What is the Opsirix Grid score?",
    a: "The Opsirix Grid is your monthly Operational Readiness Score out of 50 points — measured across 5 dimensions: Documentation Completeness (10), Compliance Status (10), Financial Coordination (10), Operational Workflow (10), and Startup Readiness (10). A score of 40+ means investor-ready operations. Your score is tracked monthly and delivered in your Founder Status Report.",
  },
  {
    q: "How is Opsirix different from an accelerator?",
    a: "Accelerators teach and connect. Opsirix runs. We are the operational infrastructure running beneath your startup every week — coordinating your attorney, organizing your documents, running your project board, scoring your readiness. The cohort ends; Opsirix continues. Think of it as having an operational backbone for your company, not a 12-week program.",
  },
];

export function FAQSection() {
  return (
    <section className="faq-section">
      <div className="faq-container">
        <ScrollReveal>
          <div className="faq-header">
            <span className="label-pill">Common Questions</span>
            <h2 className="faq-h2">Everything founders ask before getting started.</h2>
          </div>
        </ScrollReveal>

        <Accordion.Root
          type="single"
          collapsible
          defaultValue="item-1"
          className="faq-list"
        >
          {FAQS.map((item, i) => (
            <Accordion.Item key={i} value={`item-${i + 1}`} className="faq-item">
              <Accordion.Header>
                <Accordion.Trigger className="faq-trigger">
                  <span className="faq-question">{item.q}</span>
                  <span className="faq-chevron" aria-hidden>
                    <ChevronDown size={11} />
                  </span>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="faq-content">
                <div className="faq-answer">{item.a}</div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}

export default FAQSection;
