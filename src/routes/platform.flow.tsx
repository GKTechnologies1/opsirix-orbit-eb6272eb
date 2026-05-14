import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { CTASection } from "@/components/shared/CTASection";
import { RelatedModules } from "@/components/shared/RelatedModules";

export const Route = createFileRoute("/platform/flow")({
  head: () => ({
    meta: [
      { title: "Opsirix Flow | Founder Workflow Engine" },
      { name: "description", content: "Opsirix Flow organizes tasks, reminders, partner handoffs, escalations, and recurring workflows for early-stage founders. Know what needs to happen and who owns it." },
      { property: "og:title", content: "Opsirix Flow | Founder Workflow Engine" },
      { property: "og:description", content: "Opsirix Flow organizes tasks, reminders, partner handoffs, escalations, and recurring workflows for early-stage founders. Know what needs to happen and who owns it." },
      { property: "og:url", content: "https://opsirix-orbit.lovable.app/platform/flow" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix-orbit.lovable.app/platform/flow" }],
  }),
  component: Page,
});

const FEATURES = [
  { t: "Task routing", d: "Each operational task has an owner, a due date, and a status. Nothing is tracked by memory." },
  { t: "Workflow boards", d: "Operational work is organized into boards by category: formation, compliance, financial, partner coordination, and ongoing operations." },
  { t: "Partner handoff tracking", d: "When a document or task needs to go to an attorney, CPA, or other partner, the handoff is tracked — including what was sent, when, and what's pending." },
  { t: "Deadline reminders", d: "Filing deadlines, renewal dates, and review appointments tracked in advance with reminders before they arrive." },
  { t: "Escalation management", d: "Tasks that are overdue or require founder decision are flagged. Nothing sits unresolved without visibility." },
  { t: "Monthly operating cadence", d: "Every month follows a structured rhythm: task review, Vault check, Grid review, partner coordination check. Flow runs the cadence." },
  { t: "Founder follow-up tracker", d: "Open items with partners, attorneys, CPAs, and vendors tracked in one place." },
];

const AUDIENCE = [
  "Founders who manage operations through emails and calendar notes",
  "Early-stage companies without a dedicated operations person",
  "Immigrant founders coordinating multiple professionals simultaneously",
  "Founders preparing for audit, due diligence, or investor review",
  "Solo founders who need a system, not just reminders",
];

const STEPS = [
  { t: "Weekly task list generated", d: "Active tasks for the week are surfaced based on current workflows and upcoming deadlines." },
  { t: "Tasks assigned to owners", d: "Every task has an assigned person — founder, Opsirix team, or partner — with a clear due date." },
  { t: "Partner handoffs tracked", d: "Documents going to attorneys or CPAs are logged. Status updated when received or reviewed." },
  { t: "Escalation triggered when needed", d: "Tasks overdue by more than a threshold are flagged for attention." },
  { t: "Monthly review closes the loop", d: "Flow activity is reviewed during the monthly Grid session. Completed, pending, and upcoming tasks summarized." },
];

function Page() {
  return (
    <div className="inner-page">
      <PageHeader
        pageName="Platform → Opsirix Flow"
        label="Platform Module"
        title="Know what needs to happen. And who owns it."
        subtitle="Opsirix Flow is the workflow layer of the platform. Tasks are assigned, tracked, and followed up. Partner handoffs are visible. Deadlines don't disappear into email threads."
      />

      <section className="inner-section">
        <div className="inner-wrap">
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link to="/contact" className="btn-primary">Book a Discovery Call</Link>
            <Link to="/platform" className="btn-secondary">See All Modules</Link>
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">The Problem</p>
          <h2 className="inner-h2">Why most operational tasks fall through the gaps.</h2>
          <p className="inner-lead">
            Startup operations run through conversations. Attorney follow-up discussed in a call.
            CPA document request buried in an email. Payroll setup agreed in a meeting. Three weeks
            later, none of it is done because nobody had a system for it.
          </p>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">What It Does</p>
          <h2 className="inner-h2">What Opsirix Flow manages.</h2>
          <div className="inner-grid-2" style={{ marginTop: 36 }}>
            {FEATURES.map((f) => (
              <div key={f.t} className="inner-card">
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Who It's For</p>
          <h2 className="inner-h2">Who uses Opsirix Flow.</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 18,
              marginTop: 36,
            }}
          >
            {AUDIENCE.map((a) => (
              <div key={a} className="inner-card">
                <p style={{ margin: 0 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">How It Works</p>
          <h2 className="inner-h2">How Opsirix Flow operates.</h2>
          <ol style={{ marginTop: 32, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
            {STEPS.map((s, i) => (
              <li key={s.t} className="inner-card" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <span
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "rgba(0,87,217,0.08)", color: "#0057D9",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13, flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <div>
                  <h3 style={{ margin: "0 0 4px" }}>{s.t}</h3>
                  <p style={{ margin: 0 }}>{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-lead">
            <strong>Connects to:</strong> Vault (document handoffs), Nexus (partner coordination),
            Grid (monthly review), and OS (task visibility in dashboard).
          </p>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap" style={{ textAlign: "center" }}>
          <h2 className="inner-h2">Get your operational workflow organized.</h2>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 28 }}>
            <Link to="/contact" className="btn-primary">Book a Discovery Call</Link>
            <Link to="/platform" className="btn-secondary">Explore Other Modules</Link>
          </div>
        </div>
      </section>

      <RelatedModules currentSlug="flow" />
      <CTASection />
    </div>
  );
}
