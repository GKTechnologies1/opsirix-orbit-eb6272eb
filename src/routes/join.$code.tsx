import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/join/$code")({
  head: () => ({ meta: [
    { title: "Join the Nexus Network | Opsirix" },
    { name: "description", content: "Start a private Opsirix Nexus partner application from an authorized invitation." },
    { property: "og:title", content: "Join the Nexus Network | Opsirix" },
    { property: "og:description", content: "Start a private Opsirix Nexus partner application from an authorized invitation." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: JoinPage,
});

function JoinPage() {
  const { code } = Route.useParams();
  const [valid, setValid] = useState<boolean | null>(null);
  useEffect(() => { supabase.from("partner_campaigns").select("id").eq("code", code).eq("is_active", true).maybeSingle().then(({ data }) => setValid(Boolean(data))); }, [code]);
  const destination = `/partner/apply?ref=${encodeURIComponent(code)}`;
  return <main className="nexus-invite"><div className="nexus-work-card"><BadgeCheck /><p className="nexus-kicker">Nexus invitation</p><h1>{valid === null ? "Checking your invitation" : valid ? "You're invited to apply." : "This invitation is not active."}</h1><p>{valid === null ? "Please wait." : valid ? "Create a secure account, tell us about your work, and submit your details for human review." : "Contact the person who shared this link or start through our partner page."}</p>{valid && <Link to="/auth" search={{ next: destination }}>Start registration <ArrowRight /></Link>}{!valid && valid !== null && <Link to="/for-partners">Visit the partner page</Link>}</div></main>;
}