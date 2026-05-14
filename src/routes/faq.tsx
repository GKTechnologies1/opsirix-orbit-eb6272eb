import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/faq")({
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen pt-32 px-6 text-white opsirix-container">
      <h1 className="text-4xl font-bold mb-4">Faq</h1>
      <p className="text-white/60">Coming soon.</p>
    </div>
  );
}
