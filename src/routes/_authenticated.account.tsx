import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { ArrowRight, LogOut } from "lucide-react";
import { OpsirixLogo } from "@/components/layout/OpsirixLogo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess } from "@/lib/access.functions";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "Choose your workspace | Opsirix" },
      { name: "description", content: "Pick the Opsirix area you want to open based on your verified access." },
      { property: "og:title", content: "Choose your workspace | Opsirix" },
      { property: "og:description", content: "Pick the Opsirix area you want to open based on your verified access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountHub,
});

function AccountHub() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchAccess = useServerFn(getMyAccess);
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["my-access"], queryFn: () => fetchAccess() });
  const areas = data?.areas ?? [];

  // One area only: go straight there.
  useEffect(() => {
    if (areas.length === 1) void navigate({ to: areas[0].to, replace: true });
  }, [areas, navigate]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="nexus-auth-page">
      <div className="nexus-auth-shell" style={{ gridTemplateColumns: "1fr" }}>
        <section className="nexus-auth-panel" aria-labelledby="hub-title">
          <Link to="/" aria-label="Opsirix home"><OpsirixLogo /></Link>
          <h1 id="hub-title" style={{ marginTop: 24 }}>Where would you like to go?</h1>
          <p className="nexus-panel-copy">These are the areas your account can open. You can switch at any time from this page.</p>
          {isLoading && <p role="status">Checking your access</p>}
          {isError && <p role="alert">We could not check your access. <Button variant="ghost" onClick={() => refetch()}>Try again</Button></p>}
          <ul className="account-hub-list" aria-label="Your workspaces">
            {areas.map((area) => (
              <li key={area.key}>
                <Link to={area.to} className="account-hub-item">
                  <span><strong>{area.label}</strong><small>{area.description}</small></span>
                  <ArrowRight aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <Button variant="ghost" onClick={signOut}><LogOut />Sign out</Button>
        </section>
      </div>
    </main>
  );
}
