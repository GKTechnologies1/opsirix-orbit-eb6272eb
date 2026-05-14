import { Link } from "@tanstack/react-router";
import { MODULES, type ModuleEntry } from "@/lib/modules";

type Props = {
  currentSlug: string;
  count?: number;
};

export function RelatedModules({ currentSlug, count = 3 }: Props) {
  // Stable rotation: pick the next `count` modules after the current one.
  const idx = MODULES.findIndex((m) => m.slug === currentSlug);
  const ordered = idx === -1 ? MODULES : [...MODULES.slice(idx + 1), ...MODULES.slice(0, idx)];
  const related: ModuleEntry[] = ordered.filter((m) => m.slug !== currentSlug).slice(0, count);

  return (
    <section className="inner-section alt">
      <div className="inner-wrap">
        <p className="inner-eyebrow">Related Modules</p>
        <h2 className="inner-h2">Explore what this connects to.</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 18,
            marginTop: 32,
          }}
        >
          {related.map((m) => (
            <Link
              key={m.slug}
              to={m.to}
              className="inner-card"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  aria-hidden
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "rgba(0,87,217,0.1)",
                    color: "#0057D9",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  {m.slug.slice(0, 2)}
                </span>
                <h3 style={{ margin: 0 }}>{m.name}</h3>
                {m.soon && (
                  <span
                    style={{
                      marginLeft: "auto",
                      backgroundColor: "rgba(245,158,11,0.15)",
                      color: "#92400E",
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: 9,
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Soon
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 14 }}>{m.short}</p>
              <span style={{ marginTop: "auto", color: "#0057D9", fontWeight: 600, fontSize: 14 }}>
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RelatedModules;
