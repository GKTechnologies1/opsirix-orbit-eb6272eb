import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type FeaturePoint = {
  icon: string;
  title: string;
  body: string;
};

const POINTS: FeaturePoint[] = [
  {
    icon: "📁",
    title: "Document organization that matters",
    body: "Your Opsirix Vault organizes visa documents, formation records, attorney letters, and compliance evidence — all current, all accessible, all protected.",
  },
  {
    icon: "🔗",
    title: "Attorney coordination, not advice",
    body: "We coordinate your access to licensed immigration attorneys through Nexus. They provide the legal advice. We handle the administrative logistics.",
  },
  {
    icon: "📊",
    title: "Operational calmness in high-stakes environments",
    body: "When every decision may touch documentation, timing, and professional guidance — an organized operational system is not optional. It is the foundation.",
  },
];

type FounderType = {
  name: string;
  desc: string;
};

const FOUNDER_TYPES: FounderType[] = [
  { name: "F-1, OPT & STEM OPT", desc: "International students building U.S. companies" },
  { name: "H-1B Professionals", desc: "Building companies alongside employer sponsorship" },
  { name: "Green Card Holders", desc: "Permanent residents building with full flexibility" },
  { name: "International Entrepreneurs", desc: "Entering the U.S. market and building systems" },
  { name: "Early-Stage Founders", desc: "Any founder who needs operational infrastructure" },
];

export function ImmigrantFounderSection() {
  return (
    <section className="immigrant-section">
      <div className="immigrant-glow" aria-hidden="true" />
      <div className="immigrant-container">
        <div className="immigrant-grid">
          {/* LEFT */}
          <div>
            <ScrollReveal>
              <span className="immigrant-label">For Immigrant Founders</span>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h2 className="immigrant-h2">
                Building a U.S. company while navigating a U.S. visa deserves operational infrastructure built for that reality.
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="immigrant-lead">
                Immigrant founders face the same operational challenges as every founder — plus documentation complexity, professional coordination requirements, and the operational discipline that comes with running a compliant, audit-ready company.
              </p>
            </ScrollReveal>

            <div className="immigrant-points">
              {POINTS.map((p, i) => (
                <ScrollReveal key={p.title} delay={0.15 + i * 0.07}>
                  <div className="immigrant-point">
                    <div className="immigrant-point-icon">{p.icon}</div>
                    <div>
                      <h5 className="immigrant-point-title">{p.title}</h5>
                      <p className="immigrant-point-body">{p.body}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={0.4}>
              <a href="#immigrant-support" className="immigrant-cta">
                Learn More About Immigrant Founder Support
                <ArrowRight size={16} />
              </a>
            </ScrollReveal>
          </div>

          {/* RIGHT */}
          <ScrollReveal delay={0.15}>
            <div className="immigrant-visual">
              <div className="immigrant-visual-label">FOUNDER TYPES ON OPSIRIX</div>
              <div className="immigrant-types">
                {FOUNDER_TYPES.map((t) => (
                  <div key={t.name} className="immigrant-type-card">
                    <div>
                      <div className="immigrant-type-name">{t.name}</div>
                      <div className="immigrant-type-desc">{t.desc}</div>
                    </div>
                    <span className="immigrant-active-pill">Active</span>
                  </div>
                ))}
              </div>

              <div className="immigrant-disclaimer">
                <span className="immigrant-disclaimer-icon">⚠️</span>
                <p className="immigrant-disclaimer-text">
                  <strong style={{ color: "rgba(255,255,255,0.72)", fontWeight: 600 }}>Important:</strong>{" "}
                  Opsirix is not an immigration consultancy and does not provide visa advice, work authorization opinions, or immigration legal advice of any kind. All immigration matters route to independently retained licensed immigration attorneys through Opsirix Nexus.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
