import { createFileRoute, Link } from "@tanstack/react-router";
import { ModulePageLayout } from "@/components/platform/ModulePageLayout";

export const Route = createFileRoute("/platform/grid")({
  head: () => ({
    meta: [
      { title: "Opsirix Grid | Operational Readiness Score for Founders" },
      {
        name: "description",
        content:
          "Monthly operational readiness score across ten categories for early-stage founders. Know where your company is strong, what needs attention, and what to do next.",
      },
      { property: "og:title", content: "Opsirix Grid | Operational Readiness Score for Founders" },
      {
        property: "og:description",
        content:
          "Monthly operational readiness score across ten categories for early-stage founders. Know where your company is strong, what needs attention, and what to do next.",
      },
      { property: "og:url", content: "https://opsirix-orbit.lovable.app/platform/grid" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix-orbit.lovable.app/platform/grid" }],
  }),
  component: GridPage,
});

const CATEGORIES = [
  { t: "Entity and company setup", d: "Is the business properly formed, registered, and documented?" },
  { t: "Documentation readiness", d: "Are key documents organized, current, and accessible in Vault?" },
  { t: "Financial operations", d: "Are bookkeeping, banking, payroll, and financial records in order?" },
  { t: "Partner coordination", d: "Are attorney, CPA, and service partner relationships active and current?" },
  { t: "Workflow discipline", d: "Are tasks tracked, followed up, and completed within reasonable timeframes?" },
  { t: "Compliance calendar", d: "Are upcoming deadlines, renewals, and filing windows tracked and visible?" },
  { t: "Founder role clarity", d: "Is the founder's operational role documented and understood?" },
  { t: "Vendor and account setup", d: "Are business tools, vendors, and service accounts set up and documented?" },
  { t: "Insurance and risk readiness", d: "Does the company have appropriate insurance coverage for its current stage?" },
  { t: "Growth readiness", d: "Is the company operationally prepared for the next phase: hiring, fundraising, or expansion?" },
];

const STEPS = [
  { n: "01", t: "Review session (45 to 60 minutes)", d: "Founder and Opsirix team review each category against current documentation, workflows, and activities." },
  { n: "02", t: "Score calculated", d: "Each category is assessed. Areas of strength and areas needing attention identified." },
  { n: "03", t: "Founder Status Report delivered", d: "Written summary of the session: score, key findings, and priorities for the coming month." },
  { n: "04", t: "Action items enter Flow", d: "Improvement actions become tasks in Opsirix Flow with owners and due dates." },
  { n: "05", t: "Progress tracked month over month", d: "Score history visible in the OS dashboard." },
];

const DELIVERABLES = [
  "Monthly readiness score (total and by category)",
  "Founder Status Report",
  "Priority list for the coming month",
  "Updated task list in Flow",
  "Score history in OS dashboard",
];

const CONNECTED = [
  { icon: "🔒", name: "Opsirix Vault", to: "/platform/vault", desc: "Documentation score comes from Vault completeness." },
  { icon: "⚡", name: "Opsirix Flow", to: "/platform/flow", desc: "Task score comes from Flow discipline." },
  { icon: "🔗", name: "Opsirix Nexus", to: "/platform/nexus", desc: "Partner coordination score reflects Nexus activity." },
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

function GridPage() {
  return (
    <ModulePageLayout
      moduleName="Opsirix Grid"
      moduleTag="Readiness Scoring"
      moduleIcon="📊"
      headline="A monthly score across every area of your operations."
      subtext="Opsirix Grid reviews your company across ten operational categories each month. The result: a structured readiness score, a written status report, and a clear picture of what needs attention next."
    >
      {/* Section 1 — Problem */}
      <div style={{ marginBottom: 64 }}>
        <Eyebrow>The Problem</Eyebrow>
        <h2 className="module-section-h2">What most founders don't actually know about their company.</h2>
        <p style={{ maxWidth: 760, marginTop: 16 }}>
          Ask a founder how their operations are. Most will say "pretty good." Ask them to show
          their document readiness, compliance calendar, vendor setup, or insurance status. Most
          cannot. Without structure, founders have opinions about operational health. Not data.
        </p>
      </div>

      {/* Section 2 — 10 categories */}
      <div style={{ marginBottom: 40 }}>
        <Eyebrow>The Categories</Eyebrow>
        <h2 className="module-section-h2">What the Grid scores each month.</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
            marginTop: 24,
          }}
        >
          {CATEGORIES.map((c, i) => (
            <div
              key={c.t}
              className="module-feature-card"
              style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
            >
              <span
                aria-hidden
                style={{
                  fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                  fontSize: 13,
                  color: "#66C7F4",
                  fontWeight: 700,
                  minWidth: 28,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{c.t}</h3>
                <p>{c.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance note for Grid */}
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
          The Grid score is an internal operational readiness indicator. It is not a legal
          compliance certification, a regulatory audit, or a guarantee of compliance with any law
          or regulation. Regulatory and legal compliance matters are handled by licensed
          professionals.
        </p>
      </div>

      {/* Section 3 — Process */}
      <div style={{ marginBottom: 64 }}>
        <Eyebrow>The Review Process</Eyebrow>
        <h2 className="module-section-h2">How the monthly Grid review works.</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 24 }}>
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="module-feature-card"
              style={{ display: "flex", gap: 18, alignItems: "flex-start" }}
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
              <div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4 — Deliverables */}
      <div style={{ marginBottom: 64 }}>
        <Eyebrow>Deliverables</Eyebrow>
        <h2 className="module-section-h2">What comes out of every Grid review.</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 14,
            marginTop: 24,
          }}
        >
          {DELIVERABLES.map((d) => (
            <div key={d} className="module-feature-card">
              <p style={{ fontSize: 14, color: "#E2E8F0", margin: 0 }}>{d}</p>
            </div>
          ))}
        </div>
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
