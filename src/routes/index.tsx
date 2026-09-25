import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/sections/HeroSection";
import { FounderChaosSection } from "@/components/sections/FounderChaosSection";
import { OpsirixLayerSection } from "@/components/sections/OpsirixLayerSection";
import { BeforeAfterSection } from "@/components/sections/BeforeAfterSection";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { ComplianceBoundary } from "@/components/sections/ComplianceBoundary";
import { ImmigrantFounderSection } from "@/components/sections/ImmigrantFounderSection";
import { NexusDiscoverySection } from "@/components/sections/NexusDiscoverySection";
import { getOpenNexusCategories } from "@/lib/nexus.functions";
import { getPublishedContent } from "@/lib/content.functions";
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
          "Opsirix organizes documents, workflows, and partner coordination for founders and business owners, with dedicated support for immigrant founders.",
      },
      { property: "og:title", content: "Opsirix - Founder Operations Platform for Startups" },
      {
        property: "og:description",
        content:
          "Opsirix organizes documents, workflows, and partner coordination for founders and business owners, with dedicated support for immigrant founders.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://opsirix.com/" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix.com/" }],
  }),
  loader: async () => {
    const [categories, content] = await Promise.all([getOpenNexusCategories(), getPublishedContent({ data: { keys: ["home.nexus"] } })]);
    return { categories, content };
  },
  errorComponent: () => <main><p>Please refresh the page.</p></main>,
  notFoundComponent: () => <main><p>Page not found.</p></main>,
  component: Index,
});

function Index() {
  const { categories, content } = Route.useLoaderData();
  return (
    <main style={{ backgroundColor: "var(--bg-primary)" }}>
      <HeroSection />
      <FounderChaosSection />
      <OpsirixLayerSection />
      <BeforeAfterSection />
      <ServicesGrid />
      <ComplianceBoundary />
      <ImmigrantFounderSection />
      <NexusDiscoverySection categories={categories} content={content["home.nexus"]} />
      <FounderJourneyTimeline />
      <OpsirixOSPreview />
      <StatsBar />
      <FAQSection />
      <FinalCTA />
    </main>
  );
}



