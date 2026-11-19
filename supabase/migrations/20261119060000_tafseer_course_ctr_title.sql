-- E-35 (owner approved 19 Nov 2026): /courses/quran-translation had 61 Search Console impressions
-- and 0 clicks in the 28 days to 19 Nov; the top query was "quran tafseer classes online".
-- Only seo_title / seo_description change; the visible course page is unchanged.
update public.courses set
  seo_title = 'Online Tafseer Classes: Understand the Quran in English | OQC',
  seo_description = 'Live one-to-one online Tafseer classes: understand the meaning of the Quran in English with a teacher, no Arabic needed. 3-day free trial, no card.',
  updated_at = now()
where slug = 'quran-translation';
