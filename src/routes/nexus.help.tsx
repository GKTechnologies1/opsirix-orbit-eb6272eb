import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { getOpenNexusCategories, submitNexusInquiry } from "@/lib/nexus.functions";
import { NEXUS_BOUNDARY, NEXUS_CATEGORY_COPY } from "@/lib/nexus-discovery";

const TITLE = "Tell Us What Help You Need | Opsirix Nexus";
const DESC = "Send Opsirix a brief, nonconfidential request for a human-reviewed professional introduction. No account required.";

export const Route = createFileRoute("/nexus/help")({
  loader: () => getOpenNexusCategories(),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  errorComponent: () => <main className="nx-page"><div className="nx-wrap"><h1>This form is temporarily unavailable.</h1><p>Please try again shortly.</p></div></main>,
  notFoundComponent: () => <main className="nx-page"><div className="nx-wrap"><h1>Page not found.</h1></div></main>,
  component: HelpPage,
});

type Errors = Partial<Record<"fullName" | "email" | "phone" | "category" | "description" | "acknowledged" | "contactConsent", string>>;

function HelpPage() {
  const categories = Route.useLoaderData().filter((id) => NEXUS_CATEGORY_COPY[id]);
  const submit = useServerFn(submitNexusInquiry);
  const [category, setCategory] = useState("");
  const [count, setCount] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState("");
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim();
    const next: Errors = {};
    if (v("fullName").length < 2) next.fullName = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) next.email = "Enter a valid email address.";
    if (v("phone") && v("phone").length < 6) next.phone = "Enter a valid phone number or leave it blank.";
    if (!categories.includes(v("category"))) next.category = "Choose an available category.";
    if (v("description").length < 20) next.description = "Describe the help you need in at least 20 characters.";
    if (!f.get("acknowledged")) next.acknowledged = "Please confirm this request is nonconfidential.";
    if (!f.get("contactConsent")) next.contactConsent = "Please agree so Opsirix can contact you about this request.";
    setErrors(next);
    setFailure("");
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      (e.currentTarget.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    setPending(true);
    try {
      const result = await submit({ data: { fullName: v("fullName"), email: v("email"), phone: v("phone"), category: v("category"), location: v("location"), description: v("description"), acknowledged: true, contactConsent: true, website: v("website") } });
      if (result.success) setSaved(true);
      else setFailure(result.error);
    } catch {
      setFailure("Your inquiry was not saved. Please check the form and try again.");
    } finally {
      setPending(false);
    }
  }

  if (saved) return <main className="nx-page"><div className="nx-wrap nx-narrow"><section className="nx-confirm" role="status" aria-live="polite"><CheckCircle2 aria-hidden /><h1>Inquiry received</h1><p>Your inquiry was received for review. This does not promise a match, response time, eligibility, quote, or professional outcome. We will not share your identity or contact details with a partner without your specific consent.</p><Link to="/platform/nexus">Back to Nexus</Link></section></div></main>;

  const err = (k: keyof Errors) => errors[k] ? <span className="nx-error" id={`${k}-error`}>{errors[k]}</span> : null;
  const aria = (k: keyof Errors) => ({ "aria-invalid": Boolean(errors[k]), "aria-describedby": errors[k] ? `${k}-error` : undefined });

  return (
    <main className="nx-page">
      <div className="nx-wrap nx-narrow">
        <p className="nexus-kicker">Opsirix Nexus</p>
        <h1>Tell us what kind of help you need.</h1>
        <p className="nx-intro">No account is needed. Keep this brief and nonconfidential. Opsirix reviews every request before anything else happens.</p>
        {categories.length === 0 ? <p className="nx-note">No Nexus categories are currently available.</p> :
        <form className="nx-form" onSubmit={onSubmit} noValidate>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden />
          <label>Your name<input name="fullName" autoComplete="name" maxLength={120} {...aria("fullName")} />{err("fullName")}</label>
          <label>Email address<input name="email" type="email" autoComplete="email" maxLength={255} {...aria("email")} />{err("email")}</label>
          <label>Phone number (optional)<input name="phone" type="tel" autoComplete="tel" maxLength={40} {...aria("phone")} />{err("phone")}</label>
          <label>Partner category<select name="category" value={category} onChange={(e) => setCategory(e.target.value)} {...aria("category")}><option value="">Choose a category</option>{categories.map((id) => <option key={id} value={id}>{NEXUS_CATEGORY_COPY[id].option}</option>)}</select>{err("category")}</label>
          {category && <p className="nx-reminder" role="note">{NEXUS_CATEGORY_COPY[category].reminder}</p>}
          <label>Location or jurisdiction<input name="location" maxLength={160} aria-describedby="loc-help" /><span className="nx-help" id="loc-help">City, state, province, or country, where relevant to the help you need.</span></label>
          <label>Brief nonconfidential description<textarea name="description" rows={5} maxLength={1000} onChange={(e) => setCount(e.target.value.length)} {...aria("description")} /><span className="nx-help">{count}/1,000</span>{err("description")}</label>
          <label className="nx-check"><input type="checkbox" name="acknowledged" {...aria("acknowledged")} /><span>I understand this form is for a brief, nonconfidential request. I will not include documents, passwords, account numbers, or private business information.</span></label>{err("acknowledged")}
          <label className="nx-check"><input type="checkbox" name="contactConsent" {...aria("contactConsent")} /><span>I agree that Opsirix may contact me about this request. Opsirix will not give a partner my identity or contact details unless I later give specific consent to that disclosure.</span></label>{err("contactConsent")}
          {failure && <p className="nx-error nx-error--block" role="alert">{failure}</p>}
          <button type="submit" className="nx-btn nx-btn--primary" disabled={pending}>{pending ? "Sending…" : "Send inquiry to Opsirix"}</button>
          <p className="nx-boundary">{NEXUS_BOUNDARY}</p>
        </form>}
      </div>
    </main>
  );
}
