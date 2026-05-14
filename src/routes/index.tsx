import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/sections/HeroSection";
import { FounderChaosSection } from "@/components/sections/FounderChaosSection";
import { OpsirixLayerSection } from "@/components/sections/OpsirixLayerSection";
import { BeforeAfterSection } from "@/components/sections/BeforeAfterSection";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { ComplianceBoundary } from "@/components/sections/ComplianceBoundary";
import { ImmigrantFounderSection } from "@/components/sections/ImmigrantFounderSection";
import { PartnerEcosystem } from "@/components/sections/PartnerEcosystem";
import { FounderJourneyTimeline } from "@/components/sections/FounderJourneyTimeline";
import { OpsirixOSPreview } from "@/components/sections/OpsirixOSPreview";
import { StatsBar } from "@/components/sections/StatsBar";
import { FAQSection } from "@/components/sections/FAQSection";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Opsirix — The Operational Backbone for Founders" },
      {
        name: "description",
        content:
          "Opsirix is the Founder Operations OS. Workflow orchestration, document intelligence, and partner coordination for early-stage, immigrant, and technical founders.",
      },
      { property: "og:title", content: "Opsirix — The Operational Backbone for Founders" },
      {
        property: "og:description",
        content:
          "Turn founder chaos into structured execution. Workflow orchestration, document intelligence, and partner coordination for founders.",
      },
      { property: "og:url", content: "https://opsirix-orbit.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix-orbit.lovable.app/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <main style={{ backgroundColor: "var(--bg-primary)" }}>
      <HeroSection />
      <FounderChaosSection />
      <OpsirixLayerSection />
      <BeforeAfterSection />
      <ServicesGrid />
      <ComplianceBoundary />
      <ImmigrantFounderSection />
      <PartnerEcosystem />
      <FounderJourneyTimeline />
      <OpsirixOSPreview />
      <StatsBar />
      <FAQSection />
      <FinalCTA />
    </main>
  );
}



