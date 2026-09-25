import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { NEXUS_BOUNDARY, NEXUS_CATEGORY_COPY, NEXUS_NETWORK_NOTE } from "@/lib/nexus-discovery";

export function NexusDiscoverySection({ categories }: { categories: string[] }) {
  const open = categories.filter((id) => NEXUS_CATEGORY_COPY[id]);
  return (
    <section className="nx-home" aria-labelledby="nx-home-title">
      <div className="nx-wrap">
        <p className="nexus-kicker">OPSIRIX NEXUS</p>
        <h2 id="nx-home-title">Find the right professional support.</h2>
        <p className="nx-intro">Opsirix Nexus helps individuals and businesses request a human-reviewed introduction to an independent professional or participating organization. You do not need to purchase another Opsirix service to ask for help.</p>
        {open.length > 0 && <>
          <h3 className="nx-label">Available through Nexus now</h3>
          <ul className="nx-categories">
            {open.map((id) => <li key={id}><h4>{NEXUS_CATEGORY_COPY[id].title}</h4><p>{NEXUS_CATEGORY_COPY[id].body}</p></li>)}
          </ul>
        </>}
        <p className="nx-note">{NEXUS_NETWORK_NOTE}</p>
        <div className="nx-process">
          <h3>How an introduction works</h3>
          <p>Tell us what kind of help you need. Opsirix reviews the request and, when appropriate, asks for your specific consent before sharing your identity or contact details with a potential partner. The partner works independently under their own engagement terms.</p>
          <p className="nx-boundary">{NEXUS_BOUNDARY}</p>
        </div>
        <div className="nx-actions">
          <Link to="/nexus/help" className="nx-btn nx-btn--primary">Find help through Nexus <ArrowRight size={16} /></Link>
          <Link to="/directory" className="nx-btn">Browse with a free account</Link>
        </div>
      </div>
    </section>
  );
}
