import { createFileRoute } from "@tanstack/react-router";
import { Resend } from "resend";

export const Route = createFileRoute("/api/public/test-email")({
  server: {
    handlers: {
      GET: async () => {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ ok: false, error: "RESEND_API_KEY not set" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
        try {
          const resend = new Resend(apiKey);
          const result = await resend.emails.send({
            from: "Opsirix Intake <noreply@opsirix.com>",
            to: "Operations@opsirix.com",
            subject: "Opsirix test email",
            html: `<p>This is a test email sent at ${new Date().toISOString()} to verify Resend integration.</p>`,
          });
          return new Response(JSON.stringify({ ok: !result.error, result }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          return new Response(
            JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
