import { LineIcon } from "@/components/ui/LineIcon";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ModulePageLayout } from "@/components/platform/ModulePageLayout";

export const Route = createFileRoute("/platform/launch")({
  head: () => ({
    meta: [
      { title: "Opsirix Launch | Startup Formation Workflow Coordination" },
      {
        name: "description",
        content:
          "Coordinate the operational side of starting a company. A private intake reviewed by Opsirix, with Flow, Nexus and Grid as separate next steps.",
      },
      { property: "og:title", content: "Opsirix Launch | Startup Formation Workflow Coordination" },
      {
        property: "og:description",
        content:
          "Coordinate the operational side of starting a company. A private intake reviewed by Opsirix, with Flow, Nexus and Grid as separate next steps.",
      },
      { property: "og:url", content: "https://opsirix.com/platform/launch" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix.com/platform/launch" }],
  }),
  component: LaunchPage,
});

const FEATURES = [
  { t: "Founder intake and profile setup", d: "Your company details, founder background, and operational goals are documented at the start, not figured out later." },
  { t: "Entity setup information", d: "Your intake records your current or planned registration location and formation status for Opsirix review. Opsirix does not provide formation services." },
  { t: "EIN and banking status", d: "Your intake records where EIN and business banking setup stand, so the assigned Operations Lead can review next steps with you." },
  { t: "Attorney and CPA handoff preparation", d: "Your intake notes whether you want attorney or CPA help. Any introduction is a separate Nexus request that needs your consent. Professionals serve you independently." },
  { t: "Initial document collection", d: "Your intake lists which formation documents you already have. A document checklist and Vault storage are planned and not yet available." },
  { t: "Launch timeline", d: "Follow-up tasks can be added to a Flow board separately by members who can edit your workspace. Launch does not create them automatically." },
  { t: "Vendor and account setup tracker", d: "Business tools, accounts and service providers can be tracked as Flow tasks, added separately." },
];

const STEPS = [
  { n: "01", t: "Complete founder intake" },
  { n: "02", t: "Save and resume your private draft" },
  { n: "03", t: "Review and send it; Admin/CEO and the assigned Operations Lead can then read it" },
  { n: "04", t: "Request Nexus introductions separately, each with your consent" },
  { n: "05", t: "Add follow-up tasks in Flow separately" },
  { n: "06", t: "Start a Grid review separately (unscored)" },
];

const CONNECTED = [
  { icon: "🔒", name: "Opsirix Vault", to: "/platform/vault", desc: "Planned and not yet available. Launch does not send anything to Vault." },
  { icon: "🔗", name: "Opsirix Nexus", to: "/platform/nexus", desc: "A separate request: Nexus introduces approved partners only with your consent." },
  { icon: "📊", name: "Opsirix Grid", to: "/platform/grid", desc: "A separate monthly record, started on its own and unscored." },
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
      subtext="Opsirix Launch organizes the operational side of going from idea to running company. A private intake you can save, resume and send for review. Drafts are visible only to you; once sent, Opsirix Admin/CEO and the assigned Operations Lead can read it."
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
                <span aria-hidden style={{ fontSize: 20 }}><LineIcon glyph={m.icon} /></span>
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
