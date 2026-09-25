import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ModulePageLayout } from "@/components/platform/ModulePageLayout";
import { getOpenNexusCategories } from "@/lib/nexus.functions";
import { NEXUS_BOUNDARY, NEXUS_CATEGORY_COPY, NEXUS_NETWORK_NOTE } from "@/lib/nexus-discovery";

const TITLE = "Opsirix Nexus | Human-Reviewed Professional Introductions";
const DESC = "Explain a nonconfidential need and request a human-reviewed introduction to an independent professional. Nothing is shared without your specific consent.";

export const Route = createFileRoute("/platform/nexus")({
  loader: () => getOpenNexusCategories(),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://opsirix.com/platform/nexus" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix.com/platform/nexus" }],
  }),
  errorComponent: () => <main className="nx-page"><div className="nx-wrap"><h1>Nexus is temporarily unavailable.</h1><p>Please try again shortly.</p></div></main>,
  notFoundComponent: () => <main className="nx-page"><div className="nx-wrap"><h1>Page not found.</h1></div></main>,
  component: NexusPage,
});

const REASONS = [
  "A contract or company legal question",
  "Accounting, tax, or bookkeeping support",
  "Custom software or IT work",
  "Finding an approved program or financial or insurance relationship when those Nexus categories are open",
];

function NexusPage() {
  const categories = Route.useLoaderData().filter((id) => NEXUS_CATEGORY_COPY[id]);
  return (
    <ModulePageLayout
      moduleName="Opsirix Nexus"
      moduleTag="Professional Introductions"
      moduleIcon=""
      headline="A human-reviewed path to professional help."
      subtext="Nexus helps individuals and businesses explain a nonconfidential need and request an introduction. Opsirix reviews each request. We do not automatically send your information to a partner."
      relatedSlug="nexus"
    >
      {categories.length > 0 && <div style={{ marginBottom: 64 }}>
        <p className="module-eyebrow">Available through Nexus now</p>
        <h2 className="module-section-h2">Categories you can ask about today.</h2>
        <div className="module-card-grid">
          {categories.map((id) => <div key={id} className="module-feature-card"><h3>{NEXUS_CATEGORY_COPY[id].title}</h3><p>{NEXUS_CATEGORY_COPY[id].body}</p></div>)}
        </div>
        <p className="nx-note">{NEXUS_NETWORK_NOTE}</p>
      </div>}
      <div className="module-two-col" style={{ marginBottom: 64 }}>
        <div><p className="module-eyebrow">Common reasons</p><h2 className="module-section-h2">Reasons people ask for help</h2><ul className="nx-list">{REASONS.map((r) => <li key={r}><p style={{ margin: 0 }}>{r}</p></li>)}</ul></div>
        <div><p className="module-eyebrow">How it works</p><h2 className="module-section-h2">Reviewed before anything is shared</h2><p>Opsirix reviews the request, checks that the category is available, and identifies an eligible approved partner. We record your specific consent before disclosing your identity or contact details. You can decline and nothing is shared.</p></div>
      </div>
      <p className="nx-boundary">{NEXUS_BOUNDARY}</p>
      <div className="module-cta-row" style={{ marginTop: 32 }}>
        <Link to="/nexus/help" className="module-btn-primary">Tell us what kind of help you need <ArrowRight size={15} /></Link>
        <Link to="/directory" className="module-btn-secondary">Create a free account to browse</Link>
      </div>
    </ModulePageLayout>
  );
}
