import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { NEXUS_ACCOUNT_DATA_NOTICE } from "@/lib/nexus-discovery";

const TITLE = "Nexus Member Directory | Opsirix";
const DESC = "Create a free Opsirix account to browse approved Nexus profiles. No purchase, founder intake, or company workspace required.";

export const Route = createFileRoute("/directory")({
  head: () => ({ meta: [
    { title: TITLE },
    { name: "description", content: DESC },
    { property: "og:title", content: TITLE },
    { property: "og:description", content: DESC },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: DirectoryIntro,
});

function DirectoryIntro() {
  return (
    <main className="nx-page">
      <div className="nx-wrap nx-narrow">
        <p className="nexus-kicker">Nexus directory</p>
        <h1>Browse approved Nexus profiles with a free account.</h1>
        <p className="nx-intro">A free account lets you browse and filter approved Nexus profiles. It does not enroll you in another Opsirix service or create a company workspace.</p>
        <section className="nx-panel"><h2>What we collect for a free account</h2><p>{NEXUS_ACCOUNT_DATA_NOTICE}</p></section>
        <div className="nx-actions">
          <Link to="/auth" search={{ next: "/nexus/directory", purpose: "directory" }} className="nx-btn nx-btn--primary">Create a free account or sign in <ArrowRight size={16} /></Link>
          <Link to="/nexus/help" className="nx-btn">Ask for help without an account</Link>
        </div>
      </div>
    </main>
  );
}
