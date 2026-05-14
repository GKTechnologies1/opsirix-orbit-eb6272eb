import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { CTASection } from "@/components/shared/CTASection";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | Opsirix" },
      { name: "description", content: "Opsirix terms of service." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <>
      <PageHeader label="Legal" title="Terms of Service" subtitle="The terms governing use of Opsirix." pageName="Terms" />
      <section style={{ padding: "96px 0", backgroundColor: "#fff" }}>
        <div className="opsirix-container" style={{ maxWidth: 760 }}>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 15, color: "#475569", lineHeight: 1.8 }}>
            This is a placeholder terms of service. The full terms will be published shortly. For any
            questions in the meantime, please contact us via the Contact page.
          </p>
        </div>
      </section>
      <CTASection />
    </>
  );
}
