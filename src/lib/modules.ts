export type ModuleEntry = {
  slug: string;
  name: string;
  to: string;
  short: string;
  audience: string;
  icon: string;
  soon?: boolean;
};

export const MODULES: ModuleEntry[] = [
  { slug: "os", name: "Opsirix OS", to: "/platform/os", short: "Founder dashboard and operational visibility.", audience: "Every active Opsirix founder", icon: "Monitor", soon: true },
  { slug: "launch", name: "Opsirix Launch", to: "/platform/launch", short: "Structured company formation and setup.", audience: "Pre-launch and newly formed companies", icon: "Rocket" },
  { slug: "flow", name: "Opsirix Flow", to: "/platform/flow", short: "Workflow engine for tasks and handoffs.", audience: "Active founders managing ongoing tasks", icon: "Workflow" },
  { slug: "vault", name: "Opsirix Vault", to: "/platform/vault", short: "Document organization built for founders.", audience: "Founders who need organized records", icon: "LockKeyhole" },
  { slug: "nexus", name: "Opsirix Nexus", to: "/platform/nexus", short: "Coordinated access to vetted professional partners.", audience: "Founders working with professional advisers", icon: "Network" },
  { slug: "grid", name: "Opsirix Grid", to: "/platform/grid", short: "Monthly operational readiness score.", audience: "Founders seeking operational visibility", icon: "ChartNoAxesCombined" },
  { slug: "ai", name: "Opsirix AI", to: "/platform/ai", short: "Operational intelligence and surfaced patterns.", audience: "Founders who need workflow visibility", icon: "BrainCircuit", soon: true },
  { slug: "core", name: "Opsirix Core", to: "/platform/core", short: "Managed operations layer for active founders.", audience: "Founders who need managed support", icon: "Settings2" },
  { slug: "studio", name: "Opsirix Studio", to: "/platform/studio", short: "Selective venture readiness for mature founders.", audience: "Operationally mature founders", icon: "Landmark" },
];

export function getRelatedModules(currentSlug: string, count = 3): ModuleEntry[] {
  return MODULES.filter((m) => m.slug !== currentSlug).slice(0, count);
}
