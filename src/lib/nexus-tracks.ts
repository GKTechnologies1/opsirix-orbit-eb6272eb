/** Configuration for partner types that use the institution or brokerage onboarding. */
export type TrackTypeId = "university" | "banking" | "insurance";
export type Track = "institution" | "brokerage";

export const TRACK_TYPE_IDS: TrackTypeId[] = ["university", "banking", "insurance"];

export const TRACK_TYPES: Record<TrackTypeId, {
  track: Track;
  label: string;
  orgNoun: string;
  intro: string;
  disclaimer: string;
  audiences: string[];
  audienceLabel: string;
}> = {
  university: {
    track: "institution",
    label: "University partner",
    orgNoun: "institution",
    intro: "For university programs and offices that want to work with founders, students, and local businesses.",
    disclaimer: "Listing reflects a program's participation in Nexus. It does not mean the university endorses Opsirix or any business, and a request is not an admission decision.",
    audiences: ["Students", "Alumni", "Faculty founders", "International students and scholars", "Local businesses", "Community members"],
    audienceLabel: "Who your program works with",
  },
  banking: {
    track: "brokerage",
    label: "Banking partner",
    orgNoun: "bank",
    intro: "For banks and credit unions that accept introductions from founders and small businesses.",
    disclaimer: "An introduction is not an application. The bank alone decides availability, eligibility, and terms.",
    audiences: ["Early-stage startups", "Small businesses", "Immigrant founders", "Nonprofits", "Venture-backed companies", "Specific industries"],
    audienceLabel: "Business or founder segments you serve",
  },
  insurance: {
    track: "brokerage",
    label: "Insurance broker",
    orgNoun: "brokerage",
    intro: "For licensed brokerages that handle business coverage inquiries.",
    disclaimer: "Brokers quote and place coverage under their own licenses. An inquiry does not bind coverage, guarantee a quote, or mean a particular loss or event is covered.",
    audiences: ["Startups", "Small businesses", "Professional services firms", "Technology companies", "Nonprofits", "Hospitality and events"],
    audienceLabel: "Client types you focus on",
  },
};

export const REACH_OPTIONS = ["Campus", "City", "State", "National", "Online"];

export const EVIDENCE_METHODS: { id: "work_email_domain" | "official_staff_page" | "signed_letter" | "verification_contact" | "other"; label: string; hint: string }[] = [
  { id: "work_email_domain", label: "My work email is on the organization's domain", hint: "Tell us the domain, for example the part after @ in your work email." },
  { id: "official_staff_page", label: "I'm listed on an official staff or roster page", hint: "Paste the page address so a reviewer can check it." },
  { id: "verification_contact", label: "Someone at the organization can confirm my role", hint: "Name, title, and work email of the person we may contact. We will only ask them to confirm your role." },
  { id: "signed_letter", label: "I can upload a signed letter", hint: "Upload it below. Only Opsirix reviewers can see it." },
  { id: "other", label: "Another way", hint: "Describe how we can confirm your authority." },
];

export const ONBOARDING_STEPS = [
  { id: "type", label: "Partner type" },
  { id: "organization", label: "Organization and role" },
  { id: "details", label: "Details" },
  { id: "choices", label: "Choices" },
  { id: "evidence", label: "Authority" },
  { id: "preview", label: "Profile preview" },
  { id: "submit", label: "Submit" },
] as const;
export type StepId = (typeof ONBOARDING_STEPS)[number]["id"];

export function typeIdFromLabel(label: string | null | undefined): TrackTypeId | null {
  const hit = TRACK_TYPE_IDS.find((id) => TRACK_TYPES[id].label === label);
  return hit ?? null;
}

export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft", submitted: "Submitted", under_review: "Under review", changes_requested: "Changes requested",
  approved: "Approved", declined: "Not approved", pending: "Awaiting review", verified: "Verified", rejected: "Not accepted",
  suspended: "Suspended", withdrawn: "Withdrawn", superseded: "Replaced", recorded: "Recorded", none: "Not started",
};

export const splitList = (value: string) => value.split(",").map((v) => v.trim()).filter(Boolean);
