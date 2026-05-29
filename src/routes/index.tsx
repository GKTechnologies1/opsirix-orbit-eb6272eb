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
      { title: "Opsirix - Founder Operations Platform for Startups" },
      {
        name: "description",
        content:
          "Opsirix organizes documents, workflows, and partner coordination for early-stage and immigrant founders. Structure your startup operations from day one.",
      },
      { property: "og:title", content: "Opsirix - Founder Operations Platform for Startups" },
      {
        property: "og:description",
        content:
          "Opsirix organizes documents, workflows, and partner coordination for early-stage and immigrant founders. Structure your startup operations from day one.",
      },
      { property: "og:url", content: "https://opsirix.com/" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix.com/" }],
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



