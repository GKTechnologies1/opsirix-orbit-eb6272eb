import { LineIcon } from "@/components/ui/LineIcon";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ModulePageLayout } from "@/components/platform/ModulePageLayout";

export const Route = createFileRoute("/platform/grid")({
  head: () => ({
    meta: [
      { title: "Opsirix Grid | Monthly Operational Review" },
      {
        name: "description",
        content:
          "A monthly operational review with a founder self-assessment and an Opsirix evidence review, kept separate. Scoring is not yet available.",
      },
      { property: "og:title", content: "Opsirix Grid | Monthly Operational Review" },
      {
        property: "og:description",
        content:
          "A monthly operational review with a founder self-assessment and an Opsirix evidence review, kept separate. Scoring is not yet available.",
      },
      { property: "og:url", content: "https://opsirix.com/platform/grid" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix.com/platform/grid" }],
  }),
  component: GridPage,
});

const CATEGORIES = [
  { t: "Entity and company setup", d: "Is the business properly formed, registered, and documented?" },
  { t: "Documentation readiness", d: "Are key documents organized, current, and stored in company-controlled locations?" },
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
  { n: "02", t: "Checks recorded", d: "Each check is answered, with \"Evidence not shown\" and \"Not yet\" recorded as notes, never as failures. No score is calculated." },
  { n: "03", t: "Founder Status Report (planned)", d: "A written session summary is planned and not yet available. Today, notes are kept on the submitted record." },
  { n: "04", t: "Action items added to Flow", d: "Members who can edit your workspace add follow-up tasks to Opsirix Flow separately. Grid does not create tasks automatically." },
  { n: "05", t: "Progress tracked month over month", d: "Each month's submitted records are kept and can be opened month by month. A side-by-side comparison view is not yet available." },
];

const DELIVERABLES = [
  "Monthly review record: your self-assessment and the Opsirix evidence review, kept separate",
  "Founder Status Report (planned, not yet available)",
  "Priority list for the coming month",
  "Updated task list in Flow",
  "History of submitted monthly records"
];

const CONNECTED = [
  { icon: "🔒", name: "Opsirix Vault", to: "/platform/vault", desc: "Planned. Vault is not yet available; document checks are answered directly in Grid." },
  { icon: "⚡", name: "Opsirix Flow", to: "/platform/flow", desc: "Task checks ask about your Flow board: owners, due dates and overdue items." },
  { icon: "🔗", name: "Opsirix Nexus", to: "/platform/nexus", desc: "Professional engagement checks can reflect partners you work with through Nexus." },
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
      moduleTag="Readiness Review"
      moduleIcon="📊"
      headline="A monthly review across every area of your operations."
      subtext="Opsirix Grid reviews your company across ten operational categories each month. The result: a structured record of each check and a clear picture of what needs attention next. Scoring is not yet available, and checks in some specialist areas are held until specialist review."
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
        <h2 className="module-section-h2">What the Grid reviews each month.</h2>
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
          A Grid record is an internal operational readiness note. It is not a legal
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
