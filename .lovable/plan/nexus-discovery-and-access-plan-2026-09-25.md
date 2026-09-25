# Nexus discovery and access plan

## Decision and release boundary

- Make Nexus understandable from the public homepage for individuals and businesses, independent of any Opsirix purchase, founder intake, or company workspace.
- Keep University, Banking, and Insurance closed. Their 49 draft choices and all unpublished/test listings remain private.
- Do not implement or publish the homepage, directory, or inquiry changes in this step. The current public `/directory` must not become the member directory until its authenticated route and server-side profile projection are complete.

## Proposed homepage section

Place a concise Nexus section after the module introduction and before founder-specific journey content. It is curated orientation, never a searchable directory.

**Exact copy**

- `OPSIRIX NEXUS`
- `Find the right professional support.`
- `Opsirix Nexus helps individuals and businesses request a human-reviewed introduction to an independent professional or participating organization. You do not need to purchase another Opsirix service to ask for help.`
- `Available through Nexus now`
- `Attorneys` · `Help with legal questions, contracts, company matters, or other work that requires a licensed attorney.`
- `CPAs and accounting firms` · `Help with accounting, tax preparation, bookkeeping, financial records, or related professional services.`
- `Software and IT firms` · `Help with custom software, systems, integrations, infrastructure, or technical delivery.`
- `University programs, banking partners, and insurance brokers are planned Nexus categories but are not currently available. They will not appear as available or in directory results unless Opsirix opens the category and approves the participating organization.`
- `How an introduction works`
- `Tell us what kind of help you need. Opsirix reviews the request and, when appropriate, asks for your specific consent before sharing your identity or contact details with a potential partner. The partner works independently under their own engagement terms.`
- `An introduction is not an endorsement or a promise of a match, response, eligibility, quote, or professional outcome. Opsirix does not provide legal, tax, banking, insurance, immigration, or other licensed advice.`
- Primary: `Find help through Nexus`
- Secondary: `Browse with a free account`

Initially show category cards only. No name, logo, summary, or count appears. A future curated partner requires every current publication gate plus separate, versioned consent for each exact homepage field.

## Free member directory

- Public explanation: `A free account lets you browse and filter approved Nexus profiles. It does not enroll you in another Opsirix service or create a company workspace.`
- Account-data notice: `We collect your name, email address, authentication records, acceptance of the current terms and privacy notice, and basic security and access logs. We do not require company information, founder intake answers, payment information, or private business files for directory access.`
- Build authenticated `/nexus/directory`; keep `/directory` as explanation/sign-in or redirect only after the member route exists.
- All reads use authenticated server operations returning approved display fields only. Route protection alone is insufficient.
- Browse, search, location, and category filters operate only on open types and profiles that pass all publication gates.
- Credential evidence, reviewer notes, unpublished revisions, closed/suspended/withdrawn claims, and private history never enter directory responses.

## Public inquiry without login

Create `/nexus/help`, separate from the Discovery Call form.

Fields: name, email, optional phone, currently open partner category, relevant location/jurisdiction, and a brief nonconfidential description limited to 1,000 characters. No file upload.

Warnings:
- Attorney: `Do not include confidential legal facts, immigration details, case documents, government notices, or deadlines in this form.`
- CPA/accounting: `Do not include tax returns, tax identification numbers, bank records, payroll files, or account credentials in this form.`
- Software/IT: `Do not include passwords, access keys, source code, security findings, customer data, or private business files in this form.`
- Future Banking and Insurance require separately approved warning copy before opening.

Consent:
- `I understand this form is for a brief, nonconfidential request. I will not include documents, passwords, account numbers, or private business information.`
- `I agree that Opsirix may contact me about this request. Opsirix will not give a partner my identity or contact details unless I later give specific consent to that disclosure.`
- Confirmation: `Your inquiry was received for review. This does not promise a match, response time, eligibility, quote, or professional outcome. We will not share your identity or contact details with a partner without your specific consent.`

Use a Nexus inquiry record, not a company, Launch intake, CRM note, or Discovery Call submission. Statuses: received, under review, consent requested, introduced, closed. Introduction requires a separate record naming the recipient partner, exact disclosed fields, purpose, consent-text version, consent time, actor, and withdrawal.

## Permissions and audit

| Data | Public | Free member | Partner | Staff |
|---|---|---|---|---|
| Open categories/general copy | Yes | Yes | Yes | Yes |
| Curated partner fields | Only exact-consented fields after all gates | Same | Same | Same |
| Approved directory projection | No | Yes | Yes as member | Role-scoped |
| Draft/closed/suspended/withdrawn data | No | No | Own only | Assigned review only |
| Credentials/private documents | No | No | Own only | Assigned review only |
| Reviewer notes | No | No | No | Assigned review only |
| Inquiry identity/contact | No | Own if linked later | Only after recipient-specific consent | Assigned scope |

Reuse `profile_is_public`, `listing_type_is_public`, evidence checks, and Phase 1 role/audit patterns. Nexus access never implies company, CRM, Vault, or AI access. Staff title alone grants no universal access. Audit consent, disclosure, status, staff access, and closure without confidential content in summaries.

## Decisions required before implementation

- Approve the exact copy, account-data notice, fields, consent text, and role matrix.
- Approve retention/deletion for free accounts, inquiries, and consent records.
- Complete attorney/privacy review of introduction wording and warnings.
- Assign inquiry triage and contact-data access to specific Phase 1 staff roles.

## Acceptance checks for the future build

- Closed categories never appear as available; draft/sample/unapproved partners and invented counts never render.
- Individual homepage fields require field-specific consent and every current publication gate.
- Signed-out visitors cannot retrieve directory profiles through the page or direct backend calls.
- A free member browses without purchase, founder intake, or company workspace.
- Directory payloads contain no credentials, reviewer notes, or pending changes.
- A bypassed inquiry for a closed category is refused server-side.
- No partner receives identity/contact before recipient-specific recorded consent.
- University, Banking, and Insurance remain closed and all 49 choices remain draft.

## Phase 1 result already completed

Routes: `/workspace`, `/staff`, `/staff/access`.

Migrations: `0016` roles/organizations/members/audit; `0017` scoped grants; `0018` owner grant by email; `0019` owner grant reads; `0020` anonymous denial and owner-only mutation; `0021` authenticated account resolution; `0022` fail-closed missing membership.

All 19 isolated permission checks passed: admin self-grant refused; two approved staff roles granted; two founders created isolated workspaces; owner added viewer; viewer rename refused; cross-founder reads hidden; ungranted staff saw no companies; one-company Operations Lead grant worked; ungranted Compliance Coordinator stayed isolated; Admin/CEO rename refused; owner revocation removed access immediately; direct audit insert refused; anonymous reads empty; anonymous creation refused; and successful mutations wrote audit events. Test records were removed.

Limitations: no permanent automated file retains the 19-case run; full browser desktop/390px acceptance is incomplete; older project security warnings remain; no member-management screen, CRM, Launch, Grid, Vault, AI, pricing, or retention/deletion workflow was added.

## Public-copy correction state

The 13-item old/new wording table is preserved in the shareable v7 report. All corrections are saved in project source only and are not published on `opsirix.com`. Restoring either claim requires the documented security evidence and independent review, or measured service-time evidence and an approved commitment. Publishing later requires the explicit production Publish/Update action and verification on `https://opsirix.com/`.
