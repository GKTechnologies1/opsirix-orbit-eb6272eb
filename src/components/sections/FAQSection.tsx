import { useState } from "react";
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
    a: "Never. Opsirix provides zero immigration advice, visa opinions, or work authorization determinations. Any question touching immigration law is immediately routed to a licensed immigration attorney through Opsirix Nexus. We handle administrative coordination, licensed attorneys handle the legal substance.",
  },
  {
    q: "Can you help coordinate my attorney and CPA?",
    a: "Yes, administrative coordination is one of Opsirix's core functions. We handle scheduling, document delivery, and the ongoing logistics between you and your licensed professionals. They provide advice. We make working with them seamless. If you don't have an attorney or CPA yet, Opsirix Nexus will introduce you to the right partner.",
  },
  {
    q: "Who is Opsirix for?",
    a: "Opsirix serves early-stage founders, immigrant founders (F-1, OPT, H-1B, and international entrepreneurs), technical founders who are operationally overwhelmed, and any founder who needs their startup's operational layer organized and running properly. If you're building a U.S. company and your documentation, workflows, and professional team aren't organized, Opsirix is built for you.",
  },
  {
    q: "How do founders get started?",
    a: "Complete the Opsirix Intake Form (about 10 minutes). We review within one business day and schedule your 30-minute Discovery Call. After that, you sign four onboarding documents and your Opsirix Launch session is scheduled within five business days. Vault created, Flow activated, Nexus introductions made, Grid baseline set.",
  },
  {
    q: "What is the Opsirix Grid score?",
    a: "The Opsirix Grid is your monthly Operational Readiness Score out of 50 points, measured across five areas: Documentation, Compliance Status, Financial Coordination, Workflow Operations, and Startup Readiness. A score of 40 or above means investor-ready operations. Your score is tracked every month and delivered in your Founder Status Report.",
  },
  {
    q: "How is Opsirix different from an accelerator?",
    a: "Accelerators teach and connect. Opsirix runs. We are the operational infrastructure running beneath your startup every week, coordinating your attorney, organizing your documents, running your project board, scoring your readiness. The cohort ends. Opsirix continues.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="faq-section">
      <div className="faq-container">
        <ScrollReveal>
          <div className="faq-header">
            <span className="label-pill">Common Questions</span>
            <h2 className="faq-h2">Everything founders ask before getting started.</h2>
          </div>
        </ScrollReveal>

        <div className="faq-list">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="faq-item">
                <button
                  type="button"
                  className="faq-trigger"
                  data-state={isOpen ? "open" : "closed"}
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="faq-question">{item.q}</span>
                  <span className="faq-chevron" aria-hidden>
                    <ChevronDown size={11} />
                  </span>
                </button>
                {isOpen && (
                  <div className="faq-content" data-state="open">
                    <div className="faq-answer">{item.a}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
