-- SEO/AEO session, 21 Nov 2026 (owner approved publishing in chat).
-- 1. /about meta description was 160 characters; the Bing audit allows 120–159. Same facts, shorter.
update public.pages set
  seo_description = 'Learn about Online Quran College, established in 2019: our mission, qualified Quran teachers and live one-to-one Quran classes for children and adults.',
  updated_at = now()
where slug = 'about'
  and seo_description = 'Learn about Online Quran College, established in 2019. Explore our mission, qualified Quran teachers, and live one-to-one Quran classes for children and adults.';

-- 2. /blog/arabic-for-quran-readers ranks 36–54 for "learning quranic arabic" in the US, UK, Canada
-- and Australia (Search Console, 28 days to 21 Nov). Add a short answer-first paragraph at the top so
-- search and AI answers find a direct reply. No new claims: it restates steps the article already gives.
update public.blog_posts set
  body_html = '<p><strong>Short answer:</strong> to learn Arabic for understanding the Quran, first make sure you can read the Arabic script accurately, then study Quranic vocabulary and grammar with a teacher, starting from short passages you already recite. Review a few words often, and keep translation study alongside so you follow the meaning while your Arabic grows.</p>' || body_html,
  updated_at = now()
where slug = 'arabic-for-quran-readers'
  and deleted_at is null
  and body_html not like '<p><strong>Short answer:</strong>%';
