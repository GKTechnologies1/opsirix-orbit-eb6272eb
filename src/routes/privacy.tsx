import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { CTASection } from "@/components/shared/CTASection";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Opsirix" },
      { name: "description", content: "Opsirix privacy policy." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <>
      <PageHeader label="Legal" title="Privacy Policy" subtitle="How Opsirix handles your information." breadcrumb="Privacy" />
      <section style={{ padding: "96px 0", backgroundColor: "#fff" }}>
        <div className="opsirix-container" style={{ maxWidth: 760 }}>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 15, color: "#475569", lineHeight: 1.8 }}>
            This is a placeholder privacy policy. The full policy will be published shortly. For any privacy
            questions in the meantime, please contact us via the Contact page.
          </p>
        </div>
      </section>
      <CTASection />
    </>
  );
}
