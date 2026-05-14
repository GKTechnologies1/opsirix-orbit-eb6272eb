import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

type Stat = { value: number; prefix?: string; suffix?: string; label: string };

const STATS: Stat[] = [
  { value: 55, suffix: "%", label: "of U.S. billion-dollar startups had at least one immigrant founder" },
  { value: 35, suffix: "+", label: "operational documents built and compliance-ready in the Opsirix library" },
  { value: 6, label: "stages from intake to institutional-grade operational infrastructure" },
  { value: 0, prefix: "$", label: "founder infrastructure platforms existed for this market — before Opsirix" },
];

export function StatsBar() {
  return (
    <section className="stats-section">
      <div className="stats-row">
        {STATS.map((s, i) => (
          <div key={i} className="stats-item">
            <AnimatedCounter
              value={s.value}
              prefix={s.prefix}
              suffix={s.suffix}
              className="stats-num"
            />
            <div className="stats-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default StatsBar;
