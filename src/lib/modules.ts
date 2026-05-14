export type ModuleEntry = {
  slug: string;
  name: string;
  to: string;
  short: string;
  soon?: boolean;
};

export const MODULES: ModuleEntry[] = [
  { slug: "os", name: "Opsirix OS", to: "/platform/os", short: "Founder dashboard and operational visibility.", soon: true },
  { slug: "launch", name: "Opsirix Launch", to: "/platform/launch", short: "Structured company formation and setup." },
  { slug: "flow", name: "Opsirix Flow", to: "/platform/flow", short: "Workflow engine for tasks and handoffs." },
  { slug: "vault", name: "Opsirix Vault", to: "/platform/vault", short: "Document organization built for founders." },
  { slug: "nexus", name: "Opsirix Nexus", to: "/platform/nexus", short: "Coordinated access to vetted professional partners." },
  { slug: "grid", name: "Opsirix Grid", to: "/platform/grid", short: "Monthly operational readiness score." },
  { slug: "ai", name: "Opsirix AI", to: "/platform/ai", short: "Operational intelligence and surfaced patterns.", soon: true },
  { slug: "core", name: "Opsirix Core", to: "/platform/core", short: "Managed operations layer for active founders." },
  { slug: "studio", name: "Opsirix Studio", to: "/platform/studio", short: "Selective venture readiness for mature founders." },
];

export function getRelatedModules(currentSlug: string, count = 3): ModuleEntry[] {
  return MODULES.filter((m) => m.slug !== currentSlug).slice(0, count);
}
