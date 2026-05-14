import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { OpsirixLogo, OpsirixWordmark } from "./OpsirixLogo";

const NAV_LINKS: { label: string; to: string }[] = [
  { label: "How It Works", to: "/how-it-works" },
  { label: "Services", to: "/services" },
  { label: "Immigrant Founders", to: "/immigrant-founders" },
  { label: "Partners", to: "/for-partners" },
  { label: "Universities", to: "/for-universities" },
  { label: "FAQ", to: "/faq" },
];

const ANNOUNCEMENT_KEY = "opsirix-announcement-dismissed";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = sessionStorage.getItem(ANNOUNCEMENT_KEY);
    if (!dismissed) setShowAnnouncement(true);

    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const dismissAnnouncement = () => {
    setShowAnnouncement(false);
    sessionStorage.setItem(ANNOUNCEMENT_KEY, "1");
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[100]"
        style={{
          transition: "background 0.3s, box-shadow 0.3s",
          backgroundColor: scrolled ? "rgba(13,15,20,0.97)" : "rgba(13,15,20,0.90)",
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          boxShadow: scrolled ? "0 2px 24px rgba(7,27,51,0.18)" : "none",
        }}
      >
        <AnimatePresence>
          {showAnnouncement && (
            <motion.div
              initial={{ y: -36 }}
              animate={{ y: 0 }}
              exit={{ y: -36 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{
                height: 36,
                backgroundColor: "#0057D9",
                padding: "0 24px",
              }}
              className="flex items-center justify-center relative"
            >
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "#fff",
                  letterSpacing: "0.08em",
                  margin: 0,
                  textAlign: "center",
                }}
              >
                🚀 Opsirix is now accepting early-stage founders. Book a discovery call →
              </p>
              <button
                onClick={dismissAnnouncement}
                aria-label="Dismiss announcement"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ y: -68, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="flex items-center justify-between"
          style={{ height: 68, padding: "0 24px", maxWidth: 1240, margin: "0 auto" }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.85 }}
          >
            <Link to="/" className="flex items-center" style={{ gap: 10 }}>
              <OpsirixLogo size={34} />
              <OpsirixWordmark fontSize={18} />
            </Link>
          </motion.div>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link, idx) => {
              const active = pathname === link.to;
              return (
                <motion.div
                  key={link.to}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.9 + idx * 0.05 }}
                >
                  <Link
                    to={link.to}
                    className="rounded-lg transition-colors"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: 13.5,
                      fontWeight: 500,
                      padding: "7px 13px",
                      color: active ? "#2F80ED" : "#94A3B8",
                      backgroundColor: active ? "rgba(0,87,217,0.1)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (active) return;
                      (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                      (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(255,255,255,0.07)";
                    }}
                    onMouseLeave={(e) => {
                      if (active) return;
                      (e.currentTarget as HTMLAnchorElement).style.color = "#94A3B8";
                      (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
                    }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <motion.div
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.25 }}
            className="hidden md:flex items-center gap-3"
          >
            <Link
              to="/contact"
              className="btn btn-primary"
              style={{ padding: "8px 20px", fontSize: 13.5 }}
            >
              Book Discovery Call →
            </Link>
          </motion.div>

          <button
            className="md:hidden p-2 text-white"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} />
          </button>
        </motion.div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ y: -300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 left-0 right-0 z-[99] md:hidden"
            style={{ backgroundColor: "#071B33", minHeight: "100vh" }}
          >
            <div
              className="flex items-center justify-between"
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Link to="/" className="flex items-center" style={{ gap: 10 }} onClick={() => setMobileOpen(false)}>
                <OpsirixLogo size={34} />
                <OpsirixWordmark fontSize={18} />
              </Link>
              <button
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="p-2 text-white"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="block"
                  style={{
                    padding: "16px 24px",
                    fontSize: 16,
                    fontFamily: "var(--font-inter)",
                    fontWeight: 500,
                    color: "#fff",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div style={{ padding: "24px" }}>
              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="btn btn-primary w-full justify-center"
                style={{ display: "flex" }}
              >
                Book Discovery Call →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
