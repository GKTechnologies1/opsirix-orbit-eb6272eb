import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StickyCta } from "@/components/layout/StickyCta";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Opsirix - The Operational Backbone for Founders" },
      {
        name: "description",
        content:
          "Opsirix is the Founder Operations OS. We help early-stage, immigrant, and technical founders turn operational chaos into structured execution through workflow orchestration, documentation systems, and partner coordination.",
      },
      {
        name: "keywords",
        content:
          "founder operations, founder operations OS, founder infrastructure, startup operations platform, operational backbone for founders, startup workflow management, immigrant founder support, founder onboarding system, startup documentation systems, founder workflow orchestration",
      },
      { name: "author", content: "Opsirix" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "google-site-verification", content: "CQSpCOWPxfh8sc8YmyupwQV-fEIn5A3c8NHQ_sPptMw" },
      // Open Graph defaults
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Opsirix" },
      { property: "og:title", content: "Opsirix - The Operational Backbone for Founders" },
      {
        property: "og:description",
        content:
          "Turn founder chaos into structured execution. Workflow orchestration, document intelligence, and partner coordination for founders.",
      },
      { property: "og:url", content: "https://opsirix.com" },
      { property: "og:image", content: "https://opsirix.com/og-default.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Opsirix - Founder Infrastructure Platform" },
      // Twitter
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@opsirix" },
      { name: "twitter:creator", content: "@opsirix" },
      { name: "twitter:title", content: "Opsirix - Founder Operations OS" },
      { name: "twitter:description", content: "Turn founder chaos into structured execution." },
      { name: "twitter:image", content: "https://opsirix.com/og-default.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://opsirix.com/#org",
              name: "Opsirix",
              url: "https://opsirix.com",
              logo: "https://opsirix.com/logo.svg",
              description:
                "Founder operations platform for documents, workflows, and partner coordination.",
              foundingDate: "2025",
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "sales",
                url: "https://opsirix.com/contact",
              },
              sameAs: [
                "https://www.linkedin.com/company/opsirix/",
                "https://twitter.com/opsirix",
              ],
            },
            {
              "@type": "SoftwareApplication",
              "@id": "https://opsirix.com/#software",
              name: "Opsirix OS",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description:
                "Founder Operations OS for startup workflow orchestration, document management, and operational readiness scoring.",
            },
            {
              "@type": "WebSite",
              "@id": "https://opsirix.com/#site",
              url: "https://opsirix.com",
              name: "Opsirix",
              publisher: { "@id": "https://opsirix.com/#org" },
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://opsirix.com/faq?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Navbar />
      <Outlet />
      <Footer />
      <StickyCta />
    </QueryClientProvider>
  );
}
