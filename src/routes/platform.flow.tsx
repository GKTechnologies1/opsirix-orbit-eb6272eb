import { createFileRoute, Link } from "@tanstack/react-router";
import { ModulePageLayout } from "@/components/platform/ModulePageLayout";

export const Route = createFileRoute("/platform/flow")({
  head: () => ({
    meta: [
      { title: "Opsirix Flow | Founder Workflow Engine" },
      {
        name: "description",
        content:
          "Organize tasks, reminders, partner handoffs, and recurring workflows. Know what needs to happen, who owns it, and what is overdue.",
      },
      { property: "og:title", content: "Opsirix Flow | Founder Workflow Engine" },
      {
        property: "og:description",
        content:
          "Organize tasks, reminders, partner handoffs, and recurring workflows. Know what needs to happen, who owns it, and what is overdue.",
      },
      { property: "og:url", content: "https://opsirix.com/platform/flow" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix.com/platform/flow" }],
  }),
  component: FlowPage,
});

const FEATURES = [
  { t: "Task routing", d: "Each operational task has an owner, a due date, and a status. Nothing is tracked by memory alone." },
  { t: "Workflow boards", d: "Operational work organized into boards by category: formation, compliance, financial coordination, partner coordination, and ongoing operations." },
  { t: "Partner handoff tracking", d: "When a document or task goes to an attorney, CPA, or other partner, the handoff is tracked: what was sent, when, and what is pending." },
  { t: "Deadline reminders", d: "Filing deadlines, renewal dates, and review appointments tracked with reminders before they arrive." },
  { t: "Escalation management", d: "Tasks that are overdue or require a founder decision are flagged for attention." },
  { t: "Monthly operating cadence", d: "Every month follows a structured rhythm: task review, Vault check, Grid review, partner check. Flow runs the cadence." },
  { t: "Founder follow-up tracker", d: "Open items with partners, attorneys, CPAs, and vendors tracked in one place." },
];

const STEPS = [
  { n: "01", t: "Weekly task list generated", d: "Active tasks for the week are surfaced based on current workflows and deadlines." },
  { n: "02", t: "Tasks assigned with owners and due dates", d: "Every task has an assigned person: founder, Opsirix team, or partner." },
  { n: "03", t: "Partner handoffs logged", d: "Documents going to attorneys or CPAs are tracked. Status updated when received." },
  { n: "04", t: "Escalation triggered when overdue", d: "Tasks past their deadline are flagged for review." },
  { n: "05", t: "Monthly review closes the loop", d: "Flow activity is reviewed during the monthly Grid session." },
];

const AUDIENCE = [
  "Founders managing operations through emails and calendar reminders",
  "Early-stage companies without a dedicated operations person",
  "Immigrant founders coordinating multiple professionals at the same time",
  "Founders preparing for audit, due diligence, or investor review",
  "Solo founders who need a system, not just reminders",
];

const CONNECTED = [
  { icon: "🔒", name: "Opsirix Vault", to: "/platform/vault", desc: "Document handoffs tracked and linked." },
  { icon: "🤝", name: "Opsirix Nexus", to: "/platform/nexus", desc: "Partner coordination visible in Flow." },
  { icon: "📊", name: "Opsirix Grid", to: "/platform/grid", desc: "Task completion feeds into monthly readiness score." },
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

function FlowPage() {
  return (
    <ModulePageLayout
      moduleName="Opsirix Flow"
      moduleTag="Workflow Engine"
      moduleIcon="⚡"
      headline="Know what needs to happen. Know who owns it."
      subtext="Opsirix Flow is the workflow layer of the platform. Tasks are assigned, tracked, and followed up. Partner handoffs are visible. Deadlines do not disappear into email threads."
    >
      {/* Section 1 — Problem */}
      <div style={{ marginBottom: 64 }}>
        <Eyebrow>The Problem</Eyebrow>
        <h2 className="module-section-h2">Why operational tasks fall through the gaps.</h2>
        <p style={{ maxWidth: 760, marginTop: 16 }}>
          Startup operations run through conversations. Attorney follow-up discussed in a call. CPA
          document request buried in an email. Payroll setup agreed verbally. Three weeks later,
          none of it is done because nobody had a system for it.
        </p>
      </div>

      {/* Section 2 — Features */}
      <div style={{ marginBottom: 64 }}>
        <Eyebrow>Capabilities</Eyebrow>
        <h2 className="module-section-h2">What Opsirix Flow tracks.</h2>
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
        <h2 className="module-section-h2">How Flow operates each week.</h2>
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

      {/* Section 4 — Audience */}
      <div style={{ marginBottom: 64 }}>
        <Eyebrow>Who It's For</Eyebrow>
        <h2 className="module-section-h2">Who Opsirix Flow is built for.</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginTop: 24,
          }}
        >
          {AUDIENCE.map((a) => (
            <div key={a} className="module-feature-card">
              <p style={{ fontSize: 14, color: "#94A3B8" }}>{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Connected modules */}
      <div style={{ marginTop: 80 }}>
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
