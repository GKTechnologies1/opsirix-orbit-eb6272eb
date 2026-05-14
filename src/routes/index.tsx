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

export const Route = createFileRoute("/")({
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
    </main>
  );
}



