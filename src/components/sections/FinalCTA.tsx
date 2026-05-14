import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const PILLS = [
  "Compliance-First Architecture",
  "35+ Operational Documents",
  "Attorney-Coordinated Platform",
];

export function FinalCTA() {
  return (
    <section className="cta-section">
      <div className="cta-dots" aria-hidden />
      <div className="cta-radial" aria-hidden />
      <div className="cta-blur cta-blur-1" aria-hidden />
      <div className="cta-blur cta-blur-2" aria-hidden />
      <div className="cta-blur cta-blur-3" aria-hidden />

      <div className="cta-container">
        <div className="cta-pills">
          {PILLS.map((p, i) => (
            <motion.div
              key={p}
              className="cta-pill"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            >
              {p}
            </motion.div>
          ))}
        </div>

        <h2 className="cta-h2">Build with structure. Move with clarity.</h2>
        <p className="cta-sub">
          Your startup deserves an operational backbone from Day 1. Opsirix is the infrastructure
          layer that makes it possible.
        </p>

        <div className="cta-buttons">
          <a href="/contact" className="cta-btn-white">
            Book a Discovery Call <ArrowRight size={16} />
          </a>
          <a href="/how-it-works" className="cta-btn-outline">
            See How Opsirix Works
          </a>
        </div>

        <div className="cta-fineprint">No commitment required. Discovery call is free.</div>
      </div>
    </section>
  );
}

export default FinalCTA;
