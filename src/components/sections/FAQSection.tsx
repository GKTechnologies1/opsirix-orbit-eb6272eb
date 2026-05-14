import { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type QA = { q: string; a: string };

const FAQS: QA[] = [
  {
    q: "Is Opsirix a law firm or immigration consultancy?",
    a: "No. Opsirix is a Founder Infrastructure and Operations Platform. It is not a law firm, immigration consultancy, CPA firm, or licensed professional services organization. Opsirix provides operational coordination only. All legal, immigration, tax, and accounting matters are handled by independently retained licensed professionals.",
  },
  {
    q: "Who is Opsirix for?",
    a: "Opsirix serves first-time founders, immigrant founders, F-1 and OPT students building companies, H-1B professionals, green card holders, international entrepreneurs, solo founders, and early-stage operators who need operational structure. If you are building a U.S. company and your documents, workflows, and professional coordination are disorganized, Opsirix is built for you.",
  },
  {
    q: "How do founders get started?",
    a: "Complete the founder intake form. We review within one business day and schedule a free 30-minute Discovery Call to understand your situation and recommend the right Opsirix path.",
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
                    <div
                      className="faq-answer"
                      style={{ color: "#94A3B8", lineHeight: 1.7, fontSize: 15 }}
                    >
                      {item.a}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <Link
            to="/faq"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "#66C7F4",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 15,
              textDecoration: "none",
            }}
          >
            See all questions <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
