import logoSrc from "@/assets/opsirix-logo.png";

interface Props {
  size?: number;
}

export function OpsirixLogo({ size = 34 }: Props) {
  return (
    <img
      src={logoSrc}
      alt="Opsirix logo"
      width={size}
      height={size}
      style={{ display: "block", objectFit: "contain" }}
    />
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
