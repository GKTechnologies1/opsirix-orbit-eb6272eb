interface Props {
  size?: number;
}

export function OpsirixLogo({ size = 34 }: Props) {
  const nodes: [number, number][] = [
    [17, 6], [26.5, 11.5], [26.5, 22.5],
    [17, 28], [7.5, 22.5], [7.5, 11.5],
  ];
  const cross: [[number, number], [number, number]][] = [
    [[17, 6], [26.5, 22.5]],
    [[26.5, 11.5], [7.5, 22.5]],
    [[17, 28], [7.5, 11.5]],
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="17" cy="17" r="15.5" stroke="#0057D9" strokeWidth="1.5" fill="none" />
      {cross.map(([a, b], i) => (
        <line key={`c${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="rgba(47,128,237,0.25)" strokeWidth="0.8" />
      ))}
      {nodes.map(([x, y], i) => (
        <line key={`l${i}`} x1="17" y1="17" x2={x} y2={y} stroke="#0057D9" strokeWidth="1" opacity="0.55" />
      ))}
      <circle cx="17" cy="17" r="5" fill="#0057D9" />
      {nodes.map(([x, y], i) => (
        <circle key={`n${i}`} cx={x} cy={y} r="2.8" fill="#2F80ED" />
      ))}
    </svg>
  );
}

export function OpsirixWordmark({ fontSize = 18 }: { fontSize?: number }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-sora)",
        fontWeight: 800,
        fontSize,
        color: "#fff",
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}
    >
      OPSIRI<span style={{ color: "#2F80ED" }}>X</span>
    </span>
  );
}
