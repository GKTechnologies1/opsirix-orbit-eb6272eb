import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { ContentBody } from "@/lib/content.functions";
import { NEXUS_BOUNDARY, NEXUS_CATEGORY_COPY, NEXUS_NETWORK_NOTE } from "@/lib/nexus-discovery";

export function NexusDiscoverySection({ categories, content }: { categories: string[]; content?: ContentBody }) {
  const open = categories.filter((id) => NEXUS_CATEGORY_COPY[id]);
  return (
    <section className="partner-section" aria-labelledby="nx-home-title">
      <div className="partner-container">
        <div className="partner-header">
          <ScrollReveal><span className="partner-label">Opsirix Nexus</span></ScrollReveal>
          <ScrollReveal delay={0.05}><h2 id="nx-home-title" className="partner-h2">{content?.heading ?? "Find the right professional support."}</h2></ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="partner-sub">{content?.body ?? "Opsirix Nexus helps individuals and businesses request a human-reviewed introduction to an independent professional or participating organization. You do not need to purchase another Opsirix service to ask for help."}</p>
          </ScrollReveal>
        </div>

        {open.length > 0 && <>
          <h3 className="nx-label">Available through Nexus now</h3>
          <div className="partner-grid">
            {open.map((id, i) => (
              <ScrollReveal key={id} delay={0.05 + i * 0.06}>
                <div className="partner-card">
                  <h4 className="partner-card-title">{NEXUS_CATEGORY_COPY[id].title}</h4>
                  <p className="partner-card-body">{NEXUS_CATEGORY_COPY[id].body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </>}
        <p className="nx-note">{NEXUS_NETWORK_NOTE}</p>

        <ScrollReveal delay={0.1}>
          <div className="partner-banner">
            <div>
              <div className="partner-banner-label">HOW AN INTRODUCTION WORKS</div>
              <p className="partner-banner-body">Tell us what kind of help you need. Opsirix reviews the request and, when appropriate, asks for your specific consent before sharing your identity or contact details with a potential partner. The partner works independently under their own engagement terms.</p>
              <p className="nx-boundary">{NEXUS_BOUNDARY}</p>
            </div>
            <div className="nx-banner-actions">
              {content?.cta_href && content.cta_href !== "/nexus/help" ? <a href={content.cta_href} className="partner-banner-cta">{content.cta_label} <ArrowRight size={16} /></a> : <Link to="/nexus/help" className="partner-banner-cta">{content?.cta_label || "Find help through Nexus"} <ArrowRight size={16} /></Link>}
              <Link to="/directory" className="partner-link">Browse with a free account <ArrowRight size={14} /></Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
