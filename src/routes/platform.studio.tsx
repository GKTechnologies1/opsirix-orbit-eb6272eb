import { createFileRoute, Link } from "@tanstack/react-router";
import { ModulePageLayout } from "@/components/platform/ModulePageLayout";

export const Route = createFileRoute("/platform/studio")({
  head: () => ({
    meta: [
      { title: "Opsirix Studio | Venture Readiness Layer for Founders" },
      {
        name: "description",
        content:
          "Selective venture readiness support for operationally mature founders. Investor documentation, strategic coordination, and growth preparation.",
      },
      { property: "og:title", content: "Opsirix Studio | Venture Readiness Layer for Founders" },
      {
        property: "og:description",
        content:
          "Selective venture readiness support for operationally mature founders. Investor documentation, strategic coordination, and growth preparation.",
      },
      { property: "og:url", content: "https://opsirix.com/platform/studio" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix.com/platform/studio" }],
  }),
  component: StudioPage,
});

const FEATURES = [
  { t: "Venture readiness review", d: "Structured review of operational, financial, and business maturity." },
  { t: "Investor documentation preparation", d: "Data room organization and investor-ready document prep." },
  { t: "Business model review", d: "Structured review with the Opsirix team and relevant advisors." },
  { t: "Strategic partner coordination", d: "Introductions and coordination through Nexus." },
  { t: "Operational maturity review", d: "Deep Grid review for venture-readiness gaps." },
  { t: "Growth roadmap support", d: "Structured growth planning aligned to operational capacity." },
];

const QUALIFY = [
  "Organized company documentation in Vault or equivalent",
  "Active Grid score of 35 or above, or equivalent operational maturity",
  "Clear business model with demonstrated or projected revenue",
  "No open compliance or legal issues requiring resolution first",
  "Serious commitment to venture-level operational discipline",
];

const DISCLAIMERS = [
  "Does not guarantee investment or funding.",
  "Does not invest in every company that applies.",
  "Legal, immigration, tax, and financial advice handled by independent licensed professionals.",
  "Studio is a selective operational and strategic support engagement.",
];

const CONNECTED = [
  { icon: "📊", name: "Opsirix Grid", to: "/platform/grid", desc: "Deep Grid review anchors Studio qualification." },
  { icon: "🔒", name: "Opsirix Vault", to: "/platform/vault", desc: "Vault documents power the data room." },
  { icon: "🔗", name: "Opsirix Nexus", to: "/platform/nexus", desc: "Strategic partner introductions via Nexus." },
  { icon: "🖥️", name: "Opsirix OS", to: "/platform/os", desc: "Studio activity surfaced in OS dashboard." },
] as const;

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
        fontSize: 11,
        color: "#F5B544",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        margin: "0 0 12px",
      }}
    >
      {children}
    </p>
  );
}

function StudioPage() {
  return (
    <ModulePageLayout
      moduleName="Opsirix Studio"
      moduleTag="Venture Layer"
      moduleIcon="🏛️"
      headline="For founders who have built a solid foundation and are ready for what comes next."
      subtext="Opsirix Studio is a selective engagement for founders with strong operational foundations, clear documentation, and serious execution capability."
    >
      {/* Selective Program amber badge */}
      <div style={{ marginBottom: 28 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(245,181,68,0.10)",
            border: "1px solid rgba(245,181,68,0.35)",
            color: "#F5B544",
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "6px 12px",
            borderRadius: 999,
            fontWeight: 600,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#F5B544",
              boxShadow: "0 0 10px #F5B544",
            }}
          />
          Selective Program
        </span>
      </div>

      <div style={{ marginBottom: 64 }}>
        <Eyebrow>Positioning</Eyebrow>
        <h2 className="module-section-h2">This is not a standard incubator.</h2>
        <p style={{ maxWidth: 760, marginTop: 16 }}>
          Opsirix Studio is selective. Founders who enter Studio already have organized
          operations, clear documentation, and demonstrated execution. Studio helps them prepare
          for the next level, not build the foundation they should already have.
        </p>
      </div>

      <div style={{ marginBottom: 64 }}>
        <Eyebrow>Capabilities</Eyebrow>
        <h2 className="module-section-h2">What Opsirix Studio covers.</h2>
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
        <Eyebrow>Qualification</Eyebrow>
        <h2 className="module-section-h2">Who qualifies for Opsirix Studio.</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: "24px 0 0", display: "flex", flexDirection: "column", gap: 10 }}>
          {QUALIFY.map((s) => (
            <li
              key={s}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                background: "rgba(245,181,68,0.04)",
                border: "1px solid rgba(245,181,68,0.18)",
                borderRadius: 10,
                padding: "14px 18px",
                color: "#CBD5E1",
                fontSize: 14,
                lineHeight: 1.65,
              }}
            >
              <span aria-hidden style={{ color: "#F5B544", fontWeight: 700, marginTop: 1 }}>✓</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: 64 }}>
        <Eyebrow>Boundaries</Eyebrow>
        <h2 className="module-section-h2">What Opsirix Studio does not do.</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: "24px 0 0", display: "flex", flexDirection: "column", gap: 10 }}>
          {DISCLAIMERS.map((s) => (
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
          background: "rgba(245,181,68,0.06)",
          border: "1px solid rgba(245,181,68,0.25)",
          borderRadius: 16,
          padding: 32,
          marginBottom: 64,
          textAlign: "center",
        }}
      >
        <h2 className="module-section-h2" style={{ marginTop: 0 }}>Ready to apply?</h2>
        <p style={{ maxWidth: 620, margin: "16px auto 24px" }}>
          Studio applications are reviewed individually. Use the subject line "Studio Evaluation"
          when you reach out.
        </p>
        <Link
          to="/contact"
          style={{
            display: "inline-block",
            background: "#F5B544",
            color: "#0B1220",
            fontWeight: 700,
            fontFamily: "Inter, sans-serif",
            fontSize: 15,
            padding: "14px 28px",
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          Apply for Studio Evaluation
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
                  color: "#F5B544",
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
