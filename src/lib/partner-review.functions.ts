import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const reviewSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum(["under_review", "changes_requested", "approved", "declined"]),
  note: z.string().trim().max(2000).optional(),
});

export const reviewPartnerApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => reviewSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: canReview } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!canReview) throw new Error("You do not have permission to review applications.");

    const { data: current, error: readError } = await context.supabase
      .from("partner_applications")
      .select("status,user_id,organization_name,professional_type,professional_summary,city,state_region,service_areas")
      .eq("id", data.applicationId)
      .single();
    if (readError || !current) throw new Error("Application not found.");

    const now = new Date().toISOString();
    const { error: updateError } = await context.supabase
      .from("partner_applications")
      .update({ status: data.status, updated_at: now })
      .eq("id", data.applicationId);
    if (updateError) throw updateError;

    const { error: eventError } = await context.supabase.from("partner_review_events").insert({
      application_id: data.applicationId,
      reviewer_id: context.userId,
      from_status: current.status,
      to_status: data.status,
      note: data.note || null,
    });
    if (eventError) throw eventError;

    if (data.status === "approved") {
      const { data: profile } = await context.supabase.from("profiles").select("full_name").eq("id", current.user_id).single();
      await context.supabase.from("partner_profiles").upsert({
        user_id: current.user_id,
        display_name: profile?.full_name || current.organization_name,
        organization_name: current.organization_name,
        professional_type: current.professional_type,
        city: current.city,
        state_region: current.state_region,
        service_areas: current.service_areas,
        professional_summary: current.professional_summary,
        is_published: false,
        updated_at: now,
      }, { onConflict: "user_id" });
    }
    return { success: true };
  });