# Opsirix signed-in review and DevOps handoff

Date: 2026-09-28 UTC  
Preview: `https://id-preview--f5bb6a30-a69a-4b28-98ee-cfe4453a6fdd.lovable.app`  
Publication and DNS: unchanged

## Previous 88 responsive checks

The earlier suite checked five role/page combinations at desktop (1280), tablet (768), and mobile (390), with reduced motion enabled:

| Role | Page | Checks |
|---|---|---|
| Company owner | `/os` | No public header, no page overflow, mobile keyboard menu, all destinations visible, compact empty companies |
| Approved partner | `/partner` | No public header, no page overflow, mobile keyboard menu, all destinations visible, approved wording matches stored status |
| Operations Lead | `/staff` | No public header, no page overflow, mobile keyboard menu, no filler cards, assigned-request action present |
| Admin/CEO | `/staff` | No public header, no page overflow, mobile keyboard menu, all destinations visible |
| Admin/CEO | `/core` | No public header, no page overflow, mobile keyboard menu, metadata-only notice visible, TEST request details absent |

Across all 15 viewport/page cases, the common assertions and role-specific assertions totaled 88/88. The original suite did not separately assert initial/3-second/10-second timing, scrolling, or every empty/populated variant. Those gaps were covered by the expanded suite below rather than being retroactively attributed to the 88 checks.

## Expanded responsive and role review

Result: 144/144 browser assertions passed.

The four requested pages plus the signed-in directory were checked at 1280 and 390 pixels at initial render, after 3 seconds, after 10 seconds, and after scrolling. Checks covered:

- public header absent;
- no horizontal page overflow;
- reduced-motion preference active;
- scroll state remains within the viewport;
- visible `Menu` label on phones;
- menu opens with Enter;
- every available destination has a full-width, visible target without horizontal scrolling;
- focus moves into the open menu;
- Escape closes the menu and restores focus to the trigger.

Additional desktop and 390 role checks covered:

- founder owner: `/workspace`, `/flow`, `/os`;
- founder viewer: `/workspace`, `/grid`;
- partner: `/partner`, `/partner/introductions`, `/partner/tasks`;
- Operations Lead: `/staff`, `/staff/inquiries`, denial at `/staff/access`;
- Compliance Coordinator: `/staff/inquiries`, denial at `/staff/content`;
- Admin/CEO: `/staff`, `/staff/access`, `/staff/content`, `/staff/features`, `/admin/applications`, `/core`;
- free member: `/nexus/directory` with an honest no-listings state.

### Verified layout changes

1. Protected Nexus pages now share the authenticated chrome rule. `/nexus/directory` no longer receives the public announcement/header/footer above its own page.
2. The directory now uses a signed-in member workspace with Directory, My requests, Switch workspace, and Sign out destinations.
3. Phone menu buttons now include the visible word `Menu`, move keyboard focus into the opened menu, close on Escape, and restore focus.
4. Empty company sections remain compact and link directly to Flow, Core, and Grid.
5. Staff Console no longer duplicates Service suggestions in Content & Catalog. A missing Admin overview now shows an explicit unavailable state instead of a blank page.
6. Staff access now has meaningful empty states when there are no current staff roles or access-history events.
7. Approved partner guidance says `Your approved profile`; the obsolete `We review professional details` guidance is absent for approved applications.

### Screenshot evidence

Authentic earlier captures are under `/tmp/browser/post-login-final/screenshots/` and `/tmp/browser/os/shots/`. Current timing/state captures are under `/tmp/browser/post-login-expanded/`.

For `/os`, `/partner`, `/staff`, and `/core`, both desktop and 390 captures exist in the earlier and current sets. Current sets also include `initial`, `settled-3s`, `scrolled`, and `10s` captures. The visual difference on desktop `/os` is intentionally minimal because its compact-company fix predated the expanded audit. No missing historical state was recreated or mislabeled.

## Core security evidence

Expanded direct result: 16/16 passed.

Admin/CEO can read these oversight fields:

- request ID and permanent request reference;
- organization ID and organization name;
- request title;
- status;
- requester account ID and handler account ID;
- linked board ID as an operational reference only;
- created and updated timestamps;
- status history: event ID, previous status, next status, event note, actor ID, event time;
- access grants: grant ID, staff account ID/label, read-or-handle scope, owner-recorded purpose, expiry, grant time, revocation time, and active/expired/revoked state.

Admin/CEO without an active owner grant cannot directly read:

- the Core request row;
- request description;
- latest private status note;
- linked Flow board name/content;
- linked Flow task title, details, status, or due date.

Operations Lead, Compliance Coordinator, and partner accounts cannot call the Admin oversight operation. Unrelated staff cannot read the Core row or linked tasks.

Core has no separate `private_notes` field. The protected note-like content tested directly was the latest Core status note and linked Flow task details; both returned no rows to an ungranted Admin/CEO account.

## Cross-company task regression

Second TEST organization ID: `3e4fb493-6deb-4c20-b749-1914e1852aaf`  
Board: `TEST cross-company isolation board`  
Board ID: `c0fe61ce-15fa-4b7d-b729-761eeeb0c6d8`

An owner of another TEST company directly attempted to create `TEST blocked cross-company insertion` on that board. The backend refused the operation, and a follow-up query confirmed zero matching tasks. Earlier owner, viewer, Operations Lead, partner, and Admin/CEO outsider probes were also refused. The governing rule is the null-safe `flow_can_edit` authorization added in migration 0046.

## Shared-backend effects in this review

- No migration was added or applied.
- No backend rows were created, changed, or removed by the expanded checks.
- The second TEST organization and board already existed from the earlier regression setup.
- No email or partner notification was sent.
- No public content, listing, pricing, Vault, AI, Grid score, or DNS setting changed.

## Concise DevOps handoff

Preview-only source changes:

- authenticated `/nexus/*` chrome detection;
- member-directory workspace navigation;
- shared phone menu label, focus, and Escape behavior;
- Staff Console duplicate/empty-state corrections.

Commands:

```text
bun install --frozen-lockfile
bun run build
bun run dev
```

Environment variable names only:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
CONTACT_FROM_EMAIL
CONTACT_TO_EMAIL
```

External GitHub repository: not connected. Current working branch and internal preview commit are not a GitHub release reference, so do not deploy from them. After the owner connects GitHub, record the actual repository, branch, and commit, then verify a fresh checkout using an isolated staging backend with migrations in numeric order through 0050.

Role smoke tests after deployment: signed-out redirect; founder owner/viewer; directory-only member; approved partner; Operations Lead; Compliance Coordinator; Admin/CEO metadata-only Core oversight. Confirm expiry/revocation, cross-company Flow denial, and no public listing/pricing/Vault/AI/Grid-scoring change.
## Update 2026-09-28 19:55 UTC: Core note redaction, Compliance captures, in-app notifications

### Core note redaction (migration 0050_core_note_redaction_and_notifications)
Admin/CEO oversight event fields are now exactly: `id`, `from_status`, `to_status`, `actor_id`, `created_at`, `note` (always null), `note_redacted` (true when a note exists). The event stays visible; the page shows "Note withheld: requires an active owner grant." Checked on past and current requests (every past event note null) and by direct event-table read (0 rows). Audit summaries contain no note text.

### Compliance Coordinator screenshots
Saved in Files `post-login-review-2026-09-28/`: `{desktop,mobile}-compliance-inquiries.png`, `-compliance-core.png`, `-compliance-notifications.png`.

### In-app Core notifications (no email)
Recipients and rules:
- Submitted, accepted, ready for company review: every company owner, except the person who acted.
- Reopened: the handling staff member (if still able to handle) and staff with an active handle grant, except the actor.
- Access revoked: the affected staff member (recorded at revocation).
- Access expired: the affected staff member (recorded once, when they next load notifications).
Content: generic title, request reference, event time, link to `/core` (permission re-checked). No description, note or task text. Read state per account; one row per recipient per event (unique key).

Tests: direct 37/37, regression 16/16, browser 43/43 desktop and 390. Email delivery is not built.

### Shared-backend effects (live immediately)
- Oversight redaction, `core_notifications` table, triggers and RPCs.
- TEST request OX-CORE-2026-009 in TEST Founder Company, TEST grants to Ops Lead (revoked) and Compliance (expired by test harness), and their notifications.
- One Features & Releases record.
Preview only: Notifications page, menu link with unread count, redaction label, notifications page uses workspace chrome.

## Update 2026-09-28 20:10 UTC: journey review, actor labels

- Core access panel gap: public-page phone/tablet section spacing leaked into signed-in pages (72px forced padding). Scoped to public pages only. Verified: no trailing gap at 1280/390.
- Staff Console stayed on "Checking access." forever if loading failed. It now shows an error with Try again.
- Core history actor labels (migration 0051, `core_history`, `core_actor_label`): no raw account IDs are returned. Owner sees company member names, "You" and "Opsirix staff"; members/viewers see "You", "Company owner/member/viewer", "Opsirix staff"; Admin/CEO sees staff names plus company role labels, notes withheld. Revoked, expired and unrelated accounts get no history. Direct 9/9.
- Journey checks 191/192 (18 role/page pairs at 1280 and 390, including Notifications; forced-failure states on 8 pages). The single miss is a test limitation: the partner overview reads its data another way, so the simulated failure did not apply.
- Regression: notifications/Compliance 43/43, Core and cross-company 16/16.

### Active on the shared backend now
Note redaction, actor labels, notification table, triggers and read/expiry functions (migrations 0050, 0051).
### Preview only
Notifications page and menu badge, Core history display, spacing fix, Staff Console error state. Email delivery is not built.

## Update 2026-09-28 20:45 UTC: partner overview error state and institutional categories
- /partner overview: a failed application load used to show "Start your partner application" (misleading). It now shows "Your application could not load" with Try again (role=alert). Tested through the real data path (partner_applications request blocked): error appears after built-in retries (~8s), Try again recovers. Desktop + 390px pass. Preview only.
- University Programs, Banking Partners, Insurance Brokers: open for applications and help requests (shared backend, unchanged this round); 17/14/18 active choices; 0 public listings. No dynamic "planned/not open" wording shown. Added "University programs can apply now" block on /for-universities and an open-categories line on /for-partners (preview only).
- Directory eligibility (unchanged, live): approved organization application, verified representative authority, university agreement recorded, approved claimed category, approved/published/not suspended profile, approved active service; Insurance needs verified unexpired license per offered service/state/line.
- Tests: public/help/member directory/partner error 36/36 (desktop + 390); direct backend visitor/member/unrelated partner 24/24.
- No shared-backend changes this round.

## Update 2026-09-28 21:00 UTC: category copy and staging filter test
### Preview-only category copy (deploy via DevOps)
- `/for-universities`: "University programs can apply now" block.
- `/for-partners`: line listing open categories (Attorney, CPA, Software/IT, University Programs, Banking Partners, Insurance Brokers).
- `/partner` overview: load-error state with Try again.
No live category setting, permission rule or record changed. 0 public listings in University, Banking and Insurance.

### Staging test to add (isolated staging backend only)
Positive directory filter test: seed approved TEST listings per open category in staging; verify member directory category/location/service filters return them; verify suspended, closed-type, expired-license and unpublished-draft listings are excluded. Never seed TEST listings on the shared live backend.

## Update 2026-09-29 16:30 UTC: Grid incident review (D-Global Technologies LLC)

**What happened.** 2026-09-29 15:46:08 UTC, during Grid browser testing, the account opsirix+test-owner@gmail.com (63e655d6) saved a founder self-assessment draft (review 40e4beac, period 2026-08, criteria v3) to D-Global Technologies LLC (a73d534c). Action: "Save draft" on /grid, which calls server function `saveGridCriteria` and database operation `grid_save_criteria`. The test script chose the first company in the list instead of the TEST company.

**Why it was accepted.** The account was the sole owner of D-Global at the time. It created that workspace itself on 2026-09-27 18:38 UTC (`workspace.created` audit entry). Memberships at the time: owner of D-Global, TEST Founder Company, and TEST concurrency orgs 0-7. `grid_save_criteria` requires owner/member for self-assessments and admin or staff with an active grant for evidence reviews; the call met that rule. This was a test-selection mistake, not an authorization gap. No server change was made.

**Cleanup state.** Draft and its answers are gone (0 rows). History keeps one unchanged entry: `grid.draft_saved`, "Grid self-assessment draft saved.", metadata {kind self_assessment, period 2026-08-01, criteria_version grid-criteria-v3}. The deletion was a direct data cleanup and has no history entry of its own; this note is the record. D-Global has no other members, so no real person could see the draft or the entry. Grid sends no notifications; none exist for D-Global.

**Cross-company tests (TEST companies only, rolled back): 16/16 passed.** Member creating in a non-member company, viewer updating/submitting another's draft, unrelated account creating founder/staff records, submitting a foreign draft, using the old-format save, staff with revoked grant or no grant creating/submitting evidence reviews, staff writing a founder record: all denied. Foreign drafts, reviews and answers read as 0 rows. Only other caller of the same operation family: `grid_save_review` (old format), also denied. No further tests run against real companies.

**Shared backend (already live):** migration 0056 (from earlier today); D-Global draft deletion. **Preview only:** Grid screens, Features & Releases entry. Nothing published; DNS unchanged.

## Update 2026-09-29 16:45 UTC: owner decisions on incident and Stage 3

- Incident accepted as closed (test-selection error). Incident history unchanged.
- Test scripts now use `scripts/test-org-allowlist.json` via `scripts/test_guard.py`; a non-TEST company ID stops the script before anything runs (verified: D-Global refused).
- **Backups (verified, Lovable Cloud docs):** daily database backup, kept about 14 days; restore is to a daily snapshot only and replaces the whole database. A restore would bring back records deleted after that snapshot. Proposed: a deletion ledger replayed after any restore. **To confirm by DevOps:** whether uploaded storage files are covered by backups.
- Stage 3 revised to v3 (not approved; no Terms gate, no deletion, no dry run built). Stage 4 Core email design drafted; sending off.
- Shared backend: no changes in this update. Preview only: none. Nothing published; DNS unchanged.

## Update 2026-09-29 16:40 UTC: backups, D-Global classification, staging plan

**Backup facts and source.** Source: Lovable documentation (docs search "Lovable Cloud database backups", retrieved 2026-09-29 16:35 UTC): daily database backup, retained approximately 14 days; restore only to a daily snapshot; restore replaces schema and data and loses later changes. Not independently verified. **DevOps must verify** database backup coverage and whether uploaded files (storage) are backed up, before anyone relies on these figures.

**Staging plan additions (isolated staging backend only, not built):**
1. Restore test: restore a staging snapshot, confirm schema, auth, storage and app routes; record time taken.
2. Deletion-replay test (design only, no deletion implemented): seed staging records, record a mock deletion ledger, restore an earlier snapshot, replay ledger, confirm the records are gone again and nothing else changed.

**D-Global Technologies LLC:** classified "real-name record, TEST-owned, provenance unverified". OPX-000021; created 2026-09-27 18:38 UTC by opsirix+test-owner@gmail.com via Create company workspace; 1 member (that account, owner); no boards, tasks, Core requests, Grid records, grants or notifications; 2 history entries. Excluded from TEST cleanup, tests and real-client workflows. Not renamed or deleted.

**Core email:** sending off; proposed preferences now off by default. Shared backend: no change. Preview only: Features & Releases entries. Nothing published; DNS unchanged.

## Update 2026-09-29 17:05 UTC: Stage 5 v3 and release-readiness tracker v2
- Stage 5 v3 (design only): member visibility limited to owner-granted scope; Admin/CEO aggregate status only, with a separate audited, time-limited support action for per-file size/date/uploader; outside professionals have accounts and a device key but no device-list screen; recovery envelope and metadata specified; share scope/expiry/revocation explicit, downloaded copies cannot be recalled. Incident times and leads open.
- Tracker v2 separates built in preview / active on shared backend / tested / ready for DevOps. No module is deployable until GitHub is connected. Directory positive filter test has not run; 0 real listings. Launch off publicly with 7 remaining checks.
- Shared backend: no change. Preview: no change. Nothing published; DNS unchanged.

## Update 2026-09-29 17:20 UTC: Stage 5 v4, tracker v3
- Stage 5 v4 (design only): every Admin/CEO metadata support action needs an owner approval naming purpose and scope, max 24 hours, no self-approval, no extension, owner-revocable, owner-visible audit. Outside-professional device change: fresh device authorization, pending device, owner device wraps only that document's key, owner sees and can revoke; no emailed file or key.
- Tracker v3: "Ready for DevOps" means technically complete; GitHub connection listed as a separate deployment dependency for all modules.
- Shared backend, preview: no change. Nothing published; DNS unchanged.

## Update 2026-09-29 17:53 UTC: Stage 5 v5, tracker v4, Launch review evidence
- Stage 5 v5 (design only): every new outside-professional device requires owner approval. Routine additions retain an old device only while it remains authorized and expose immediate revocation; a reported lost or compromised device is revoked within the same change flow. This remains pending security review.
- Sharing wording now states that downloaded copies may remain after sharing stops without implying ownership or rights. Recipient expiry is shown in local time with UTC for reference. Drive-link wording says Opsirix sees the stored link and label, while provider settings control file access; Opsirix does not verify those settings or apply Vault protection.
- Tracker v4 separates technical readiness, release approval and deployment verification. Public copy still needs owner sign-off; the member-directory positive filter test remains isolated-staging only; every deployed module needs a clean staging build and named role smoke tests.
- Launch remains off publicly. Proposed future placement is under the public Platform navigation and Platform overview, linking to `/platform/launch`; signed-in intake remains `/launch`.
- Shared backend: no change. Preview source: no change. Nothing published; DNS unchanged.
