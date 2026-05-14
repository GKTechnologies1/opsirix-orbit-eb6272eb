import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { CTASection } from "@/components/shared/CTASection";
import { RelatedModules } from "@/components/shared/RelatedModules";

export const Route = createFileRoute("/platform/ai")({
  head: () => ({
    meta: [
      { title: "Opsirix AI | Operational Intelligence for Founders" },
      { name: "description", content: "Opsirix AI surfaces missing documents, workflow delays, task patterns, and suggested next actions — without replacing professional judgment." },
      { property: "og:title", content: "Opsirix AI | Operational Intelligence for Founders" },
      { property: "og:description", content: "Opsirix AI surfaces missing documents, workflow delays, task patterns, and suggested next actions — without replacing professional judgment." },
      { property: "og:url", content: "https://opsirix-orbit.lovable.app/platform/ai" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix-orbit.lovable.app/platform/ai" }],
  }),
  component: Page,
});

const CAPABILITIES = [
  { t: "Missing document detection", d: "When expected documents are absent from Vault, AI surfaces the gap with context about what is missing and why it matters." },
  { t: "Workflow delay alerts", d: "Tasks that have been open longer than expected are flagged so they can be reviewed or reassigned." },
  { t: "Pattern recognition", d: "Recurring delays or gaps across months are identified so underlying issues can be addressed, not just individual tasks." },
  { t: "Next action suggestions", d: "Based on current document status, workflow activity, and Grid score, AI surfaces a short list of high-priority next actions." },
  { t: "Meeting preparation summaries", d: "Before a Grid review, attorney meeting, or CPA engagement, AI summarizes open items and relevant document status." },
  { t: "Status summaries", d: "Founder status summaries generated from Flow activity, Vault status, and Nexus updates — reducing the time spent pulling information together." },
];

const NOT_DOES = [
  "Opsirix AI does not provide legal advice.",
  "It does not provide immigration advice or visa guidance.",
  "It does not provide tax advice or financial advice.",
  "It does not provide accounting guidance.",
  "It does not replace attorney review of legal documents.",
  "It does not replace CPA review of financial or tax matters.",
  "AI output is for operational awareness only. All regulated matters require a licensed professional.",
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
        pageName="Platform → Opsirix AI"
        label="Platform Module"
        title="Smarter visibility into what needs attention."
        subtitle="Opsirix AI works across the platform to surface patterns, flag gaps, and suggest next actions. It does not replace professional judgment — it makes the operational picture clearer so founders and professionals can act on it faster."
      />

      <section className="inner-section">
        <div className="inner-wrap">
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            <Link to="/contact" className="btn-primary">Book a Discovery Call</Link>
            <Link to="/platform" className="btn-secondary">See All Modules</Link>
            <AmberPill />
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">The Problem</p>
          <h2 className="inner-h2">What gets missed when there is too much to track.</h2>
          <p className="inner-lead">
            Founders miss document renewals not because they don't care — but because there is
            no system watching for them. Tasks stay open not from lack of intention — but because
            the priority isn't visible. Opsirix AI is built to catch what falls through the cracks.
          </p>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Capabilities</p>
          <h2 className="inner-h2">What Opsirix AI does.</h2>
          <div className="inner-grid-2" style={{ marginTop: 36 }}>
            {CAPABILITIES.map((c) => (
              <div key={c.t} className="inner-card">
                <h3>{c.t}</h3>
                <p>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Boundaries</p>
          <h2 className="inner-h2">What Opsirix AI does not do.</h2>
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 10 }}>
            {NOT_DOES.map((n) => (
              <div
                key={n}
                className="inner-card"
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
              >
                <span style={{ color: "#0057D9", fontFamily: "var(--font-mono)", fontWeight: 700, flexShrink: 0 }}>
                  ×
                </span>
                <p style={{ margin: 0 }}>{n}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Human Review</p>
          <h2 className="inner-h2">Human review is always required.</h2>
          <p className="inner-lead">
            Every AI-generated output in the Opsirix platform is a starting point, not a
            conclusion. Founders review AI-surfaced items. Professionals review AI-prepared
            summaries. Nothing goes to a partner or outside party without human review.
          </p>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-lead" style={{ fontSize: 14, color: "#64748B" }}>
            Opsirix AI is an operational intelligence tool. It is not a legal AI, immigration AI,
            tax AI, or financial advice system. All AI outputs are operational in nature and must
            be reviewed by the founder and relevant licensed professionals before action.
          </p>
          <p className="inner-lead" style={{ marginTop: 20 }}>
            <strong>Connects to:</strong> Vault (document detection), Flow (task pattern
            recognition), Grid (readiness trend analysis), Nexus (partner prep summaries), OS
            (surfaced alerts in dashboard).
          </p>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap" style={{ textAlign: "center" }}>
          <h2 className="inner-h2">Get early access to Opsirix AI.</h2>
          <p className="inner-lead">
            Opsirix AI is currently in development. Book a discovery call to learn about current
            platform capabilities and the AI roadmap.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 28 }}>
            <Link to="/contact" className="btn-primary">Book a Discovery Call</Link>
          </div>
        </div>
      </section>

      <RelatedModules currentSlug="ai" />
      <CTASection />
    </div>
  );
}
