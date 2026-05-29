import { createFileRoute, Link } from "@tanstack/react-router";
import { ModulePageLayout } from "@/components/platform/ModulePageLayout";

export const Route = createFileRoute("/platform/vault")({
  head: () => ({
    meta: [
      { title: "Opsirix Vault | Founder Document Organization System" },
      {
        name: "description",
        content:
          "Organize company documents, formation records, and partner handoff packets in one structured document vault for early-stage founders.",
      },
      { property: "og:title", content: "Opsirix Vault | Founder Document Organization System" },
      {
        property: "og:description",
        content:
          "Organize company documents, formation records, and partner handoff packets in one structured document vault for early-stage founders.",
      },
      { property: "og:url", content: "https://opsirix.com/platform/vault" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix.com/platform/vault" }],
  }),
  component: VaultPage,
});

const CATEGORIES = [
  {
    t: "Company Formation",
    d: "Articles of incorporation, operating agreement, founder agreements, EIN letter, state registration. The documents that prove your company exists and is properly formed.",
  },
  {
    t: "Financial and Banking",
    d: "Business bank account records, bookkeeping setup documents, tax identification records, and financial statements when available.",
  },
  {
    t: "Attorney Correspondence",
    d: "Engagement letters, professional correspondence, and legal documents held by the founder. Opsirix organizes access. Attorneys provide the legal review.",
  },
  {
    t: "Compliance Records",
    d: "Compliance calendar events, important notices, renewal documents, and filing confirmations. Opsirix tracks these operationally, not legally.",
  },
  {
    t: "Partner Handoff Packets",
    d: "Before an attorney or CPA engagement, relevant documents are organized into a packet for their review. Prepared by Opsirix, reviewed by the licensed professional.",
  },
  {
    t: "Vendor and Insurance",
    d: "Software subscriptions, service agreements, vendor contracts, and insurance certificates organized in one place.",
  },
];

const AUDIENCE = [
  "Founders who can't find their formation documents when a bank or attorney asks",
  "Immigrant founders with visa-related correspondence that must stay organized",
  "Companies preparing for investor due diligence or banking review",
  "Founders who have had attorneys ask for documents they couldn't find",
  "Startups with growing document complexity and no organization system",
];

const CAPABILITIES = [
  { t: "Status labels", d: "Document status labels: current, expiring, missing, or under review." },
  { t: "Missing document alerts", d: "Missing document alerts when expected documents are absent from a folder." },
  { t: "Partner-ready packets", d: "Partner-ready document packets organized before professional engagements." },
  { t: "Audit-readiness tracking", d: "Audit-readiness tracking as part of the monthly Grid review." },
];

const CONNECTED = [
  { icon: "🔄", name: "Opsirix Flow", to: "/platform/flow", desc: "Tasks and document handoffs tracked together." },
  { icon: "🤝", name: "Opsirix Nexus", to: "/platform/nexus", desc: "Partner packets prepared before professional introductions." },
  { icon: "📊", name: "Opsirix Grid", to: "/platform/grid", desc: "Documentation readiness scored monthly." },
] as const;

function SectionWrap({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 64 }}>
      {eyebrow && (
        <p
          style={{
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontSize: 11,
            color: "#66C7F4",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            margin: "0 0 12px",
          }}
        >
          {eyebrow}
        </p>
      )}
      <h2 className="module-section-h2">{title}</h2>
      <div style={{ marginTop: 24 }}>{children}</div>
    </div>
  );
}

function VaultPage() {
  return (
    <ModulePageLayout
      moduleName="Opsirix Vault"
      moduleTag="Document Intelligence"
      moduleIcon="🔒"
      headline="Stop losing documents across email and random folders."
      subtext="Opsirix Vault is the document organization layer of the platform. Formation papers, attorney correspondence, financial records, and operational documents: organized, labeled, and ready when you need them."
    >
      {/* Section 1 — The Problem */}
      <SectionWrap eyebrow="The Problem" title="What most founders experience.">
        <p style={{ maxWidth: 760 }}>
          Formation documents are in a Google Drive folder nobody organized. The EIN letter is in
          an old email. The operating agreement was signed somewhere. The attorney engagement
          letter might be in Downloads. When a bank, investor, or attorney asks for a document, the
          founder spends two hours finding it.
        </p>
      </SectionWrap>

      {/* Section 2 — Categories */}
      <SectionWrap eyebrow="Categories" title="What Opsirix Vault organizes.">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 18,
          }}
        >
          {CATEGORIES.map((c) => (
            <div key={c.t} className="module-feature-card">
              <h3>{c.t}</h3>
              <p>{c.d}</p>
            </div>
          ))}
        </div>
      </SectionWrap>

      {/* Section 3 — Audience */}
      <SectionWrap eyebrow="Who It's For" title="Who needs Opsirix Vault.">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {AUDIENCE.map((a) => (
            <div key={a} className="module-feature-card">
              <p style={{ fontSize: 14, color: "#94A3B8" }}>{a}</p>
            </div>
          ))}
        </div>
      </SectionWrap>

      {/* Section 4 — Capabilities */}
      <SectionWrap eyebrow="Capabilities" title="What Vault does.">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 18,
          }}
        >
          {CAPABILITIES.map((c) => (
            <div key={c.t} className="module-feature-card">
              <h3>{c.t}</h3>
              <p>{c.d}</p>
            </div>
          ))}
        </div>
      </SectionWrap>

      {/* Compliance note */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          padding: 22,
          marginTop: 24,
        }}
      >
        <p style={{ fontSize: 13.5, color: "#64748B", margin: 0, lineHeight: 1.7 }}>
          Opsirix Vault organizes documents. It does not review, interpret, or advise on the
          content of legal documents. It does not provide immigration document preparation, legal
          opinions, or tax advice. All regulated document review is handled by independently
          retained licensed professionals.
        </p>
      </div>

      {/* Connected modules */}
      <div style={{ marginTop: 80 }}>
        <h2 className="module-section-h2">Connects to.</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 18,
            marginTop: 24,
          }}
        >
          {CONNECTED.map((m) => (
            <Link
              key={m.name}
              to={m.to}
              className="module-feature-card"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                textDecoration: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span aria-hidden style={{ fontSize: 20 }}>{m.icon}</span>
                <h3 style={{ margin: 0 }}>{m.name}</h3>
              </div>
              <p>{m.desc}</p>
              <span
                style={{
                  marginTop: "auto",
                  color: "#66C7F4",
                  fontWeight: 600,
                  fontSize: 13.5,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </ModulePageLayout>
  );
}
