import { createFileRoute, redirect } from "@tanstack/react-router";

// Old URL kept working: permanently redirects to the immigrant-founder section of the canonical /founders page.
export const Route = createFileRoute("/immigrant-founders")({
  beforeLoad: () => {
    throw redirect({ to: "/founders", hash: "immigrant-founders", statusCode: 301 });
  },
});
