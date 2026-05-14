import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | Opsirix" },
      { name: "description", content: "Terms governing use of the Opsirix platform and operational coordination services." },
      { property: "og:title", content: "Terms of Service | Opsirix" },
      { property: "og:description", content: "Terms governing use of the Opsirix platform and operational coordination services." },
      { property: "og:url", content: "https://opsirix-orbit.lovable.app/terms" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix-orbit.lovable.app/terms" }],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="inner-page">
      <PageHeader pageName="Terms" label="Legal" title="Terms of Service" subtitle="Last updated: January 2026" />

      <section className="inner-section">
        <div className="inner-wrap" style={{ maxWidth: 760 }}>
          <h2 className="inner-h2">1. Acceptance of Terms</h2>
          <p className="inner-lead">By accessing or using the Opsirix website or platform, you agree to be bound by these Terms of Service. If you do not agree, do not use the services.</p>

          <h2 className="inner-h2" style={{ marginTop: 48 }}>2. Not Legal or Professional Advice</h2>
          <p className="inner-lead"><strong>Opsirix is an operations coordination platform. Opsirix is NOT a law firm, immigration advisor, CPA firm, accounting firm, or licensed professional services provider of any kind.</strong> Nothing on this website or in the platform constitutes legal, immigration, tax, accounting, or other professional advice. All regulated matters are handled by independently retained licensed professionals. Opsirix coordinates access to those professionals, it does not replace them.</p>

          <h2 className="inner-h2" style={{ marginTop: 48 }}>3. Use of Services</h2>
          <p className="inner-lead">You agree to use the services only for lawful purposes and in accordance with these terms. You are responsible for the accuracy of information you provide and for maintaining the confidentiality of any account credentials.</p>

          <h2 className="inner-h2" style={{ marginTop: 48 }}>4. Limitation of Liability</h2>
          <p className="inner-lead">To the maximum extent permitted by law, Opsirix and its affiliates are not liable for any indirect, incidental, consequential, or punitive damages arising from your use of the services. Opsirix's total liability for any claim is limited to the amount you paid to Opsirix in the twelve months preceding the claim.</p>

          <h2 className="inner-h2" style={{ marginTop: 48 }}>5. Contact Information</h2>
          <p className="inner-lead">Questions about these terms? Email <a href="mailto:contact@opsirix.com" style={{ color: "#2F80ED" }}>contact@opsirix.com</a> or visit our <a href="/contact" style={{ color: "#2F80ED" }}>contact page</a>.</p>
        </div>
      </section>
    </div>
  );
}
