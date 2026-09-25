import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { getMemberDirectory } from "@/lib/nexus.functions";
import { NEXUS_BOUNDARY } from "@/lib/nexus-discovery";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/nexus/directory")({
  head: () => ({ meta: [
    { title: "Member Directory | Opsirix Nexus" },
    { name: "description", content: "Browse approved Opsirix Nexus profiles as a signed-in member." },
    { property: "og:title", content: "Member Directory | Opsirix Nexus" },
    { property: "og:description", content: "Browse approved Opsirix Nexus profiles as a signed-in member." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: MemberDirectory,
});

function MemberDirectory() {
  const load = useServerFn(getMemberDirectory);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["nexus-member-directory"], queryFn: () => load() });
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const categories = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of data ?? []) p.category_ids.forEach((id, i) => m.set(id, p.category_labels[i]));
    return [...m];
  }, [data]);
  const visible = useMemo(() => (data ?? []).filter((p) =>
    (!category || p.category_ids.includes(category)) &&
    (!location || `${p.city ?? ""} ${p.state_region ?? ""} ${p.service_areas.join(" ")}`.toLowerCase().includes(location.toLowerCase())) &&
    `${p.display_name} ${p.organization_name} ${p.professional_summary} ${p.category_labels.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [data, query, category, location]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="nx-page">
      <div className="nx-wrap">
        <div className="nx-topbar"><p className="nexus-kicker">Nexus member directory</p><span style={{ display: "flex", gap: 16, flexWrap: "wrap" }}><Link to="/nexus/requests" className="nx-link">My requests</Link><Link to="/account" className="nx-link">Switch workspace</Link><button type="button" className="nx-link" onClick={signOut}>Sign out</button></span></div>
        <h1>Approved Nexus profiles</h1>
        <p className="nx-intro">Profiles appear here only after Opsirix review. Professionals work independently under their own engagement terms.</p>
        <div className="nx-filters" role="search">
          <label className="nexus-search"><Search aria-hidden /><span className="sr-only">Search profiles</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, organization, or service" /></label>
          <label><span className="sr-only">Category</span><select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All available categories</option>{categories.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
          <label><span className="sr-only">Location</span><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, state, or service area" /></label>
        </div>
        <section aria-live="polite" className="nx-results">
          {isLoading ? <p className="nx-muted">Loading approved profiles.</p> : isError ? <div className="nx-panel"><p>The directory could not be loaded.</p><button type="button" className="nx-btn" onClick={() => refetch()}>Try again</button></div> :
            visible.length ? <div className="nexus-directory-grid">{visible.map((p) => <article key={p.profile_id} className="nexus-directory-card">
              <span>{p.category_labels.join(" · ")}</span><h2>{p.display_name}</h2><h3>{p.organization_name}</h3>
              {(p.city || p.state_region) && <p className="nexus-location"><MapPin aria-hidden />{[p.city, p.state_region].filter(Boolean).join(", ")}</p>}
              <button type="button" className="nx-link" aria-expanded={open === p.profile_id} onClick={() => setOpen(open === p.profile_id ? null : p.profile_id)}>{open === p.profile_id ? "Hide profile" : "View profile"}</button>
              {open === p.profile_id && <div><p>{p.professional_summary}</p><ul>{p.service_areas.map((a) => <li key={a}>{a}</li>)}</ul><p className="nx-muted">Introduction requests from the directory are not open yet. You can <Link to="/nexus/help">tell us what help you need</Link>.</p></div>}
            </article>)}</div> :
            <div className="nx-panel"><h2>No approved profiles to show yet</h2><p>{query || category || location ? "Try a broader search." : "Approved profiles will appear here after Opsirix review and publication."}</p></div>}
        </section>
        <p className="nx-boundary">{NEXUS_BOUNDARY}</p>
      </div>
    </main>
  );
}
