import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, ArrowRight } from "lucide-react";

type ModulePageLayoutProps = {
  moduleName: string;
  moduleTag: string;
  moduleIcon: string;
  headline: string;
  subtext: string;
  statusBadge?: string;
  /** module slug used to pick three related cards (e.g. "vault") */
  relatedSlug?: string;
  children: ReactNode;
};

export function ModulePageLayout({
  moduleName,
  moduleTag,
  moduleIcon,
  headline,
  subtext,
  statusBadge,
  relatedSlug,
  children,
}: ModulePageLayoutProps) {
  return (
    <div className="module-page">
      {/* ============ HEADER ============ */}
      <header className="module-hero">
        <div className="module-hero-grid" aria-hidden />
        <div className="module-hero-glow" aria-hidden />

        <div className="module-container">
          {/* Breadcrumb */}
          <nav className="module-crumbs" aria-label="Breadcrumb">
            <Link to="/" className="module-crumb-link">Home</Link>
            <ChevronRight size={12} aria-hidden />
            <Link to="/platform" className="module-crumb-link">Platform</Link>
            <ChevronRight size={12} aria-hidden />
            <span className="module-crumb-current">{moduleName}</span>
          </nav>

          {/* Tag pill */}
          <div className="module-tag-row">
            <span className="module-tag">
              <span aria-hidden style={{ marginRight: 6 }}>{moduleIcon}</span>
              {moduleTag}
            </span>
            {statusBadge && (
              <span className="module-status-badge">{statusBadge}</span>
            )}
          </div>

          {/* H1 */}
          <h1 className="module-h1">{headline}</h1>
          <p className="module-sub">{subtext}</p>

          {/* CTAs */}
          <div className="module-cta-row">
            <Link to="/contact" className="module-btn-primary">
              Book a Discovery Call <ArrowRight size={15} />
            </Link>
            <Link to="/platform" className="module-btn-secondary">
              See All Modules
            </Link>
          </div>
        </div>
      </header>

      {/* ============ CONTENT ============ */}
      <main className="module-content">
        <div className="module-container">{children}</div>
      </main>

      {/* ============ FINAL CTA ============ */}
      <section className="module-final-cta">
        <div className="module-container module-final-inner">
          <h2 className="module-final-h2">Ready to get organized?</h2>
          <p className="module-final-sub">
            Book a discovery call. We review your founder stage and recommend the right path.
          </p>
          <div className="module-cta-row" style={{ justifyContent: "center" }}>
            <Link to="/contact" className="module-btn-primary">
              Book a Discovery Call <ArrowRight size={15} />
            </Link>
            <Link to="/contact" className="module-btn-secondary">
              Start Founder Intake
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ModulePageLayout;
