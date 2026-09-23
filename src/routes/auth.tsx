import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ArrowRight, CheckCircle2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { OpsirixLogo } from "@/components/layout/OpsirixLogo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({ next: z.string().optional().catch(undefined) });

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Partner Sign In | Opsirix Nexus" },
      { name: "description", content: "Create or access your secure Opsirix Nexus partner account." },
      { property: "og:title", content: "Partner Sign In | Opsirix Nexus" },
      { property: "og:description", content: "Create or access your secure Opsirix Nexus partner account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/partner";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("fullName") ?? "").trim();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
      if (!error && data.user) {
        await supabase.from("profiles").upsert({ id: data.user.id, email, full_name: fullName });
        if (data.session) await navigate({ to: safeNext });
        else setMessage("Check your email to confirm your account, then return here to sign in.");
      } else setMessage(error?.message ?? "We could not create your account. Please try again.");
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data.user) {
        await supabase.from("profiles").upsert({ id: data.user.id, email: data.user.email ?? email, full_name: String(data.user.user_metadata.full_name ?? "") });
        await navigate({ to: safeNext });
      }
      else setMessage(error?.message ?? "We could not sign you in. Please try again.");
    }
    setPending(false);
  }

  return (
    <main className="nexus-auth-page">
      <div className="nexus-auth-shell">
        <section className="nexus-auth-intro" aria-labelledby="auth-title">
          <Link to="/" aria-label="Opsirix home"><OpsirixLogo /></Link>
          <div>
            <p className="nexus-kicker">Nexus Partner Network</p>
            <h1 id="auth-title">Tell us what you do best.</h1>
            <p>We'll review your details and help you set up a profile that makes it easier for the right people to find you.</p>
          </div>
          <ul className="nexus-assurance-list">
            <li><ShieldCheck aria-hidden="true" /> Your application stays private during review.</li>
            <li><CheckCircle2 aria-hidden="true" /> Every application is reviewed by a person.</li>
          </ul>
        </section>
        <section className="nexus-auth-panel" aria-label="Partner account">
          <div className="nexus-segmented" role="group" aria-label="Account action">
            <Button type="button" variant={mode === "signup" ? "default" : "ghost"} onClick={() => setMode("signup")}>Create account</Button>
            <Button type="button" variant={mode === "signin" ? "default" : "ghost"} onClick={() => setMode("signin")}>Sign in</Button>
          </div>
          <h2>{mode === "signup" ? "Create your partner account" : "Welcome back"}</h2>
          <p className="nexus-panel-copy">{mode === "signup" ? "Start an application and return to it at any time." : "Access your application and review status."}</p>
          <form onSubmit={submit} className="nexus-form">
            {mode === "signup" && <label>Full name<input name="fullName" autoComplete="name" required maxLength={120} /></label>}
            <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={255} /></label>
            <label>Password<span className="nexus-password-wrap"><input name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={8} /><Button type="button" variant="ghost" size="icon" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</Button></span></label>
            {message && <p className="nexus-form-message" role="status">{message}</p>}
            <Button type="submit" size="lg" disabled={pending}>{pending ? "Please wait" : mode === "signup" ? "Create account" : "Sign in"}<ArrowRight /></Button>
          </form>
          <p className="nexus-terms">By continuing, you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.</p>
        </section>
      </div>
    </main>
  );
}