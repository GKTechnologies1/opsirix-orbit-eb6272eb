/** Approved public copy per open Nexus category. A category without an entry here is never shown publicly. */
export const NEXUS_DISCLOSURE_VERSION = "nexus-help-2026-09-25-v2";

export const NEXUS_CATEGORY_COPY: Record<string, { title: string; body: string; reminder: string; option: string }> = {
  attorney: {
    title: "Attorneys",
    option: "Attorney / law firm",
    body: "Help with legal questions, contracts, company matters, or other work that requires a licensed attorney.",
    reminder: "Do not include confidential legal facts, immigration details, case documents, government notices, or deadlines in this form.",
  },
  cpa: {
    title: "CPAs and accounting firms",
    option: "CPA / accounting firm",
    body: "Help with accounting, tax preparation, bookkeeping, financial records, or related professional services.",
    reminder: "Do not include tax returns, tax identification numbers, bank records, payroll files, or account credentials in this form.",
  },
  it_services: {
    title: "Software and IT firms",
    option: "Software / IT services firm",
    body: "Help with custom software, systems, integrations, infrastructure, or technical delivery.",
    reminder: "Do not include passwords, access keys, source code, security findings, customer data, or private business files in this form.",
  },
  university: {
    title: "University programs",
    option: "University program",
    body: "Help finding an entrepreneurship program, workshop, incubator, or other university resource that works with founders.",
    reminder: "Do not include student ID numbers, transcripts, visa or enrollment status, immigration documents, or grades in this form. Opsirix cannot speak for a university on admissions, enrollment, or eligibility.",
  },
  banking: {
    title: "Banking partners",
    option: "Banking partner",
    body: "Help understanding which participating banking institutions offer business accounts or services that may fit your situation.",
    reminder: "Do not include account numbers, card numbers, online banking logins, Social Security or tax ID numbers, or bank statements in this form. Opsirix does not decide account approval or eligibility.",
  },
  insurance: {
    title: "Insurance brokers",
    option: "Insurance broker",
    body: "Help reaching a licensed insurance brokerage about business coverage such as general liability, professional liability, or cyber coverage.",
    reminder: "Do not include policy numbers, claims details, medical or health information, Social Security numbers, or financial statements in this form. Opsirix does not provide quotes or coverage advice. Please include your state, because brokers are licensed state by state.",
  },
};

/** Labels for categories that may still be closed; shown only while closed. */
export const NEXUS_PLANNED_LABELS: Record<string, string> = { university: "University programs", banking: "Banking partners", insurance: "Insurance brokers" };

export function nexusNetworkNote(open: string[]): string | null {
  const closed = Object.keys(NEXUS_PLANNED_LABELS).filter((id) => !open.includes(id)).map((id) => NEXUS_PLANNED_LABELS[id]);
  if (!closed.length) return null;
  return closed.length === 1
    ? `The ${closed[0]} category is planned but not open yet, and no partners in that category are listed.`
    : `${closed.join(", ")} are planned Nexus categories. They are not open yet, and no partners in those categories are listed.`;
}

export const NEXUS_BOUNDARY =
  "An introduction is not an endorsement or a promise of a match, response, eligibility, quote, or professional outcome. Opsirix does not provide legal, tax, banking, insurance, immigration, or other licensed advice.";

export const NEXUS_ACCOUNT_DATA_NOTICE =
  "We collect your name, email address, authentication records, and basic security and access logs. We do not require company information, founder intake answers, payment information, or private business files for directory access.";
