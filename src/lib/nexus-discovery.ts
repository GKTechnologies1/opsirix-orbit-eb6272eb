/** Approved public copy per open Nexus category. A category without an entry here is never shown publicly. */
export const NEXUS_DISCLOSURE_VERSION = "nexus-help-2026-09-25-v1";

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
};

export const NEXUS_NETWORK_NOTE =
  "University programs, banking partners, and insurance brokers are planned Nexus categories but are not currently available. They will not appear as available or in directory results unless Opsirix opens the category and approves the participating organization.";

export const NEXUS_BOUNDARY =
  "An introduction is not an endorsement or a promise of a match, response, eligibility, quote, or professional outcome. Opsirix does not provide legal, tax, banking, insurance, immigration, or other licensed advice.";

export const NEXUS_ACCOUNT_DATA_NOTICE =
  "We collect your name, email address, authentication records, and basic security and access logs. We do not require company information, founder intake answers, payment information, or private business files for directory access.";
