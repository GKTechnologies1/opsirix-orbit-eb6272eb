import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/for-universities")({
  head: () => ({
    meta: [
      { title: "University Partnerships | Opsirix Founder Operations Programs" },
      { name: "description", content: "Opsirix partners with universities, entrepreneurship centers, and international student offices. Operational workshops, founder readiness programs, and campus resources." },
      { property: "og:title", content: "University Partnerships | Opsirix Founder Operations Programs" },
      { property: "og:description", content: "Opsirix partners with universities, entrepreneurship centers, and international student offices. Operational workshops, founder readiness programs, and campus resources." },
      { property: "og:url", content: "https://opsirix-orbit.lovable.app/for-universities" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix-orbit.lovable.app/for-universities" }],
  }),
  component: Page,
});

const AUDIENCE = [
  { t: "University Entrepreneurship Centers", d: "Programs supporting student and alumni founders building real ventures." },
  { t: "International Student Offices", d: "Offices supporting international students navigating documentation and operational complexity." },
  { t: "Career and Professional Development Centers", d: "Teams preparing students for entrepreneurial career paths." },
  { t: "Campus Incubators and Accelerators", d: "Cohort programs that need an operational layer for participating founders." },
  { t: "Student Startup Programs", d: "Curricular and extracurricular programs focused on student venture creation." },
  { t: "Faculty and Staff Supporting Founders", d: "Educators and advisors working directly with student founders." },
];

const OFFERINGS = [
  { t: "Founder Readiness Workshops", d: "Practical sessions on startup documentation, workflow setup, and professional coordination for student founders. No legal advice. Operational foundations only." },
  { t: "Student Founder Documentation Checklists", d: "Custom checklists for student founders organizing their first startup: what to document, when to do it, and who needs to be involved." },
  { t: "Operational Awareness Sessions", d: "Educational sessions helping student founders understand the difference between legal advice, tax advice, and operational coordination, and why it matters." },
  { t: "Campus Partner Program", d: "Universities that partner with Opsirix gain access to branded founder resources, workshop materials, and a referral channel for their student founders." },
];

function Page() {
  return (
    <div className="inner-page">
      <PageHeader
        pageName="For Universities"
        label="For Universities & Programs"
        title="Founder operations support for university entrepreneurship programs."
        subtitle="Opsirix partners with universities, entrepreneurship centers, and international student offices to provide founder-focused operational resources. No immigration advice. Pure operational education."
      />

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Audience</p>
          <h2 className="inner-h2">Who this is for.</h2>
          <div className="inner-grid-3">
            {AUDIENCE.map((c) => <div key={c.t} className="inner-card"><h3>{c.t}</h3><p>{c.d}</p></div>)}
          </div>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Offerings</p>
          <h2 className="inner-h2">What Opsirix offers universities.</h2>
          <div className="inner-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginTop: 28 }}>
            {OFFERINGS.map((c) => <div key={c.t} className="inner-card"><h3>{c.t}</h3><p>{c.d}</p></div>)}
          </div>
        </div>
      </section>

      <section className="inner-section">
        <div className="inner-wrap">
          <p className="inner-eyebrow">Scope Boundary</p>
          <h2 className="inner-h2">Important: What Opsirix does not provide.</h2>
          <p className="inner-lead">Opsirix does not provide immigration advice, visa guidance, legal advice, or immigration consulting services of any kind. University partnerships are limited to operational education and coordination resources. All immigration, legal, and compliance matters are referred to independently retained licensed professionals.</p>
        </div>
      </section>

      <section className="inner-section alt">
        <div className="inner-wrap" style={{ textAlign: "center" }}>
          <h2 className="inner-h2">Interested in a university partnership?</h2>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
            <a href="/contact?type=university" className="btn-primary">Request a University Partnership Call</a>
          </div>
        </div>
      </section>
    </div>
  );
}
