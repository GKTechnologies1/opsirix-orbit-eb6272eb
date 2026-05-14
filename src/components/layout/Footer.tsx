import { Link } from "@tanstack/react-router";
import { Linkedin } from "lucide-react";
import { OpsirixLogo, OpsirixWordmark } from "./OpsirixLogo";

type FooterLink = { label: string; to?: string; href?: string; soon?: boolean };

const PLATFORM_LINKS: FooterLink[] = [
  { label: "Opsirix OS", to: "/platform/os", soon: true },
  { label: "Opsirix Launch", to: "/platform/launch" },
  { label: "Opsirix Flow", to: "/platform/flow" },
  { label: "Opsirix Vault", to: "/platform/vault" },
  { label: "Opsirix Nexus", to: "/platform/nexus" },
  { label: "Opsirix Grid", to: "/platform/grid" },
  { label: "Opsirix AI", to: "/platform/ai", soon: true },
  { label: "Opsirix Core", to: "/platform/core" },
  { label: "Opsirix Studio", to: "/platform/studio" },
];

const FOUNDER_LINKS: FooterLink[] = [
  { label: "F-1 Founders", to: "/immigrant-founders" },
  { label: "OPT Founders", to: "/immigrant-founders" },
  { label: "H-1B Professionals", to: "/immigrant-founders" },
  { label: "International Founders", to: "/immigrant-founders" },
  { label: "Early-Stage Founders", to: "/early-stage-founders" },
  { label: "Founder Journey", to: "/how-it-works" },
  { label: "Book Discovery Call", to: "/contact" },
];

const COMPANY_LINKS: FooterLink[] = [
  { label: "Partners", to: "/for-partners" },
  { label: "Universities", to: "/for-universities" },
  { label: "About", to: "/about" },
  { label: "Blog", soon: true },
  { label: "FAQ", to: "/faq" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
  { label: "Contact", to: "/contact" },
];

const linkStyle: React.CSSProperties = {
  fontFamily: "var(--font-inter)",
  fontSize: 13.5,
  color: "rgba(255,255,255,0.5)",
  display: "block",
  marginBottom: 10,
  textDecoration: "none",
  transition: "color 180ms",
};

function FooterLinkEl({ link }: { link: FooterLink }) {
  const onEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.color = "rgba(255,255,255,0.88)";
    e.currentTarget.style.textDecoration = "underline";
    e.currentTarget.style.textUnderlineOffset = "2px";
  };
  const onLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.color = "rgba(255,255,255,0.5)";
    e.currentTarget.style.textDecoration = "none";
  };
  const content = (
    <>
      {link.label}
      {link.soon && (
        <span
          style={{
            marginLeft: 8,
            backgroundColor: "rgba(245,158,11,0.15)",
            color: "#F59E0B",
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: 9,
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Soon
        </span>
      )}
    </>
  );

  if (link.to) {
    return (
      <Link to={link.to} style={linkStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>
        {content}
      </Link>
    );
  }
  if (link.href) {
    return (
      <a href={link.href} style={linkStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>
        {content}
      </a>
    );
  }
  return <span style={{ ...linkStyle, cursor: "default" }}>{content}</span>;
}

function ColumnHeader({ children }: { children: React.ReactNode }) {
  return (
    <h4
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        fontWeight: 700,
        color: "rgba(255,255,255,0.4)",
        letterSpacing: "0.16em",
        marginBottom: 20,
        textTransform: "uppercase",
      }}
    >
      {children}
    </h4>
  );
}

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#071B33",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "72px 0 40px",
      }}
    >
      <div className="opsirix-container-wide">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr_1fr] grid-cols-1">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center" style={{ gap: 10 }}>
              <OpsirixLogo size={40} />
              <OpsirixWordmark fontSize={20} />
            </Link>
            <p
              style={{
                marginTop: 20,
                fontSize: 13,
                color: "rgba(255,255,255,0.42)",
                maxWidth: 260,
                lineHeight: 1.7,
                fontFamily: "var(--font-inter)",
              }}
            >
              The Founder Infrastructure Platform. Workflow orchestration, document intelligence,
              partner coordination, and operational readiness for founders building properly from Day 1.
            </p>
            <div className="flex items-center gap-4" style={{ marginTop: 24 }}>
              <a
                href="https://www.linkedin.com/company/opsirix/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                style={{ color: "rgba(255,255,255,0.45)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <ColumnHeader>Platform</ColumnHeader>
            {PLATFORM_LINKS.map((l) => (
              <FooterLinkEl key={l.label} link={l} />
            ))}
          </div>

          {/* Founders */}
          <div>
            <ColumnHeader>Founders</ColumnHeader>
            {FOUNDER_LINKS.map((l) => (
              <FooterLinkEl key={l.label} link={l} />
            ))}
          </div>

          {/* Company */}
          <div>
            <ColumnHeader>Company</ColumnHeader>
            {COMPANY_LINKS.map((l) => (
              <FooterLinkEl key={l.label} link={l} />
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: 48,
            marginBottom: 24,
            height: 1,
            backgroundColor: "rgba(255,255,255,0.06)",
          }}
        />

        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 flex-wrap text-center md:text-left items-center">
          <p
            style={{
              fontSize: 11.5,
              color: "rgba(255,255,255,0.22)",
              lineHeight: 1.7,
              maxWidth: 700,
              fontFamily: "var(--font-inter)",
              margin: 0,
            }}
          >
            Legal Notice: Opsirix is a Founder Infrastructure & Operations Platform. Opsirix is NOT a
            law firm, immigration consultancy, CPA firm, or licensed professional services
            organization of any kind. Nothing on this website constitutes legal, immigration, tax, or
            professional advice. All regulated matters are handled by independently retained licensed
            professionals. Opsirix coordinates access to those professionals. It does not replace them.
          </p>
          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.2)",
              fontFamily: "var(--font-inter)",
              margin: 0,
              flexShrink: 0,
            }}
          >
            © 2026 Opsirix
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
