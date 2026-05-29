import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Opsirix" },
      { name: "description", content: "How Opsirix collects, uses, and protects information from founders, partners, and visitors." },
      { property: "og:title", content: "Privacy Policy | Opsirix" },
      { property: "og:description", content: "How Opsirix collects, uses, and protects information from founders, partners, and visitors." },
      { property: "og:url", content: "https://opsirix.com/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix.com/privacy" }],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="inner-page">
      <PageHeader pageName="Privacy" label="Legal" title="Privacy Policy" subtitle="Last updated: January 2026" />

      <section className="inner-section">
        <div className="inner-wrap" style={{ maxWidth: 760 }}>
          <h2 className="inner-h2">1. What information we collect</h2>
          <p className="inner-lead">When you contact us or complete an intake form, we collect information you provide directly: your name, email address, phone number, organization, and any details you share about your operational situation. We may also collect basic technical information (IP address, browser type) when you visit the site.</p>

          <h2 className="inner-h2" style={{ marginTop: 48 }}>2. How we use your information</h2>
          <p className="inner-lead">We use the information you provide to respond to your inquiries, schedule discovery calls, deliver the operational coordination services you request, coordinate introductions with partners in the Opsirix Nexus network, and improve our platform.</p>

          <h2 className="inner-h2" style={{ marginTop: 48 }}>3. Information sharing</h2>
          <p className="inner-lead">We do not sell your information. We share information only with service providers who help us operate the platform (e.g., hosting, email delivery), with partners in the Nexus network when you request a referral, or where required by law.</p>

          <h2 className="inner-h2" style={{ marginTop: 48 }}>4. Data security</h2>
          <p className="inner-lead">We use industry-standard practices to protect your information, including encryption in transit, access controls, and regular review of our security posture. No method of transmission over the internet is 100% secure, but we work to safeguard your data appropriately.</p>

          <h2 className="inner-h2" style={{ marginTop: 48 }}>5. Contact</h2>
          <p className="inner-lead">Questions about this policy? Email <a href="mailto:contact@opsirix.com" style={{ color: "#2F80ED" }}>contact@opsirix.com</a> or visit our <a href="/contact" style={{ color: "#2F80ED" }}>contact page</a>.</p>
        </div>
      </section>
    </div>
  );
}
