Public navigation stays sticky in normal document flow, and navbar responsive rules must be scoped to `.site-header`; this reserves dynamic announcement height and prevents page-header collisions.Website content edits go through Admin-only security-definer functions (save_content_draft/publish/restore) with versioned rows, and public reads use published_site_content with code fallbacks; this keeps history, blocks pricing, and never touches category/consent rules.

After sign-in everyone lands on `/account`, which reads verified access server-side (getMyAccess) and forwards single-workspace users or shows a switcher; staff access is never self-registered.

Company history: raw audit rows are readable only by company owners and Admin/CEO; members, viewers and granted staff read through company_history_view, so private fields never leave the database.

Core oversight: Admin/CEO receives metadata, status, audit, and grant lists through core_admin_oversight; full request and linked Flow content requires an active owner grant, preventing silent privileged content access.

Every authenticated `/nexus/*` page uses signed-in workspace chrome, including the free member directory; public navigation never renders above a protected workspace.
- Core notifications are in-app only, created by database triggers with a per-recipient unique key; expiry notices are recorded lazily on fetch because expiry has no event.
- Launch intake review access: Admin/CEO reads and assigns all submitted intakes; an Operations Lead reads/acts only on intakes with an active assignment (launch_can_review); drafts are founder-only. Why: least-privilege triage per owner decision 2026-09-28.

- Grid v3 answers live one row per criterion (grid_criterion_answers) and each review stores criteria_version; later wording changes never rewrite submitted history.

- TEST orgs require the allowlist and guard. Tours key state by verified role/version and recheck access on write.
- Staging database setup runs scripts/staging-setup.sh (base table if absent, then drizzle journal only); release-history SQL lives in docs/release-history, never in drizzle/migrations. Why: repeatable clean setup with no production records.
