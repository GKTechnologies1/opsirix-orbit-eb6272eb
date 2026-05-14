import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { CTASection } from "@/components/shared/CTASection";

export const Route = createFileRoute("/platform")({
  head: () => ({
    meta: [
      { title: "Opsirix Platform | Nine Founder Operations Modules" },
      { name: "description", content: "Nine connected modules covering documents, workflows, partner coordination, readiness scoring, and operational support for early-stage and immigrant founders." },
      { property: "og:title", content: "Opsirix Platform | Nine Founder Operations Modules" },
      { property: "og:description", content: "Nine connected modules covering documents, workflows, partner coordination, readiness scoring, and operational support for early-stage and immigrant founders." },
      { property: "og:url", content: "https://opsirix-orbit.lovable.app/platform" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix-orbit.lovable.app/platform" }],
  }),
  component: Page,
});

const PRINCIPLES = [
  { t: "Structured from day one", d: "Opsirix organizes the operational layer before things become messy. Documents, workflows, and partner coordination in one place." },
  { t: "Connected, not siloed", d: "Every module in the Opsirix platform connects to the others. A document added to Vault appears in Flow. A Grid score improvement shows in the OS dashboard." },
  { t: "Coordination, not advice", d: "Opsirix coordinates operations. Licensed professionals handle legal, immigration, tax, and accounting matters independently." },
];

type Module = { icon: string; name: string; desc: string; who: string; href: string };
const MODULES: Module[] = [
  { icon: "🖥️", name: "Opsirix OS", desc: "The central founder operations dashboard.", who: "Every active Opsirix founder", href: "/platform/os" },
  { icon: "🚀", name: "Opsirix Launch", desc: "Startup formation and operational setup coordination.", who: "Pre-launch and newly formed companies", href: "/platform/launch" },
  { icon: "⚡", name: "Opsirix Flow", desc: "Workflow engine for founder operations.", who: "Active founders managing ongoing tasks", href: "/platform/flow" },
  { icon: "🔒", name: "Opsirix Vault", desc: "Secure document organization for founders.", who: "Founders who need organized, accessible records", href: "/platform/vault" },
  { icon: "🔗", name: "Opsirix Nexus", desc: "Partner coordination network for founders.", who: "Founders who work with attorneys, CPAs, and service partners", href: "/platform/nexus" },
  { icon: "📊", name: "Opsirix Grid", desc: "Monthly operational readiness score.", who: "Founders who want structured operational visibility", href: "/platform/grid" },
  { icon: "🧠", name: "Opsirix AI", desc: "Operational intelligence and detection layer.", who: "Founders who need smarter workflow visibility", href: "/platform/ai" },
  { icon: "⚙️", name: "Opsirix Core", desc: "Managed operations support for higher-touch needs.", who: "Founders who need operational support, not just tools", href: "/platform/core" },
  { icon: "🏛️", name: "Opsirix Studio", desc: "Venture readiness layer for operationally mature founders.", who: "Founders with strong operational foundations preparing for growth", href: "/platform/studio" },
];

const CONNECTIONS = [
  { from: "Launch", to: "OS", note: "company profile appears in dashboard" },
  { from: "Vault", to: "OS", note: "document status shows in dashboard" },
  { from: "Flow", to: "OS", note: "task status shows in dashboard" },
  { from: "Nexus", to: "OS", note: "partner coordination visible in dashboard" },
  { from: "Grid", to: "OS", note: "readiness score shows in dashboard" },
  { from: "AI", to: "Flow, Vault, Grid", note: "surfaces patterns across modules" },
  { from: "Core", to: "All modules", note: "managed support across the platform" },
  { from: "Studio", to: "Grid, OS, Vault", note: "uses readiness data for venture review" },
];

const JOURNEY = [
  "Intake and setup — Opsirix Launch",
  "Document organization — Opsirix Vault",
  "Workflow management — Opsirix Flow",
  "Partner coordination — Opsirix Nexus",
  "Monthly readiness review — Opsirix Grid",
  "Operational dashboard — Opsirix OS",
  "Managed support if needed — Opsirix Core",
  "Venture readiness when ready — Opsirix Studio",
];

const COORDINATES = [
  "Document organization",
  "Workflow tracking",
  "Task management",
  "Partner scheduling",
  "Readiness scoring",
  "Operational review",
  "AI-assisted detection",
  "Managed ops support",
];
const PROFESSIONALS = [
  "Legal advice",
  "Immigration advice",
  "Visa strategy",
  "Tax advice",
  "Accounting filings",
  "USCIS filings",
  "Legal document drafting",
  "Regulated compliance decisions",
];

function Page() {
  return (
    <div className="inner-page">
      <PageHeader
        pageName="Platform"
        label="The Opsirix Platform"
        title="The Opsirix Platform"
        subtitle="Nine connected modules that help founders organize documents, workflows, partners, compliance timelines, and operational readiness from one structured system."
      />

      <section className="inner-section">
        <div className="inner-wrap">
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link to="/contact" className="btn-primary">Book a Discovery Call</Link>
            <Link to="/contact" className="btn-secondary">Start Founder Intake</Link>
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Platform Overview</p>
          <h2 className="inner-h2">One platform. Nine modules.</h2>
          <p className="inner-lead">
            Opsirix is not a single tool. It is a connected operational system. Each module
            handles a specific part of running a startup. Together they give founders a
            complete operational picture.
          </p>
          <div className="inner-grid-2" style={{ marginTop: 36, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {PRINCIPLES.map((p) => (
              <div key={p.t} className="inner-card">
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Modules</p>
          <h2 className="inner-h2">All nine platform modules.</h2>
          <p className="inner-lead">Click any module to see what it does, who it is for, and how it works.</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 18,
              marginTop: 36,
            }}
          >
            {MODULES.map((m) => (
              <a key={m.name} href={m.href} className="inner-card module-card-link">
                <div style={{ fontSize: 28, marginBottom: 10 }}>{m.icon}</div>
                <h3 style={{ fontFamily: "var(--font-sora)", fontWeight: 700 }}>{m.name}</h3>
                <p>{m.desc}</p>
                <p style={{ fontSize: 12, color: "#64748B", marginTop: 6 }}>
                  <strong style={{ color: "#0057D9" }}>Who it helps:</strong> {m.who}
                </p>
                <span className="module-card-cta">Explore Module →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Connections</p>
          <h2 className="inner-h2">How the modules connect.</h2>
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
            {CONNECTIONS.map((c) => (
              <div
                key={c.from + c.to}
                className="inner-card"
                style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}
              >
                <span style={{ fontFamily: "var(--font-sora)", fontWeight: 700, color: "#071B33" }}>
                  Opsirix {c.from}
                </span>
                <span style={{ color: "#0057D9", fontFamily: "var(--font-mono)", fontSize: 12 }}>→</span>
                <span style={{ fontFamily: "var(--font-sora)", fontWeight: 700, color: "#071B33" }}>
                  Opsirix {c.to}
                </span>
                <span style={{ color: "#64748B", fontSize: 14 }}>— {c.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Founder Journey</p>
          <h2 className="inner-h2">How founders move through the platform.</h2>
          <ol style={{ marginTop: 32, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
            {JOURNEY.map((step, i) => (
              <li
                key={step}
                className="inner-card"
                style={{ display: "flex", alignItems: "center", gap: 16 }}
              >
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
                <span style={{ fontFamily: "var(--font-inter)", fontSize: 15, color: "#071B33" }}>
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Compliance Boundary</p>
          <h2 className="inner-h2">What Opsirix does. What licensed professionals handle.</h2>
          <div className="inner-cols" style={{ marginTop: 32 }}>
            <div className="inner-col-card included">
              <h3>Opsirix coordinates</h3>
              <ul>{COORDINATES.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
            <div className="inner-col-card routed">
              <h3>Licensed professionals handle independently</h3>
              <ul>{PROFESSIONALS.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          </div>
          <p className="inner-lead" style={{ marginTop: 28, fontSize: 14, color: "#64748B" }}>
            Opsirix is an operations coordination platform. It does not provide legal, immigration,
            tax, or accounting advice. All regulated matters are handled by independently retained
            licensed professionals.
          </p>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap" style={{ textAlign: "center" }}>
          <h2 className="inner-h2">Ready to get organized?</h2>
          <p className="inner-lead">
            Book a discovery call. We review your founder stage and recommend the right modules.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 28 }}>
            <Link to="/contact" className="btn-primary">Book a Discovery Call</Link>
            <Link to="/contact" className="btn-secondary">Start Founder Intake</Link>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
