import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { CTASection } from "@/components/shared/CTASection";

export const Route = createFileRoute("/for-universities")({
  head: () => ({
    meta: [
      { title: "University Partnerships | Opsirix Founder Operations Programs" },
      {
        name: "description",
        content:
          "Opsirix partners with universities, entrepreneurship centers, and international student offices. Operational workshops, founder readiness programs, and campus resources.",
      },
      { property: "og:title", content: "University Partnerships | Opsirix Founder Operations Programs" },
      {
        property: "og:description",
        content: "Opsirix partners with universities, entrepreneurship centers, and international student offices. Operational workshops, founder readiness programs, and campus resources.",
      },
      { property: "og:url", content: "https://opsirix-orbit.lovable.app/for-universities" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix-orbit.lovable.app/for-universities" }],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="inner-page">
      <PageHeader
        pageName="For Universities"
        label="For Universities & Programs"
        title="Founder operations support for university entrepreneurship programs."
        subtitle="Give your alumni and student founders the operational backbone that complements your programming."
      />
      <section className="inner-section">
        <div className="inner-wrap" style={{ maxWidth: 760 }}>
          <p className="inner-eyebrow">Partnership</p>
          <h2 className="inner-h2">Programming meets operations.</h2>
          <p className="inner-lead">
            University entrepreneurship programs teach and connect. Opsirix runs the operational layer — Vault, Flow,
            Nexus coordination, and monthly Grid reviews — so the founders coming out of your program have a real
            operational backbone, not just a slide deck and a Slack workspace.
          </p>
        </div>
      </section>
      <CTASection />
    </div>
  );
}
