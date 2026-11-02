-- OQC public-claim remediation, 2 November 2026.
-- Idempotent CMS copy/settings updates. No schema or student/parent data changed.
-- These statements were applied to the active OQC Supabase project and read back.

UPDATE public.pages
SET excerpt = 'Online Quran College is an online academy offering live one-to-one Quran learning for children and adults, with course guidance and flexible lesson scheduling.',
    seo_description = 'Discover Online Quran College, an online academy offering live one-to-one Quran learning for children and adults, with course guidance and flexible lesson scheduling.',
    updated_at = now()
WHERE slug = 'about'
  AND status = 'published'
  AND deleted_at IS NULL;

UPDATE public.pages
SET body_html = replace(body_html, 'Online Quran College, United Kingdom', 'Online Quran College (online-only service)'),
    updated_at = now()
WHERE slug = 'privacy-policy'
  AND status = 'published'
  AND deleted_at IS NULL;

UPDATE public.settings
SET value = value - 'location',
    updated_at = now()
WHERE key = 'site.contact';

UPDATE public.settings
SET value = value - 'established',
    updated_at = now()
WHERE key = 'site.identity';

UPDATE public.pricing_plans
SET features = array_replace(features, 'Certified tutor', 'Teacher availability confirmed before enrolment'),
    updated_at = now()
WHERE status = 'published'
  AND is_public
  AND deleted_at IS NULL
  AND 'Certified tutor' = ANY(features);
