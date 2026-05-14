import { Link } from "@tanstack/react-router";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type Row =
  | {
      kind: "label";
      text: string;
      tone?: "default" | "cyan" | "gray";
    }
  | {
      kind: "row";
      icon: string;
      label: string;
      badge: string;
      badgeBg: string;
      badgeColor: string;
    }
  | { kind: "opsirix" };

const ROWS: Row[] = [
  { kind: "label", text: "Professional Layer" },
  {
    kind: "row",
    icon: "⚖️",
    label: "Immigration Attorney",
    badge: "Licensed Pro",
    badgeBg: "rgba(16,185,129,0.15)",
    badgeColor: "#10B981",
  },
  {
    kind: "row",
    icon: "📊",
    label: "CPA / Bookkeeper",
    badge: "Licensed Pro",
    badgeBg: "rgba(16,185,129,0.15)",
    badgeColor: "#10B981",
  },
  {
    kind: "row",
    icon: "🏦",
    label: "Business Banking",
    badge: "Financial Infra",
    badgeBg: "rgba(47,128,237,0.15)",
    badgeColor: "#2F80ED",
  },
  { kind: "label", text: "Opsirix Orchestration Layer", tone: "cyan" },
  { kind: "opsirix" },
  { kind: "label", text: "Execution Layer", tone: "gray" },
  {
    kind: "row",
    icon: "💼",
    label: "Payroll Coordination",
    badge: "Admin Layer",
    badgeBg: "rgba(255,255,255,0.06)",
    badgeColor: "rgba(255,255,255,0.65)",
  },
  {
    kind: "row",
    icon: "📋",
    label: "Workflow Systems",
    badge: "Ops Layer",
    badgeBg: "rgba(255,255,255,0.06)",
    badgeColor: "rgba(255,255,255,0.65)",
  },
  {
    kind: "row",
    icon: "🔒",
    label: "Document Vault",
    badge: "Intel Layer",
    badgeBg: "rgba(255,255,255,0.06)",
    badgeColor: "rgba(255,255,255,0.65)",
  },
  {
    kind: "row",
    icon: "🚀",
    label: "The Founder",
    badge: "Building",
    badgeBg: "rgba(102,199,244,0.15)",
    badgeColor: "#66C7F4",
  },
];

const FEATURES = [
  "Coordinates your attorney, CPA, and professional team through Opsirix Nexus without replacing them",
  "Organizes your documents in Opsirix Vault. Audit-ready and accessible when you need them.",
  "Runs your operational rhythm through Opsirix Flow: weekly boards, task tracking, and scheduled reviews.",
  "Scores your operational health monthly across 5 dimensions with a 50-point readiness score.",
  "Never gives legal, immigration, or tax advice — all regulated matters route to licensed professionals immediately",
];

const ease = [0.4, 0, 0.2, 1] as const;

function StackVisual() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });

  // Stagger only across actual interactive rows; labels appear instantly with their adjacent row.
  let rowIndex = 0;

  return (
    <div
      ref={ref}
      className="relative overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(102,199,244,0.12)",
        borderRadius: 20,
        padding: 36,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(102,199,244,0.4), transparent)",
        }}
      />

      {ROWS.map((row, i) => {
        if (row.kind === "label") {
          const color =
            row.tone === "cyan"
              ? "rgba(102,199,244,0.6)"
              : row.tone === "gray"
              ? "rgba(255,255,255,0.3)"
              : "rgba(255,255,255,0.3)";
          return (
            <div
              key={`l-${i}`}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "10px 16px 6px",
                marginBottom: 4,
                fontWeight: 600,
              }}
            >
              {row.text}
            </div>
          );
        }

        if (row.kind === "opsirix") {
          const myIndex = rowIndex++;
          const delay = myIndex * 0.06 + 0.15;
          return (
            <motion.div
              key={`o-${i}`}
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
              transition={{ duration: 0.6, delay, ease }}
              className="layer-opsirix"
              style={{
                border: "1.5px solid rgba(102,199,244,0.35)",
                borderRadius: 14,
                padding: "16px 20px",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontFamily: "var(--font-sora)",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#fff",
                    letterSpacing: "0.02em",
                  }}
                >
                  OPSIRIX
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "#66C7F4",
                  }}
                >
                  Orchestration Layer
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#10B981",
                    boxShadow: "0 0 0 4px rgba(16,185,129,0.18)",
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "rgba(255,255,255,0.7)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Active
                </span>
              </div>
            </motion.div>
          );
        }

        const myIndex = rowIndex++;
        const delay = myIndex * 0.06;
        return (
          <motion.div
            key={`r-${i}`}
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay, ease }}
            className="layer-row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderRadius: 12,
              marginBottom: 8,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(102,199,244,0.08)",
              transition: "all 200ms var(--ease-smooth)",
            }}
          >
            <span
              style={{
                fontSize: 20,
                width: 40,
                textAlign: "center",
                flexShrink: 0,
              }}
            >
              {row.icon}
            </span>
            <span
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 500,
                fontSize: 13,
                color: "rgba(255,255,255,0.82)",
                flex: 1,
              }}
            >
              {row.label}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                fontWeight: 500,
                background: row.badgeBg,
                color: row.badgeColor,
                borderRadius: 100,
                padding: "3px 10px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {row.badge}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

export function OpsirixLayerSection() {
  return (
    <section
      style={{
        backgroundColor: "#071B33",
        padding: "var(--section-py) 0",
        position: "relative",
      }}
    >
      <div className="opsirix-container-wide">
        <div className="opsirix-layer-grid">
          {/* LEFT */}
          <div>
            <ScrollReveal>
              <span className="section-label">The Solution</span>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h2
                style={{
                  fontFamily: "var(--font-sora)",
                  fontWeight: 800,
                  fontSize: "clamp(28px, 3.6vw, 44px)",
                  color: "#fff",
                  lineHeight: 1.1,
                  letterSpacing: "-0.025em",
                  margin: 0,
                }}
              >
                Opsirix sits between your startup and the{" "}
                <span className="gradient-text">professionals it depends on</span>.
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p
                className="lead"
                style={{ marginTop: 18, marginBottom: 32, maxWidth: 460 }}
              >
                You already have professionals. You already have tools. What's missing is the
                coordination layer that connects them to your daily operations. That's Opsirix.
              </p>
            </ScrollReveal>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {FEATURES.map((f, i) => (
                <ScrollReveal key={f} delay={0.15 + i * 0.06} y={16}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "rgba(0,87,217,0.2)",
                        border: "1.5px solid #0057D9",
                        flexShrink: 0,
                        marginTop: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "#2F80ED",
                          display: "block",
                        }}
                      />
                    </span>
                    <p
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: 14,
                        color: "rgba(255,255,255,0.68)",
                        lineHeight: 1.65,
                        margin: 0,
                      }}
                    >
                      {f}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={0.5}>
              <Link
                to="/how-it-works"
                className="btn btn-primary"
                style={{ marginTop: 32 }}
              >
                See How It Works →
              </Link>
            </ScrollReveal>
          </div>

          {/* RIGHT */}
          <div>
            <StackVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

export default OpsirixLayerSection;
