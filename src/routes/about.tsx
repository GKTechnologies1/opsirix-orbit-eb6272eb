import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { CTASection } from "@/components/shared/CTASection";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Opsirix | Founder Infrastructure Platform" },
      {
        name: "description",
        content:
          "Opsirix is a founder operations platform that helps startups organize documents, workflows, and professional coordination. Built for serious founders from day one.",
      },
      { property: "og:title", content: "About Opsirix | Founder Infrastructure Platform" },
      {
        property: "og:description",
        content: "Opsirix is a founder operations platform that helps startups organize documents, workflows, and professional coordination. Built for serious founders from day one.",
      },
      { property: "og:url", content: "https://opsirix.com/about" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix.com/about" }],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="inner-page">
      <PageHeader
        pageName="About"
        label="About Opsirix"
        title="About Opsirix."
        subtitle="Opsirix is a Founder Infrastructure & Operations Platform, built to run the coordination layer between founders and licensed professionals."
      />
      <section className="inner-section">
        <div className="inner-wrap" style={{ maxWidth: 760 }}>
          <p className="inner-eyebrow">Our Mission</p>
          <h2 className="inner-h2">Coordination, not advice.</h2>
          <p className="inner-lead">
            Founders don't fail from bad ideas. They fail from operational chaos, scattered documents, disconnected
            professionals, no monthly rhythm. Opsirix runs the operational layer: organizing the Vault, running the
            weekly Flow, coordinating Nexus partners, and scoring readiness with the monthly Grid.
          </p>
          <p className="inner-lead">
            Every regulated question routes to an independently retained licensed professional through Opsirix Nexus.
            Opsirix is not a law firm, immigration consultancy, or CPA firm, and that boundary is structural, not
            cosmetic.
          </p>
        </div>
      </section>
      <CTASection />
    </div>
  );
}
