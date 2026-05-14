import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type Badge = { label: string; bg: string; color: string };

const OPSIRIX_BADGE: Badge = {
  label: "Opsirix",
  bg: "rgba(0,87,217,0.1)",
  color: "#0057D9",
};
const ATTORNEY_BADGE: Badge = {
  label: "Attorney",
  bg: "rgba(16,185,129,0.1)",
  color: "#059669",
};
const CPA_BADGE: Badge = {
  label: "CPA",
  bg: "rgba(245,158,11,0.1)",
  color: "#D97706",
};

type RowItem = { icon: string; title: string; subtitle: string; badge: Badge };

const OPSIRIX_ROWS: RowItem[] = [
  {
    icon: "📋",
    title: "Workflow coordination & project management",
    subtitle: "Task routing, operational cadence, Opsirix Flow boards",
    badge: OPSIRIX_BADGE,
  },
  {
    icon: "🔒",
    title: "Document organization & Vault management",
    subtitle: "Encrypted storage, compliance calendar, audit-readiness",
    badge: OPSIRIX_BADGE,
  },
  {
    icon: "🤝",
    title: "Partner coordination scheduling & logistics",
    subtitle: "Admin scheduling between founder and licensed professionals",
    badge: OPSIRIX_BADGE,
  },
];

const PRO_ROWS: RowItem[] = [
  {
    icon: "⚖️",
    title: "Immigration legal advice & visa opinions",
    subtitle: "Work authorization, USCIS matters, visa eligibility",
    badge: ATTORNEY_BADGE,
  },
  {
    icon: "📊",
    title: "Tax strategy, tax filing & accounting",
    subtitle: "Financial decisions, payroll classification, tax advice",
    badge: CPA_BADGE,
  },
  {
    icon: "📑",
    title: "Legal document drafting & review",
    subtitle: "Contracts, governance documents, legal opinions",
    badge: ATTORNEY_BADGE,
  },
];

function Row({ item }: { item: RowItem }) {
  return (
    <div className="compliance-row">
      <span style={{ fontSize: 18, width: 40, textAlign: "center", flexShrink: 0 }}>
        {item.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-sora)",
            fontWeight: 600,
            fontSize: 13.5,
            color: "#071B33",
            lineHeight: 1.35,
          }}
        >
          {item.title}
        </div>
        <div
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 12,
            color: "#94A3B8",
            marginTop: 4,
            lineHeight: 1.45,
          }}
        >
          {item.subtitle}
        </div>
      </div>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 700,
          background: item.badge.bg,
          color: item.badge.color,
          borderRadius: 100,
          padding: "4px 12px",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {item.badge.label}
      </span>
    </div>
  );
}

function GroupHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        fontWeight: 700,
        color: "rgba(0,87,217,0.7)",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        marginBottom: 12,
        paddingLeft: 4,
      }}
    >
      {children}
    </div>
  );
}

export function ComplianceBoundary() {
  return (
    <section style={{ background: "#fff", padding: "var(--section-py) 0" }}>
      <div className="opsirix-container-wide">
        <div className="compliance-grid">
          {/* LEFT */}
          <div>
            <ScrollReveal>
              <span
                className="label-pill"
                style={{
                  display: "inline-flex",
                  marginBottom: 18,
                  background: "rgba(0,87,217,0.08)",
                }}
              >
                How We Work
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
                What Opsirix does.{" "}
                <span className="gradient-text">What licensed professionals</span> handle.
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 16,
                  color: "#334155",
                  lineHeight: 1.7,
                  marginTop: 18,
                  maxWidth: 420,
                }}
              >
                Opsirix is an operations coordination platform. We help founders organize documents,
                workflows, timelines, and partner communication. When regulated guidance is needed,
                founders work directly with independently retained licensed professionals.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 14,
                  color: "#64748B",
                  lineHeight: 1.72,
                  marginTop: 16,
                  maxWidth: 440,
                }}
              >
                This separation is intentional. It keeps professional advice where it belongs — with
                licensed professionals — while giving founders a clean operational system to manage
                everything else.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.22}>
              <Link
                to="/faq"
                className="compliance-link"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 24,
                  fontFamily: "var(--font-inter)",
                  fontWeight: 500,
                  fontSize: 14,
                  color: "#0057D9",
                  textDecoration: "none",
                  transition: "gap 200ms var(--ease-smooth)",
                }}
              >
                Read our full compliance FAQ <ArrowRight size={14} />
              </Link>
            </ScrollReveal>
          </div>

          {/* RIGHT */}
          <ScrollReveal delay={0.1}>
            <div
              style={{
                background: "#F3F8FF",
                border: "1px solid #E2E8F0",
                borderRadius: 20,
                padding: 36,
              }}
            >
              <GroupHeader>Opsirix Handles</GroupHeader>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {OPSIRIX_ROWS.map((r) => (
                  <Row key={r.title} item={r} />
                ))}
              </div>

              <div
                style={{
                  borderTop: "1px solid #E2E8F0",
                  margin: "20px 0 16px",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: -8,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#F3F8FF",
                    padding: "0 10px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#94A3B8",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  Licensed Professionals Handle
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {PRO_ROWS.map((r) => (
                  <Row key={r.title} item={r} />
                ))}
              </div>

              {/* Disclaimer */}
              <div
                style={{
                  background: "rgba(0,87,217,0.05)",
                  borderLeft: "3px solid #0057D9",
                  borderRadius: "0 8px 8px 0",
                  padding: 16,
                  marginTop: 20,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-inter)",
                    fontSize: 12,
                    color: "#64748B",
                    lineHeight: 1.65,
                  }}
                >
                  Opsirix coordinates the operational layer. It does not provide legal, immigration,
                  tax, or accounting advice. Licensed matters are handled by independently retained
                  attorneys, CPAs, and other licensed professionals.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

export default ComplianceBoundary;
