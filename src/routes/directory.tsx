import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type PartnerProfile = Database["public"]["Tables"]["partner_profiles"]["Row"];

export const Route = createFileRoute("/directory")({
  head: () => ({ meta: [
    { title: "Nexus Partner Directory | Opsirix" },
    { name: "description", content: "Find approved professionals in the Opsirix Nexus partner network." },
    { property: "og:title", content: "Nexus Partner Directory | Opsirix" },
    { property: "og:description", content: "Find approved professionals in the Opsirix Nexus partner network." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: DirectoryPage,
});

function DirectoryPage() {
  const [profiles, setProfiles] = useState<PartnerProfile[]>([]);
  const [query, setQuery] = useState("");
  useEffect(() => { supabase.from("partner_profiles").select("*").eq("is_published", true).then(({ data }) => setProfiles(data ?? [])); }, []);
  const visible = useMemo(() => profiles.filter((profile) => `${profile.display_name} ${profile.organization_name} ${profile.professional_type} ${profile.city} ${profile.state_region} ${profile.service_areas.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [profiles, query]);
  return <main className="nexus-directory"><header><div className="nexus-public-wrap"><p className="nexus-kicker">Nexus directory</p><h1>Find the right professional for the work.</h1><p>Browse approved Nexus profiles. Professionals work independently and provide services under their own engagement terms.</p><label className="nexus-search"><Search /><span className="sr-only">Search partner directory</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by service, location, or organization" /></label></div></header><section className="nexus-public-wrap nexus-directory-results" aria-live="polite">{visible.length ? <div className="nexus-directory-grid">{visible.map((profile) => <article key={profile.id} className="nexus-directory-card"><span>{profile.professional_type}</span><h2>{profile.display_name}</h2><h3>{profile.organization_name}</h3>{(profile.city || profile.state_region) && <p className="nexus-location"><MapPin />{[profile.city, profile.state_region].filter(Boolean).join(", ")}</p>}<p>{profile.professional_summary}</p><ul>{profile.service_areas.map((area) => <li key={area}>{area}</li>)}</ul></article>)}</div> : <div className="nexus-empty"><Search /><h2>No published profiles found</h2><p>{query ? "Try a broader search." : "Approved profiles will appear here when partners choose to publish."}</p></div>}</section></main>;
}