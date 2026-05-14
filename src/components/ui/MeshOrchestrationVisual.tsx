import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const RADIUS = 42; // % from center

type Node = {
  angle: number;
  emoji: string;
  label: string;
  description: string;
  delay: number;
};

const NODES: Node[] = [
  { angle: 90, emoji: "📋", label: "Workflows", description: "Structured execution flows for every founder milestone.", delay: 0 },
  { angle: 135, emoji: "⚖️", label: "Attorney", description: "Coordinated access to immigration & corporate counsel.", delay: 0.5 },
  { angle: 180, emoji: "📊", label: "CPA", description: "Tax, bookkeeping & filings routed to vetted CPAs.", delay: 1.0 },
  { angle: 225, emoji: "💳", label: "Banking", description: "Founder-ready banking & treasury onboarding.", delay: 1.5 },
  { angle: 270, emoji: "📁", label: "Documents", description: "Versioned document vault with intelligent indexing.", delay: 2.0 },
  { angle: 315, emoji: "💼", label: "Payroll", description: "Compliant payroll across founders, employees & contractors.", delay: 2.5 },
  { angle: 0, emoji: "🔒", label: "Compliance", description: "Compliance-first architecture across every workstream.", delay: 3.0 },
  { angle: 45, emoji: "💡", label: "Execution", description: "Operational readiness from idea to incorporation.", delay: 3.5 },
];

function polar(angleDeg: number, r = RADIUS) {
  const a = (angleDeg * Math.PI) / 180;
  return {
    left: 50 + r * Math.cos(a),
    top: 50 - r * Math.sin(a),
  };
}

export function MeshOrchestrationVisual() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="relative w-full mx-auto"
      style={{ aspectRatio: "1 / 1", maxWidth: 480 }}
    >
      {/* SVG connection layer */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        {/* Octagon ring */}
        <polygon
          points={NODES.map((n) => {
            const p = polar(n.angle);
            return `${p.left},${p.top}`;
          }).join(" ")}
          fill="none"
          stroke="rgba(0,87,217,0.12)"
          strokeWidth="0.4"
          strokeDasharray="2 3"
          style={{ animation: "dash 18s linear infinite" }}
        />

        {/* Diagonal cross lines (alternate nodes) */}
        {[
          [0, 4],
          [2, 6],
          [1, 5],
        ].map(([a, b], i) => {
          const pa = polar(NODES[a].angle);
          const pb = polar(NODES[b].angle);
          return (
            <line
              key={`cross-${i}`}
              x1={pa.left}
              y1={pa.top}
              x2={pb.left}
              y2={pb.top}
              stroke="rgba(47,128,237,0.08)"
              strokeWidth="0.3"
            />
          );
        })}

        {/* Spokes from center to each node */}
        {NODES.map((n, i) => {
          const p = polar(n.angle);
          const isHovered = hovered === i;
          const dimmed = hovered !== null && !isHovered;
          const dur = 2 + (i % 4) * 0.4;
          return (
            <line
              key={`spoke-${i}`}
              x1="50"
              y1="50"
              x2={p.left}
              y2={p.top}
              stroke={isHovered ? "rgba(102,199,244,0.6)" : "rgba(102,199,244,0.18)"}
              strokeWidth={isHovered ? "0.6" : "0.4"}
              strokeDasharray="3 2"
              style={{
                opacity: dimmed ? 0.4 : 1,
                transition: "opacity 280ms, stroke 280ms",
                animation: `dash ${dur}s linear infinite`,
              }}
            />
          );
        })}
      </svg>

      {/* Center node + rings */}
      <div
        className="absolute z-10"
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      >
        {/* Outer rings */}
        <div
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 86,
            height: 86,
            borderRadius: "50%",
            border: "1px solid rgba(0,87,217,0.2)",
            animation: "ringExpand 3s ease-out infinite",
          }}
        />
        <div
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 86,
            height: 86,
            borderRadius: "50%",
            border: "1px solid rgba(0,87,217,0.1)",
            animation: "ringExpand 3s ease-out 0.5s infinite",
          }}
        />

        <motion.div
          animate={{ scale: hovered !== null ? 1.08 : 1 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          style={{
            width: 86,
            height: 86,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #0057D9, #2F80ED)",
            boxShadow: "var(--shadow-glow)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            position: "relative",
          }}
        >
          🏗️
        </motion.div>
      </div>

      {/* Orbital nodes */}
      {NODES.map((n, i) => {
        const p = polar(n.angle);
        const isHovered = hovered === i;
        return (
          <div
            key={n.label}
            className="absolute"
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              transform: "translate(-50%, -50%)",
              animation: `floatY 4s ease-in-out ${n.delay}s infinite`,
            }}
          >
            <div
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="flex flex-col items-center"
              style={{ cursor: "default" }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  background: isHovered ? "rgba(0,87,217,0.4)" : "rgba(255,255,255,0.07)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  border: `1px solid ${isHovered ? "rgba(102,199,244,0.55)" : "rgba(102,199,244,0.22)"}`,
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  transform: isHovered ? "scale(1.12)" : "scale(1)",
                  transition: "all 280ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {n.emoji}
              </div>
              <div
                className="mesh-node-label"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.55)",
                  marginTop: 8,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.05em",
                }}
              >
                {n.label}
              </div>

              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute"
                    style={{
                      top: "calc(100% + 14px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#111827",
                      border: "1px solid rgba(0,87,217,0.3)",
                      borderRadius: 10,
                      padding: 12,
                      boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
                      maxWidth: 160,
                      width: 160,
                      zIndex: 30,
                      pointerEvents: "none",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        lineHeight: 1.45,
                        color: "rgba(255,255,255,0.78)",
                        fontFamily: "var(--font-inter)",
                      }}
                    >
                      {n.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

export default MeshOrchestrationVisual;
