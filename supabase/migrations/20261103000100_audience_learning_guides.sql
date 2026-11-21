-- Two audience learning guides (3 Nov 2026 SEO plan): families who want a female teacher,
-- and reverts / new Muslims. Same cautious wording as the existing guides: no promised
-- timelines, prices or results; availability is always confirmed by the coordinator.
-- Rendered at /learn/female-quran-teacher and /learn/quran-for-reverts (LEARNING_GUIDES).
insert into public.pages (slug, title, excerpt, body_html, seo_title, seo_description, cover_url, cover_alt, status, published_at)
values
(
  'learning-female-quran-teacher',
  'Online Quran Classes with a Female Teacher',
  'Live one-to-one Quran lessons for sisters, girls and young children with a female teacher, arranged around your family''s routine.',
  $html$<h2>Choose a female teacher when you book</h2><p>On the <a href="/free-trial">free trial form</a> you can ask for a female or male teacher. The coordinator then confirms which female teacher is available for your course, teaching language and lesson times before classes begin. Lessons are live and one-to-one online, so the learner and the teacher work together without other students in the class.</p><h2>Who often asks for a female teacher</h2><ul><li>Sisters and adult women who prefer to learn with a woman, for comfort or privacy.</li><li>Mothers who would like lessons of their own alongside their children's routine.</li><li>Girls and younger children whose parents prefer a female teacher.</li></ul><p>A preference does not need a reason. Tell the coordinator what matters to your family, such as camera use, who will be in the room, or whether a parent will sit nearby with a young child.</p><h2>Courses you can ask about</h2><p>Tell the coordinator which course you want so that a female teacher's availability can be checked for that subject: <a href="/courses/noorani-qaida">Noorani Qaida</a> for reading foundations, <a href="/courses/quran-nazara">Quran reading with Tajweed</a>, <a href="/courses/hifz-quran">Hifz</a>, <a href="/courses/arabic-language">Arabic</a>, <a href="/courses/quran-translation">Quran translation</a> and <a href="/courses/hadith-translation">Islamic studies</a>. The <a href="/courses/tajweed">Tajweed guide</a> explains how pronunciation feedback works during a lesson.</p><h2>Questions to ask before regular classes</h2><ol><li>Which female teacher is proposed, and what relevant qualifications and experience does she have?</li><li>Which language will she use to explain?</li><li>Which days and times are available in your time zone?</li><li>How will progress and feedback be shared with you or with a parent?</li><li>What happens if a lesson needs to be rescheduled?</li></ol><h2>Learning as a family</h2><p>Some families book separate lessons for a mother and her children. Ask the coordinator how lesson times and packages can be arranged for more than one learner. The <a href="/pricing">fees page</a> lists the current packages and the sibling discount.</p>$html$,
  'Female Quran Teacher Online for Sisters & Kids',
  'Learn Quran online with a female teacher: live one-to-one lessons for sisters, girls and young children. Choose your preference when you book a free trial.',
  'https://lgbwidraztavhhbnbfhr.supabase.co/storage/v1/object/public/media/regenerated/2026-10/map-albania-r2-1200.webp',
  'A mother and her young daughter attentive to a female teacher on a laptop during a calm online lesson at home',
  'published',
  now()
),
(
  'learning-quran-for-reverts',
  'Learning the Quran as a New Muslim',
  'A calm, one-to-one way for reverts to start reading the Quran, understand its meaning and ask questions at their own pace.',
  $html$<h2>Start from the very beginning</h2><p>Many new Muslims meet the Arabic alphabet for the first time. <a href="/courses/noorani-qaida">Noorani Qaida</a> teaches the letters, their sounds and how they join, so reading the Quran becomes possible step by step. You do not need any previous Arabic, and each lesson goes at your pace with one teacher.</p><h2>Reading, meaning and practice are different goals</h2><p>Reading the Arabic text, understanding its meaning and learning how to practise Islam are related but separate goals. <a href="/courses/quran-translation">Quran translation</a> lessons focus on meaning in a language you understand, and <a href="/courses/hadith-translation">Islamic studies</a> lessons cover practical topics. Tell the coordinator which goal matters most right now so the first lessons stay focused.</p><h2>Short surahs for prayer</h2><p>If you are learning short surahs for salah, ask the teacher to listen as you recite and to correct your pronunciation. Listening to a teacher and reciting back, rather than relying on transliteration alone, helps you hear sounds that English letters cannot show. For questions about rulings, ask a scholar you trust; a Quran lesson focuses on reading and recitation.</p><h2>Ask questions freely</h2><p>One-to-one lessons give you room to ask questions without a class watching. You can request a female or male teacher and say which language helps you understand explanations. The <a href="/learn/quran-for-adults">guide for adult beginners</a> explains how to build a practice routine around work and family.</p><h2>Before you enrol</h2><ol><li>Describe your starting point: no Arabic, some letters, or some reading.</li><li>Agree the first goal: reading, meaning or practical topics.</li><li>Confirm the teaching language and lesson times in your time zone.</li><li>Ask about the package and how rescheduling works.</li></ol><p>A <a href="/free-trial">free trial</a> on an eligible plan is a simple way to meet a teacher before deciding. The Weekend plan is excluded from the free trial.</p>$html$,
  'Quran Classes for Reverts and New Muslims',
  'Live one-to-one Quran lessons for reverts and new Muslims: learn Arabic letters from the start, study meaning and practise at your own pace.',
  'https://lgbwidraztavhhbnbfhr.supabase.co/storage/v1/object/public/media/regenerated/2026-10/blog-translation-arabic-r2-1200.webp',
  'Adult learner reviewing an open reference book and taking notes beside a laptop',
  'published',
  now()
)
on conflict do nothing;
