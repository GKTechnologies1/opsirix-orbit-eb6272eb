import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/for-partners")({
  head: () => ({
    meta: [
      { title: "Partner With Opsirix | Nexus Partner Network for Attorneys and CPAs" },
      { name: "description", content: "Join the Opsirix Nexus partner network. Get referrals to organized, prepared founders. Work with clients who have their operational documents ready." },
      { property: "og:title", content: "Partner With Opsirix | Nexus Partner Network for Attorneys and CPAs" },
      { property: "og:description", content: "Join the Opsirix Nexus partner network. Get referrals to organized, prepared founders. Work with clients who have their operational documents ready." },
      { property: "og:url", content: "https://opsirix-orbit.lovable.app/for-partners" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix-orbit.lovable.app/for-partners" }],
  }),
  component: Page,
});

const BENEFITS = [
  { t: "Prepared founders", d: "Founders who come through Opsirix have organized documents, completed intake forms, and a clear picture of their operational situation before the first conversation." },
  { t: "Clear referral scope", d: "Opsirix routes founders to the right professional based on their specific operational situation. No cold referrals. Context is provided upfront." },
  { t: "Less back-and-forth", d: "Because Opsirix organizes documents and operational context before the professional introduction, less time is spent on basic administrative setup." },
  { t: "Clear professional boundaries", d: "Opsirix handles operations coordination. Partners provide licensed professional advice. The separation is clear in every engagement." },
];

const TYPES = [
  { icon: "⚖️", t: "Immigration Attorneys", d: "Founders with organized documentation and clear context." },
  { icon: "📊", t: "CPAs and Bookkeepers", d: "Financial coordination handled. Accounting work ready to begin." },
  { icon: "🏦", t: "Banking Partners", d: "Startup-ready founders who need business banking setup." },
  { icon: "🛡️", t: "Insurance Brokers", d: "Founders who need GL, E&O, or Cyber Liability coverage." },
  { icon: "💻", t: "Technology Partners", d: "Founders who need software development, AI, or MVP builds." },
  { icon: "🏛️", t: "University Partners", d: "Campus programs seeking operational resources for student founders." },
];

const STEPS = [
  "Founder completes intake — operational situation documented.",
  "Opsirix identifies the right professional based on founder's needs.",
  "Warm introduction made with context — documents prepared.",
  "Professional engagement begins. Opsirix coordinates logistics.",
  "Ongoing coordination continues. Clear scope maintained.",
];

function Page() {
  const [submitted, setSubmitted] = useState(false);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="inner-page">
      <PageHeader
        pageName="For Partners"
        label="Nexus Partner Network"
        title="Join the Opsirix Nexus partner network."
        subtitle="Opsirix connects founders to attorneys, CPAs, insurance, banking, and technology partners at the right moment in their operational journey. Every partner serves founders independently. Opsirix handles the coordination."
      />

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Why Partners Join Nexus</p>
          <h2 className="inner-h2">What partners gain from Nexus.</h2>
          <div className="inner-grid-3">
            {BENEFITS.map((c) => <div key={c.t} className="inner-card"><h3>{c.t}</h3><p>{c.d}</p></div>)}
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Partner Types</p>
          <h2 className="inner-h2">Who joins the Nexus network.</h2>
          <div className="inner-grid-3">
            {TYPES.map((t) => (
              <div key={t.t} className="inner-card">
                <div style={{ fontSize: 28, marginBottom: 12 }}>{t.icon}</div>
                <h3>{t.t}</h3>
                <p>{t.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">How Nexus Works</p>
          <h2 className="inner-h2">How Opsirix Nexus works.</h2>
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14 }}>
            {STEPS.map((s, i) => (
              <div key={i} className="inner-card" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div className="num-badge" style={{ flexShrink: 0 }}>{i + 1}</div>
                <p style={{ margin: 0 }}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Scope Boundary</p>
          <h2 className="inner-h2">Clear scope — what Opsirix does not provide.</h2>
          <p className="inner-lead">Opsirix does not provide legal advice, immigration advice, tax advice, accounting services, or any licensed professional services. Partners provide the professional advice. Opsirix provides the operational coordination layer. This boundary is maintained in every founder engagement.</p>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Apply</p>
          <h2 className="inner-h2">Apply to join the Nexus network.</h2>

          <div style={{ maxWidth: 640, marginTop: 32 }} className="contact-card">
            {submitted ? (
              <div className="contact-success">
                <div className="contact-check">✅</div>
                <h3>Application received</h3>
                <p>We'll review and respond within 2 business days.</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="contact-form">
                <div className="contact-field">
                  <label className="contact-label">Full Name*</label>
                  <input className="contact-input" required maxLength={100} placeholder="Full name" />
                </div>
                <div className="contact-field">
                  <label className="contact-label">Organization Name*</label>
                  <input className="contact-input" required maxLength={150} placeholder="Firm or organization" />
                </div>
                <div className="contact-field">
                  <label className="contact-label">Professional Type*</label>
                  <select className="contact-input" required defaultValue="">
                    <option value="" disabled>Select…</option>
                    <option>Attorney</option>
                    <option>Immigration Attorney</option>
                    <option>CPA</option>
                    <option>Bookkeeper</option>
                    <option>Insurance Broker</option>
                    <option>Banker</option>
                    <option>Technology Partner</option>
                    <option>University Partner</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="contact-field">
                  <label className="contact-label">Email Address*</label>
                  <input type="email" className="contact-input" required maxLength={255} placeholder="you@firm.com" />
                </div>
                <div className="contact-field">
                  <label className="contact-label">Phone</label>
                  <input type="tel" className="contact-input" maxLength={30} placeholder="+1 555 555 5555" />
                </div>
                <div className="contact-field">
                  <label className="contact-label">Why you want to partner with Opsirix*</label>
                  <textarea className="contact-input" required maxLength={1000} style={{ minHeight: 120 }} placeholder="Tell us about your practice and why this network is a fit." />
                </div>
                <button type="submit" className="contact-submit">Submit Partner Application</button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap" style={{ textAlign: "center" }}>
          <h2 className="inner-h2">Ready to join the Nexus network?</h2>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
            <a href="/contact?type=partner" className="btn-primary">Become a Nexus Partner →</a>
          </div>
        </div>
      </section>
    </div>
  );
}
