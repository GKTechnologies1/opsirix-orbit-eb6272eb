import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

type Card = {
  emoji: string;
  title: string;
  body: string;
  bar: string;
};

const CARDS: Card[] = [
  {
    emoji: "📂",
    title: "Document Disorder",
    body:
      "Visa documents, formation papers, and contractor agreements scattered across email threads, personal drives, and memory. Impossible to find when asked.",
    bar: "linear-gradient(90deg, #EF4444, #F97316)",
  },
  {
    emoji: "🔀",
    title: "Missed Handoffs",
    body:
      "Attorney, CPA, payroll, and HR all operate in silos. Nobody coordinates the space between them. Critical tasks fall through the gaps between professionals.",
    bar: "linear-gradient(90deg, #F97316, #F59E0B)",
  },
  {
    emoji: "😰",
    title: "Compliance Anxiety",
    body:
      "“Am I doing this right?” That question costs founders hours every week. Decision paralysis, delayed hiring, slower building — from operational uncertainty.",
    bar: "linear-gradient(90deg, #8B5CF6, #EC4899)",
  },
  {
    emoji: "🕳️",
    title: "No Single Source of Truth",
    body:
      "12 tools. 3 professionals. 5 spreadsheets. Nobody knows the current state of operations. Investors ask. Founders scramble.",
    bar: "linear-gradient(90deg, #EF4444, #8B5CF6)",
  },
  {
    emoji: "🔄",
    title: "Reactive Execution",
    body:
      "No monthly review. No readiness score. No operational calendar. Every month starts from zero because nothing was tracked or systematized.",
    bar: "linear-gradient(90deg, #F59E0B, #10B981)",
  },
  {
    emoji: "💸",
    title: "Advisor Confusion",
    body:
      "Attorney and CPA don't talk to each other. Neither talks to operations. Nobody sees the complete picture. Expensive, slow, and dangerous for founders.",
    bar: "linear-gradient(90deg, #EC4899, #F97316)",
  },
];

type Stat = {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
};

const STATS: Stat[] = [
  { value: 72, suffix: "%", label: "of startup CEOs report burnout — operational overload is the #1 driver" },
  { value: 12, suffix: "+", label: "disconnected tools the average founder juggles with no coordination layer" },
  { value: 6, suffix: " mo", label: "average time founders waste on avoidable operational chaos annually" },
  { value: 0, prefix: "$", label: "platforms built for founder operational orchestration — until now" },
];

function ChaosCard({ card, index }: { card: Card; index: number }) {
  return (
    <ScrollReveal delay={index * 0.08}>
      <article className="founder-chaos-card group">
        <div className="founder-chaos-card-bar" style={{ background: card.bar }} />
        <span style={{ display: "block", fontSize: 30, marginBottom: 16 }}>{card.emoji}</span>
        <h4
          style={{
            fontFamily: "var(--font-sora)",
            fontWeight: 700,
            fontSize: 16,
            color: "#071B33",
            margin: "0 0 8px",
            letterSpacing: "-0.01em",
          }}
        >
          {card.title}
        </h4>
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontWeight: 400,
            fontSize: 13.5,
            color: "#64748B",
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          {card.body}
        </p>
      </article>
    </ScrollReveal>
  );
}

export function FounderChaosSection() {
  return (
    <section
      style={{
        backgroundColor: "#F3F8FF",
        padding: "var(--section-py) 0",
        position: "relative",
      }}
    >
      <div className="opsirix-container">
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto" }}>
          <ScrollReveal>
            <span
              className="label-pill"
              style={{
                display: "inline-flex",
                marginBottom: 18,
                background: "rgba(0,87,217,0.08)",
              }}
            >
              The Problem
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <h2
              style={{
                fontFamily: "var(--font-sora)",
                fontWeight: 800,
                fontSize: "clamp(28px, 3.8vw, 46px)",
                color: "#071B33",
                lineHeight: 1.12,
                letterSpacing: "-0.025em",
                margin: 0,
              }}
            >
              Founders don't fail from lack of ambition.
              <br />
              They get slowed down by{" "}
              <span
                style={{
                  backgroundImage: "linear-gradient(135deg, #EF4444, #F97316)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }}
              >
                operational chaos
              </span>
              .
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 16,
                color: "#64748B",
                lineHeight: 1.7,
                marginTop: 16,
              }}
            >
              Every week, brilliant founders lose time, momentum, and confidence to problems that
              have nothing to do with their product — and everything to do with broken operational
              systems.
            </p>
          </ScrollReveal>
        </div>

        {/* Cards */}
        <div className="founder-chaos-grid" style={{ marginTop: 56 }}>
          {CARDS.map((c, i) => (
            <ChaosCard key={c.title} card={c} index={i} />
          ))}
        </div>

        {/* Stat bar */}
        <ScrollReveal delay={0.1}>
          <div
            style={{
              backgroundColor: "#071B33",
              borderRadius: 20,
              padding: "32px 40px",
              marginTop: 56,
            }}
          >
            <div
              className="founder-chaos-stats"
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 32,
              }}
            >
              {STATS.map((s) => (
                <div key={s.label} style={{ textAlign: "center", flex: "1 1 160px" }}>
                  <AnimatedCounter
                    value={s.value}
                    prefix={s.prefix}
                    suffix={s.suffix}
                    style={{
                      fontFamily: "var(--font-sora)",
                      fontWeight: 900,
                      fontSize: "clamp(36px, 4.5vw, 52px)",
                      color: "#fff",
                      lineHeight: 1,
                      letterSpacing: "-0.03em",
                      display: "block",
                    }}
                  />
                  <p
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: 13,
                      color: "rgba(255,255,255,0.45)",
                      marginTop: 10,
                      maxWidth: 140,
                      marginLeft: "auto",
                      marginRight: "auto",
                      lineHeight: 1.5,
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default FounderChaosSection;
