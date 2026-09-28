INSERT INTO public.release_records (feature_key, title, authorized_by, activated_by, activated_at, test_result, effect_preview, effect_live_site, effect_backend) VALUES (
 'launch-intake-preview', 'Launch intake and staff review (preview)',
 'Owner Stage 1 decision 2026-09-28: build and test revised intake in preview; not publication or legal/eligibility judgment',
 'Lovable implementation', now(),
 'Direct role checks 29/29 (save/resume, other-founder isolation, staff roles, correction and resubmission, audit); browser checks at 1280 and 390px.',
 'Founder /launch intake with draft/resume, review-before-send, confirmation and founder-visible message; Staff /staff/launch queue for Admin/CEO and Operations Lead. Scope notice shown without a required checkbox.',
 'No website publication or DNS change.',
 'Migrations 0052/0053 add Launch intake, review and event tables with RLS and two RPCs. Immigration status, visa, work authorization and government-matter fields are refused. One TEST intake OX-LAUNCH-000001 exists.');