-- Website content migrated from the current onlinequrancollege.com (courses, fees, FAQs, policies).
-- Teacher profiles copied from the old site are saved privately until staff verify them.

-- ---------------------------------------------------------------------------
-- Courses
-- ---------------------------------------------------------------------------
insert into public.courses (slug, title, arabic_title, summary, description_html, age_group, level, duration_text, category, icon,
                            outcomes, is_featured, sort_order, status, seo_title, seo_description)
values
('noorani-qaida', 'Noorani Qaida', 'القاعدة النورانية',
 'The ideal first step: learn the Arabic letters, their correct sounds and the basic rules you need to read the Quran.',
 $html$<p>Noorani Qaida is the classic foundation for reading the Quran. Your teacher starts with the Arabic letters and their correct articulation points (<em>makharij</em>), then builds step by step to joined letters, vowels, long vowels and the first Tajweed rules — until you can read complete verses with confidence.</p>
<h3>Who is it for?</h3>
<p>Complete beginners with no Arabic background: children from about 4½–5 years old, and adults who want to learn to read from scratch or correct their pronunciation.</p>
<h3>How classes work</h3>
<p>Every lesson is live and one-to-one. No physical book is needed — your teacher shows a digital Qaida on screen, and PDF copies are shared for practice at home. Female and male teachers are available.</p>
<h3>How long does it take?</h3>
<p>Children taking three classes a week usually finish in about four to six months. Adults often progress faster, depending on practice time.</p>$html$,
 'Ages 4½+ and adults', 'Beginner', 'About 4–6 months for children at 3 classes a week', 'quran', 'book-a',
 array['Pronounce every Arabic letter from its correct articulation point',
       'Read joined letters, harakat and tanween without hesitation',
       'Apply first Tajweed rules: madd, sukoon, tashdeed, ghunnah and qalqalah',
       'Read complete verses and memorise short surahs from Juz Amma'],
 true, 1, 'published', 'Noorani Qaida Online for Kids & Adults | Online Quran College',
 'Learn Noorani Qaida online with live 1-on-1 classes. Arabic letters, makharij, harakat and first Tajweed rules for kids from 4½ and adults. 7-day free trial.'),

('quran-nazara', 'Quran Reading with Tajweed (Nazara)', 'ناظرة القرآن',
 'Read the Quran fluently with correct makharij and Tajweed — from the short surahs of Juz Amma to longer passages.',
 $html$<p>Our Nazara course takes you from careful reading to fluent, beautiful recitation. Lessons focus on accurate pronunciation, the essential rules of Tajweed and steady rhythm and breath control, with a growing understanding of what you are reciting.</p>
<h3>Who is it for?</h3>
<p>Children and adults who can recognise the Arabic letters and want to recite correctly — whether you are just starting to read the Quran or polishing your recitation. Sisters and young children can ask for a female teacher.</p>
<h3>How classes work</h3>
<p>Private live classes with video, screen-sharing and an interactive whiteboard. The pace adapts to each learner, and classes can be scheduled at any time of day.</p>$html$,
 'Children & adults', 'Beginner to advanced', 'Self-paced — adapted to each learner', 'quran', 'book-open-text',
 array['Pronounce letters accurately from their correct articulation points',
       'Apply Tajweed rules such as madd, ghunnah, idgham, ikhfa and waqf',
       'Recite fluently with proper rhythm and breath control',
       'Learn daily duas and remembrances with their meanings'],
 true, 2, 'published', 'Online Quran Reading with Tajweed (Nazara) | Online Quran College',
 'Learn to read the Quran with Tajweed online. Live one-to-one Nazara classes for kids and adults with female & male teachers. Book a 7-day free trial.'),

('hifz-quran', 'Hifz ul Quran', 'حفظ القرآن',
 'Memorise the Quran with a structured Sabaq, Sabqi and Manzil revision system and regular oral assessments.',
 $html$<p>Our Hifz programme combines traditional recitation methods, proven memorisation techniques and a disciplined revision system. Each student follows a personal plan — the whole Quran, a particular Juz, or selected surahs.</p>
<h3>Who is it for?</h3>
<p>Children and adults who have completed Noorani Qaida (or equivalent) and can read Arabic correctly with basic Tajweed. You do not need to speak Arabic. Beginners should start with Noorani Qaida or Nazara first.</p>
<h3>The three-part revision system</h3>
<ul><li><strong>Sabaq</strong> — the new lesson, recited daily.</li><li><strong>Sabqi</strong> — revision of the last seven days of memorisation.</li><li><strong>Manzil</strong> — a steady rotation through everything memorised earlier.</li></ul>
<p>Routine oral assessments keep memorisation strong and accurate.</p>
<h3>How long does it take?</h3>
<p>Memorising the whole Quran typically takes two to four years, depending on ability, class frequency and revision at home.</p>$html$,
 'Children & adults who can read the Quran', 'Intermediate', 'Whole Quran typically 2–4 years; custom Juz plans available', 'quran', 'brain',
 array['Memorise accurately with correct Tajweed',
       'Keep memorisation strong with Sabaq, Sabqi and Manzil revision',
       'Recite with confidence in front of a teacher and in salah',
       'Follow a personal plan for the whole Quran or chosen Juz'],
 true, 3, 'published', 'Online Hifz ul Quran Classes | Online Quran College',
 'Memorise the Quran online with one-to-one Hifz classes. Structured Sabaq, Sabqi and Manzil revision, oral assessments, female & male teachers. Free trial.'),

('arabic-language', 'Arabic Language', 'اللغة العربية',
 'Understand Quranic and Classical Arabic (Fusha): vocabulary, grammar — Nahw and Sarf — and conversation.',
 $html$<p>Learn the language of the Quran so you can understand verses, duas and classical texts directly. The course covers vocabulary, grammar (<em>Nahw</em> and <em>Sarf</em>), pronunciation and conversation, with Quranic verses woven into every lesson.</p>
<h3>Who is it for?</h3>
<p>All levels. Absolute beginners start with the alphabet and pronunciation; intermediate learners move straight to grammar and syntax.</p>
<h3>Materials</h3>
<p>Free PDF worksheets, vocabulary lists and grammar guides — used in class and kept for revision at home.</p>
<h3>How long until I understand verses?</h3>
<p>With three classes a week, most students understand simple Quranic vocabulary and sentence structures within three to six months.</p>$html$,
 'Children & adults', 'All levels', 'Simple Quranic vocabulary in 3–6 months at 3 classes a week', 'arabic', 'languages',
 array['Understand common Quranic vocabulary and sentence structures',
       'Learn the foundations of Nahw (syntax) and Sarf (morphology)',
       'Understand the meanings of duas and adhkar you recite',
       'Build reading, translation and conversation skills in Fusha'],
 false, 4, 'published', 'Learn Quranic Arabic Online | Online Quran College',
 'Online Arabic classes for kids and adults: Quranic vocabulary, Nahw, Sarf and conversation in Classical Arabic. Live 1-on-1 lessons and a 7-day free trial.'),

('quran-translation', 'Quran Translation & Tafseer', 'ترجمة القرآن وتفسيره',
 'Understand the meaning of the Quran in simple English, with context and practical lessons for daily life.',
 $html$<p>Designed for English speakers with little or no Arabic, this course explains the meaning of the Quran verse by verse — with context, clear explanation and discussion of how each lesson applies to everyday life.</p>
<h3>Sources</h3>
<p>Classes draw on established translations such as Sahih International, <em>The Clear Quran</em> by Dr Mustafa Khattab and Pickthall, together with classical Tafseer from Ibn Kathir.</p>
<h3>How long does it take?</h3>
<p>An overview of the key messages and chapters takes about six to twelve months. A detailed verse-by-verse Tafseer takes longer and is paced to suit you.</p>$html$,
 'Teens & adults', 'All levels', 'Overview in about 6–12 months; detailed Tafseer takes longer', 'studies', 'scroll-text',
 array['Understand the meaning of verses in clear English',
       'Learn the context in which verses were revealed',
       'Apply Quranic guidance to character, decisions and family life',
       'Progress to deeper Tafseer with word-by-word study'],
 false, 5, 'published', 'Online Quran Translation & Tafseer Classes | Online Quran College',
 'Understand the Quran in English with live one-to-one translation and Tafseer classes. No Arabic needed. Female & male teachers. Book a free trial.'),

('hadith-translation', 'Hadith & Islamic Studies', 'الحديث والدراسات الإسلامية',
 'Study authentic Hadith with clear English translation, plus the everyday essentials: Wudu, Salah, duas and Islamic manners.',
 $html$<p>Learn the teachings of the Prophet Muhammad ﷺ from verified collections such as Sahih al-Bukhari, Sahih Muslim and Riyad as-Salihin — with translation, historical context and practical lessons for daily life.</p>
<p>For younger learners the course covers the essentials of practice: the steps of Wudu and Salah, daily duas, stories of the Prophets and Islamic manners.</p>
<h3>Who is it for?</h3>
<p>Children, teens and adults. No advanced Arabic is needed — concepts are built step by step in English.</p>$html$,
 'Children, teens & adults', 'All levels', 'Flexible — paced to each learner', 'studies', 'library-big',
 array['Understand selected Hadith with accurate English translation',
       'Learn Wudu, Salah, daily duas and Islamic manners',
       'Know the stories of the Prophets and their lessons',
       'Build a foundation for further study of Tafseer and Fiqh'],
 false, 6, 'published', 'Online Hadith & Islamic Studies Classes | Online Quran College',
 'Study Hadith, Wudu, Salah, daily duas and Islamic manners online with live one-to-one classes for kids and adults. 7-day free trial.')
on conflict (slug) do nothing;

insert into public.course_modules (course_id, title, objectives, topics, sort_order)
select c.id, m.title, m.objectives, m.topics, m.sort_order
from public.courses c
join (values
  ('noorani-qaida', 1, 'Single letters (Mufradat)', 'Identify and pronounce every letter in its isolated form.',
     array['The 29 letters and their names', 'Throat letters', 'Heavy and light sounds', 'Articulation drills']),
  ('noorani-qaida', 2, 'Compound letters (Murakkabat)', 'Read connected letters within words without hesitation.',
     array['Letter shapes at the start, middle and end of words', 'Joining drills', 'Matching games for kids']),
  ('noorani-qaida', 3, 'Vowels and tanween (Harakat)', 'Pronounce words with short vowels and tanween.',
     array['Fathah, kasrah, dammah', 'Tanween: an, in, un', 'Spelling practice (Haji)']),
  ('noorani-qaida', 4, 'Long vowels and advanced pronunciation', 'Read longer words with vowel extensions, doubling and pauses.',
     array['Madd for 2, 4 or 6 counts', 'Sukoon and tashdeed', 'Qalqalah', 'Ghunnah']),
  ('noorani-qaida', 5, 'Fluency and short surahs', 'Move smoothly from the Qaida to reciting the Quran.',
     array['Reading full sentences', 'Waqf — stopping rules', 'Memorising Al-Fatihah, Al-Ikhlas and other short surahs', 'Etiquette of reciting the Quran']),

  ('quran-nazara', 1, 'Foundations and letter mastery', 'Identify and pronounce single and joined letters with correct vowels.',
     array['Alphabet and letter shapes', 'Joining letters', 'Fathah, kasrah, dammah', 'Basic reading fluency']),
  ('quran-nazara', 2, 'Essential Tajweed rules', 'Apply doubling, joining, nasalisation and extension rules automatically.',
     array['Sukoon and tashdeed', 'Madd (2, 4 or 6 counts)', 'Ghunnah and waqf', 'Noon sakinah & tanween: izhar, idgham, iqlab, ikhfa']),
  ('quran-nazara', 3, 'Surah recitation', 'Recite surahs with correct rhythm and stopping points.',
     array['Short surahs of Juz 30', 'Longer passages', 'Applying rules in live recitation', 'Pausing and rhythm']),
  ('quran-nazara', 4, 'Recitation with understanding', 'Recite long verses with breath control, reverence and understanding.',
     array['Breath control', 'Intonation', 'Basic word-by-word meaning']),
  ('quran-nazara', 5, 'Daily duas and remembrances', 'Bring masnoon duas and etiquettes into daily life.',
     array['Duas for sleeping, waking, eating and entering the home', 'Steps of Wudu and Salah', 'Morning and evening adhkar']),

  ('hifz-quran', 1, 'Recitation core', 'Recite accurately before memorising.',
     array['Tajweed and makharij', 'Tarteel — measured recitation', 'Repetitive recitation to build memory']),
  ('hifz-quran', 2, 'Memorisation techniques', 'Memorise in small, steady steps.',
     array['Ayah-by-ayah chunking', 'Daily goals of 3–5 lines', 'Consistent Mushaf layout and visualisation']),
  ('hifz-quran', 3, 'Sabaq, Sabqi and Manzil', 'Keep everything memorised strong with a three-part revision cycle.',
     array['Sabaq — the new lesson', 'Sabqi — the last seven days', 'Manzil — rotation through older portions']),
  ('hifz-quran', 4, 'Assessment and practical mastery', 'Recite confidently and track progress.',
     array['Routine oral assessments', 'Teacher correction', 'Daily routine and home revision', 'Learning the meanings of memorised verses']),

  ('arabic-language', 1, 'Alphabet and pronunciation', 'Read and pronounce Arabic correctly (beginner track).',
     array['Letters and sounds', 'Vowel marks', 'Reading simple words']),
  ('arabic-language', 2, 'Quranic vocabulary', 'Recognise the most frequent words of the Quran.',
     array['Common nouns and verbs', 'Words in daily duas', 'Vocabulary lists']),
  ('arabic-language', 3, 'Grammar — Nahw and Sarf', 'Understand how Arabic sentences and words are built.',
     array['Nominal and verbal sentences', 'Verb forms and patterns', 'Cases and endings']),
  ('arabic-language', 4, 'Reading and translation', 'Read and translate Quranic and classical texts.',
     array['Translating verses', 'Duas and adhkar', 'Short classical passages']),
  ('arabic-language', 5, 'Conversation', 'Build confidence speaking simple Fusha.',
     array['Everyday phrases', 'Role-play', 'Listening practice']),

  ('quran-translation', 1, 'Translation with context', 'Understand what each verse means and why it was revealed.',
     array['Verse-by-verse translation', 'Context of revelation', 'Key themes of each surah']),
  ('quran-translation', 2, 'Clear explanations for English speakers', 'Learn without needing Arabic.',
     array['Simple English explanations', 'Important Arabic terms explained']),
  ('quran-translation', 3, 'Living by the Quran', 'Apply Quranic guidance to daily life.',
     array['Character and conduct', 'Family and community', 'Discussion and reflection']),
  ('quran-translation', 4, 'Tafseer', 'Go deeper with classical commentary.',
     array['Tafseer Ibn Kathir', 'Word-by-word analysis', 'Linguistic insights']),

  ('hadith-translation', 1, 'Introduction to Hadith', 'Know what Hadith are and how they were preserved.',
     array['Major collections', 'Authenticity', 'Hadith in daily life']),
  ('hadith-translation', 2, 'Selected Hadith with translation', 'Understand and reflect on authentic narrations.',
     array['Riyad as-Salihin', 'Sahih al-Bukhari and Sahih Muslim selections', 'Lessons and application']),
  ('hadith-translation', 3, 'Practice essentials', 'Perform Wudu and Salah correctly and learn daily duas.',
     array['Steps of Wudu', 'Steps of Salah', 'Daily duas']),
  ('hadith-translation', 4, 'Stories and manners', 'Learn from the lives of the Prophets and Islamic manners.',
     array['Stories of the Prophets', 'Islamic manners (adab)', 'Respect for parents and others'])
) as m(slug, sort_order, title, objectives, topics) on m.slug = c.slug
where not exists (select 1 from public.course_modules cm where cm.course_id = c.id);

-- ---------------------------------------------------------------------------
-- Fees (USD, monthly) — from the current pricing page
-- ---------------------------------------------------------------------------
insert into public.pricing_plans (name, tagline, course_type, billing_period, classes_per_week, duration_min, trial_days,
                                  features, is_featured, is_public, sort_order, status)
select * from (values
  ('Package 1', 'A gentle start', 'Standard Quran Course', 'monthly', 2, 30, 7,
   array['2 classes a week', '30-minute 1-on-1 classes', 'Certified tutor', '7-day free trial'], false, true, 1, 'published'),
  ('Package 2', 'Steady progress', 'Standard Quran Course', 'monthly', 3, 30, 7,
   array['3 classes a week', '30-minute 1-on-1 classes', 'Certified tutor', '7-day free trial'], true, true, 2, 'published'),
  ('Package 3', 'Faster progress', 'Standard Quran Course', 'monthly', 4, 30, 7,
   array['4 classes a week', '30-minute 1-on-1 classes', 'Certified tutor', '7-day free trial'], false, true, 3, 'published'),
  ('Package 4', 'Specialised courses', 'Specialized Quran Course', 'monthly', 4, 30, 7,
   array['4 classes a week', '30-minute 1-on-1 classes', 'Hifz, Tajweed, Arabic & more', '7-day free trial'], false, true, 4, 'published'),
  ('Leisure', 'Learn at a relaxed pace', 'Leisure Quran Lessons', 'monthly', 2, 30, 7,
   array['2 classes a week', '30-minute 1-on-1 classes', 'Relaxed pace', '7-day free trial'], false, true, 5, 'published'),
  ('Weekend', 'Saturday & Sunday classes', 'Weekend Quran Studies', 'monthly', 2, 30, 0,
   array['2 weekend classes', '30-minute 1-on-1 classes', 'Ideal for busy weekdays'], false, true, 6, 'published')
) as p(name, tagline, course_type, billing_period, classes_per_week, duration_min, trial_days, features, is_featured, is_public, sort_order, status)
where not exists (select 1 from public.pricing_plans);

insert into public.pricing_plan_prices (plan_id, currency, amount_minor, is_public)
select p.id, 'USD', v.amount, true
from public.pricing_plans p
join (values ('Package 1', 3000), ('Package 2', 4000), ('Package 3', 4500), ('Package 4', 5000),
             ('Leisure', 3500), ('Weekend', 4000)) as v(name, amount) on v.name = p.name
on conflict (plan_id, currency) do nothing;

-- ---------------------------------------------------------------------------
-- FAQs
-- ---------------------------------------------------------------------------
insert into public.faqs (question, answer, category, sort_order, status)
select * from (values
  ('Is there a free trial?', 'Yes. You get 7 days of free classes with no credit card required (all packages except the Weekend plan). It is a chance to meet your teacher, try the virtual classroom and settle on timings before you subscribe.', 'Getting started', 1, 'published'),
  ('Can I choose a female teacher?', 'Yes. Female teachers are available for children and sisters, and male teachers for brothers. Choose your preference on the free-trial form.', 'Getting started', 2, 'published'),
  ('How do online classes work?', 'Every class is live and one-to-one with your teacher, using video, screen-sharing and an interactive whiteboard. You only need a laptop, tablet or phone with a camera, microphone and a stable internet connection.', 'Classes', 3, 'published'),
  ('Do I need to buy books?', 'No. Your teacher shows the Qaida or Mushaf on screen and shares PDF copies for practice at home.', 'Classes', 4, 'published'),
  ('At what age can my child start?', 'Children can usually start Noorani Qaida from about 4½ to 5 years old. Adults of any age are very welcome.', 'Classes', 5, 'published'),
  ('Can I reschedule a class?', 'Yes. Let us know at least 4 hours before the class and our coordinators will arrange a make-up class, to be completed within 30 days. With less notice, the class is forfeited.', 'Classes', 6, 'published'),
  ('What happens if we miss a class?', 'Teachers wait for 10 minutes after the start time. After that the class is marked as missed. Missed classes are not refunded and are not automatically made up.', 'Classes', 7, 'published'),
  ('How do I pay my monthly fees?', 'Fees are billed monthly at the start of each billing cycle. You can pay by credit or debit card, PayPal or bank transfer.', 'Fees', 8, 'published'),
  ('Do you offer a family discount?', 'Yes. Additional children from the same household receive a 15% sibling discount.', 'Fees', 9, 'published'),
  ('How do I cancel?', 'You can cancel your subscription at any time by contacting our support team. If you cancel within the first week of a billing period, that month''s tuition is refunded in full.', 'Fees', 10, 'published'),
  ('How long does it take to memorise the Quran?', 'Memorising the whole Quran usually takes two to four years, depending on ability, number of classes per week and revision at home. Plans for a single Juz or selected surahs are also available.', 'Courses', 11, 'published'),
  ('Will I receive a certificate?', 'Yes. Students receive a formal certificate after completing a course and its final assessment.', 'Courses', 12, 'published')
) as f(question, answer, category, sort_order, status)
where not exists (select 1 from public.faqs);

-- ---------------------------------------------------------------------------
-- Pages
-- ---------------------------------------------------------------------------
insert into public.pages (slug, title, excerpt, template, body_html, show_in_footer, sort_order, status, seo_title, seo_description)
values
('about', 'About Online Quran College',
 'Since 2018 we have been bringing traditional Quran teaching into modern, interactive online classrooms for families around the world.',
 'standard',
 $html$<p>Online Quran College started in 2018 with a small group of certified teachers and one goal: to bridge traditional Islamic education with modern, interactive virtual classrooms. Today we teach children and adults across the UK, the USA, Canada, Australia, Europe and beyond — always one-to-one, always live.</p>
<h2>Our mission</h2>
<p>To provide a structured, supportive and authentic environment where learners anywhere in the world can recite, memorise and understand the Quran with correct Tajweed.</p>
<h2>Our vision</h2>
<p>To become a leading digital home for Islamic studies — focused on spiritual development, academic excellence and good character.</p>
<h2>What we value</h2>
<ul><li><strong>Authenticity</strong> — teaching rooted in the classical tradition.</li><li><strong>Patience</strong> — every learner moves at their own pace.</li><li><strong>Comfort</strong> — female teachers for sisters and children, male teachers for brothers.</li><li><strong>Flexibility</strong> — classes arranged around your family's time zone and routine.</li><li><strong>Student first</strong> — personal plans, regular feedback and caring coordinators.</li></ul>
<h2>Our teachers</h2>
<p>Our teachers hold formal qualifications in Islamic studies and Quranic recitation, and recite with correct Tajweed. Every teacher goes through a background check and a teaching-skills evaluation, and receives regular coaching on online teaching and working with children.</p>$html$,
 false, 1, 'published', 'About Us | Online Quran College', 'Online Quran College has offered live one-to-one online Quran classes since 2018 — authentic teaching, female & male teachers and flexible timings.'),

('privacy-policy', 'Privacy Policy', 'How we collect, use and protect your personal information.', 'policy',
 $html$<p><em>Last updated: 13 October 2026</em></p>
<p>Online Quran College (“we”, “us”) is committed to handling the personal data of our website visitors, students and parents safely and responsibly. This policy explains what we collect and why.</p>
<h2>1. Information we collect</h2>
<ul><li><strong>Personal details</strong> you give us in our free-trial, contact or registration forms — such as name, email address, phone or WhatsApp number, country, city and time zone, and the learner’s age group.</li><li><strong>Course information</strong> — class schedules, attendance, progress notes and feedback.</li><li><strong>Technical information</strong> — limited usage data such as browser type, and a one-way hashed version of your IP address used to protect our forms from abuse.</li></ul>
<h2>2. How we use your information</h2>
<ul><li>To arrange trial classes, enrolment and class schedules.</li><li>To communicate with you about lessons, progress and administration.</li><li>To provide support and handle requests or complaints.</li><li>To improve our website and courses.</li></ul>
<h2>3. Sharing and security</h2>
<p>We do not sell, trade or rent your personal information. Access is limited to staff who need it for their role, and we use appropriate security measures to protect it. No method of transmission over the internet is completely secure, but we work hard to keep your data safe.</p>
<h2>4. Cookies</h2>
<p>Our public website does not use advertising cookies. Staff sign-in uses essential cookies only.</p>
<h2>5. Your rights</h2>
<p>You may ask to access, correct or delete your personal data at any time by emailing <a href="mailto:info@onlinequrancollege.com">info@onlinequrancollege.com</a>.</p>
<h2>6. Changes to this policy</h2>
<p>We may update this policy from time to time. The latest version will always be published on this page.</p>
<h2>7. Contact</h2>
<p>Online Quran College, United Kingdom · <a href="mailto:info@onlinequrancollege.com">info@onlinequrancollege.com</a> · +44 7864 710821</p>$html$,
 true, 10, 'published', 'Privacy Policy | Online Quran College', 'How Online Quran College collects, uses and protects personal information.'),

('terms-and-conditions', 'Terms & Conditions', 'The rules that apply to our classes, subscriptions and website.', 'policy',
 $html$<p><em>Last updated: 13 October 2026</em></p>
<p>These terms apply to the use of the Online Quran College website and to enrolment in our classes. By using our services you accept them.</p>
<h2>1. Class scheduling and attendance</h2>
<ul><li>All classes are one-to-one and take place online in our virtual classroom.</li><li>Students should log in at the scheduled time. Teachers wait for up to 10 minutes; after that the class is marked as missed.</li><li>Missed classes are not refunded and do not receive an automatic make-up class.</li></ul>
<h2>2. Rescheduling and make-up classes</h2>
<ul><li>Cancellations or reschedules need at least 4 hours’ notice before the class.</li><li>Make-up classes are arranged through our coordinators and must be completed within 30 days of the missed class.</li><li>With less than 4 hours’ notice, the class is forfeited.</li></ul>
<h2>3. Subscriptions and payments</h2>
<ul><li>Monthly tuition is billed at the start of each billing cycle.</li><li>We accept major credit and debit cards, bank transfer and PayPal.</li><li>Families enrolling additional children from the same household receive a 15% sibling discount.</li></ul>
<h2>4. Cancellation and refunds</h2>
<ul><li>You may cancel a monthly subscription at any time by contacting support.</li><li>If you cancel within the first week of a billing period, that month’s tuition is refunded in full.</li></ul>
<h2>5. Governing law</h2>
<p>These terms are governed by the laws of the United Kingdom, and disputes fall under the exclusive jurisdiction of the UK courts.</p>
<h2>6. Contact</h2>
<p><a href="mailto:info@onlinequrancollege.com">info@onlinequrancollege.com</a> · +44 7864 710821</p>$html$,
 true, 11, 'published', 'Terms & Conditions | Online Quran College', 'Terms for classes, rescheduling, payments and cancellations at Online Quran College.'),

('refund-policy', 'Cancellation & Refund Policy', 'How cancellations, refunds and make-up classes work.', 'policy',
 $html$<p><em>Last updated: 13 October 2026</em></p>
<h2>Cancelling your subscription</h2>
<p>You can cancel your monthly subscription at any time by contacting our support team by email or WhatsApp.</p>
<h2>Refunds</h2>
<p>If you cancel within the first week of a billing period, the tuition for that month is refunded in full. After the first week, the subscription continues until the end of the billing period.</p>
<h2>Missed and rescheduled classes</h2>
<ul><li>Give at least 4 hours’ notice to reschedule; our coordinators will arrange a make-up class within 30 days.</li><li>Classes missed without notice are not refunded or automatically made up.</li></ul>
<h2>Questions</h2>
<p>Email <a href="mailto:info@onlinequrancollege.com">info@onlinequrancollege.com</a> or call +44 7864 710821.</p>$html$,
 true, 12, 'published', 'Cancellation & Refund Policy | Online Quran College', 'Cancellation, refund and make-up class policy for Online Quran College.')
on conflict (slug, locale) do nothing;

-- ---------------------------------------------------------------------------
-- Menus
-- ---------------------------------------------------------------------------
insert into public.menu_items (menu, label, href, sort_order)
select * from (values
  ('header', 'Home', '/', 1),
  ('header', 'Courses', '/courses', 2),
  ('header', 'Fees', '/pricing', 3),
  ('header', 'About', '/about', 4),
  ('header', 'Blog', '/blog', 5),
  ('header', 'FAQ', '/faq', 6),
  ('header', 'Contact', '/contact', 7),
  ('footer_courses', 'Noorani Qaida', '/courses/noorani-qaida', 1),
  ('footer_courses', 'Quran Reading with Tajweed', '/courses/quran-nazara', 2),
  ('footer_courses', 'Hifz ul Quran', '/courses/hifz-quran', 3),
  ('footer_courses', 'Arabic Language', '/courses/arabic-language', 4),
  ('footer_courses', 'Quran Translation & Tafseer', '/courses/quran-translation', 5),
  ('footer_courses', 'Hadith & Islamic Studies', '/courses/hadith-translation', 6),
  ('footer_company', 'About us', '/about', 1),
  ('footer_company', 'Fees & packages', '/pricing', 2),
  ('footer_company', 'Our teachers', '/teachers', 3),
  ('footer_company', 'Blog', '/blog', 4),
  ('footer_company', 'FAQ', '/faq', 5),
  ('footer_company', 'Contact', '/contact', 6),
  ('footer_legal', 'Privacy policy', '/privacy-policy', 1),
  ('footer_legal', 'Terms & conditions', '/terms-and-conditions', 2),
  ('footer_legal', 'Refund policy', '/refund-policy', 3),
  ('footer_legal', 'Verify a certificate', '/verify-certificate', 4)
) as m(menu, label, href, sort_order)
where not exists (select 1 from public.menu_items);

-- ---------------------------------------------------------------------------
-- Teacher profiles from the old website — saved privately until verified
-- ---------------------------------------------------------------------------
insert into public.teachers (slug, display_name, headline, gender, bio, qualifications, languages, specialties,
                             years_experience, is_active, is_public, sort_order, verification_note)
select * from (values
  ('ustadha-maryam', 'Ustadha Maryam', 'Tajweed Expert', 'female',
   'Teaches Tajweed and correct recitation to children and adults.', 'Al-Azhar graduate; Ijazah in Hafs ''an ''Asim',
   array['English', 'Arabic'], array['Tajweed', 'Quran Nazara'], 6, true, false, 1),
  ('ustadha-aisha', 'Ustadha Aisha', 'Hifz Specialist', 'female',
   'Hafiza of the Quran who guides students through structured memorisation and revision.', 'Hafiza; Master''s in Islamic Studies',
   array['English', 'Arabic', 'Urdu'], array['Hifz ul Quran'], 5, true, false, 2),
  ('ustadha-fatima', 'Ustadha Fatima', 'Noorani Qaida Specialist', 'female',
   'Specialises in teaching young beginners to read Arabic with patience and care.', 'Certificate from Madinah University',
   array['English', 'Arabic'], array['Noorani Qaida'], 7, true, false, 3),
  ('ustadha-khadija', 'Ustadha Khadija', 'Islamic Studies Scholar', 'female',
   'Teaches Hadith, daily duas, Salah and Islamic manners.', 'BA in Shariah',
   array['English', 'Arabic'], array['Hadith & Islamic Studies'], 8, true, false, 4),
  ('ustadha-sarah', 'Ustadha Sarah', 'Arabic Language Scholar', 'female',
   'Teaches Quranic and Classical Arabic grammar, vocabulary and conversation.', 'MA in Arabic Linguistics',
   array['English', 'Arabic'], array['Arabic Language'], 6, true, false, 5),
  ('ustadha-zainab', 'Ustadha Zainab', 'Tafseer Scholar', 'female',
   'Teaches Quran translation and Tafseer to advanced students.', 'PhD in Quranic Exegesis',
   array['English', 'Arabic'], array['Quran Translation & Tafseer'], 10, true, false, 6)
) as t(slug, display_name, headline, gender, bio, qualifications, languages, specialties, years_experience, is_active, is_public, sort_order)
cross join (select 'Copied from the previous website on 13 Oct 2026. Verify name, photo and credentials before making public.' as verification_note) n
where not exists (select 1 from public.teachers);

insert into public.teacher_courses (teacher_id, course_id)
select t.id, c.id from public.teachers t
join public.courses c on (t.slug, c.slug) in (
  ('ustadha-maryam', 'quran-nazara'), ('ustadha-aisha', 'hifz-quran'), ('ustadha-fatima', 'noorani-qaida'),
  ('ustadha-khadija', 'hadith-translation'), ('ustadha-sarah', 'arabic-language'), ('ustadha-zainab', 'quran-translation'))
on conflict do nothing;
