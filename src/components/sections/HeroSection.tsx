import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { MeshOrchestrationVisual } from "@/components/ui/MeshOrchestrationVisual";

const NOISE_SVG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>\")";

const ease = [0.4, 0, 0.2, 1] as const;

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "100svh", backgroundColor: "#071B33" }}
    >
      {/* Layer 2: top radial */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(0,87,217,0.14) 0%, transparent 65%)",
        }}
      />
      {/* Layer 3: fade to next section */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent 70%, #0A0D12 100%)",
        }}
      />
      {/* Layer 4: grid */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(47,128,237,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(47,128,237,0.045) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 90%)",
        }}
      />
      {/* Layer 5: glow orb 1 */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,87,217,0.14) 0%, transparent 65%)",
          top: -200,
          right: -150,
          animation: "glowPulse 7s ease-in-out infinite",
        }}
      />
      {/* Layer 6: glow orb 2 */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(102,199,244,0.1) 0%, transparent 65%)",
          bottom: -100,
          left: -80,
          animation: "glowPulse 9s ease-in-out infinite reverse",
        }}
      />
      {/* Layer 7: noise */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: NOISE_SVG, opacity: 0.1, mixBlendMode: "overlay" }}
      />

      {/* Main content */}
      <div
        className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mx-auto px-6"
        style={{ maxWidth: 1080, minHeight: "100svh", paddingTop: 120, paddingBottom: 80 }}
      >
        {/* LEFT */}
        <div>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-6"
            style={{
              background: "rgba(102,199,244,0.08)",
              border: "1px solid rgba(102,199,244,0.2)",
              borderRadius: 100,
              padding: "6px 16px",
              width: "fit-content",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#66C7F4",
                animation: "pulse 2s infinite",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "#66C7F4",
                letterSpacing: "0.14em",
              }}
            >
              Founder Operations Platform
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            style={{
              fontFamily: "var(--font-sora)",
              fontWeight: 900,
              fontSize: "clamp(42px, 7vw, 78px)",
              color: "#fff",
              letterSpacing: "-0.035em",
              lineHeight: 1.03,
              margin: "0 0 20px",
            }}
          >
            <span style={{ display: "block" }}>The Operational</span>
            <span
              style={{
                display: "block",
                backgroundImage:
                  "linear-gradient(135deg, #2F80ED 0%, #66C7F4 50%, #2F80ED 100%)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
                animation: "shimmer 6s ease-in-out infinite",
              }}
            >
              Backbone
            </span>
            <span style={{ display: "block" }}>for Founders.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 400,
              fontSize: "clamp(15px, 1.8vw, 19px)",
              color: "rgba(255,255,255,0.62)",
              lineHeight: 1.75,
              maxWidth: 500,
              margin: "0 0 36px",
            }}
          >
            Opsirix gives founders one organized place to manage documents, workflows, partner
            communication, and operating decisions. Build with structure from day one.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.34 }}
            className="flex items-center gap-3 flex-wrap"
            style={{ marginBottom: 40 }}
          >
            <Link to="/contact" className="btn btn-primary btn-lg">
              Book a Discovery Call →
            </Link>
            <Link
              to="/how-it-works"
              className="btn btn-secondary btn-lg"
              style={{ borderColor: "rgba(255,255,255,0.18)" }}
            >
              See How Opsirix Works
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center flex-wrap"
            style={{ gap: 28 }}
          >
            {[
              "Compliance-first architecture",
              "Not a law firm or visa advisor",
              "Immigrant founder ready",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2">
                <CheckCircle2 size={17} color="#66C7F4" strokeWidth={2} />
                <span
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontWeight: 400,
                    fontSize: 12.5,
                    color: "rgba(255,255,255,0.48)",
                  }}
                >
                  {t}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT */}
        <div className="hidden md:flex items-center justify-center hero-mesh-wrap">
          <MeshOrchestrationVisual />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
