import { createFileRoute, Link } from "@tanstack/react-router";
import { ModulePageLayout } from "@/components/platform/ModulePageLayout";

export const Route = createFileRoute("/platform/launch")({
  head: () => ({
    meta: [
      { title: "Opsirix Launch | Startup Formation Workflow Coordination" },
      {
        name: "description",
        content:
          "Opsirix Launch helps founders coordinate the operational side of starting a company. Formation checklists, document collection, banking setup, and professional introductions.",
      },
      { property: "og:title", content: "Opsirix Launch | Startup Formation Workflow Coordination" },
      {
        property: "og:description",
        content:
          "Opsirix Launch helps founders coordinate the operational side of starting a company. Formation checklists, document collection, banking setup, and professional introductions.",
      },
      { property: "og:url", content: "https://opsirix-orbit.lovable.app/platform/launch" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix-orbit.lovable.app/platform/launch" }],
  }),
  component: LaunchPage,
});

const FEATURES = [
  { t: "Founder intake and profile setup", d: "Your company details, founder background, and operational goals are documented at the start, not figured out later." },
  { t: "Entity setup checklist", d: "Formation steps organized into a tracked checklist. Opsirix coordinates the documentation and professional handoff. It does not provide formation services." },
  { t: "EIN and banking readiness", d: "Checklists for EIN application and business banking setup organized and tracked. Next steps are clear." },
  { t: "Attorney and CPA handoff preparation", d: "Documents prepared for your first attorney and CPA engagement. Opsirix coordinates the introduction through Nexus. Professionals serve you independently." },
  { t: "Initial document collection", d: "Formation documents, operating agreements, and initial contracts collected and organized in Vault." },
  { t: "Launch timeline", d: "A structured timeline for the first 30 days of operational setup. Each task has a status and an owner in Flow." },
  { t: "Vendor and account setup tracker", d: "Business tools, software, accounts, and service providers tracked as they are set up." },
];

const STEPS = [
  { n: "01", t: "Complete founder intake" },
  { n: "02", t: "Receive your launch checklist" },
  { n: "03", t: "Begin document collection in Vault" },
  { n: "04", t: "Professional introductions via Nexus" },
  { n: "05", t: "Launch timeline activated in Flow" },
  { n: "06", t: "Baseline Grid score established" },
];

const CONNECTED = [
  { icon: "🔒", name: "Opsirix Vault", to: "/platform/vault", desc: "Launch documents go straight into Vault." },
  { icon: "🔗", name: "Opsirix Nexus", to: "/platform/nexus", desc: "Attorney and CPA introductions happen during Launch." },
  { icon: "📊", name: "Opsirix Grid", to: "/platform/grid", desc: "Grid baseline established at the end of Launch." },
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

function LaunchPage() {
  return (
    <ModulePageLayout
      moduleName="Opsirix Launch"
      moduleTag="Formation Layer"
      moduleIcon="🚀"
      headline="Get your startup structured from the beginning."
      subtext="Opsirix Launch organizes the operational side of going from idea to running company. Formation checklists, document collection, professional handoffs, and operational baseline: coordinated so nothing is missed."
    >
      {/* Section 1 — Problem */}
      <div style={{ marginBottom: 64 }}>
        <Eyebrow>The Problem</Eyebrow>
        <h2 className="module-section-h2">What happens without a structured launch.</h2>
        <p style={{ maxWidth: 760, marginTop: 16 }}>
          Most founders set up their company by figuring it out as they go. Entity filed. Bank
          account opened. Attorney contacted once. And then a pile of follow-up items nobody
          tracks. Six months later, documents are missing, accounts are not set up correctly, and
          the operational foundation has gaps.
        </p>
      </div>

      {/* Section 2 — Features */}
      <div style={{ marginBottom: 64 }}>
        <Eyebrow>Capabilities</Eyebrow>
        <h2 className="module-section-h2">What Opsirix Launch covers.</h2>
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

      {/* Section 3 — Steps */}
      <div style={{ marginBottom: 64 }}>
        <Eyebrow>How It Works</Eyebrow>
        <h2 className="module-section-h2">How Opsirix Launch works.</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="module-feature-card"
              style={{ display: "flex", gap: 18, alignItems: "center" }}
            >
              <span
                aria-hidden
                style={{
                  fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                  fontSize: 13,
                  color: "#66C7F4",
                  fontWeight: 700,
                  minWidth: 32,
                }}
              >
                {s.n}
              </span>
              <h3 style={{ margin: 0 }}>{s.t}</h3>
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
          Opsirix Launch organizes the operational and documentation side of starting a company.
          It does not provide legal advice, tax advice, immigration advice, or formation services.
          Entity formation, legal opinions, and tax filings are handled by independently retained
          licensed professionals.
        </p>
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
