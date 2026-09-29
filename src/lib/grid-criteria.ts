// Opsirix Grid criteria version 3. Unscored evidence checks. Client-safe shared definitions.
// Validation is enforced again in the database (grid_v3_check); this file drives the forms and display.

export const GRID_CRITERIA_VERSION = "grid-criteria-v3";

export type Choice = "in_place" | "partly" | "not_yet" | "evidence_not_shown" | "not_applicable";
export const CHOICE_LABEL: Record<Choice, string> = {
  in_place: "In place",
  partly: "Partly",
  not_yet: "Not yet",
  evidence_not_shown: "Evidence not shown",
  not_applicable: "Not applicable",
};
export const CHOICE_HELP: Record<Choice, string> = {
  in_place: "Shown and meets the check as written.",
  partly: "Some shown, not all.",
  not_yet: "The company does not have this yet. A stage, not a failure.",
  evidence_not_shown: "Not shown during this review. Does not mean missing or late.",
  not_applicable: "Only where the check allows it. Add a one-line reason.",
};

export type CountField = { key: string; label: string };
export type Criterion = {
  key: string;
  n: number;
  title: string;
  wording: string;
  type: "choice" | "count";
  choices?: Choice[];
  naWhen?: string;
  counts?: CountField[];
  staffOnly?: boolean;
};

const ALL: Choice[] = ["in_place", "partly", "not_yet", "evidence_not_shown", "not_applicable"];
const NO_NA: Choice[] = ["in_place", "partly", "not_yet", "evidence_not_shown"];

export const GRID_CRITERIA: Criterion[] = [
  { key: "engagement_record", n: 1, title: "Professional engagement record", type: "choice", choices: ALL,
    wording: "If the company has engaged an attorney, CPA or other professional, a record of the engagement (letter or signed agreement) is stored.",
    naWhen: "No professional is engaged.", counts: [{ key: "total", label: "Professionals engaged" }, { key: "stored", label: "With a stored record" }] },
  { key: "calendar_current", n: 2, title: "Deadline calendar kept current", type: "choice", choices: NO_NA,
    wording: "The company keeps a deadline calendar or list, and it was updated in the last 30 days." },
  { key: "calendar_entries", n: 3, title: "Calendar entries complete", type: "choice", choices: ALL,
    wording: "Every entry in the deadline calendar has a due date and a named person responsible.",
    naWhen: "The calendar has no entries.", counts: [{ key: "total", label: "Entries" }, { key: "complete", label: "With due date and person responsible" }] },
  { key: "overdue_status", n: 4, title: "Overdue entries have a recorded status", type: "choice", choices: ALL,
    wording: "Each entry past its due date has a recorded status: Done, Extended (new date recorded), or Referred to a professional.",
    naWhen: "No entries are overdue.",
    counts: [{ key: "overdue", label: "Overdue entries" }, { key: "done", label: "Done" }, { key: "extended", label: "Extended (new date recorded)" }, { key: "referred", label: "Referred to a professional" }, { key: "no_status", label: "No status" }] },
  { key: "business_account", n: 5, title: "Business account exists", type: "choice", choices: ["in_place", "not_yet", "evidence_not_shown"],
    wording: "The founder showed that a business bank account exists in the company's name." },
  { key: "vendor_paperwork", n: 6, title: "Recurring vendor paperwork stored", type: "choice", choices: ALL,
    wording: "For each recurring vendor the founder lists, an invoice or agreement is stored.",
    naWhen: "The company has no recurring vendors.", counts: [{ key: "total", label: "Recurring vendors" }, { key: "stored", label: "With invoice or agreement stored" }] },
  { key: "board_updated", n: 7, title: "Task board updated recently", type: "choice", choices: NO_NA,
    wording: "The company's task board has at least one update in the last 30 days." },
  { key: "tasks_owner_due", n: 8, title: "Open tasks have owner and due date", type: "choice", choices: ALL,
    wording: "Every open task has an owner and a due date.",
    naWhen: "There are no open tasks.", counts: [{ key: "total", label: "Open tasks" }, { key: "complete", label: "With owner and due date" }] },
  { key: "responsibilities", n: 9, title: "Operational responsibilities identified", type: "choice", choices: ALL,
    wording: "The company has identified who is responsible for bookkeeping, paying bills and maintaining the deadline calendar.",
    naWhen: "The company has no activity in any of the three areas." },
  { key: "tasks_by_due", n: 10, title: "Tasks handled by the due date", type: "count",
    wording: "Of tasks with a due date in the last 30 days: how many were completed by the due date, and how many were updated by the due date but not completed.",
    counts: [{ key: "due", label: "Tasks due in the last 30 days" }, { key: "completed", label: "Completed by the due date" }, { key: "updated_only", label: "Updated by the due date, not completed" }] },
  { key: "long_overdue", n: 11, title: "Long-overdue open tasks", type: "count",
    wording: "The number of open tasks more than 30 days past their due date.",
    counts: [{ key: "overdue_30", label: "Open tasks more than 30 days overdue" }] },
  { key: "doc_locations", n: 12, title: "Company-controlled document locations", type: "choice", choices: NO_NA,
    wording: "Key company documents are kept in one or more locations the company controls, and the founder can name them." },
  { key: "major_contracts", n: 13, title: "Major contracts stored and tracked", type: "choice", choices: ALL,
    wording: "Contracts the founder identifies as major are stored in a company-controlled location, with counterparty and end date recorded where there is one.",
    naWhen: "The founder identifies no major contracts.",
    counts: [{ key: "total", label: "Major contracts" }, { key: "stored", label: "Stored" }, { key: "with_counterparty", label: "Counterparty recorded" }, { key: "no_fixed_end", label: "No fixed end date" }] },
  { key: "retrieval", n: 14, title: "Optional retrieval exercise", type: "count", staffOnly: true,
    wording: "Optional. The reviewer picks up to three document types from active checks that apply to this company, and the founder locates them.",
    counts: [{ key: "found", label: "Found" }] },
];

export const RETRIEVAL_TYPES = ["engagement_record", "vendor_paperwork", "major_contracts"] as const;
export const RESP_AREAS = [
  { key: "bookkeeping", label: "Bookkeeping" },
  { key: "bills", label: "Paying bills" },
  { key: "calendar", label: "Maintaining the deadline calendar" },
] as const;
export const RESP_LABEL: Record<string, string> = { assigned: "Role or team assigned", not_assigned: "Not yet assigned", not_applicable: "Not applicable" };

export const PENDING_SPECIALIST = [
  { n: 1, title: "Formation document", discipline: "Legal" },
  { n: 2, title: "Tax registration confirmation", discipline: "Tax" },
  { n: 3, title: "Agreements for people working in the business", discipline: "Employment/payroll" },
  { n: 4, title: "Business insurance renewal dates", discipline: "Insurance" },
  { n: 9, title: "Registry status check", discipline: "Legal" },
  { n: 10, title: "Licence or permit renewal dates", discipline: "Legal" },
  { n: 12, title: "Books reconciliation date", discipline: "Tax" },
  { n: 13, title: "Payroll records", discipline: "Employment/payroll" },
  { n: 14, title: "Tax professional or filing-date list", discipline: "Tax" },
  { n: 21, title: "Ownership record", discipline: "Legal" },
  { n: 22, title: "Work-product agreements", discipline: "Legal" },
];

export type Answer = {
  criterion: string;
  answer: Choice | null;
  counts: Record<string, number>;
  detail: Record<string, unknown>;
  note: string;
};

export const critByKey = (k: string) => GRID_CRITERIA.find((c) => c.key === k);

/** Human-readable lines for a saved answer. Never produces a score or percentage. */
export function describeAnswer(a: Answer): string[] {
  const c = critByKey(a.criterion);
  const d = a.detail ?? {}; const n = a.counts ?? {};
  const lines: string[] = [];
  const src = d.source === "flow" ? "Read from Opsirix Flow" : d.source === "external" ? "External board, founder-reported. Opsirix has not accessed this board." : "";
  if (a.criterion === "tasks_by_due") {
    if (d.status === "no_tasks_due") return ["No tasks due"];
    if (d.status === "no_data") return ["No data"];
    lines.push(`Completed by the due date: ${n.completed ?? 0} of ${n.due ?? 0}`);
    lines.push(`Updated by the due date, not completed: ${n.updated_only ?? 0} of ${n.due ?? 0}`);
    if (src) lines.push(src);
    return lines;
  }
  if (a.criterion === "long_overdue") {
    if (d.status === "no_data") return ["No data"];
    return [`${n.overdue_30 ?? 0} open tasks more than 30 days overdue`, ...(src ? [src] : [])];
  }
  if (a.criterion === "retrieval") {
    if (d.status === "not_run") return ["Not run"];
    const types = (d.types as string[] | undefined) ?? [];
    return [`Found ${n.found ?? 0} of ${types.length}`, `Types: ${types.map((t) => critByKey(t)?.title ?? t).join(", ")}`];
  }
  if (a.answer) lines.push(CHOICE_LABEL[a.answer]);
  if (a.criterion === "overdue_status" && n.overdue !== undefined) {
    const unresolved = (n.referred ?? 0) + (n.no_status ?? 0);
    lines.push(`Overdue: ${n.overdue}. Done: ${n.done ?? 0}. Extended: ${n.extended ?? 0}.`);
    if (n.referred) lines.push(`Referred to a professional: ${n.referred} (still overdue and unresolved; referral does not change a deadline)`);
    if (n.no_status) lines.push(`No status: ${n.no_status}`);
    lines.push(`Unresolved overdue entries: ${unresolved}`);
  } else if (c?.counts && Object.keys(n).length) {
    lines.push(c.counts.filter((f) => n[f.key] !== undefined).map((f) => `${f.label}: ${n[f.key]}`).join(". "));
  }
  if (a.criterion === "responsibilities") {
    for (const r of RESP_AREAS) if (d[r.key]) lines.push(`${r.label}: ${RESP_LABEL[String(d[r.key])]}`);
  }
  if (a.criterion === "doc_locations" && Array.isArray(d.labels) && d.labels.length) lines.push(`Locations: ${(d.labels as string[]).join(", ")}`);
  if (a.criterion === "board_updated" && d.last_update) lines.push(`Last update: ${String(d.last_update)}`);
  if (src) lines.push(src);
  if (a.note) lines.push(a.answer === "not_applicable" ? `Reason: ${a.note}` : `Note: ${a.note}`);
  return lines;
}
