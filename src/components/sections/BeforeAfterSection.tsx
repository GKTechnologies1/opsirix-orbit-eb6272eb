import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

const ease = [0.4, 0, 0.2, 1] as const;

const BEFORE = [
  "Documents scattered across email, drives, and memory — impossible to find when asked",
  "Attorney, CPA, and payroll operating in disconnected silos with zero coordination",
  "No compliance calendar — deadlines discovered only when missed",
  "Reactive execution — every week starts from zero because nothing was tracked",
  "No operational readiness score — no way to know what investors or USCIS will find",
  "Constant background anxiety about whether everything is structured correctly",
];

const AFTER = [
  "All critical documents organized in Opsirix Vault — encrypted, current, audit-ready in minutes",
  "Attorney, CPA, and partner team coordinated through Opsirix Nexus — right timing, full preparation",
  "Live compliance calendar — every deadline tracked, 90-day advance alerts, nothing missed",
  "Monthly Opsirix Grid review — priorities set, progress tracked, score improving every quarter",
  "Grid score 40+/50 — investor-ready operations with a complete evidence trail",
  "Operational calmness — your systems are running. You focus entirely on building.",
];

function CheckIcon({ delay }: { delay: number }) {
  return (
    <motion.svg
      width="11"
      height="11"
      viewBox="0 0 14 14"
      fill="none"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
    >
      <motion.path
        d="M2.5 7.5 L6 11 L11.5 4"
        stroke="#10B981"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{
          hidden: { pathLength: 0 },
          visible: { pathLength: 1 },
        }}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

function ItemRow({
  text,
  iconBg,
  iconNode,
}: {
  text: string;
  iconBg: string;
  iconNode: React.ReactNode;
}) {
  return (
    <li style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      <span
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        {iconNode}
      </span>
      <span
        style={{
          fontFamily: "var(--font-inter)",
          fontWeight: 400,
          fontSize: 14,
          color: "#334155",
          lineHeight: 1.6,
        }}
      >
        {text}
      </span>
    </li>
  );
}

export function BeforeAfterSection() {
  return (
    <section style={{ background: "#fff", padding: "var(--section-py) 0" }}>
      <div className="opsirix-container">
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
          <span
            className="label-pill"
            style={{ display: "inline-flex", marginBottom: 18, background: "rgba(0,87,217,0.08)" }}
          >
            The Transformation
          </span>
          <h2
            style={{
              fontFamily: "var(--font-sora)",
              fontWeight: 800,
              fontSize: "clamp(28px, 3.6vw, 44px)",
              color: "#071B33",
              letterSpacing: "-0.025em",
              lineHeight: 1.12,
              margin: 0,
            }}
          >
            What changes when you run on{" "}
            <span className="gradient-text">Opsirix</span>.
          </h2>
        </div>

        {/* Comparison grid */}
        <div className="before-after-grid" style={{ marginTop: 56 }}>
          {/* BEFORE */}
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease }}
            style={{
              background: "rgba(254,242,242,0.5)",
              border: "1.5px solid rgba(239,68,68,0.18)",
              borderRadius: 18,
              padding: 36,
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: 11,
                color: "#EF4444",
                letterSpacing: "0.14em",
                margin: "0 0 24px",
                textTransform: "uppercase",
              }}
            >
              Before Opsirix
            </h3>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {BEFORE.map((t) => (
                <ItemRow
                  key={t}
                  text={t}
                  iconBg="rgba(239,68,68,0.12)"
                  iconNode={
                    <span
                      style={{
                        fontSize: 11,
                        color: "#EF4444",
                        lineHeight: 1,
                        fontWeight: 700,
                      }}
                    >
                      ✕
                    </span>
                  }
                />
              ))}
            </ul>
          </motion.div>

          {/* VS DIVIDER */}
          <div className="before-after-vs">
            <div className="before-after-vs-line" />
            <div
              style={{
                fontFamily: "var(--font-sora)",
                fontWeight: 700,
                fontSize: 11,
                color: "#94A3B8",
                background: "#F3F8FF",
                border: "1.5px solid #E2E8F0",
                borderRadius: 8,
                padding: "6px 10px",
                letterSpacing: "0.05em",
              }}
            >
              VS
            </div>
            <div className="before-after-vs-line" />
          </div>

          {/* AFTER */}
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            style={{
              background: "rgba(240,249,255,0.7)",
              border: "1.5px solid rgba(0,87,217,0.16)",
              borderRadius: 18,
              padding: 36,
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: 11,
                color: "#0057D9",
                letterSpacing: "0.14em",
                margin: "0 0 24px",
                textTransform: "uppercase",
              }}
            >
              After Opsirix
            </h3>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {AFTER.map((t, i) => (
                <ItemRow
                  key={t}
                  text={t}
                  iconBg="rgba(16,185,129,0.12)"
                  iconNode={<CheckIcon delay={0.25 + i * 0.08} />}
                />
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom accent */}
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontStyle: "italic",
              fontSize: 13,
              color: "#64748B",
              margin: 0,
            }}
          >
            This transformation begins within your first 30 days on Opsirix.
          </p>
          <Link
            to="/how-it-works"
            className="before-after-cta"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              marginTop: 10,
              fontFamily: "var(--font-inter)",
              fontWeight: 500,
              fontSize: 14,
              color: "#0057D9",
              textDecoration: "none",
              transition: "gap 200ms var(--ease-smooth)",
            }}
          >
            See the full founder journey <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default BeforeAfterSection;
