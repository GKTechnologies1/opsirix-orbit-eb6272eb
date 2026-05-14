import { Link } from "@tanstack/react-router";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type Service = {
  icon: string;
  title: string;
  tag: string;
  body: string;
  gradient: string;
  to: string;
  featured?: boolean;
  comingSoon?: boolean;
};

const SERVICES: Service[] = [
  { icon: "🚀", title: "Opsirix Launch", tag: "Formation Layer", body: "Zero to operational in 30 days. Entity coordination, EIN, banking, Vault creation, and Nexus introductions.", gradient: "linear-gradient(90deg, #0D9E8F, #2DD4BF)", to: "/platform/launch" },
  { icon: "⚡", title: "Opsirix Flow", tag: "Workflow Engine", body: "Weekly workflow orchestration. Task routing, escalation management, project boards, and operational cadence.", gradient: "linear-gradient(90deg, #7C3AED, #A78BFA)", to: "/platform/flow" },
  { icon: "🔒", title: "Opsirix Vault", tag: "Document Intelligence", body: "Encrypted document management. Compliance-calendar-driven. Audit-ready. Every critical document protected.", gradient: "linear-gradient(90deg, #0D9E8F, #0057D9)", to: "/platform/vault" },
  { icon: "🔗", title: "Opsirix Nexus", tag: "Partner Network", body: "Warm routing to licensed attorneys, CPAs, insurance, and tech partners at exactly the right moment.", gradient: "linear-gradient(90deg, #0057D9, #66C7F4)", to: "/platform/nexus" },
  { icon: "📊", title: "Opsirix Grid", tag: "Readiness Scoring", body: "Monthly Operational Readiness Score — 5 dimensions, 50 points. Measurable, trackable, investor-visible.", gradient: "linear-gradient(90deg, #F59E0B, #FCD34D)", to: "/platform/grid" },
  { icon: "🖥️", title: "Opsirix OS", tag: "Founder Dashboard", body: "Central founder operations dashboard. Document status, workflow activity, and company health in one view.", gradient: "linear-gradient(90deg, #0057D9, #2F80ED)", to: "/platform/os", comingSoon: true },
  { icon: "⚙️", title: "Opsirix Core", tag: "Managed Ops", body: "High-touch managed operations for complex situations — H-1B governance, pre-fundraise, audit-readiness.", gradient: "linear-gradient(90deg, #1E2A3A, #334155)", to: "/platform/core" },
  { icon: "🧠", title: "Opsirix AI", tag: "Intelligence Layer", body: "AI-powered operational intelligence. Pattern recognition, risk surfacing, intelligent routing, and proactive startup copilot.", gradient: "linear-gradient(90deg, #0057D9, #2F80ED, #66C7F4)", to: "/platform/ai", featured: true, comingSoon: true },
  { icon: "🎯", title: "Opsirix Studio", tag: "Venture Readiness", body: "Selective venture readiness layer for operationally mature founders. Investor documentation and growth preparation.", gradient: "linear-gradient(90deg, #92400E, #F59E0B)", to: "/platform/studio" },
];

function ServiceCard({ s }: { s: Service }) {
  return (
    <Link
      to={s.to}
      className={"service-card" + (s.featured ? " service-card--featured" : "")}
      style={
        {
          "--service-bar": s.gradient,
          display: "block",
          textDecoration: "none",
          color: "inherit",
        } as React.CSSProperties
      }
    >
      <div className="service-icon">{s.icon}</div>
      <h4
        style={{
          fontFamily: "var(--font-sora)",
          fontWeight: 700,
          fontSize: 15,
          color: "#071B33",
          margin: "0 0 8px",
          letterSpacing: "-0.01em",
        }}
      >
        {s.title}
        {s.comingSoon && (
          <span
            style={{
              marginLeft: 8,
              background: "rgba(245,158,11,0.12)",
              color: "#F59E0B",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 9,
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              verticalAlign: "middle",
            }}
          >
            Coming
          </span>
        )}
      </h4>
      <p
        style={{
          fontFamily: "var(--font-inter)",
          fontWeight: 400,
          fontSize: 13,
          color: "#64748B",
          lineHeight: 1.65,
          margin: "0 0 14px",
        }}
      >
        {s.body}
      </p>
      <span
        style={{
          display: "inline-block",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 600,
          color: "#0057D9",
          background: "rgba(0,87,217,0.07)",
          borderRadius: 100,
          padding: "4px 12px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {s.tag}
      </span>
    </Link>
  );
}

export function ServicesGrid() {
  return (
    <section style={{ background: "#F3F8FF", padding: "var(--section-py) 0" }}>
      <div className="opsirix-container-wide">
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
          <ScrollReveal>
            <span
              className="label-pill"
              style={{ display: "inline-flex", marginBottom: 18, background: "rgba(0,87,217,0.08)" }}
            >
              Platform Modules
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <h2
              style={{
                fontFamily: "var(--font-sora)",
                fontWeight: 800,
                fontSize: "clamp(28px, 3.6vw, 44px)",
                color: "#071B33",
                lineHeight: 1.12,
                letterSpacing: "-0.025em",
                margin: 0,
              }}
            >
              Every layer of your operational infrastructure,{" "}
              <span className="gradient-text">coordinated</span>.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 16,
                color: "#64748B",
                lineHeight: 1.7,
                marginTop: 12,
              }}
            >
              Nine modules. One operating system. Start with what you need — expand as you grow.
            </p>
          </ScrollReveal>
        </div>

        <div className="services-grid" style={{ marginTop: 56 }}>
          {SERVICES.map((s, i) => (
            <ScrollReveal key={s.title} delay={i * 0.07} y={20}>
              <ServiceCard s={s} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesGrid;
