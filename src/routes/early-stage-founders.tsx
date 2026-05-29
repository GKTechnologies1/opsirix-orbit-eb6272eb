import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { CTASection } from "@/components/shared/CTASection";

export const Route = createFileRoute("/early-stage-founders")({
  head: () => ({
    meta: [
      { title: "For Early-Stage Founders | Opsirix Operations Platform" },
      {
        name: "description",
        content:
          "Opsirix gives pre-seed and seed founders the operational backbone funded companies take for granted, Vault, Flow, Nexus coordination, and a monthly Grid review.",
      },
      { property: "og:title", content: "For Early-Stage Founders | Opsirix" },
      {
        property: "og:description",
        content: "Operational infrastructure for pre-seed and seed founders.",
      },
      { property: "og:url", content: "https://opsirix.com/early-stage-founders" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix.com/early-stage-founders" }],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="inner-page">
      <PageHeader
        pageName="Early-Stage Founders"
        label="For Early-Stage Founders"
        title="Operational infrastructure from day one."
        subtitle="Pre-seed and seed founders get the same operational backbone funded companies take for granted."
      />
      <section className="inner-section">
        <div className="inner-wrap" style={{ maxWidth: 760 }}>
          <p className="inner-eyebrow">What You Get</p>
          <h2 className="inner-h2">Vault. Flow. Nexus. Grid.</h2>
          <p className="inner-lead">
            From the day you incorporate, Opsirix organizes your formation documents, runs your weekly project board,
            coordinates the administrative logistics with your independently retained attorney and CPA, and scores your
            operational readiness every month, so you stop being the human integration layer between disconnected tools
            and people.
          </p>
        </div>
      </section>
      <CTASection />
    </div>
  );
}
