export const TOUR_VERSION = 1;

export type TourRole =
  | "workspace_switcher"
  | "directory_member"
  | "founder_owner"
  | "editing_member"
  | "viewer"
  | "partner"
  | "operations_lead"
  | "compliance_coordinator"
  | "admin_ceo";

export type TourStep = {
  title: string;
  body: string;
  visibility: string;
  review?: string;
  href?: string;
  linkLabel?: string;
};

export type TourDefinition = { key: string; role: TourRole; label: string; steps: TourStep[] };

const start = (role: TourRole, label: string, first: string): TourDefinition => ({
  key: `${role}.orientation`, role, label,
  steps: [
    { title: `Welcome to ${label}`, body: first, visibility: "This tour shows only areas your account can currently open." },
  ],
});

export const BUILT_IN_TOURS: Record<TourRole, TourDefinition> = {
  workspace_switcher: {
    key: "workspace_switcher.orientation", role: "workspace_switcher", label: "Workspace switcher", steps: [
      { title: "Choose where you are working", body: "Your account has more than one workspace. Choose one here, then Opsirix will show the tour for that workspace.", visibility: "Only workspaces allowed for your signed-in account appear.", href: "/account", linkLabel: "View workspaces" },
    ],
  },
  directory_member: {
    ...start("directory_member", "Nexus member area", "Start by browsing approved partner profiles or opening a help request."), steps: [
      { title: "Find an approved partner", body: "Browse and filter the directory. Your first useful action is choosing the service area you need.", visibility: "Other members cannot see your browsing activity.", review: "Only approved profiles appear in the directory.", href: "/nexus/directory", linkLabel: "Browse directory" },
      { title: "Ask for help", body: "Send a private request when you are not sure which partner type fits.", visibility: "You and authorized Opsirix staff can see your request.", review: "Opsirix reviews the request before any introduction is considered.", href: "/nexus/requests", linkLabel: "View my requests" },
    ],
  },
  founder_owner: {
    ...start("founder_owner", "company owner workspace", "Start on Overview, then use Flow for work and Core when you need scoped Opsirix support."), steps: [
      { title: "See the operating picture", body: "Overview gathers the current state of your company workspace. Start by checking work that needs attention.", visibility: "Company access follows the membership and staff grants you control.", href: "/os", linkLabel: "Open overview" },
      { title: "Organize work in Flow", body: "Create a board and add the first task with an owner and due date.", visibility: "Company members see records allowed by their role. Partners see only tasks explicitly shared with them.", review: "Escalated work stays on hold until an authorized reviewer clears it.", href: "/flow", linkLabel: "Open Flow" },
      { title: "Request scoped support in Core", body: "Create a request, then grant staff only the scope and period needed.", visibility: "Admin/CEO sees oversight details, not request content, without an active owner grant.", review: "You can revoke staff access immediately.", href: "/core", linkLabel: "Open Core" },
    ],
  },
  editing_member: {
    ...start("editing_member", "editing member workspace", "Start with the company overview and the work your owner has made available."), steps: [
      { title: "Work in Flow", body: "Open an existing board and update the tasks you are allowed to edit.", visibility: "Company owners and permitted company members can see the board. Shared partners see only explicitly shared tasks.", review: "A hold can require reviewer clearance before work resumes.", href: "/flow", linkLabel: "Open Flow" },
      { title: "Use company requests", body: "Follow existing Core and Nexus work without changing owner-only access grants.", visibility: "Visibility follows your current company role and active grants.", href: "/core", linkLabel: "Open Core" },
    ],
  },
  viewer: {
    ...start("viewer", "viewer workspace", "Start by reading the company overview and work shared with you."), steps: [
      { title: "Review without editing", body: "Use Overview and Flow to follow current work. Viewer access does not allow changes.", visibility: "You see only the company records available to viewers.", href: "/os", linkLabel: "Open overview" },
      { title: "Understand company history", body: "Open Companies & history to review role-limited activity.", visibility: "Private actor details remain limited to company owners and authorized Admin/CEO access.", href: "/workspace", linkLabel: "View company history" },
    ],
  },
  partner: {
    ...start("partner", "partner workspace", "Start with your application or profile, then respond to consent-based introductions."), steps: [
      { title: "Complete your partner record", body: "Choose services and maintain the institution or brokerage information used for review.", visibility: "Your draft and private credentials are limited to you and authorized reviewers.", review: "A profile appears in the directory only after the required review and authorization.", href: "/partner/profile", linkLabel: "Open profile" },
      { title: "Respond to introductions", body: "Open an introduction and record your response before following up.", visibility: "The introduction is limited to the participating accounts and authorized Opsirix staff.", review: "Founder and partner consent is required. An introduction is not an endorsement, eligibility decision, or quote.", href: "/partner/introductions", linkLabel: "View introductions" },
    ],
  },
  operations_lead: {
    ...start("operations_lead", "Operations Lead workspace", "Start in Staff Console and open only work assigned to you."), steps: [
      { title: "Open assigned work", body: "Use Staff Console to find active work and record progress within the granted scope.", visibility: "You see only records allowed by your role and active assignment or owner grant.", review: "Revoked or expired access disappears immediately.", href: "/staff", linkLabel: "Open Staff Console" },
      { title: "Review assigned Launch intakes", body: "Launch is preview-only. Review only an intake actively assigned to you and record a correction or outcome.", visibility: "Unassigned Launch intakes and founder drafts are not visible to Operations Leads.", review: "Admin/CEO assigns the intake. Launch is not publicly available.", href: "/staff/launch", linkLabel: "Open Launch review" },
    ],
  },
  compliance_coordinator: {
    ...start("compliance_coordinator", "Compliance Coordinator workspace", "Start in Staff Console and work only within current assignments and grants."), steps: [
      { title: "Check your permitted work", body: "Use Staff Console to open the records currently assigned or granted to you.", visibility: "Revoked or expired access removes records and links immediately.", review: "Company owners control request-scoped access. Admin/CEO controls staff roles.", href: "/staff", linkLabel: "Open Staff Console" },
      { title: "Use Flow and Core within scope", body: "Review tasks and requests only when the company has granted the required access.", visibility: "Private request content remains hidden without an active owner grant.", href: "/core", linkLabel: "Open Core" },
    ],
  },
  admin_ceo: {
    ...start("admin_ceo", "Admin/CEO workspace", "Start in Staff Console to manage queues, access and release records."), steps: [
      { title: "Triage work", body: "Use Staff Console to review operational queues and assign work to the right staff role.", visibility: "Oversight does not grant silent access to private company request content.", review: "Full Core content still requires an active owner grant.", href: "/staff", linkLabel: "Open Staff Console" },
      { title: "Review Launch assignments", body: "Launch is preview-only. Assign a submitted intake to an Operations Lead or record a review directly.", visibility: "Admin/CEO can see submitted intakes. Founder drafts remain private.", review: "Public Launch remains off until its release checks are approved.", href: "/staff/launch", linkLabel: "Open Launch review" },
      { title: "Manage draft content", body: "Use Content & Catalog to draft, preview and version wording before a separate publish action.", visibility: "Only Admin/CEO can manage this content.", review: "Saving a draft does not publish it.", href: "/staff/content", linkLabel: "Open Content & Catalog" },
    ],
  },
};

export const TOUR_CONTENT_BODY = {
  heading: "Signed-in guided tours",
  body: "Short role-based orientation shown only after verified sign-in. Saving this content creates a draft; publishing is a separate action.",
  items: Object.values(BUILT_IN_TOURS).map((tour) => ({ q: tour.label, a: tour.steps.map((step) => `${step.title}: ${step.body} ${step.visibility}${step.review ? ` ${step.review}` : ""}`).join("\n\n") })),
};