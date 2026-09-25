import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ModulePageLayout } from "@/components/platform/ModulePageLayout";
import { getOpenNexusCategories } from "@/lib/nexus.functions";
import { NEXUS_CATEGORY_COPY, nexusNetworkNote } from "@/lib/nexus-discovery";

const TITLE = "Opsirix Nexus | Professional Partner Coordination Network";
const DESC = "The right professional, at the right time, with the right information. Request a human-reviewed introduction to an independent attorney, CPA, software/IT firm, university program, banking partner, or insurance broker. Nothing is shared without your specific consent.";

export const Route = createFileRoute("/platform/nexus")({
  loader: () => getOpenNexusCategories(),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://opsirix.com/platform/nexus" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix.com/platform/nexus" }],
  }),
  errorComponent: () => <main className="nx-page"><div className="nx-wrap"><h1>Nexus is temporarily unavailable.</h1><p>Please try again shortly.</p></div></main>,
  notFoundComponent: () => <main className="nx-page"><div className="nx-wrap"><h1>Page not found.</h1></div></main>,
  component: NexusPage,
});

const FOUNDER_FEATURES = [
  { t: "Professional introductions", d: "You describe what you need. An Opsirix team member reviews the request and looks for an approved partner in an open category. There is no automatic matching." },
  { t: "Preparing for the first conversation", d: "Opsirix helps you understand what the professional is likely to ask about, so you can arrive with the right context. You keep your own documents and decide what to share." },
  { t: "Help without onboarding", d: "You can ask for help without buying another Opsirix service, completing founder intake, or creating a company workspace." },
  { t: "Your consent comes first", d: "Your name and contact details are shared with a partner only after you give specific consent to that introduction." },
];

const PARTNER_FEATURES = [
  { t: "Reviewed introductions", d: "Requests are reviewed by Opsirix before any introduction is proposed, and a person's details reach you only with their recorded consent." },
  { t: "Clear scope from day one", d: "Every Nexus introduction clarifies that Opsirix handles coordination. The professional handles licensed advice under their own engagement terms." },
  { t: "Reviewed before listing", d: "Partner applications, credentials, and profiles are reviewed by Opsirix. Profiles appear in the member directory only after approval." },
];

const HOW = [
  { t: "1. Tell us what you need", d: "Share your contact details, the kind of help, your location where it matters, and a short, nonconfidential description. No attachments." },
  { t: "2. Opsirix reviews it", d: "A person on our team reads the request. We do not promise a match, a response time, eligibility, or an outcome." },
  { t: "3. You decide", d: "If an introduction makes sense, we ask for your specific consent first. You can decline and nothing is shared." },
];


function NexusPage() {
  const categories = Route.useLoaderData().filter((id) => NEXUS_CATEGORY_COPY[id]);
  return (
    <ModulePageLayout
      moduleName="Opsirix Nexus"
      moduleTag="Partner Network"
      moduleIcon=""
      headline="The right professional, at the right time, with the right information."
      subtext="Opsirix Nexus coordinates the relationship between people who need help and independent licensed professional partners. Every request is reviewed by a person, and nothing about you is shared without your specific consent."
      relatedSlug="nexus"
    >
      <section style={{ marginBottom: 64 }}>
        <p className="module-eyebrow">The problem</p>
        <h2 className="module-section-h2">Why founder-professional relationships often start badly.</h2>
        <p>Founders reach out to attorneys or CPAs without context. Meetings happen without the right information. Follow-up gets lost in email. The result: slower progress, higher cost, and a founder who does not know what to do between professional conversations.</p>
      </section>

      <section style={{ marginBottom: 64 }}>
        <p className="module-eyebrow">What Nexus does</p>
        <h2 className="module-section-h2">What Opsirix Nexus coordinates.</h2>
        <div className="module-two-col">
          {[["For founders", FOUNDER_FEATURES], ["For partners", PARTNER_FEATURES]].map(([title, items]) => (
            <div key={title as string} className="module-feature-card">
              <h3>{title as string}</h3>
              {(items as typeof FOUNDER_FEATURES).map((f) => (
                <div key={f.t} style={{ marginTop: 16 }}><h4 style={{ margin: "0 0 4px", fontSize: 15 }}>{f.t}</h4><p style={{ margin: 0 }}>{f.d}</p></div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 64 }}>
        <p className="module-eyebrow">Partner types</p>
        <h2 className="module-section-h2">Available through Nexus now.</h2>
        {categories.length > 0 && <div className="module-card-grid">
          {categories.map((id) => <div key={id} className="module-feature-card"><h3>{NEXUS_CATEGORY_COPY[id].title}</h3><p>{NEXUS_CATEGORY_COPY[id].body}</p></div>)}
        </div>}
        {nexusNetworkNote(categories) && <p className="nx-note">{nexusNetworkNote(categories)}</p>}
        <p className="nx-note">An open category means Opsirix accepts partner applications and help requests for it. A partner appears in the member directory only after its organization, representative, category, profile and services pass review.</p>
      </section>

      <section style={{ marginBottom: 64 }}>
        <p className="module-eyebrow">How help works</p>
        <h2 className="module-section-h2">Reviewed by a person, shared only with consent.</h2>
        <div className="module-card-grid">
          {HOW.map((s) => <div key={s.t} className="module-feature-card"><h3>{s.t}</h3><p>{s.d}</p></div>)}
        </div>
        <div className="module-two-col" style={{ marginTop: 24 }}>
          <div className="module-feature-card"><h3>Free member directory</h3><p>Create a free account to browse approved partner profiles. You do not need to buy an Opsirix service, complete founder intake, or create a company workspace. We collect your name, email, and password to run the account.</p></div>
          <div className="module-feature-card"><h3>Keep it nonconfidential</h3><p>Please do not send confidential legal facts, tax documents, account numbers, passwords, or private business files in a help request.</p></div>
        </div>
      </section>

      <section style={{ marginBottom: 48 }}>
        <p className="module-eyebrow">Boundaries</p>
        <h2 className="module-section-h2">What Opsirix Nexus does not do.</h2>
        <p>Opsirix Nexus coordinates introductions and logistics. It does not provide legal advice, immigration advice, tax advice, or any regulated professional service. Every partner in the Nexus network serves clients independently under their own engagement terms. Opsirix does not supervise, direct, or participate in licensed professional work, and does not endorse or guarantee any partner.</p>
      </section>

      <section style={{ marginBottom: 48 }}>
        <p className="module-eyebrow">Connects to</p>
        <h2 className="module-section-h2">How Nexus fits with the other modules.</h2>
        <p>Nexus works on its own today. Connections to Vault (preparing documents you choose to share), Flow (scheduling and follow-up), and the OS dashboard (seeing your professional engagements in one place) are planned and are not available yet.</p>
      </section>

      <div className="module-cta-row">
        <Link to="/nexus/help" className="module-btn-primary">Tell us what kind of help you need <ArrowRight size={15} /></Link>
        <Link to="/directory" className="module-btn-secondary">Create a free account to browse</Link>
        <Link to="/for-partners" className="module-btn-secondary">Apply to join Nexus</Link>
      </div>
    </ModulePageLayout>
  );
}
