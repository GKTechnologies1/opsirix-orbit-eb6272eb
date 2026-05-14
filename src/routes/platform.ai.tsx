import { createFileRoute, Link } from "@tanstack/react-router";
import { ModulePageLayout } from "@/components/platform/ModulePageLayout";

export const Route = createFileRoute("/platform/ai")({
  head: () => ({
    meta: [
      { title: "Opsirix AI | Operational Intelligence for Founder Operations" },
      {
        name: "description",
        content:
          "Opsirix AI surfaces missing documents, workflow delays, and suggested next actions for founders. Operational visibility without replacing professional judgment.",
      },
      { property: "og:title", content: "Opsirix AI | Operational Intelligence for Founder Operations" },
      {
        property: "og:description",
        content:
          "Opsirix AI surfaces missing documents, workflow delays, and suggested next actions for founders. Operational visibility without replacing professional judgment.",
      },
      { property: "og:url", content: "https://opsirix-orbit.lovable.app/platform/ai" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix-orbit.lovable.app/platform/ai" }],
  }),
  component: AIPage,
});

const FEATURES = [
  { t: "Missing document detection", d: "When expected documents are absent, AI surfaces the gap." },
  { t: "Workflow delay alerts", d: "Tasks open longer than expected are flagged for review." },
  { t: "Pattern recognition", d: "Recurring delays or gaps across months identified." },
  { t: "Next action suggestions", d: "Based on document status, workflow activity, and Grid score." },
  { t: "Meeting preparation summaries", d: "Open items summarized before Grid reviews or partner meetings." },
  { t: "Status summaries", d: "Founder status summaries generated from Flow, Vault, and Nexus updates." },
];

const NOT_DOES = [
  "Opsirix AI does not provide legal advice.",
  "It does not provide immigration advice or visa guidance.",
  "It does not provide tax or financial advice.",
  "It does not replace attorney review of legal documents.",
  "It does not replace CPA review of financial or tax matters.",
  "AI output is for operational awareness only. All regulated matters require a licensed professional.",
];

const CONNECTED = [
  { icon: "🔒", name: "Opsirix Vault", to: "/platform/vault", desc: "AI surfaces missing or expiring Vault documents." },
  { icon: "⚡", name: "Opsirix Flow", to: "/platform/flow", desc: "AI flags workflow delays and overdue tasks." },
  { icon: "📊", name: "Opsirix Grid", to: "/platform/grid", desc: "AI suggests priorities based on Grid score." },
] as const;

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
        fontSize: 11,
        color: "#66C7F4",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        margin: "0 0 12px",
      }}
    >
      {children}
    </p>
  );
}

function AIPage() {
  return (
    <ModulePageLayout
      moduleName="Opsirix AI"
      moduleTag="Intelligence Layer"
      moduleIcon="🧠"
      statusBadge="Coming Soon"
      headline="Smarter visibility into what needs attention."
      subtext="Opsirix AI surfaces patterns, flags gaps, and suggests next actions across the platform. It does not replace professional judgment. It makes the operational picture clearer so founders and professionals can act faster."
    >
      <div style={{ marginBottom: 64 }}>
        <Eyebrow>The Problem</Eyebrow>
        <h2 className="module-section-h2">What gets missed when there is too much to track.</h2>
        <p style={{ maxWidth: 760, marginTop: 16 }}>
          Founders miss document renewals because there is no system watching for them. Tasks stay
          open not from lack of intention but because the priority is not visible. Opsirix AI is
          built to catch what falls through the cracks.
        </p>
      </div>

      <div style={{ marginBottom: 64 }}>
        <Eyebrow>Capabilities</Eyebrow>
        <h2 className="module-section-h2">What Opsirix AI does.</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 18,
            marginTop: 24,
          }}
        >
          {FEATURES.map((f) => (
            <div key={f.t} className="module-feature-card">
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 64 }}>
        <Eyebrow>Boundaries</Eyebrow>
        <h2 className="module-section-h2">What Opsirix AI does not do.</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: "24px 0 0", display: "flex", flexDirection: "column", gap: 10 }}>
          {NOT_DOES.map((s) => (
            <li
              key={s}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: "14px 18px",
                color: "#94A3B8",
                fontSize: 14,
                lineHeight: 1.65,
              }}
            >
              {s}
            </li>
          ))}
        </ul>
      </div>

      <div
        style={{
          background: "rgba(102,199,244,0.06)",
          border: "1px solid rgba(102,199,244,0.18)",
          borderRadius: 16,
          padding: 28,
          marginBottom: 64,
        }}
      >
        <h2 className="module-section-h2" style={{ marginTop: 0 }}>Human review is always required.</h2>
        <p style={{ marginTop: 12, maxWidth: 760 }}>
          Every AI output is a starting point, not a conclusion. Founders review AI-surfaced items.
          Professionals review AI-prepared summaries. Nothing goes to a partner without human
          review first.
        </p>
        <Link
          to="/contact"
          style={{
            display: "inline-block",
            marginTop: 18,
            background: "#66C7F4",
            color: "#0B1220",
            fontWeight: 700,
            fontFamily: "Inter, sans-serif",
            fontSize: 15,
            padding: "12px 24px",
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          Book a Discovery Call
        </Link>
      </div>

      <div style={{ marginTop: 16 }}>
        <h2 className="module-section-h2">Connects to.</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 18,
            marginTop: 24,
          }}
        >
          {CONNECTED.map((m) => (
            <Link
              key={m.name}
              to={m.to}
              className="module-feature-card"
              style={{ display: "flex", flexDirection: "column", gap: 10, textDecoration: "none" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span aria-hidden style={{ fontSize: 20 }}>{m.icon}</span>
                <h3 style={{ margin: 0 }}>{m.name}</h3>
              </div>
              <p>{m.desc}</p>
              <span
                style={{
                  marginTop: "auto",
                  color: "#66C7F4",
                  fontWeight: 600,
                  fontSize: 13.5,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </ModulePageLayout>
  );
}
