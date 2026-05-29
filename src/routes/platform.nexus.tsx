import { createFileRoute, Link } from "@tanstack/react-router";
import { ModulePageLayout } from "@/components/platform/ModulePageLayout";

export const Route = createFileRoute("/platform/nexus")({
  head: () => ({
    meta: [
      { title: "Opsirix Nexus | Professional Partner Coordination Network" },
      {
        name: "description",
        content:
          "Connect to attorneys, CPAs, insurance, and banking partners with organized intake, warm introductions, and clear professional boundaries.",
      },
      { property: "og:title", content: "Opsirix Nexus | Professional Partner Coordination Network" },
      {
        property: "og:description",
        content:
          "Connect to attorneys, CPAs, insurance, and banking partners with organized intake, warm introductions, and clear professional boundaries.",
      },
      { property: "og:url", content: "https://opsirix.com/platform/nexus" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix.com/platform/nexus" }],
  }),
  component: NexusPage,
});

const FOR_FOUNDERS = [
  { t: "Professional introductions", d: "Nexus matches founders to the right licensed professional based on company type, needs, and operational stage." },
  { t: "Document preparation", d: "Before a professional engagement, relevant documents from Vault are organized into a packet so the founder arrives prepared." },
  { t: "Scheduling and follow-up", d: "Meeting scheduling, follow-up reminders, and handoff tracking through Flow." },
  { t: "Status visibility", d: "Active and upcoming professional engagements visible in the OS dashboard." },
];

const FOR_PARTNERS = [
  { t: "Organized founder referrals", d: "Partners receive introductions to founders with completed intake forms, organized documents, and clear context." },
  { t: "Clear scope from day one", d: "Every Nexus introduction clarifies that Opsirix handles operations. The professional handles licensed advice." },
  { t: "Less administrative friction", d: "Founders have organized records before work begins, reducing back-and-forth." },
];

const PARTNER_TYPES = [
  "Immigration Attorneys",
  "Attorneys (General)",
  "CPAs",
  "Tax Professionals",
  "Bookkeepers",
  "Insurance Brokers",
  "Payroll Providers",
  "Business Bankers",
  "Startup Advisors",
  "University Partners",
];

const CONNECTED = [
  { icon: "🔒", name: "Opsirix Vault", to: "/platform/vault", desc: "Partner packets prepared from Vault documents." },
  { icon: "⚡", name: "Opsirix Flow", to: "/platform/flow", desc: "Partner handoffs tracked in Flow." },
  { icon: "📊", name: "Opsirix Grid", to: "/platform/grid", desc: "Partner coordination scored in monthly review." },
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

function ColumnHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontFamily: "Sora, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        color: "#66C7F4",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        margin: "0 0 18px",
      }}
    >
      {children}
    </h3>
  );
}

function NexusPage() {
  return (
    <ModulePageLayout
      moduleName="Opsirix Nexus"
      moduleTag="Partner Network"
      moduleIcon="🔗"
      headline="The right professional, at the right time, with the right information."
      subtext="Opsirix Nexus coordinates the relationship between founders and licensed professional partners. Scheduling, document preparation, and follow-through handled so founders arrive prepared and professionals receive organized clients."
    >
      {/* Section 1 — Problem */}
      <div style={{ marginBottom: 64 }}>
        <Eyebrow>The Problem</Eyebrow>
        <h2 className="module-section-h2">Why founder-professional relationships often start badly.</h2>
        <p style={{ maxWidth: 760, marginTop: 16 }}>
          Founders reach out to attorneys or CPAs without context. Meetings happen without the
          right documents. Follow-up gets lost in email. The result: slower progress, higher cost,
          and a founder who does not know what to do between professional engagements.
        </p>
      </div>

      {/* Section 2 — Two columns */}
      <div style={{ marginBottom: 64 }}>
        <Eyebrow>What It Coordinates</Eyebrow>
        <h2 className="module-section-h2">What Opsirix Nexus coordinates.</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 32,
            marginTop: 28,
          }}
        >
          <div>
            <ColumnHeader>For Founders</ColumnHeader>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {FOR_FOUNDERS.map((f) => (
                <div key={f.t} className="module-feature-card">
                  <h3>{f.t}</h3>
                  <p>{f.d}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <ColumnHeader>For Partners</ColumnHeader>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {FOR_PARTNERS.map((f) => (
                <div key={f.t} className="module-feature-card">
                  <h3>{f.t}</h3>
                  <p>{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3 — Partner types */}
      <div style={{ marginBottom: 64 }}>
        <Eyebrow>The Network</Eyebrow>
        <h2 className="module-section-h2">Who is in the Nexus network.</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
            marginTop: 24,
          }}
        >
          {PARTNER_TYPES.map((p) => (
            <div
              key={p}
              className="module-feature-card"
              style={{ padding: "16px 18px", textAlign: "center" }}
            >
              <p style={{ margin: 0, fontSize: 13.5, color: "#E2E8F0" }}>{p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance boundary */}
      <div style={{ marginBottom: 56 }}>
        <Eyebrow>Boundaries</Eyebrow>
        <h2 className="module-section-h2">What Opsirix Nexus does not do.</h2>
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: 22,
            marginTop: 16,
          }}
        >
          <p style={{ fontSize: 14, color: "#94A3B8", margin: 0, lineHeight: 1.7 }}>
            Opsirix Nexus coordinates introductions and logistics. It does not provide legal
            advice, immigration advice, tax advice, or any regulated professional service. Every
            partner in the Nexus network serves founders independently under their own engagement
            terms. Opsirix does not supervise, direct, or participate in licensed professional work.
          </p>
        </div>
      </div>

      {/* Two CTAs */}
      <div
        style={{
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 64,
        }}
      >
        <Link to="/contact" className="module-btn-primary">Book a Discovery Call</Link>
        <Link to="/for-partners" className="module-btn-secondary">Apply to Join Nexus</Link>
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
