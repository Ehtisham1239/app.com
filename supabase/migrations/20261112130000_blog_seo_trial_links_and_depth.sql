-- 12 Nov 2026: blog SEO follow-up from the read-only audit of the 37 published articles.
-- 1) Nine articles that had no /free-trial link get one closing sentence (trial wording matches the
--    existing articles: free trial on an eligible plan; no price, discount, outcome or date claim).
-- 2) Five thin articles (299-388 words) get practical study-routine sections. No religious rulings,
--    interpretations, sources or credentials are added; religious wording still needs qualified review.
-- Each statement is guarded, so it is a no-op for a missing slug or when the change is already there,
-- and it only touches published, non-deleted English rows. updated_at moves only when a row changes.

update public.blog_posts
   set body_html = rtrim(body_html) || E'\n' || $h$<p>If you would like to see how lessons could work for each child, <a href="/free-trial">request a free trial</a> on an eligible plan and share each learner's starting point and your preferred lesson times.</p>$h$, updated_at = now()
 where slug = 'family-quran-learning-multiple-children' and locale = 'en' and status = 'published' and deleted_at is null
   and body_html not ilike '%/free-trial%';

update public.blog_posts
   set body_html = rtrim(body_html) || E'\n' || $h$<p>To hear how a teacher checks pronunciation in a live lesson, <a href="/free-trial">request a free trial</a> on an eligible plan and tell the coordinator what you can already read.</p>$h$, updated_at = now()
 where slug = 'importance-of-reciting-quran-with-tajweed' and locale = 'en' and status = 'published' and deleted_at is null
   and body_html not ilike '%/free-trial%';

update public.blog_posts
   set body_html = rtrim(body_html) || E'\n' || $h$<p>If you would like to test this planning framework with a teacher, <a href="/free-trial">request a free trial</a> on an eligible plan and describe your starting point and the practice time you have.</p>$h$, updated_at = now()
 where slug = 'adult-quran-beginner-first-month' and locale = 'en' and status = 'published' and deleted_at is null
   and body_html not ilike '%/free-trial%';

update public.blog_posts
   set body_html = rtrim(body_html) || E'\n' || $h$<p>To experience how feedback works in a live lesson, <a href="/free-trial">request a free trial</a> on an eligible plan and tell the coordinator which sounds you want to improve.</p>$h$, updated_at = now()
 where slug = 'tajweed-practice-with-feedback' and locale = 'en' and status = 'published' and deleted_at is null
   and body_html not ilike '%/free-trial%';

update public.blog_posts
   set body_html = rtrim(body_html) || E'\n' || $h$<p>A trial lesson shows how a teacher gives feedback. <a href="/free-trial">Request a free trial</a> on an eligible plan and ask how progress is reviewed with parents.</p>$h$, updated_at = now()
 where slug = 'parent-teacher-quran-progress-review' and locale = 'en' and status = 'published' and deleted_at is null
   and body_html not ilike '%/free-trial%';

update public.blog_posts
   set body_html = rtrim(body_html) || E'\n' || $h$<p>Ready to compare times? <a href="/free-trial">Request a free trial</a> on an eligible plan and write your city, preferred date and local time together so the coordinator can confirm the arrangement.</p>$h$, updated_at = now()
 where slug = 'quran-lessons-australia-time-zones' and locale = 'en' and status = 'published' and deleted_at is null
   and body_html not ilike '%/free-trial%';

update public.blog_posts
   set body_html = rtrim(body_html) || E'\n' || $h$<p>A teacher can hear your recall and set a revision routine that fits you. <a href="/free-trial">Request a free trial</a> on an eligible plan to discuss a suitable starting point.</p>$h$, updated_at = now()
 where slug = 'memorization-techniques-for-beginners' and locale = 'en' and status = 'published' and deleted_at is null
   and body_html not ilike '%/free-trial%';

update public.blog_posts
   set body_html = rtrim(body_html) || E'\n' || $h$<p>To discuss a revision routine around the school week, <a href="/free-trial">request a free trial</a> on an eligible plan and share the learner's timetable.</p>$h$, updated_at = now()
 where slug = 'hifz-revision-with-school' and locale = 'en' and status = 'published' and deleted_at is null
   and body_html not ilike '%/free-trial%';

update public.blog_posts
   set body_html = rtrim(body_html) || E'\n' || $h$<p>Want to see how a live lesson feels for your child? <a href="/free-trial">Request a free trial</a> on an eligible plan and tell the coordinator your child's age and what they can already read.</p>$h$, updated_at = now()
 where slug = 'help-your-kids-learn-quran-online' and locale = 'en' and status = 'published' and deleted_at is null
   and body_html not ilike '%/free-trial%';

update public.blog_posts
   set body_html = replace(body_html, $a$<h2>Questions to ask before enrolling</h2>$a$, $h$<h2>Prepare for your first Tafseer lesson</h2><p>Choose one short passage before the lesson, perhaps a surah you already recite, and read its translation once. Write down any words or ideas that are unclear. A specific passage gives the teacher something concrete to explain and makes it easier to judge whether the level and language of explanation suit you.</p><p>During the lesson, listen to the full explanation before adding your own interpretation. Keep a notebook with two columns: what the teacher explained and your own questions. If a question touches on a legal ruling or a disputed matter, ask the teacher how such questions are handled rather than reaching a conclusion from a single source. This guide describes how study is organised; it is not a source of religious rulings.</p><h2>Review what you have learned</h2><p>Return to the same passage a few days later and try to explain it in your own words. Notice which ideas you can recall without notes and which need another explanation. Bring those gaps to the next lesson so the teacher can adjust the pace. Understanding grows through repeated, guided study rather than a single lesson.</p>$h$ || $a$<h2>Questions to ask before enrolling</h2>$a$), updated_at = now()
 where slug = 'online-tafseer-classes-what-you-learn' and locale = 'en' and status = 'published' and deleted_at is null
   and body_html like $a$%<h2>Questions to ask before enrolling</h2>%$a$ and body_html not like $h$%<h2>Prepare for your first Tafseer lesson</h2>%$h$;

update public.blog_posts
   set body_html = replace(body_html, $a$<h2>Questions to ask before starting</h2>$a$, $h$<h2>What a realistic first conversation covers</h2><p>A useful first conversation covers the learner's current reading level, how much time is available each day, whether anything has been memorised before and how revision will fit around school or work. The teacher can then suggest a starting portion and describe how often it will be reviewed. Ask what would show that the pace needs to change; that is more helpful than being given a single completion date.</p><p>No guide can say how long a particular learner will take. Some learners progress steadily, others pause for exams, illness or travel, and many return to older portions before moving forward. Treat any timeframe as a planning estimate to review with the teacher, not a promise.</p><h2>Keep a simple revision record</h2><p>Note each day what was new, what was revised and anything that felt uncertain. Bring the record to lessons so the teacher can see patterns, such as a portion that needs more frequent review. Avoid comparing your pace with another learner's; retention, reading fluency and available time all differ.</p>$h$ || $a$<h2>Questions to ask before starting</h2>$a$), updated_at = now()
 where slug = 'how-long-does-hifz-take-online' and locale = 'en' and status = 'published' and deleted_at is null
   and body_html like $a$%<h2>Questions to ask before starting</h2>%$a$ and body_html not like $h$%<h2>What a realistic first conversation covers</h2>%$h$;

update public.blog_posts
   set body_html = replace(body_html, $a$<h2>Plan for steady practice</h2>$a$, $h$<h2>Build vocabulary from passages you already know</h2><p>Many learners find it easier to start with short passages they have already heard or recited. Pick a few words and ask the teacher to show where else they appear, what pattern they follow and how they change within a sentence. Seeing the same word in several places helps recognition without needing a long vocabulary list at the start.</p><p>Use a notebook sparingly and only for words the teacher has explained. Keep each entry short: the word, a meaning agreed with the teacher and the passage where you met it. Review a small set often rather than a large set rarely.</p><h2>Set expectations for pace</h2><p>Learning to understand Arabic takes sustained practice, and the pace depends on the course, your previous experience and the time you can give each week. Ask the teacher how progress will be shown, for example reading a short unfamiliar sentence with support, and avoid judging yourself against a fixed deadline.</p>$h$ || $a$<h2>Plan for steady practice</h2>$a$), updated_at = now()
 where slug = 'arabic-for-quran-readers' and locale = 'en' and status = 'published' and deleted_at is null
   and body_html like $a$%<h2>Plan for steady practice</h2>%$a$ and body_html not like $h$%<h2>Build vocabulary from passages you already know</h2>%$h$;

update public.blog_posts
   set body_html = replace(body_html, $a$<h2>Ask questions in the right place</h2>$a$, $h$<h2>Choose a passage that fits your level</h2><p>Start with a short passage rather than a long one, and read the translation more than once before the lesson. Short passages let you notice repeated words and themes, and they leave time for questions. If one verse seems to conflict with another, note it down and ask your teacher instead of settling it alone.</p><h2>Track what you have understood</h2><p>After each lesson, write two or three sentences summarising the explanation in your own words, and mark anything you could not follow. Reading these notes before the next lesson helps you see whether you are building understanding or only collecting facts. Share the notes with your teacher so explanations can be adjusted to your level.</p>$h$ || $a$<h2>Ask questions in the right place</h2>$a$), updated_at = now()
 where slug = 'quran-translation-tafseer-beginners' and locale = 'en' and status = 'published' and deleted_at is null
   and body_html like $a$%<h2>Ask questions in the right place</h2>%$a$ and body_html not like $h$%<h2>Choose a passage that fits your level</h2>%$h$;

update public.blog_posts
   set body_html = replace(body_html, $a$<h2>Questions to ask the teacher</h2>$a$, $h$<h2>What a lesson might look like at this stage</h2><p>A Noorani Qaida lesson usually revisits the previous page, introduces a small amount of new material and ends with the learner reading aloud. Teachers often mark which letters or joined shapes need another pass. Short, frequent practice generally suits young children, while adults may prefer a slightly longer, focused session.</p><p>If progress feels slow, ask the teacher where the learner is hesitating. A single sound, a vowel mark or letters that look alike can hold up an otherwise fluent page, and a targeted exercise often helps more than repeating the whole page.</p>$h$ || $a$<h2>Questions to ask the teacher</h2>$a$), updated_at = now()
 where slug = 'how-long-to-learn-noorani-qaida' and locale = 'en' and status = 'published' and deleted_at is null
   and body_html like $a$%<h2>Questions to ask the teacher</h2>%$a$ and body_html not like $h$%<h2>What a lesson might look like at this stage</h2>%$h$;
