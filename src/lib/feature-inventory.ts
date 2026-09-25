// Admin/CEO feature inventory. Code is the source of truth for what is held and why.
export type InventoryItem = {
  module: string;
  item: string;
  state: "Active" | "Built, not on live site" | "Held" | "Draft" | "Placeholder" | "Closed";
  why: string;
  missing: string;
  backend: string;
  test: string;
  link?: string;
};

export const FEATURE_INVENTORY: InventoryItem[] = [
  { module: "Nexus", item: "Introductions (consent, staff send, partner portal)", state: "Active", why: "Enabled 2026-09-25 18:46 UTC for eligible approved partners.", missing: "A published, approved partner in an open category (currently none).", backend: "Live: real requests can be introduced only to published partners.", test: "Done. Repeat full TEST flow after any consent wording change.", link: "/staff/inquiries" },
  { module: "Nexus", item: "Help form, member directory, founder request history pages", state: "Built, not on live site", why: "Automatic preview build fails intermittently.", missing: "Lovable support fix and a run of stable automatic builds.", backend: "None; backend already live.", test: "Repeated automatic builds pass; recheck routes signed in and signed out.", link: "/nexus/help" },
  { module: "Nexus", item: "Partner listings (all categories)", state: "Held", why: "No listing publication authorized.", missing: "Owner authorization per listing.", backend: "Publishing makes the profile visible to members and eligible for real introductions.", test: "Publication gates, closed-type refusal, member projection check." , link: "/admin/applications" },
  { module: "Nexus", item: "University, Banking, Insurance categories", state: "Active", why: "Opened for applications and help requests 2026-09-25.", missing: "Listings still need separate authorization.", backend: "Category flags open on shared backend.", test: "Done.", link: "/staff" },
  { module: "Nexus", item: "Homepage partner showcase", state: "Held", why: "Only shows partners with approved status and explicit display permission.", missing: "At least one published partner with display permission.", backend: "None.", test: "Only permitted partners appear; closed categories never appear." },
  { module: "Accounts", item: "Terms acknowledgement at sign-up", state: "Draft", why: "Final Terms wording not approved.", missing: "Approved Terms text and version.", backend: "Would store acknowledgement version and time per account.", test: "Sign-up blocked without active acknowledgement; version recorded." },
  { module: "Nexus", item: "Help-form rate-limit record cleanup", state: "Held", why: "Retention period not decided.", missing: "Owner-approved retention period (30 days proposed).", backend: "Scheduled deletion of old rate-limit keys.", test: "Old records removed, recent kept, limits still enforced." },
  { module: "Content", item: "Public pricing", state: "Held", why: "Pricing publication is blocked in the content portal.", missing: "Owner-approved, reconciled pricing schedule (OPSIRIX_33 missing).", backend: "Pricing block could be published.", test: "Preview, publish, restore; no page shows unapproved prices.", link: "/staff/content" },
  { module: "Content", item: "Most page copy and FAQs", state: "Draft", why: "Still written in code; only some sections are editable.", missing: "Decide which sections to move into the portal.", backend: "New content blocks.", test: "Draft, preview, publish, restore per section.", link: "/staff/content" },
  { module: "OS", item: "Founder workspace beyond company, members and staff access", state: "Placeholder", why: "No approved spec.", missing: "Approved OS spec.", backend: "Not built.", test: "Defined per approved spec.", link: "/workspace" },
  { module: "Launch", item: "Launch intake and coordination", state: "Held", why: "Source intake document missing.", missing: "OPSIRIX_05 intake, 01 agreement, 03 disclaimer, 04 attestation; privacy counsel review.", backend: "Not built.", test: "Minimal jurisdiction-neutral intake; staff sees only two yes/no sensitive fields." },
  { module: "Flow", item: "Scheduling and follow-up", state: "Placeholder", why: "Marketing page only.", missing: "Approved spec.", backend: "Not built.", test: "Defined per approved spec." },
  { module: "Grid", item: "Self-assessment and staff evidence review", state: "Held", why: "Scoring bands provisional.", missing: "Approved criteria; no Critical or Investor-visible bands until defined.", backend: "Not built.", test: "Separate labeled founder and staff records; no determinations." },
  { module: "Core", item: "Core module", state: "Placeholder", why: "Marketing page only.", missing: "Approved spec.", backend: "Not built.", test: "Defined per approved spec." },
  { module: "Vault", item: "Private document storage", state: "Held", why: "Awaiting privacy design and security review.", missing: "Client-held key design, independent security review, retention and incident plan (OPSIRIX_29).", backend: "Not built. Nexus storage must not be reused.", test: "Independent review; no encryption claims until verified." },
  { module: "AI", item: "AI features (page marked Coming Soon)", state: "Held", why: "Awaiting privacy and security review.", missing: "Approval rules before any content reaches an AI provider; security review.", backend: "Not built.", test: "Explicit per-item approval before sending; review sign-off." },
  { module: "Staff Console", item: "Audit search", state: "Held", why: "Approved but not yet built.", missing: "None; ready to build.", backend: "Read-only search over audit history (Admin only).", test: "Admin can search; other roles denied.", link: "/staff" },
  { module: "Staff Console", item: "Founder Success and Technology Liaison roles", state: "Held", why: "Duties and access not specified.", missing: "Written duties and access limits.", backend: "New roles and permissions.", test: "Role-by-role browser and direct-request denial tests." },
  { module: "Release", item: "Publish preview to opsirix.lovable.app", state: "Held", why: "Intermittent automatic build failure.", missing: "Build fix and owner go-ahead. Domain routed by owner via GitHub; DNS unchanged.", backend: "None.", test: "Stable automatic builds; public and signed-in route checks after publish." },
];
