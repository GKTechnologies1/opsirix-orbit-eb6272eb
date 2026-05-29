import { createFileRoute, Link } from "@tanstack/react-router";
import { ModulePageLayout } from "@/components/platform/ModulePageLayout";

export const Route = createFileRoute("/platform/os")({
  head: () => ({
    meta: [
      { title: "Opsirix OS | Founder Operations Dashboard" },
      {
        name: "description",
        content:
          "Central founder operations dashboard. Document status, workflow activity, partner coordination, and company health in one view.",
      },
      { property: "og:title", content: "Opsirix OS | Founder Operations Dashboard" },
      {
        property: "og:description",
        content:
          "Central founder operations dashboard. Document status, workflow activity, partner coordination, and company health in one view.",
      },
      { property: "og:url", content: "https://opsirix.com/platform/os" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix.com/platform/os" }],
  }),
  component: OSPage,
});

const FEATURES = [
  { t: "Company profile overview", d: "Entity details, founding date, key contacts, and company stage visible from the dashboard." },
  { t: "Document status summary", d: "Vault readiness at a glance: which documents are current, which need renewal, and what is missing." },
  { t: "Workflow and task overview", d: "Active tasks, overdue items, and upcoming deadlines from Flow summarized on the dashboard." },
  { t: "Partner coordination view", d: "Scheduled attorney and CPA interactions, pending handoffs, and Nexus activity visible without logging into separate systems." },
  { t: "Compliance calendar", d: "Important dates, filing windows, and renewal reminders organized in one timeline." },
  { t: "Monthly operating snapshot", d: "Grid score, status report highlights, and top priorities for the current month." },
];

const CONNECTED = [
  { icon: "🔒", name: "Opsirix Vault", to: "/platform/vault", desc: "Document status feeds into OS." },
  { icon: "⚡", name: "Opsirix Flow", to: "/platform/flow", desc: "Task activity visible in OS." },
  { icon: "📊", name: "Opsirix Grid", to: "/platform/grid", desc: "Monthly score shown prominently in OS dashboard." },
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

function OSPage() {
  return (
    <ModulePageLayout
      moduleName="Opsirix OS"
      moduleTag="Central Dashboard"
      moduleIcon="🖥️"
      statusBadge="Coming Soon"
      headline="One dashboard for your entire operation."
      subtext="Opsirix OS gives founders a single organized view of company documents, workflows, partner activity, compliance calendar, and operational health. No switching between scattered tools."
    >
      {/* Section 1 — Problem */}
      <div style={{ marginBottom: 64 }}>
        <Eyebrow>The Problem</Eyebrow>
        <h2 className="module-section-h2">The problem most founders don't name.</h2>
        <p style={{ maxWidth: 760, marginTop: 16 }}>
          Founders manage their startup through email threads, chat messages, Google Drive folders,
          spreadsheets, and memory. Nothing is connected. Nobody has a complete view. The founder
          is the only system holding everything together. That does not scale.
        </p>
      </div>

      {/* Section 2 — Features */}
      <div style={{ marginBottom: 64 }}>
        <Eyebrow>What It Shows</Eyebrow>
        <h2 className="module-section-h2">What Opsirix OS shows.</h2>
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

      {/* Compliance note */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          padding: 22,
          marginBottom: 64,
        }}
      >
        <p style={{ fontSize: 13.5, color: "#94A3B8", margin: 0, lineHeight: 1.7 }}>
          Opsirix OS is an operational visibility tool. It does not provide legal, immigration,
          tax, or accounting advice. Information shown in the dashboard reflects operational
          status only, not legal compliance certification.
        </p>
      </div>

      {/* Early Access CTA */}
      <div
        style={{
          background: "rgba(102,199,244,0.06)",
          border: "1px solid rgba(102,199,244,0.18)",
          borderRadius: 16,
          padding: 32,
          marginBottom: 64,
          textAlign: "center",
        }}
      >
        <h2 className="module-section-h2" style={{ marginTop: 0 }}>
          Get early access to Opsirix OS.
        </h2>
        <p style={{ maxWidth: 620, margin: "16px auto 24px" }}>
          Opsirix OS is currently in development. Book a discovery call to get on the early access
          list and see current platform features available now.
        </p>
        <Link
          to="/contact"
          style={{
            display: "inline-block",
            background: "#66C7F4",
            color: "#0B1220",
            fontWeight: 700,
            fontFamily: "Inter, sans-serif",
            fontSize: 15,
            padding: "14px 28px",
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          Book a Discovery Call
        </Link>
      </div>

      {/* Connected modules */}
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
