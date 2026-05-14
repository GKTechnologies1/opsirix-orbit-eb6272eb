import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { CTASection } from "@/components/shared/CTASection";

export const Route = createFileRoute("/platform/os")({
  head: () => ({
    meta: [
      { title: "Opsirix OS | Founder Operations Dashboard" },
      { name: "description", content: "Opsirix OS is the central founder operations dashboard. See document status, workflow activity, partner coordination, readiness score, and company health in one view." },
      { property: "og:title", content: "Opsirix OS | Founder Operations Dashboard" },
      { property: "og:description", content: "Opsirix OS is the central founder operations dashboard. See document status, workflow activity, partner coordination, readiness score, and company health in one view." },
      { property: "og:url", content: "https://opsirix-orbit.lovable.app/platform/os" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix-orbit.lovable.app/platform/os" }],
  }),
  component: Page,
});

const FEATURES = [
  { t: "Company profile overview", d: "Your entity details, founding date, key contacts, and company stage — visible from the main dashboard." },
  { t: "Document status summary", d: "Vault readiness at a glance. Which documents are current, which need renewal, and what's missing — without opening folders." },
  { t: "Workflow and task overview", d: "Active tasks, overdue items, and upcoming deadlines from Opsirix Flow — summarized on the dashboard." },
  { t: "Partner coordination view", d: "Scheduled attorney and CPA interactions, pending handoffs, and Nexus activity — visible without logging into separate systems." },
  { t: "Compliance calendar", d: "Important dates, filing windows, and renewal reminders organized in one timeline." },
  { t: "Monthly operating snapshot", d: "Grid score, status report highlights, and the top priorities for the current month." },
];

const AUDIENCE = [
  "Early-stage founders who are managing everything manually",
  "Immigrant founders who need a clear picture of company status",
  "Technical founders who don't have an operations background",
  "Founders preparing for investor conversations or due diligence",
];

const CONNECTIONS = [
  { m: "Vault", d: "Document status and readiness appears in the OS summary" },
  { m: "Flow", d: "Task activity and workflow status shows in the OS task overview" },
  { m: "Nexus", d: "Partner coordination activity and scheduled interactions visible in OS" },
  { m: "Grid", d: "Monthly readiness score and deltas shown prominently in OS dashboard" },
  { m: "AI", d: "Flagged items, missing documents, and suggested next actions surfaced in OS" },
  { m: "Core", d: "Managed operations activity and status reports accessible through OS" },
  { m: "Launch", d: "Initial setup progress visible during the launch phase" },
];

const AmberPill = () => (
  <span
    style={{
      display: "inline-block",
      background: "rgba(245,158,11,0.12)",
      color: "#B45309",
      padding: "4px 12px",
      borderRadius: 100,
      fontSize: 11,
      fontFamily: "var(--font-mono)",
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      marginLeft: 10,
    }}
  >
    Coming Soon
  </span>
);

function Page() {
  return (
    <div className="inner-page">
      <PageHeader
        pageName="Platform → Opsirix OS"
        label="Platform Module"
        title="One dashboard for your entire operation."
        subtitle="Opsirix OS gives founders a single, organized view of company documents, workflows, partner activity, compliance calendar, and operational health — without switching between scattered tools."
      />

      <section className="inner-section">
        <div className="inner-wrap">
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <Link to="/contact" className="btn-primary">Book a Discovery Call</Link>
            <Link to="/platform" className="btn-secondary">Explore Other Modules</Link>
            <AmberPill />
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">The Problem</p>
          <h2 className="inner-h2">The problem most founders don't name.</h2>
          <p className="inner-lead">
            Founders manage their startup through a mix of email threads, WhatsApp messages,
            Google Drive folders, spreadsheets, and sticky notes. Nothing is connected. Nobody
            has a complete view. The founder is the only system holding everything together —
            and that doesn't scale.
          </p>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">What It Does</p>
          <h2 className="inner-h2">What Opsirix OS provides.</h2>
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
          <h2 className="inner-h2">Who uses Opsirix OS.</h2>
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
          <p className="inner-eyebrow">Connections</p>
          <h2 className="inner-h2">How Opsirix OS connects to other modules.</h2>
          <p className="inner-lead">OS is the view layer. Every other module feeds into it.</p>
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
            {CONNECTIONS.map((c) => (
              <div key={c.m} className="inner-card" style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--font-sora)", fontWeight: 700, color: "#0057D9", minWidth: 90 }}>
                  {c.m}
                </span>
                <span style={{ color: "#64748B", fontSize: 14 }}>{c.d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-lead" style={{ fontSize: 14, color: "#64748B" }}>
            Opsirix OS is an operational visibility tool. It does not provide legal, immigration,
            tax, or accounting advice. Information shown in the dashboard reflects operational
            status only — not legal compliance certification.
          </p>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap" style={{ textAlign: "center" }}>
          <h2 className="inner-h2">Get early access to Opsirix OS.</h2>
          <p className="inner-lead">
            Opsirix OS is currently in development. Book a discovery call to get on the early
            access list and see the current platform features available now.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 28 }}>
            <Link to="/contact" className="btn-primary">Book a Discovery Call</Link>
            <Link to="/platform" className="btn-secondary">Explore Other Modules</Link>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
