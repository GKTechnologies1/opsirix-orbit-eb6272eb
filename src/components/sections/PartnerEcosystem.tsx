import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type Partner = {
  icon: string;
  title: string;
  body: string;
  cta: string;
};

const PARTNERS: Partner[] = [
  {
    icon: "⚖️",
    title: "Immigration Attorneys",
    body: "All visa, status, and work authorization legal matters. Opsirix Nexus routes to the right attorney with full context and preparation.",
    cta: "Become a Nexus Partner",
  },
  {
    icon: "📊",
    title: "CPAs & Bookkeepers",
    body: "Tax coordination, bookkeeping, and payroll classification. Opsirix handles admin coordination; your CPA handles financial advice.",
    cta: "Become a Nexus Partner",
  },
  {
    icon: "🏦",
    title: "Banking Partners",
    body: "Startup-friendly banks and fintechs for immigrant and early-stage founders. Opsirix coordinates banking setup and onboarding.",
    cta: "Partner with Opsirix",
  },
  {
    icon: "🛡️",
    title: "Insurance Partners",
    body: "GL, E&O, and Cyber Liability required before Founder 1 activates. Opsirix introduces founders to the right coverage.",
    cta: "Become a Nexus Partner",
  },
  {
    icon: "🏛️",
    title: "Universities & Colleges",
    body: "Operational workshops, resource hubs, and founder readiness programs for international student entrepreneurs. Zero immigration advice.",
    cta: "Partner with Your University",
  },
  {
    icon: "💻",
    title: "Technology Partners",
    body: "Software development, AI systems, and MVP builds coordinated through the Opsirix platform.",
    cta: "Become a Nexus Partner",
  },
];

export function PartnerEcosystem() {
  return (
    <section className="partner-section">
      <div className="partner-container">
        <div className="partner-header">
          <ScrollReveal>
            <span className="partner-label">Partner Ecosystem</span>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <h2 className="partner-h2">The professionals your startup needs, coordinated through one platform.</h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="partner-sub">
              Opsirix Nexus connects founders to attorneys, CPAs, insurance, and banking partners at the right moment. Every partner serves founders independently. Opsirix handles the coordination.
            </p>
          </ScrollReveal>
        </div>

        <div className="partner-grid">
          {PARTNERS.map((p, i) => (
            <ScrollReveal key={p.title} delay={0.05 + i * 0.06}>
              <div className="partner-card">
                <span className="partner-emoji">{p.icon}</span>
                <h4 className="partner-card-title">{p.title}</h4>
                <p className="partner-card-body">{p.body}</p>
                <Link
                  to={p.cta === "Partner with Your University" ? "/for-universities" : "/for-partners"}
                  className="partner-link"
                >
                  {p.cta}
                  <ArrowRight size={14} />
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.1}>
          <div className="partner-banner">
            <div>
              <div className="partner-banner-label">JOIN THE NETWORK</div>
              <h3 className="partner-banner-h3">
                Are you an attorney, CPA, university, or bank that works with founders?
              </h3>
              <p className="partner-banner-body">
                Join the Opsirix Nexus partner network. Receive warm referrals from organized, audit-ready founders who are ready to work with you.
              </p>
            </div>
            <Link to="/for-partners" className="partner-banner-cta">
              Become a Nexus Partner
              <ArrowRight size={16} />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
