# Opsirix Nexus Foundation

## Goal
Build the secure foundation for a professional partner network in the selected Professional Dark Enterprise direction, while preserving all five discovery-call records and the existing public website.

## Immediate repairs
- Fix `/platform` nesting so each of the nine module URLs renders its own page.
- Replace the fake `/for-partners` success state with a persisted application path; never show success until the record is saved.
- Centralize module names, links, descriptions, and availability flags, then include all module pages in the sitemap.

## Data and access foundation
- Enable email account access for applicants and staff.
- Add separate tables for profiles, user roles, partner applications, credentials, review events, and QR/campaign attribution.
- Keep roles in a dedicated table and enforce admin checks on the server.
- Use row-level access rules so applicants can see and edit only their own draft/application data; admins can review applications; public visitors cannot read applicant or credential data.
- Add a private document bucket for credential files with type and size restrictions.
- Preserve `discovery_call_submissions` unchanged and keep email failure non-blocking after successful saves.

## Screens and flows
- `/partner/apply`: accessible stepped registration with organization, professional details, credentials, review, validation, saved progress, and the approved human-review copy.
- `/auth`: sign-in and account entry for applicants and staff.
- `/partner`: protected partner workspace with application status, required actions, profile readiness, credentials, and introduction placeholders driven only by real records.
- `/admin/applications`: protected admin queue and application review detail with approve, request-changes, and decline actions plus review history.
- `/directory`: future-facing shell that publishes only approved fields; show an honest empty state until approved profiles exist.
- `/join/$code`: poster/QR entry route that validates and records campaign attribution before registration.

## Design system
- Reuse the real Opsirix logo, Sora, Inter, JetBrains Mono, navy, blue, and cyan.
- Map brand, surface, border, success, warning, and error roles into one semantic token system.
- Build a responsive private workspace shell using the selected dark enterprise direction.
- Use precise icons instead of emojis, restrained state transitions, visible keyboard focus, 44px mobile targets, screen-reader announcements, and reduced-motion behavior.
- Keep applicant information out of public pages and analytics.

## Technical details
- TanStack Start file routes and protected server functions; no framework replacement.
- Shared Zod schemas for browser and server validation.
- Server-side role verification before privileged reads or writes; privileged client only after verification.
- Database migration includes explicit grants, RLS, indexes, timestamps, and audit-safe status transitions.
- Public partner submission receives honeypot and server-side abuse protection.
- Unique route metadata for every new content route.

## Validation
- Verify discovery-call records remain intact.
- Test registration, save/resume, application submission, applicant isolation, admin review, and unauthorized access.
- Test module routes, sitemap, keyboard flow, validation/error announcements, and desktop/mobile layouts.
- Confirm the preview builds without errors and inspect the completed screens in-browser.

## Delivery boundary
This phase creates the network foundation and review workflow. Real partner introductions, messaging, billing, and public directory launch remain later features; no fabricated profiles, activity, metrics, or testimonials will be added.
