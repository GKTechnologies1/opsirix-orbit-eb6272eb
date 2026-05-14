import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { DashboardMockup } from "@/components/ui/DashboardMockup";

type Feature = { emoji: string; title: string; desc: string };

const FEATURES: Feature[] = [
  { emoji: "📊", title: "Founder Dashboard", desc: "Real-time Grid score, tasks, and operational status" },
  { emoji: "🔒", title: "Document Vault", desc: "Encrypted, organized, always accessible" },
  { emoji: "🗺️", title: "Workflow Map", desc: "Visual map of all active tasks and owners" },
  { emoji: "🔗", title: "Partner Hub", desc: "Attorney, CPA, insurance, coordinated" },
  { emoji: "⭐", title: "Readiness Score", desc: "50-point Grid with investor-exportable history" },
  { emoji: "🧠", title: "AI Copilot", desc: "Proactive risk surfacing and intelligent routing" },
];

export function OpsirixOSPreview() {
  return (
    <section className="os-section">
      <div className="os-dots" aria-hidden />
      <div className="os-container">
        <div className="os-grid">
          <ScrollReveal>
            <div className="os-text">
              <div className="os-coming">
                <span className="os-pulse" />
                <span className="os-coming-label">COMING: OPSIRIX OS</span>
              </div>
              <h2 className="os-h2">The founder operating system. Everything in one place.</h2>
              <p className="os-lead">
                We are building the dashboard that gives every founder a real-time view of their
                operational health, and tells them exactly what to do next.
              </p>
              <div className="os-features">
                {FEATURES.map((f, i) => (
                  <ScrollReveal key={f.title} delay={0.05 + i * 0.04}>
                    <div className="os-feature">
                      <div className="os-feature-emoji">{f.emoji}</div>
                      <div className="os-feature-title">{f.title}</div>
                      <div className="os-feature-desc">{f.desc}</div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <div className="os-visual">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

export default OpsirixOSPreview;
