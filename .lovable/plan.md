# Launch evidence and guided tours

## Build

- Add a versioned guided-tour system for the current signed-in roles: directory member, founder owner, editing member, viewer, partner, Operations Lead, Compliance Coordinator, and Admin/CEO.
- Show a short first-login orientation, then optional page-specific tours that explain the first useful action, record visibility, and required review or consent.
- For dual-role accounts, introduce the workspace switcher first and begin the relevant role tour only after a workspace is chosen.
- Add accessible Skip, Back, Next/Finish controls and a persistent **Take a tour** action under Help. Filter every step from current verified permissions so revoked access disappears immediately.
- Keep unavailable or gated capabilities out of tours: Vault, AI, Grid scoring, Core email, and public Launch.
- Add tour wording to Content & Catalog using the existing draft, preview, version, publish, restore, and unpublish controls. Initial wording remains draft/unpublished.

## Shared-backend changes

- Add a tour-completion table keyed by account, role, and tour version, with authenticated grants and owner-only row policies.
- Add authenticated operations to read, save, skip, finish, and restart tour progress without exposing another account’s records.
- Create one clearly labeled Launch TEST intake only through an approved allowlisted TEST company/account flow. Do not use D-Global or any real-name organization.

## Evidence and testing

- Capture founder Launch states at desktop and 390px: new draft, saved and resumed, review before send with scope notice, submitted, and correction requested.
- Capture Admin/CEO assignment plus assigned and unassigned Operations Lead views at both sizes.
- Test tour first login, skip, resume, replay, dual roles, revoked access, direct protected links, keyboard/focus, screen-reader labels, reduced motion, and 390px layout with TEST accounts only.
- List every Launch TEST record created on the shared backend and distinguish shared-backend changes from preview-only interface changes.
- Update the delivery tracker, release inventory, DevOps handoff, and architecture rules with implementation, tests, release limits, and the next unblocked tracker task.

## Release boundaries

- Keep Launch public access off and all tour content unpublished.
- Do not publish the site or change DNS.
- Leave Terms, retention deletion, Vault, AI, Grid scoring, Core email, and other gated work unchanged.
