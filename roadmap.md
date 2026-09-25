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
- [ ] Grid record structure + review screens (scoring disabled until criteria approved)
- [ ] Core (after Flow): managed operational requests, owner-granted scoped/time-limited staff access with immediate revoke, audited lifecycle; no Vault file access; no "free"/pricing labels.
- [ ] Grid: draft 25 evidence criteria from OPSIRIX_23 for review; record structure/permissions/draft screens only; scoring disabled.
- [x] Member list pagination verified with 12 TEST members (2 pages); history date range + role-filtered details (owners see person/end date; viewers see access/scope only). 25/25 browser+backend checks.
