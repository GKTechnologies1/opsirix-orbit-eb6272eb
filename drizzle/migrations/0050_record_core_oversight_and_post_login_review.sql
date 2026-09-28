INSERT INTO public.release_records (
  feature_key, title, authorized_by, activated_by, activated_at, test_result,
  effect_preview, effect_live_site, effect_backend
) VALUES
(
  'core-admin-metadata-oversight',
  'Core Admin/CEO metadata-only oversight',
  'Owner direction: oversight metadata without automatic request or Flow content access',
  'Lovable implementation', now(),
  'Direct role regression 10/10 for oversight boundary; combined Core and cross-company direct checks 16/16; responsive browser review 88/88.',
  'Admin/CEO sees Core organization, reference, title, status, timestamps, audit history and owner access-grant list. Request descriptions and linked Flow tasks remain hidden without an active owner grant.',
  'No website publication or DNS change.',
  'Migration 0049 removed the Admin/CEO bypass from Core read and handle authorization and added an Admin-only metadata projection. Unrelated staff receive no Core rows.'
),
(
  'flow-null-authorization-regression',
  'Flow and Core cross-company creation regression',
  'Owner direction: preserve cross-company creation fix and complete second-board task test',
  'Lovable implementation', now(),
  'Direct checks 6/6 against a second labeled TEST board: owner of another company, viewer, Operations Lead, partner and Admin/CEO could not add a task; zero rows created.',
  'No public or authenticated UI publication.',
  'Confirms migration 0046 remains effective. Root cause: flow_can_edit returned NULL for non-members and an earlier caller treated only FALSE as denial; COALESCE now makes non-members explicitly false.'
),
(
  'post-login-ux-review',
  'Post-login workspace usability review',
  'Owner-approved post-login design fixes',
  'Lovable implementation', now(),
  'Browser checks 88/88 across desktop, tablet and 390px mobile with keyboard-opened menus and reduced motion; latest automatic preview build OK.',
  'Preview-only shell changes: discoverable wrapped navigation, compact empty companies, action-oriented Staff Console, accurate partner status guidance, and useful Admin review empty state.',
  'No website publication or DNS change.',
  'No role, content, listing, pricing, category or client-data changes.'
);
