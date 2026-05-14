import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh", paddingTop: 104 }}>
      <section className="opsirix-container" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <span className="label-pill">Founder Infrastructure Platform</span>
        <h1 style={{ fontFamily: "var(--font-sora)", fontWeight: 900, fontSize: "clamp(40px, 7vw, 80px)", lineHeight: 1.03, letterSpacing: "-0.035em", color: "#fff", margin: "16px 0 24px" }}>
          Build properly <span className="gradient-text">from Day 1</span>.
        </h1>
        <p className="lead" style={{ maxWidth: 640 }}>
          Workflow orchestration, document intelligence, partner coordination, and operational
          readiness for founders. Navbar and Footer are wired — sections coming next.
        </p>
      </section>
    </main>
  );
}
