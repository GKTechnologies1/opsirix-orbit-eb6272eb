import { motion } from "framer-motion";

const CIRC = 2 * Math.PI * 28; // ~175.93
const SCORE = 42;
const MAX = 50;
const offset = CIRC * (1 - SCORE / MAX);

type Module = {
  name: string;
  status: string;
  dot: string;
  pct: number;
  from: string;
  to: string;
};

const MODULES: Module[] = [
  { name: "VAULT STATUS", status: "Current", dot: "#10B981", pct: 92, from: "#10B981", to: "#34D399" },
  { name: "FLOW BOARD", status: "3 Active", dot: "#2F80ED", pct: 68, from: "#0057D9", to: "#2F80ED" },
  { name: "NEXUS STATUS", status: "Coordinated", dot: "#2DD4BF", pct: 95, from: "#0D9E8F", to: "#2DD4BF" },
  { name: "COMPLIANCE", status: "1 Upcoming", dot: "#F59E0B", pct: 80, from: "#F59E0B", to: "#FCD34D" },
];

const ACTIVITY = [
  { text: "Vault: EIN letter filed and verified", dot: "#10B981", blink: false },
  { text: "Nexus: Attorney intro scheduled for Thursday", dot: "#2F80ED", blink: false },
  { text: "Grid review due in 12 days", dot: "#F59E0B", blink: true },
];

export function DashboardMockup() {
  return (
    <motion.div
      className="dash-card"
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="dash-titlebar">
        <span className="dash-dot" style={{ background: "#EF4444" }} />
        <span className="dash-dot" style={{ background: "#F59E0B" }} />
        <span className="dash-dot" style={{ background: "#10B981" }} />
        <span className="dash-url">opsirix.com / dashboard</span>
      </div>

      <div className="dash-body">
        <div className="dash-score-row">
          <div className="dash-ring-wrap">
            <svg width="64" height="64" viewBox="0 0 64 64">
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0057D9" />
                  <stop offset="100%" stopColor="#66C7F4" />
                </linearGradient>
              </defs>
              <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                initial={{ strokeDashoffset: CIRC }}
                whileInView={{ strokeDashoffset: offset }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                transform="rotate(-90 32 32)"
              />
            </svg>
            <span className="dash-ring-num">{SCORE}</span>
          </div>
          <div className="dash-score-text">
            <div className="dash-score-label">OPSIRIX GRID SCORE</div>
            <div className="dash-score-value">42 / 50 · STRONG</div>
            <div className="dash-score-delta">↑ +7 points this quarter</div>
            <div className="dash-score-sub">5 dimensions scored · Next review in 12 days</div>
          </div>
        </div>

        <div className="dash-modules">
          {MODULES.map((m) => (
            <div key={m.name} className="dash-module">
              <div className="dash-module-name">{m.name}</div>
              <div className="dash-module-status">
                <span className="dash-pulse-dot" style={{ background: m.dot }} />
                <span className="dash-module-text">{m.status}</span>
              </div>
              <div className="dash-bar">
                <motion.div
                  className="dash-bar-fill"
                  style={{ background: `linear-gradient(90deg, ${m.from}, ${m.to})` }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${m.pct}%` }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 1.1, ease: "easeOut", delay: 0.4 }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="dash-activity-label">RECENT ACTIVITY</div>
        <div className="dash-activity">
          {ACTIVITY.map((a, i) => (
            <div key={i} className="dash-activity-item">
              <span className="dash-activity-dot" style={{ background: a.dot }} />
              <span className="dash-activity-text">
                {a.text}
                {a.blink && <span className="dash-cursor">▍</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default DashboardMockup;
