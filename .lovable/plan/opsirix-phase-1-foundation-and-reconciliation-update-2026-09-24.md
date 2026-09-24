# Opsirix Phase 1 foundation and reconciliation update

## Scope

- Update the reconciliation report with the newly reviewed documents 07 and 08, all approved Section 8 decisions, the remaining unreviewed priority documents, and the revised phased sequence.
- Preserve the tested Nexus implementation. University, Banking, and Insurance stay closed and unpublished; their draft catalogs and incomplete visitor checks remain unchanged.
- Build only the smallest safe Phase 1 foundation: company workspaces, Staff Console separation, staff roles, server-enforced permissions, and shared audit history.
- Do not build Launch intake, Grid workflows, Vault, AI, pricing, or any real sensitive-founder-data collection.

## Source reconciliation

- Treat document 07 as an older Nexus agreement template. Keep useful independence, conflict-check, confidentiality, and direct-engagement concepts as draft requirements, but do not restore automatic routing, 24-hour promises, Vault-based document delivery, or broad staff access. Existing consent, review, publication, closed-type, and credential controls remain authoritative.
- Treat document 08 as an older staff-led review form. Preserve the provisional five-dimension, 50-point structure, but specify separate founder self-assessment and staff evidence review records with numeric scores only. Exclude visa/status details, legal determinations, old risk bands, seven-day resolution promises, and automatic Nexus routing pending specialist review.
- Mark 01 Client Onboarding Agreement, 03 disclaimer, 04 attestation, 05 intake, 29 incident plan, and 33 pricing as missing/unreviewed. Keep Brand Architecture clearly distinguished from document 01.
- Add the approved minimal, jurisdiction-neutral Launch question set as a review draft, not a live form.

## Phase 1 data and permissions

- Extend the existing separate role system with `operations_lead` and `compliance_coordinator`; retain `admin` as Admin/CEO. Founder Success and Technology Liaison remain absent.
- Add organization workspaces, organization memberships, and append-only audit events with explicit grants, row-level policies, indexes, integrity checks, and server-side permission helpers.
- Keep staff roles distinct from organization roles. Organization owners, members, and viewers never gain Staff Console access through organization membership.
- Record workspace, membership, and staff-role actions in audit history without storing private note contents or sensitive founder information.
- Apply the migration to the current backend only after verifying it does not alter existing Nexus records, partner-type status, catalog publication state, or storage.

## Screens and operations

- Add a founder-facing company workspace screen for creating/selecting a company and viewing its members and audit history within the caller's permissions.
- Add a visually distinct Staff Console home and access screen for authorized staff only. Admin/CEO can manage Operations Lead and Compliance Coordinator assignments; the two operational roles cannot assign themselves or elevate others.
- Put all writes behind authenticated server operations with validation and role checks. Keep database policies as the second enforcement layer.
- Add navigation without mixing Staff Console links into ordinary partner or founder views for unauthorized users.

## Verification

- Database tests: anonymous denial; cross-company isolation; viewer write refusal; member/owner boundaries; staff-role separation; self-elevation refusal; unauthorized Staff Console denial; append-only audit behavior; Nexus tables and closed-type states unchanged.
- Browser tests: create and reopen a company workspace, inspect membership and history, verify each staff role's allowed screen, and verify direct-route denial as a founder. Check desktop and 390px mobile.
- Confirm no sensitive founder fields, real founder records, Vault content, AI flow, prices, or Launch/Grid submissions were introduced.
- Check the current build and runtime signals before completion.

## Public-copy preview and release boundary

- Keep the 13 corrected occurrences in preview only; do not publish.
- Capture desktop and 390px screenshots of the affected public pages/sections and include the old/new wording table in the report.
- Report separately: files and backend changes saved in the project versus what is currently live on `opsirix.com`.
- State the exact release action: use **Publish your app** after review; until then, the saved preview and backend foundation do not update the published public pages.

## Deliverables

- Updated complete reconciliation report (v6) in Files.
- Public-copy preview screenshots in Files.
- Implemented and tested Phase 1 foundation in the existing project, with no publication.
