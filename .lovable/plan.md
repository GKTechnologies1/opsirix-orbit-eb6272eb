# Post-login UX and Core oversight plan

## Build
- Update the shared authenticated shells so public navigation never appears inside workspaces and phone navigation uses a visible menu/list rather than horizontal scrolling.
- Compact empty company sections in Opsirix OS while preserving real data and role-aware actions.
- Replace Staff Console filler summaries with current assigned-work actions and meaningful empty states.
- Make partner status guidance conditional so approved partners no longer see pre-approval review wording.
- Continue the founder, partner, staff, and Admin/CEO screen review, fixing shared usability, keyboard, focus, loading, empty-state, and reduced-motion issues within the post-login experience only.

## Core security
- Add a metadata-only Admin/CEO oversight projection containing request reference/title, company, status/timestamps, audit trail, and access-grant list.
- Stop Admin/CEO from receiving request descriptions or Flow task content unless the owner has granted that Admin/CEO account active request-scoped access.
- Keep unrelated staff unable to read either oversight data or request content.
- Present exceptional full access as a separate future workflow requiring a recorded reason and owner-visible audit event; do not silently add an override.

## Regression and evidence
- Create a second clearly labeled TEST company board and verify an outsider cannot add a task by direct request; keep all resulting records private.
- Retest Core reads for owner, editing member, granted staff, Admin/CEO without a grant, Admin/CEO with a grant where appropriate, and unrelated staff.
- Test founder, partner, staff, and Admin screens at desktop, tablet, and 390px, including keyboard-only navigation and reduced motion.
- Capture before/after screenshots, update the delivery tracker and Features & Releases evidence, and report shared-backend effects.

## Boundaries
- Do not change the public website, publish, or modify DNS.
- Keep Grid scoring, Launch, pricing, Vault, AI, and Core notifications gated.
