import { createFileRoute } from "@tanstack/react-router";
import { ContactForm } from "@/components/sections/ContactForm";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Book a Discovery Call | Opsirix Founder Operations" },
      {
        name: "description",
        content:
          "Schedule your free 30-minute Opsirix Discovery Call. Complete the founder intake form and we will recommend the right Opsirix path within one business day.",
      },
      { property: "og:title", content: "Book a Discovery Call | Opsirix Founder Operations" },
      {
        property: "og:description",
        content:
          "Schedule your free 30-minute Opsirix Discovery Call. Complete the founder intake form and we will recommend the right Opsirix path within one business day.",
      },
      { property: "og:url", content: "https://opsirix.com/contact" },
    ],
    links: [{ rel: "canonical", href: "https://opsirix.com/contact" }],
  }),
  component: ContactPage,
});

const INFO_ROWS = [
  { icon: "🕐", label: "RESPONSE TIME", value: "Within 1 business day of submission" },
  { icon: "📞", label: "DISCOVERY CALL", value: "30-minute call to understand your needs and recommend the right Opsirix path." },
  { icon: "🔒", label: "CONFIDENTIAL", value: "Strictly confidential per Opsirix Privacy Policy" },
];

function ContactPage() {
  return (
    <main className="contact-page">
      <div className="contact-grid">
        <div className="contact-left">
          <span className="label-pill">Get Started</span>
          <h1 className="contact-h1">Book your Discovery Call.</h1>
          <p className="contact-lead">
            Tell us about your situation. We'll review your intake and schedule your 30-minute Discovery Call within 1 business day.
          </p>

          {INFO_ROWS.map((row) => (
            <div key={row.label} className="contact-info-row">
              <div className="contact-info-icon">{row.icon}</div>
              <div>
                <div className="contact-info-label">{row.label}</div>
                <div className="contact-info-value">{row.value}</div>
              </div>
            </div>
          ))}

          <div className="contact-legal">
            ⚠️ Note: Completing this form does not create a platform agreement or initiate services. Opsirix is not a law firm, immigration consultancy, or CPA firm. Nothing submitted constitutes legal, immigration, or tax advice.
          </div>
        </div>

        <ContactForm />
      </div>
    </main>
  );
}
