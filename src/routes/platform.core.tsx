import { createFileRoute, Link } from "@tanstack/react-router";
import { ModulePageLayout } from "@/components/platform/ModulePageLayout";

export const Route = createFileRoute("/platform/core")({
  head: () => ({
    meta: [
      { title: "Opsirix Core | Managed Founder Operations Support" },
      {
        name: "description",
        content:
          "Opsirix Core provides managed operational support for founders who need more than tools. Monthly reviews, task follow-up, document coordination, and partner management.",
      },
      { property: "og:title", content: "Opsirix Core | Managed Founder Operations Support" },
      {
        property: "og:description",
        content:
          "Opsirix Core provides managed operational support for founders who need more than tools. Monthly reviews, task follow-up, document coordination, and partner management.",
      },
      { property: "og:url", content: "https://opsirix-orbit.lovable.app/platform/core" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix-orbit.lovable.app/platform/core" }],
  }),
  component: CorePage,
});

const FEATURES = [
  { t: "Monthly founder operations review", d: "Dedicated monthly session covering all operational areas." },
  { t: "Task follow-up management", d: "Open tasks actively followed up, not just tracked." },
  { t: "Document follow-up", d: "Missing, expiring, or outdated documents identified and addressed." },
  { t: "Partner coordination support", d: "Attorney, CPA, and partner scheduling handled through Nexus." },
  { t: "Operating checklist management", d: "Formation and ongoing checklists managed and updated." },
  { t: "Founder Status Report", d: "Written monthly report covering score, activities, and priorities." },
  { t: "Meeting preparation", d: "Documents and context organized before attorney, CPA, or investor meetings." },
  { t: "Communication coordination", d: "Professional correspondence tracked and followed up." },
  { t: "Business process organization", d: "Core processes documented in Flow." },
];

const NOT_INCLUDES = [
  "Legal advice, immigration advice, or legal document preparation.",
  "Tax advice, accounting services, or CPA work.",
  "USCIS filings or immigration case management.",
  "Executive or strategic decision-making.",
  "All regulated matters handled by independently retained licensed professionals through Nexus.",
];

const CONNECTED = [
  { icon: "🔒", name: "Opsirix Vault", to: "/platform/vault", desc: "Document follow-up runs through Vault." },
  { icon: "⚡", name: "Opsirix Flow", to: "/platform/flow", desc: "Tasks actively managed in Flow." },
  { icon: "🔗", name: "Opsirix Nexus", to: "/platform/nexus", desc: "Partner scheduling handled via Nexus." },
  { icon: "📊", name: "Opsirix Grid", to: "/platform/grid", desc: "Monthly Grid review delivered as part of Core." },
  { icon: "🖥️", name: "Opsirix OS", to: "/platform/os", desc: "Operations visible in the OS dashboard." },
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

function CorePage() {
  return (
    <ModulePageLayout
      moduleName="Opsirix Core"
      moduleTag="Managed Operations"
      moduleIcon="⚙️"
      headline="Operational support that runs alongside your startup."
      subtext="Opsirix Core is the managed operations layer. Instead of tools to manage yourself, you get a dedicated operational support structure: task follow-up, document coordination, partner management, and monthly reporting actively handled."
    >
      <div style={{ marginBottom: 64 }}>
        <Eyebrow>The Problem</Eyebrow>
        <h2 className="module-section-h2">When self-managed tools are not enough.</h2>
        <p style={{ maxWidth: 760, marginTop: 16 }}>
          Some founders have the discipline to use a workflow system. Others are building a
          company, managing a team, talking to investors, and handling customers, and there is
          simply no time to self-manage an operational platform. Opsirix Core runs the operational
          layer so you do not have to.
        </p>
      </div>

      <div style={{ marginBottom: 64 }}>
        <Eyebrow>Capabilities</Eyebrow>
        <h2 className="module-section-h2">What Opsirix Core provides.</h2>
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
        <h2 className="module-section-h2">What Opsirix Core does not provide.</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: "24px 0 0", display: "flex", flexDirection: "column", gap: 10 }}>
          {NOT_INCLUDES.map((s) => (
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
          textAlign: "center",
        }}
      >
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
