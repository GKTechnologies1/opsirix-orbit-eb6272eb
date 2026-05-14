import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/sections/HeroSection";
import { FounderChaosSection } from "@/components/sections/FounderChaosSection";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main style={{ backgroundColor: "var(--bg-primary)" }}>
      <HeroSection />
      <FounderChaosSection />
    </main>
  );
}

