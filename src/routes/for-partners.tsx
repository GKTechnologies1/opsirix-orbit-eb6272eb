import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CTASection } from "@/components/shared/CTASection";

export const Route = createFileRoute("/for-partners")({
  head: () => ({
    meta: [
      { title: "Partner With Opsirix | Nexus Partner Network" },
      { name: "description", content: "Join the Opsirix Nexus partner network — receive warm referrals from organized, audit-ready founders. Built for attorneys, CPAs, banks, insurers, universities, and technology partners." },
      { property: "og:title", content: "Partner With Opsirix | Nexus Partner Network" },
      { property: "og:description", content: "Join the Opsirix Nexus partner network." },
      { property: "og:url", content: "https://opsirix-orbit.lovable.app/for-partners" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix-orbit.lovable.app/for-partners" }],
  }),
  component: Page,
});

const TYPES = [
  { t: "Immigration Attorneys", d: "Receive warm intros to founders whose documentation is already organized in Opsirix Vault." },
  { t: "CPA Firms", d: "Engage founders whose books and operational records are coordinated through monthly Grid reviews." },
  { t: "Banks & Fintech", d: "Connect with founders who arrive with clean formation documents and an organized treasury operation." },
  { t: "Insurance Brokers", d: "Founders pre-organized for underwriting — formation, headcount, contracts, all in one place." },
  { t: "Universities & Programs", d: "Provide alumni and student founders with operational infrastructure that complements your programming." },
  { t: "Technology Partners", d: "Integrate with the Vault and Dashboard to deliver tools where founders already operate." },
];

function Page() {
  const [submitted, setSubmitted] = useState(false);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // === CRM INTEGRATION POINT ===
    // Route to HubSpot pipeline: "Nexus Partner Applications"
    setSubmitted(true);
  };

  return (
    <div className="inner-page">
      <PageHeader pageName="For Partners" label="Nexus Partner Network" title="Join the Opsirix Nexus partner network." subtitle="Receive warm referrals from organized, audit-ready founders who are ready to work with you." />

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Why Partners Work With Opsirix</p>
          <h2 className="inner-h2">Warm referrals. Organized clients. Clear scope.</h2>
          <div className="inner-grid-3">
            {[
              { t: "Warm referrals", d: "Founders are introduced to you with context, not as cold inquiries. They already understand your scope and yours alone." },
              { t: "Organized clients", d: "Every referred founder arrives with documents, formation records, and operational history already structured in Opsirix Vault." },
              { t: "Clear scope", d: "Opsirix handles administrative coordination. You provide licensed professional advice. The boundary is documented and enforced." },
            ].map((c) => <div key={c.t} className="inner-card"><h3>{c.t}</h3><p>{c.d}</p></div>)}
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">What Nexus Partners Receive</p>
          <h2 className="inner-h2">Everything you need to onboard a referred founder fast.</h2>
          <ul className="inner-list">
            <li>Warm introduction with founder context, company stage, and the specific reason for the referral.</li>
            <li>Document-ready clients — formation, EIN, banking, and operational records already organized.</li>
            <li>Coordination logistics handled — scheduling, document delivery, follow-through, and recurring touchpoints.</li>
            <li>A clear engagement boundary — you engage the founder under your own engagement letter, on your own terms.</li>
            <li>Visibility into operational milestones via the Opsirix Founder Status Report.</li>
          </ul>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Partner Types</p>
          <h2 className="inner-h2">Built for the professional team your founders depend on.</h2>
          <div className="inner-grid-3">
            {TYPES.map((t) => <div key={t.t} className="inner-card"><h3>{t.t}</h3><p>{t.d}</p></div>)}
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Apply</p>
          <h2 className="inner-h2">Partner Application</h2>
          <p className="inner-lead">Tell us about your firm. We'll respond within 2 business days.</p>

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
                  <label className="contact-label">Your Name*</label>
                  <input className="contact-input" required placeholder="Full name" />
                </div>
                <div className="contact-field">
                  <label className="contact-label">Organization*</label>
                  <input className="contact-input" required placeholder="Firm or organization" />
                </div>
                <div className="contact-field">
                  <label className="contact-label">Partner Type*</label>
                  <select className="contact-input" required defaultValue="">
                    <option value="" disabled>Select…</option>
                    <option>Immigration attorney</option>
                    <option>CPA / accounting firm</option>
                    <option>Bank / fintech</option>
                    <option>Insurance broker</option>
                    <option>University / program</option>
                    <option>Technology partner</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="contact-field">
                  <label className="contact-label">Why you want to partner*</label>
                  <textarea className="contact-input" required style={{ minHeight: 100 }} placeholder="Tell us about your practice and why this network is a fit." />
                </div>
                <button type="submit" className="contact-submit">Submit Application →</button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Agreement Overview</p>
          <h2 className="inner-h2">Nexus Partner Agreement — the four key principles.</h2>
          <ul className="inner-list">
            <li><strong>Independence.</strong> Every partner serves the founder under their own engagement letter. Opsirix never controls the substance of professional advice.</li>
            <li><strong>Coordination only.</strong> Opsirix handles administrative logistics — scheduling, document delivery, follow-through. No referral fees on regulated work.</li>
            <li><strong>Confidentiality.</strong> Founder information is handled per the Opsirix Privacy Policy and the partner's own confidentiality obligations.</li>
            <li><strong>Quality bar.</strong> Partners maintain responsiveness, professionalism, and the boundary that Opsirix is not a law firm, CPA firm, or licensed professional services organization.</li>
          </ul>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
