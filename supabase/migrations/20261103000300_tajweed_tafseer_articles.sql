-- November 2026 articles, round two, from Search Console gaps (28 days to 3 Nov):
-- Tajweed searches (US, ~position 25) and Tafseer course searches (US, positions 70-100).
-- Tajweed rules follow the standard Hafs 'an 'Asim reading taught on the site; short Quran
-- words are given as examples. Answer first; no promised timelines or results.
insert into public.blog_posts (slug, title, excerpt, body_html, cover_url, cover_alt, category, tags, author_name, reading_minutes, status, seo_title, seo_description, published_at)
values
(
  'tajweed-rules-for-beginners',
  'Tajweed rules for beginners, with examples',
  'The first Tajweed rules most learners meet: Noon Sakinah and Tanween, Meem Sakinah, Qalqalah, Ghunnah and the natural Madd, each with a short example.',
  $html$<p>The first Tajweed rules most beginners learn are the four rules of Noon Sakinah and Tanween, the three rules of Meem Sakinah, Qalqalah, Ghunnah and the natural Madd. Each one describes how a sound changes in a particular position. They are learned best by listening to a teacher, reciting, and being corrected one rule at a time.</p>
<h2>1. Noon Sakinah and Tanween</h2><p>A Noon with a sukoon (نْ) or a Tanween (ً ٍ ٌ) is pronounced in one of four ways, depending on the letter that follows it.</p><ul><li><strong>Izhar (clear):</strong> before the six throat letters ء ه ع ح غ خ the Noon is pronounced clearly, as in مَنْ آمَنَ.</li><li><strong>Idgham (merging):</strong> before the letters ي ر م ل و ن the Noon merges into the next letter. With ي ن م و it merges with a nasal sound (ghunnah), as in مَن يَقُولُ; with ل ر it merges without ghunnah, as in مِن رَّبِّهِمْ.</li><li><strong>Iqlab (changing):</strong> before ب the Noon changes to a light Meem sound with ghunnah, as in مِنۢ بَعْدِ.</li><li><strong>Ikhfa (hiding):</strong> before the remaining fifteen letters the Noon is hidden in a nasal sound, as in مِنْ قَبْلِ and أَنتُمْ.</li></ul>
<h2>2. Meem Sakinah</h2><ul><li><strong>Ikhfa Shafawi:</strong> before ب the Meem is hidden with ghunnah, as in تَرْمِيهِم بِحِجَارَةٍ.</li><li><strong>Idgham Shafawi:</strong> before another م the two merge with ghunnah, as in لَهُم مَّا.</li><li><strong>Izhar Shafawi:</strong> before every other letter the Meem is pronounced clearly, as in لَكُمْ دِينُكُمْ.</li></ul>
<h2>3. Qalqalah</h2><p>The letters ق ط ب ج د make a slight echo when they carry a sukoon, remembered by the phrase قُطْبُ جَدٍّ. The echo is strongest when you stop on the letter, as at the end of قُلْ هُوَ ٱللَّهُ أَحَدٌ, read as أَحَدْ.</p>
<h2>4. Ghunnah</h2><p>A Noon or Meem with a shaddah (نّ مّ) is held with a nasal sound for about two counts, as in إِنَّ and ثُمَّ.</p>
<h2>5. The natural Madd</h2><p>A long vowel (ا after a fatha, و after a damma, ي after a kasra) is stretched for two counts when no hamza or sukoon follows, as in قَالَ. Longer Madd types come later, once this one is steady.</p>
<h2>How to practise</h2><ol><li>Learn one rule at a time and find it in the passage you are already reading.</li><li>Listen to your teacher recite the example, then recite it back.</li><li>Ask for one correction per lesson and practise only that before the next one.</li><li>Record yourself and compare with the teacher's recitation, but let the teacher confirm the correction.</li></ol><p>If letters and vowels are still unsure, <a href="/courses/noorani-qaida">Noorani Qaida</a> comes first. When reading is steady, <a href="/courses/quran-nazara">Quran reading with Tajweed</a> applies these rules lesson by lesson. The <a href="/courses/tajweed">Tajweed guide</a> explains how feedback works, and <a href="/blog/tajweed-practice-with-feedback">this article</a> shows how to turn a correction into practice.</p>$html$,
  'https://lgbwidraztavhhbnbfhr.supabase.co/storage/v1/object/public/media/regenerated/2026-10/map-australia-melbourne-r2-1200.webp',
  'A parent sitting nearby while a teenage girl follows an online Tajweed lesson in a calm home study with Quran learning materials',
  'Tajweed',
  array['Tajweed','Tajweed rules','Noon Sakinah','Quran recitation'],
  'Online Quran College',
  6,
  'published',
  'Tajweed Rules for Beginners, with Examples',
  'The first Tajweed rules: Noon Sakinah and Tanween, Meem Sakinah, Qalqalah, Ghunnah and the natural Madd, each explained with a short Quran example.',
  now()
),
(
  'online-tafseer-classes-what-you-learn',
  'Online Tafseer classes: what you learn and how to choose',
  'Tafseer explains the meaning and context of the Quran. What an online Tafseer lesson covers, how it differs from translation, and what to ask before enrolling.',
  $html$<p>Tafseer is the explanation of the Quran: what each verse means, the context in which it was revealed, how it connects to other verses and Hadith, and what scholars have said about it. An online Tafseer class goes through a passage with a teacher, reading the verses, their translation and the explanation, with time for your questions.</p>
<h2>Translation and Tafseer are different</h2><p>A translation gives the meaning of the words in another language. Tafseer goes further: it explains why a verse was revealed, what its words mean in Arabic, and how scholars have understood it. Many learners begin with translation and add Tafseer when they want to understand a passage in depth. <a href="/blog/quran-translation-and-arabic-difference">Quran translation or Arabic?</a> compares those goals.</p>
<h2>What a lesson usually covers</h2><ul><li>Reading the passage in Arabic, with correction where needed.</li><li>The translation, word by word for key terms.</li><li>The context of revelation, where it is known.</li><li>The explanation given by classical scholars.</li><li>Lessons for daily life and your own questions.</li></ul>
<h2>Which works are used</h2><p>Teachers often draw on well-known classical works such as Tafsir Ibn Kathir and Tafsir al-Jalalayn, alongside modern explanations in English or Urdu. Ask the coordinator which works and language the proposed teacher uses, so the level suits you.</p>
<h2>Do you need Arabic first?</h2><p>No. Tafseer can be studied through English or Urdu explanation. Some Arabic helps you follow key words, and learners who want that can add <a href="/courses/arabic-language">Arabic lessons</a> later.</p>
<h2>Questions to ask before enrolling</h2><ol><li>Which surahs or themes will we start with?</li><li>Which language will the teacher explain in?</li><li>Which Tafseer works does the teacher use?</li><li>Is the course one-to-one, and how are questions handled?</li><li>How will progress be reviewed?</li></ol><p>Read about the <a href="/courses/quran-translation">Quran translation and Tafseer course</a>, or meet a teacher in a <a href="/free-trial">free trial</a> on an eligible plan.</p>$html$,
  'https://lgbwidraztavhhbnbfhr.supabase.co/storage/v1/object/public/media/regenerated/2026-10/translation-study-r2-1200.webp',
  'An adult learner comparing study books and notes during an online Quran translation lesson',
  'Adult learning',
  array['Adult learning','Tafseer','Quran translation'],
  'Online Quran College',
  4,
  'published',
  'Online Tafseer Classes: What You Learn',
  'Tafseer explains the meaning and context of the Quran. What an online Tafseer lesson covers, how it differs from translation, and what to ask first.',
  now()
)
on conflict do nothing;
