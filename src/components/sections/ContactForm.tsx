import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name required").max(120),
  email: z.string().email("Valid email required").max(255),
  phone: z.string().max(40).optional(),
  company: z.string().max(150).optional(),
  founderType: z.string().min(1, "Please select your founder type"),
  companyStage: z.string().min(1, "Please select your company stage"),
  visaStatus: z.string().max(120).optional(),
  hasAttorney: z.enum(["yes", "no"], { required_error: "Required" }),
  hasCPA: z.enum(["yes", "no"], { required_error: "Required" }),
  hasEntity: z.enum(["yes", "no"], { required_error: "Required" }),
  helpNeeded: z.string().min(20, "Please describe your situation (20 chars min)").max(2000),
  meetingTime: z.string().optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "You must agree to continue" }) }),
});

type FormData = z.infer<typeof schema>;

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    // === CRM INTEGRATION POINT ===
    // Route to HubSpot: POST /api/contact (server function)
    // Fields map: email → contact.email, founderType → custom property "founder_type"
    // companyStage → custom property "company_stage"
    // helpNeeded → contact.description
    // Trigger HubSpot workflow: "New Founder Intake Received"
    // Slack notification: POST to webhook, channel #new-founder-intakes
    // Google Sheets: append row via Sheets API for manual review
    // Salesforce: Create Lead, Source = "Opsirix Website - Intake Form"
    console.log("Intake submission:", data);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitted(true);
  };

  return (
    <div className="contact-card">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 20, duration: 0.4 }}
            className="contact-success"
          >
            <div className="contact-check">✅</div>
            <h3>Intake received!</h3>
            <p>
              We'll review your intake and be in touch within 1 business day to schedule your Discovery Call.
            </p>
            <a href="/how-it-works" className="contact-success-link">
              In the meantime, read How Opsirix Works →
            </a>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3 className="contact-h3">Founder Intake Form</h3>
            <p className="contact-sub">Complete all sections. Response within 1 business day.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="contact-form">
              <div className="contact-row">
                <Field label="Full Legal Name*" error={errors.name?.message}>
                  <input className={inputCls(!!errors.name)} placeholder="Your full name" {...register("name")} />
                </Field>
                <Field label="Email Address*" error={errors.email?.message}>
                  <input type="email" className={inputCls(!!errors.email)} placeholder="you@company.com" {...register("email")} />
                </Field>
              </div>

              <div className="contact-row">
                <Field label="Phone / WhatsApp" error={errors.phone?.message}>
                  <input type="tel" className={inputCls(!!errors.phone)} placeholder="+1 (555) 000-0000" {...register("phone")} />
                </Field>
                <Field label="Company Name" error={errors.company?.message}>
                  <input className={inputCls(!!errors.company)} placeholder="Your company" {...register("company")} />
                </Field>
              </div>

              <Field label="Founder Type*" error={errors.founderType?.message}>
                <select className={inputCls(!!errors.founderType)} defaultValue="" {...register("founderType")}>
                  <option value="" disabled>Select your founder type…</option>
                  <optgroup label="FOUNDER TYPES">
                    <option>Early-stage founder (any background)</option>
                    <option>F-1 / OPT / STEM OPT founder</option>
                    <option>H-1B professional founder</option>
                    <option>H-4 EAD founder</option>
                    <option>International entrepreneur (non-U.S.)</option>
                    <option>Green card holder founder</option>
                    <option>U.S. citizen / PR founder</option>
                  </optgroup>
                  <optgroup label="PARTNER TYPES">
                    <option>Immigration attorney / CPA partner</option>
                    <option>University / college partner</option>
                    <option>Bank or financial institution partner</option>
                    <option>Startup ecosystem / accelerator partner</option>
                    <option>Other</option>
                  </optgroup>
                </select>
              </Field>

              <Field label="Company Stage*" error={errors.companyStage?.message}>
                <select className={inputCls(!!errors.companyStage)} defaultValue="" {...register("companyStage")}>
                  <option value="" disabled>Select your company stage…</option>
                  <option>Idea / Pre-formation</option>
                  <option>Just formed (0–3 months)</option>
                  <option>Pre-revenue (3–12 months)</option>
                  <option>Early revenue ($0–$10K MRR)</option>
                  <option>Growing ($10K–$100K MRR)</option>
                  <option>Scaling ($100K+ MRR)</option>
                </select>
              </Field>

              <Field label="Visa or Immigration Status (optional)" error={errors.visaStatus?.message}>
                <input
                  className={inputCls(!!errors.visaStatus)}
                  placeholder="e.g., F-1, OPT, H-1B, Green Card, U.S. Citizen, International"
                  {...register("visaStatus")}
                />
              </Field>

              <div className="contact-row">
                <Field label="Do you have an attorney?*" error={errors.hasAttorney?.message}>
                  <select className={inputCls(!!errors.hasAttorney)} defaultValue="" {...register("hasAttorney")}>
                    <option value="" disabled>Select…</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </Field>
                <Field label="Do you have a CPA?*" error={errors.hasCPA?.message}>
                  <select className={inputCls(!!errors.hasCPA)} defaultValue="" {...register("hasCPA")}>
                    <option value="" disabled>Select…</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </Field>
              </div>

              <Field label="Have you formed a U.S. business entity?*" error={errors.hasEntity?.message}>
                <select className={inputCls(!!errors.hasEntity)} defaultValue="" {...register("hasEntity")}>
                  <option value="" disabled>Select…</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </Field>

              <Field label="What do you need help with?*" error={errors.helpNeeded?.message}>
                <textarea
                  className={inputCls(!!errors.helpNeeded) + " min-h-[100px]"}
                  placeholder="Describe your current operational situation and what you're trying to solve. Be specific — the more we understand, the better we can help."
                  {...register("helpNeeded")}
                />
              </Field>

              <Field label="Preferred Meeting Time" error={errors.meetingTime?.message}>
                <select className={inputCls(false)} defaultValue="" {...register("meetingTime")}>
                  <option value="">Select a preferred time…</option>
                  <option>Morning (8am–12pm EST)</option>
                  <option>Afternoon (12pm–4pm EST)</option>
                  <option>Evening (4pm–7pm EST)</option>
                  <option>Flexible — any time works</option>
                </select>
              </Field>

              <div className="contact-field" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <input
                  type="checkbox"
                  id="consent"
                  style={{ marginTop: 4, flexShrink: 0 }}
                  {...register("consent")}
                />
                <label htmlFor="consent" style={{ fontSize: 12.5, lineHeight: 1.55, color: "rgba(255,255,255,0.7)" }}>
                  I understand that Opsirix is an operations coordination platform — not a law firm, immigration consultancy, CPA firm, or licensed professional services provider — and that nothing on this form or in any response constitutes legal, immigration, or tax advice. I agree to the{" "}
                  <a href="/terms" style={{ color: "#2F80ED", textDecoration: "underline" }}>Terms of Service</a> and{" "}
                  <a href="/privacy" style={{ color: "#2F80ED", textDecoration: "underline" }}>Privacy Policy</a>.
                </label>
              </div>
              {errors.consent && <p className="contact-err">{errors.consent.message}</p>}

              <button type="submit" disabled={isSubmitting} className="contact-submit">
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Submitting…</span>
                  </>
                ) : (
                  <span>Submit Intake Form →</span>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="contact-field">
      <label className="contact-label">{label}</label>
      {children}
      {error && <p className="contact-err">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `contact-input ${hasError ? "contact-input-err" : ""}`;
}

export default ContactForm;
