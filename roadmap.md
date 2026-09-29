# Roadmap

Full tracker: /mnt/documents/opsirix-delivery-tracker.md. Do not publish until reviewed.

- [x] Shared public header layout fix, verified across all public routes
- [x] Staff/workspace shell mobile empty space fix
- [x] Closed categories hidden from visitor, member, partner (direct checks)
- [x] /staff overview role tests; platform audit history limited to Admin/CEO
- [x] Nexus help requests for all six categories (preview form; server requires open category)
- [x] Consent-based introductions built and tested with TEST accounts (preview; backend live)
- [ ] Publish Nexus help/directory/requests pages — blocked: automatic preview build fails intermittently (Lovable support)
- [x] University/Banking/Insurance opened for applications and help requests 2026-09-25 17:56-17:58 UTC; no listings published
- [x] Company history direct-read gap closed: full rows only for owners/Admin; others get role-limited projection (5 roles tested directly + page)
- [x] opsirix.com finding: owner keeps current live site; recorded in DevOps handoff v2. No TEST Content publishing against shared backend
- [ ] Flow, Grid, Core: proposals presented 2026-09-25 20:15 UTC; blocked on owner decisions (Flow without Launch, Grid 25 criteria text, Core scope)
- [ ] Launch: blocked on OPSIRIX_05 intake document
- [ ] Vault, AI — blocked: privacy architecture + specialist review
- [ ] Visual redesign (separate track) — needs direction review
- [ ] Terms acknowledgement — blocked: versions/wording; rate-limit cleanup — blocked: retention policy
- [x] Content & Catalog portal (homepage Nexus section + catalog controls) built and tested in preview
- [x] Portal: homepage common questions (1-12 Q&A, reorder, preview, long-dash check); draft/publish/restore/unpublish 19/19, editor 8/8 desktop+390 (2 false alarms from test wording, confirmed by screenshot); left unpublished, built-in text shows
- [x] Portal fixes: FAQ preview heading visible, reorder buttons in a row at 390px, long-dash block removed (was a style rule, not technical); FAQ 19/19 backend + 8/8 browser rerun
- [x] Portal: Founders intro, Partners intro, Nexus questions (hidden until published; no new public wording); 37/37 backend, 12/12 browser; all left unpublished
- [x] Audit search in Staff Console (Admin/CEO only) + request search; founder company history search
- [ ] Connect GitHub and opsirix.com — owner action
- [x] Announcement bar broadened; founder card line icons
- [x] Domain and 137-vs-91 catalog reconciliation (report: opsirix-nexus-rollout-v1.md)

## Activation phase (2026-09-25)
- [x] Intro decline/withdraw/failed-notice tests (preview + shared backend)
- [x] Company viewer/member invitations by email (owner only)
- [x] Admin introduction monitoring counts on /staff
- [x] Introductions enabled 2026-09-25 18:46:36 UTC (wording approved; portal vs email history; notice-only retry)
- [ ] Publish Nexus pages to opsirix.lovable.app: blocked on intermittent managed build error (escalate to Lovable support)
- [ ] Pricing (schedule approval), Terms acknowledgement (wording), retention (period), Vault/AI (privacy/security review), Launch (OPSIRIX_05)

## Access and handoff (2026-09-25 19:15 UTC)
- [x] Header Sign in / Create account (desktop + mobile), /account switcher, role routing; 49/49 checks
- [x] DevOps handoff v1 (clean build 3/3 outside Lovable)
- [ ] Fill repo/branch/commit in handoff v2: blocked on owner connecting GitHub; not "synced" until a fresh checkout of that commit builds
- [x] DevOps handoff v2: staging must use an isolated backend (36 setup steps, storage + email tests, staging vs production variable names)
- [x] Dual-access TEST account (`test-dual-access@example.test`), workspace switching and permission checks 39/39; Staff search 14/14
- [x] Auth copy fixes + Opsirix team sign in → /staff; 24/24 role checks
- [x] Founder help-request history: details sent, request status, search/filter/sort/pages/row numbers
- [x] OPX-000001 references: permanent, sequence-assigned (8 simultaneous = 8 distinct), never reused; 12 backfilled by creation date; Admin/CEO search + merge (lower number kept)
- [x] Partner introductions: private workspace notes, personal read/unread, follow-up flags, search/filter/sort; 33/33 backend boundary checks, 24/24 browser
- [x] Shared list controls (search, filters, sort, pages, counts, empty states, row numbers) on founder requests, partner introductions, staff requests, OPX search
- [x] Company history + member list controls (search, filter, sort, pages, counts, row numbers); co-member names/emails only to owners; 16/16 browser + direct checks
- [x] Company history: date range, kind and who-did-it (names only for owners; others see "A company member"/"Opsirix"); member pages with 12 TEST members (test-company-member-01..12@example.test in "TEST concurrency org 0"); 18/18 + 16/16 regression
- [ ] Show OPX in staff organization views as they are built (ongoing rule)
- [x] Renamed OPX-000012 to "TEST – GK Technologies (fictional record)", audit event recorded; no database link to real data


## Owner direction received 2026-09-25 (uploaded note)
- [x] Flow phase 1 (preview /flow, /partner/tasks; 34/34 backend, 8/8 browser): owner-created boards without Launch; tasks (owner, due date, status); owner may delegate create/assign; viewers read-only; staff escalations within assigned work with audited clearing; partner sees only explicitly shared tasks.
- [x] Flow phase 1 completion: editing member + assigned staff browser checks, escalation hold (OX-ESC refs, Blocked until 10+ char written clearance, prior status restored, audited), owner share preview, share stop ends access; 56/56 (desktop+390, direct backend)
- [x] Flow hold reviewer rule (2026-09-28): assigned reviewer (not raiser) or explicit audited Admin/CEO override clears; edits during hold logged and shown; 33/33 backend, 20/20 browser. Fixed outsider-edit gap (flow_can_edit null-safe).
- [x] Grid records + review screens (/grid): separate self-assessment and staff evidence review, drafts private, submitted final, no score field; 22/22 backend, browser checks passed. Scoring OFF.
- [x] Core phase 1 (/core): request → staff accept (own Flow board) → tasks → ready → owner close/reopen; revoke stops staff immediately; audited; 29/29 backend + partner 12/12, browser passed.
- [ ] Grid scoring + 25 criteria text: BLOCKED on owner approval of rewritten criteria and specialist review.
- [ ] Core time-limited scope labels / notifications: not started (no approved notification spec).
- [x] Member list pagination verified with 12 TEST members (2 pages); history date range + role-filtered details (owners see person/end date; viewers see access/scope only). 25/25 browser+backend checks.

## 2026-09-28
- [x] Core: owner grants request-scoped staff access (scope, purpose, end date), revoke, audit; applies to Core Flow boards (backend 62/62, browser 8/8)
- [x] Cross-company creation regression (Flow boards/tasks, Core) + Features & Releases record
- [x] Opsirix OS founder overview /os (browser 20/20); Staff Console links (18/18)
- [x] Notifications for Core access/requests: in-app phase 1 done; email pending approval
- [x] Post-login UI/UX fixes: workspace-only chrome, discoverable mobile menus, compact empty companies, action-oriented Staff Console, status-aware partner guidance; desktop/tablet/390 + keyboard/reduced-motion checks
- [x] Core Admin/CEO oversight is metadata-only unless the owner grants active request-scoped access; unrelated staff receive no Core data
- [ ] Grid scoring: blocked on 25 criteria + specialist review

- [x] Core Admin oversight direct regression: metadata/history/grants visible; descriptions and linked tasks hidden without owner grant (16/16 combined direct checks)
- [x] Missing second-company board regression: outsiders cannot add tasks; zero rows created (6/6)
- [x] Post-login review final: founder, partner, staff and Admin at desktop/tablet/390; keyboard menu and reduced motion (88/88); latest automatic preview build OK
- [x] Expanded signed-in review: directory uses signed-in chrome/navigation; Staff Console duplicate/blank states fixed; 144/144 desktop/390 role checks and expanded Core 16/16 direct checks; evidence and DevOps handoff recorded
- [x] 2026-09-28 19:45 UTC evidence summary delivered (routes, Core oversight fields, cross-company board, screenshots). Gap: no Compliance Coordinator screenshots were saved (checks were assertion-only) — capture next UI pass
- [ ] Next ready tasks: none unblocked. Grid scoring (criteria + specialist), Launch (OPSIRIX_05), Core notifications (no approved spec), pricing (schedule), Terms (wording), retention (period), Vault/AI (reviews), GitHub (owner), publishing (build stability)
- [x] Core note redaction for Admin/CEO oversight (past + current, direct + page); 37/37 direct, 16/16 regression
- [x] Compliance Coordinator desktop/390 screenshots added to handoff
- [x] Core in-app notifications phase 1 (/notifications; no email); browser 43/43. Email delivery: not built, needs owner approval of recipients/rules
- [ ] Journey review continuation: founder/partner/staff loading+error states pass remaining; minor: empty space under Core access panel (cosmetic)
- [x] Journey review: Core access gap (leaked public spacing), Staff Console load-failure state, Core actor labels (no raw IDs); 191/192 browser (1 test limitation), 9/9 labels, 43/43, 16/16
- Next ready: none unblocked. Blockers unchanged: Grid scoring, Launch (OPSIRIX_05), pricing, Terms wording, retention period, Vault/AI reviews, GitHub connection, publishing, Core email approval

- [x] Partner overview load-error state + retry (tested 2026-09-28)
- [x] Institutional categories public presentation accurate; 0 listings (tested 2026-09-28)

## 2026-09-29 Stage 5 and Launch review
- [x] Stage 5 v5 records owner approval for every outside-professional device, old-device handling, lost/compromised revocation, and revised sharing/expiry/Drive-link wording; Vault and AI remain unbuilt pending review.
- [x] Tracker v4 separates technical readiness, release approval and deployment verification.
- [ ] Launch owner review: founder and staff desktop/390 screenshots supplied; public wording, retention treatment and all seven release checks still require approval.

## 2026-09-28 21:00 UTC
- [x] University Programs, Banking Partners, Insurance Brokers: complete. Applications and help requests open; 0 public listings each; public copy preview-only for DevOps
- [x] Decision packet v1 prepared (Files: opsirix-decision-packet-v1.md): Launch intake, Grid 25 criteria, Terms, retention, Core email, Vault/AI, pricing. All gates remain off pending owner answers
- [ ] Staging positive directory-filter test with approved TEST listings: blocked on isolated staging backend (never on shared live)

## Launch Stage 1 (owner decision 2026-09-28)
- [x] Revised intake built in preview (/launch), staff queue (/staff/launch), migrations 0052/0053 live; 29/29 direct checks, browser 1280/390.
- [ ] Owner to approve final scope-notice wording before any required checkbox (blocked: owner).
- [ ] Launch activation/publication (blocked: owner review). Stages 2–5 not approved.
- [ ] OPSIRIX_04_How_We_Work.docx unreviewed until received.
- [x] Launch scope notice approved (informational, no checkbox). Assignment scoping migration 0055: 31/31 direct, screen checks per role.
- [ ] Grid Stage 2 revised criteria awaiting owner approval (/mnt/documents/opsirix-grid-criteria-v2.md); scoring off.
- [x] Launch owner-review evidence: new allowlisted TEST intake OX-LAUNCH-000004 in TEST Founder Company; draft, resume, review/scope, submit, correction, Admin assignment and assigned/unassigned Operations Lead captured at desktop/390 where applicable. Public Launch remains off.
- [x] Launch saves are company-scoped (0059): current membership required and an open intake cannot move companies.
- [x] Guided tours built in preview for directory member, founder owner, editing member, viewer, partner, Operations Lead, Compliance Coordinator and Admin/CEO; dual-role switcher first; progress keyed by account/role/version with access rechecked on save; draftable tour copy remains unpublished.
- [x] Guided tours all-role, revoked-access, 390px and protected-link checks on shared backend with TEST Staging Co (2026-09-29)
- [ ] Guided tours tour-wording publish/restore round trip: blocked on owner decision (publish is not TEST-restricted)
- [ ] Guided tours isolated-staging validation: blocked on DevOps isolated backend + GitHub
