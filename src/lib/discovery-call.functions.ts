import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Resend } from "resend";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SubmissionSchema = z.object({
  full_name: z.string().trim().min(2).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company_name: z.string().trim().max(200).optional().or(z.literal("")),
  website: z.string().trim().max(300).optional().or(z.literal("")),
  business_stage: z.string().trim().max(200).optional().or(z.literal("")),
  service_interest: z.string().trim().max(500).optional().or(z.literal("")),
  preferred_contact_method: z.string().trim().max(100).optional().or(z.literal("")),
  preferred_meeting_time: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(5000),
  source_page: z.string().trim().max(200).optional(),
  website_url: z.string().max(0).optional().or(z.literal("")),
  user_agent: z.string().max(500).optional(),
});

function escapeHtml(v: unknown) {
  return v == null || v === ""
    ? "Not provided"
    : String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export const submitDiscoveryCall = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SubmissionSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.website_url && data.website_url.length > 0) {
      // honeypot tripped — silently succeed
      return { success: true, id: null };
    }

    const row = {
      full_name: data.full_name,
      email: data.email,
      phone: data.phone || null,
      company_name: data.company_name || null,
      website: data.website || null,
      business_stage: data.business_stage || null,
      service_interest: data.service_interest || null,
      preferred_contact_method: data.preferred_contact_method || null,
      preferred_meeting_time: data.preferred_meeting_time || null,
      message: data.message,
      source_page: data.source_page || "Opsirix Website",
      user_agent: data.user_agent || null,
    };

    // Save to database first — must succeed
    const { data: saved, error: dbError } = await supabaseAdmin
      .from("discovery_call_submissions")
      .insert(row)
      .select()
      .single();

    if (dbError) {
      console.error("Failed to insert discovery_call_submissions:", dbError);
      throw new Error("Database save failed");
    }

    // Then attempt email — failure here does NOT fail the submission
    try {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        console.error("RESEND_API_KEY not configured; skipping email notification");
      } else {
        const resend = new Resend(apiKey);
        const html = `
          <div style="font-family:system-ui,-apple-system,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#0f172a">
            <div style="border-bottom:2px solid #2F80ED;padding-bottom:16px;margin-bottom:24px">
              <h1 style="margin:0;font-size:22px;color:#0f172a">New Discovery Call Request</h1>
              <p style="margin:6px 0 0;color:#64748b;font-size:14px">Opsirix Founder Intake</p>
            </div>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              ${[
                ["Full Name", row.full_name],
                ["Email", row.email],
                ["Phone", row.phone],
                ["Company", row.company_name],
                ["Founder Type / Stage", row.business_stage],
                ["Service Interest", row.service_interest],
                ["Preferred Contact", row.preferred_contact_method],
                ["Preferred Time", row.preferred_meeting_time],
              ]
                .map(
                  ([k, v]) =>
                    `<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;width:200px">${k}</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0">${escapeHtml(v)}</td></tr>`,
                )
                .join("")}
            </table>
            <div style="margin-top:24px;padding:16px;background:#f8fafc;border-radius:6px">
              <h3 style="margin:0 0 8px;font-size:15px">What They Need Help With</h3>
              <p style="margin:0;white-space:pre-wrap;font-size:14px;line-height:1.55">${escapeHtml(row.message)}</p>
            </div>
            <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b">
              <p style="margin:0">Reply to this email to contact the founder directly.</p>
              <p style="margin:4px 0 0">Submitted: ${new Date().toISOString()} — Source: ${escapeHtml(row.source_page)}</p>
            </div>
          </div>
        `;

        const { error: emailError } = await resend.emails.send({
          from: "Opsirix Intake <noreply@opsirix.com>",
          to: "Opsirix@gmail.com",
          replyTo: row.email,
          subject: `New Discovery Call Request — ${row.full_name}`,
          html,
        });
        if (emailError) {
          console.error("Resend email failed (submission still saved):", emailError);
        }
      }
    } catch (emailError) {
      console.error("Resend email threw (submission still saved):", emailError);
    }

    return { success: true, id: saved?.id ?? null };
  });
