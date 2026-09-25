import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set Your Password | Opsirix" },
      { name: "description", content: "Choose a new password for your Opsirix account." },
      { property: "og:title", content: "Set Your Password | Opsirix" },
      { property: "og:description", content: "Choose a new password for your Opsirix account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) setReady(true);
    });
    void supabase.auth.getSession().then(({ data: s }) => { if (s.session) setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const pw = String(form.get("password") ?? "");
    if (pw.length < 12) return setMessage("Use at least 12 characters.");
    if (pw !== String(form.get("confirm") ?? "")) return setMessage("The two passwords do not match.");
    setPending(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setPending(false);
    if (error) return setMessage("The password could not be saved. The link may have expired; ask for a new one.");
    setDone(true);
  }

  return (
    <main className="nexus-auth-page">
      <div className="nexus-auth-shell">
        <section className="nexus-auth-panel" aria-labelledby="reset-title">
          <h1 id="reset-title">Set your password</h1>
          {done ? <p className="nexus-panel-copy" role="status">Your password is saved. <Link to="/auth">Continue to sign in</Link></p>
            : !ready ? <p className="nexus-panel-copy">Open this page from the link in your password email. If the link has expired, ask for a new one.</p>
            : <form onSubmit={submit} className="nexus-form">
                <label>New password<input name="password" type="password" autoComplete="new-password" required minLength={12} /></label>
                <label>Confirm password<input name="confirm" type="password" autoComplete="new-password" required minLength={12} /></label>
                {message && <p className="nexus-form-message" role="alert">{message}</p>}
                <Button type="submit" disabled={pending}>{pending ? "Saving" : "Save password"}</Button>
              </form>}
        </section>
      </div>
    </main>
  );
}
