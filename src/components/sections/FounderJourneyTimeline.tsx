import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type Step = {
  emoji: string;
  title: string;
  desc: string;
  details: string[];
};

const STEPS: Step[] = [
  {
    emoji: "🔍",
    title: "Discovery",
    desc: "Complete Intake Flow in 15 min",
    details: [
      "Complete 15-min Intake Flow",
      "No discovery call required first",
      "We review within 1 business day",
      "No commitment at this stage",
    ],
  },
  {
    emoji: "📋",
    title: "Intake",
    desc: "Risk classified within 1 business day",
    details: [
      "Compliance Coordinator reviews intake",
      "Risk classified Low/Medium/High",
      "Attorney contacted if needed before activation",
      "CEO signs off on High/Stop-Work situations",
    ],
  },
  {
    emoji: "🔀",
    title: "Risk Routing",
    desc: "Compliance questions → licensed pro",
    details: [
      "Any compliance question routes to licensed attorney via Nexus",
      "No services activate until risks are resolved",
      "Written professional resolution required",
      "Typical resolution: 24–48 hours",
    ],
  },
  {
    emoji: "⚙️",
    title: "Ops Setup",
    desc: "Vault, Flow, Nexus all activated",
    details: [
      "Opsirix Vault created with folder structure",
      "Opsirix Flow project board activated",
      "Nexus partner introductions made",
      "Grid baseline established",
    ],
  },
  {
    emoji: "🤝",
    title: "Partner Coordination",
    desc: "Attorney, CPA, insurance coordinated",
    details: [
      "Attorney introduced through Nexus",
      "CPA/bookkeeper introduced",
      "Insurance partner introduced",
      "All coordination is administrative — no legal advice",
    ],
  },
  {
    emoji: "📊",
    title: "Monthly Grid Review",
    desc: "Score tracked, priorities set",
    details: [
      "45–60 min session each month",
      "Score calculated across 5 dimensions",
      "Priorities set for next month",
      "Status report delivered after every session",
    ],
  },
  {
    emoji: "📈",
    title: "Growth Systems",
    desc: "Investor-ready. Operational calmness.",
    details: [
      "Grid score 40+/50 = investor-ready",
      "Audit-ready documentation",
      "Operational evidence trail complete",
      "Continue or transition to Opsirix Core",
    ],
  },
];

export function FounderJourneyTimeline() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <section className="journey-section">
      <div className="journey-container">
        <ScrollReveal>
          <div className="journey-header">
            <span className="label-pill">The Founder Journey</span>
            <h2 className="journey-h2">
              From first contact to institutional-grade operations.
            </h2>
            <p className="journey-sub">
              Every founder follows the same path. Here is exactly what yours looks like.
            </p>
          </div>
        </ScrollReveal>

        <div className="journey-timeline-wrap">
          <div className="journey-timeline">
            <div className="journey-connector" aria-hidden />
            {STEPS.map((s, i) => {
              const isActive = activeStep === i;
              return (
                <div key={i} className="journey-step">
                  <button
                    type="button"
                    className={`journey-circle ${isActive ? "is-active" : ""}`}
                    onClick={() => setActiveStep(isActive ? null : i)}
                    aria-expanded={isActive}
                    aria-label={`Step ${i + 1}: ${s.title}`}
                  >
                    <span className="journey-emoji">{s.emoji}</span>
                    <span className="journey-num">{i + 1}</span>
                  </button>
                  <div className="journey-text">
                    <div className="journey-step-title">{s.title}</div>
                    <div className="journey-step-desc">{s.desc}</div>
                  </div>

                  {/* Mobile inline detail */}
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        key="m-detail"
                        className="journey-detail-mobile"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <DetailCard step={s} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop detail */}
        <AnimatePresence initial={false}>
          {activeStep !== null && (
            <motion.div
              key={`d-${activeStep}`}
              className="journey-detail-desktop"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            >
              <DetailCard step={STEPS[activeStep]} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function DetailCard({ step }: { step: Step }) {
  return (
    <div className="journey-detail-card">
      <h4 className="journey-detail-title">{step.title}</h4>
      <ul className="journey-detail-list">
        {step.details.map((d, i) => (
          <li key={i}>{d}</li>
        ))}
      </ul>
      <a href="#contact" className="journey-detail-cta">
        Start Your Journey <ArrowRight size={16} />
      </a>
    </div>
  );
}

export default FounderJourneyTimeline;
