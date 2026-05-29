import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
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
  // honeypot — must be empty
  website_url: z.string().max(0).optional().or(z.literal("")),
  user_agent: z.string().max(500).optional(),
});

const NOTIFY_TO = "Operations@opsirix.com";
const NOTIFY_FROM = "Opsirix Website <notifications@opsirix.com>";

async function sendNotificationEmail(row: Record<string, unknown>) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    console.warn("LOVABLE_API_KEY not set, skipping email notification");
    return;
  }
  const fields = [
    ["Full Name", row.full_name],
    ["Email", row.email],
    ["Phone", row.phone],
    ["Company Name", row.company_name],
    ["Website", row.website],
    ["Business Stage", row.business_stage],
    ["Service Interest", row.service_interest],
    ["Preferred Contact Method", row.preferred_contact_method],
    ["Preferred Meeting Time", row.preferred_meeting_time],
    ["Message", row.message],
    ["Source Page", row.source_page],
    ["Submitted", new Date().toISOString()],
  ] as const;

  const html = `
    <h2 style="font-family:system-ui">New Opsirix Discovery Call Request</h2>
    <table style="font-family:system-ui;border-collapse:collapse">
      ${fields
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee"><strong>${k}</strong></td><td style="padding:6px 12px;border-bottom:1px solid #eee">${v ? String(v).replace(/</g, "&lt;") : "—"}</td></tr>`,
        )
        .join("")}
    </table>`;

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: [NOTIFY_TO],
        subject: "New Opsirix Discovery Call Request",
        html,
        reply_to: row.email,
      }),
    });
    if (!res.ok) {
      console.error("Email notification failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Email notification threw:", err);
  }
}

export const submitDiscoveryCall = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SubmissionSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.website_url && data.website_url.length > 0) {
      // honeypot tripped — silently succeed
      return { ok: true };
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

    const { error } = await supabaseAdmin
      .from("discovery_call_submissions")
      .insert(row);

    if (error) {
      console.error("Failed to insert discovery_call_submissions:", error);
      throw new Error("Could not save submission");
    }

    // Fire-and-forget email; don't fail the request if email errors.
    await sendNotificationEmail(row);

    return { ok: true };
  });
