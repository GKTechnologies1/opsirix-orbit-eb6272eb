const BADGES = [
  "55% of U.S. unicorn founders were immigrants (NFAP)",
  "35+ operational documents in the Opsirix library",
  "6 platform modules covering the full ops layer",
  "First founder operations OS built for this market",
];

export function StatsBar() {
  return (
    <section className="stats-section" style={{ padding: "56px 0" }}>
      <div
        className="opsirix-container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "center",
        }}
      >
        {BADGES.map((b) => (
          <span
            key={b}
            style={{
              backgroundColor: "rgba(0,87,217,0.08)",
              border: "1px solid rgba(0,87,217,0.18)",
              borderRadius: 9999,
              padding: "8px 16px",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "#2F80ED",
              letterSpacing: "0.02em",
              lineHeight: 1.4,
            }}
          >
            {b}
          </span>
        ))}
      </div>
    </section>
  );
}

export default StatsBar;
