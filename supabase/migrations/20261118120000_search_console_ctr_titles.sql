-- Search Console, last 90 days (checked 18 Nov 2026): these articles rank on page 1 or near it
-- for question searches but earned 0 clicks, because the search title did not echo the question.
-- Only seo_title / seo_description change; the visible article and its claims are unchanged.
update public.blog_posts set
  seo_title = 'Can Siblings Take Online Quran Classes With the Same Academy?',
  seo_description = 'Yes. Siblings can learn with the same online Quran academy, each on their own course and level. How to plan timetables, teachers, shared devices and family fees.',
  updated_at = now()
where slug = 'family-quran-learning-multiple-children' and deleted_at is null;

update public.blog_posts set
  seo_title = 'How Much Do Online Quran Classes Cost in the UK?',
  seo_description = 'What shapes the cost of online Quran classes in the UK: lesson length, lessons per week, GBP packages, trial terms and what to confirm in writing before enrolling.',
  updated_at = now()
where slug = 'online-quran-class-fees-uk-comparison' and deleted_at is null;

update public.blog_posts set
  seo_title = 'How to Learn Arabic to Understand the Quran: Where to Start',
  seo_description = 'Learning Quranic Arabic as a Quran reader: how Arabic study differs from reading practice and translation, and which first step suits your level.',
  updated_at = now()
where slug = 'arabic-for-quran-readers' and deleted_at is null;
