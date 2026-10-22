-- Reference data: staff roles (aligned with OQC departments), their permissions, site settings and menus.

insert into public.app_roles (key, name, description, sort_order) values
  ('super_admin', 'Super Admin', 'CEO and IT — full access, including roles and other Super Admins', 1),
  ('admin', 'Administrator', 'Management — full operational access', 2),
  ('admissions', 'Admission', 'Free trials, enquiries, complaints, new students and enrolments', 3),
  ('academic', 'Academic', 'Courses, teachers, schedules, classes, attendance, progress and certificates', 4),
  ('qa', 'Quality Assurance', 'Read classes and progress, follow up complaints', 5),
  ('finance', 'Finance & Accounts', 'Fees, invoices and payments', 6),
  ('content_editor', 'Marketing', 'Website pages, blog, FAQs, testimonials, media and site settings', 7),
  ('teacher', 'Teacher', 'Own timetable, attendance and progress notes', 8)
on conflict (key) do update set name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;

insert into public.app_role_permissions (role, permission)
select role, permission from (values
  ('super_admin', '*'),

  ('admin', 'users:*'), ('admin', 'roles:read'), ('admin', 'settings:*'), ('admin', 'audit:read'),
  ('admin', 'reports:*'), ('admin', 'exports:*'), ('admin', 'media:*'), ('admin', 'pages:*'), ('admin', 'blog:*'),
  ('admin', 'faqs:*'), ('admin', 'testimonials:*'), ('admin', 'menus:*'), ('admin', 'redirects:*'),
  ('admin', 'courses:*'), ('admin', 'teachers:*'), ('admin', 'pricing:*'), ('admin', 'trials:*'),
  ('admin', 'contacts:*'), ('admin', 'complaints:*'), ('admin', 'students:*'), ('admin', 'guardians:*'),
  ('admin', 'enrollments:*'), ('admin', 'schedules:*'), ('admin', 'sessions:*'), ('admin', 'attendance:*'),
  ('admin', 'progress:*'), ('admin', 'certificates:*'), ('admin', 'invoices:*'), ('admin', 'payments:*'),

  ('admissions', 'trials:*'), ('admissions', 'contacts:*'), ('admissions', 'complaints:*'),
  ('admissions', 'students:read'), ('admissions', 'students:create'), ('admissions', 'students:update'),
  ('admissions', 'guardians:read'), ('admissions', 'guardians:create'), ('admissions', 'guardians:update'),
  ('admissions', 'enrollments:read'), ('admissions', 'enrollments:create'), ('admissions', 'enrollments:update'),
  ('admissions', 'schedules:read'), ('admissions', 'sessions:read'), ('admissions', 'attendance:read'),
  ('admissions', 'progress:read'), ('admissions', 'courses:read'), ('admissions', 'teachers:read'),
  ('admissions', 'pricing:read'), ('admissions', 'invoices:read'), ('admissions', 'payments:read'),
  ('admissions', 'reports:read'), ('admissions', 'exports:read'),

  ('academic', 'courses:*'), ('academic', 'teachers:*'), ('academic', 'students:*'), ('academic', 'guardians:read'),
  ('academic', 'guardians:update'), ('academic', 'enrollments:*'), ('academic', 'schedules:*'), ('academic', 'sessions:*'),
  ('academic', 'attendance:*'), ('academic', 'progress:*'), ('academic', 'certificates:*'), ('academic', 'trials:read'),
  ('academic', 'trials:update'), ('academic', 'complaints:read'), ('academic', 'complaints:update'),
  ('academic', 'pricing:read'), ('academic', 'reports:read'), ('academic', 'exports:read'), ('academic', 'media:read'),
  ('academic', 'media:create'),

  ('qa', 'teachers:read'), ('qa', 'students:read'), ('qa', 'enrollments:read'), ('qa', 'schedules:read'),
  ('qa', 'sessions:read'), ('qa', 'attendance:read'), ('qa', 'progress:read'), ('qa', 'progress:create'),
  ('qa', 'complaints:read'), ('qa', 'complaints:update'), ('qa', 'trials:read'), ('qa', 'courses:read'),
  ('qa', 'reports:read'),

  ('finance', 'pricing:*'), ('finance', 'invoices:*'), ('finance', 'payments:*'), ('finance', 'students:read'),
  ('finance', 'guardians:read'), ('finance', 'guardians:update'), ('finance', 'enrollments:read'),
  ('finance', 'enrollments:update'), ('finance', 'courses:read'), ('finance', 'reports:read'), ('finance', 'exports:read'),

  ('content_editor', 'pages:*'), ('content_editor', 'blog:*'), ('content_editor', 'faqs:*'),
  ('content_editor', 'testimonials:*'), ('content_editor', 'menus:*'), ('content_editor', 'redirects:*'),
  ('content_editor', 'media:*'), ('content_editor', 'courses:read'), ('content_editor', 'courses:update'),
  ('content_editor', 'courses:publish'), ('content_editor', 'teachers:read'), ('content_editor', 'teachers:update'),
  ('content_editor', 'pricing:read'), ('content_editor', 'settings:read'), ('content_editor', 'settings:update'),
  ('content_editor', 'trials:read'), ('content_editor', 'reports:read'),

  ('teacher', 'portal:teacher')
) as x(role, permission)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Site settings (public ones feed the website)
-- ---------------------------------------------------------------------------
insert into public.settings (key, is_public, label, description, value) values
('site.identity', true, 'Brand', 'Name and short description used across the website', jsonb_build_object(
  'name', 'Online Quran College',
  'legal_name', 'Online Quran College LTD',
  'tagline', 'Unlock the wisdom of the Quran with our online Quran college. Explore, learn, and grow with us.',
  'established', '2018',
  'description', 'Live one-to-one online Quran, Tajweed, Hifz, Arabic and Islamic studies classes for children and adults, with male and female teachers and flexible timings.'
)),
('site.contact', true, 'Contact details', 'Shown in the header, footer and contact page', jsonb_build_object(
  'email', 'info@onlinequrancollege.com',
  'phone', '+44 7864 710821',
  'whatsapp', '447864710821',
  'location', 'United Kingdom',
  'hours', 'Classes 24/7 across time zones'
)),
('site.social', true, 'Social links', 'Leave a link empty to hide it', jsonb_build_object(
  'facebook', 'https://www.facebook.com/OnlineQuranCollegeLtdUK',
  'x', 'https://x.com/OnlineQuranClg',
  'instagram', 'https://www.instagram.com/online_quran_college',
  'youtube', '',
  'tiktok', ''
)),
('site.hero', true, 'Home page hero', 'Main message at the top of the home page', jsonb_build_object(
  'eyebrow', 'Live 1-on-1 online Quran classes',
  'title', 'Empowering minds with online Quranic education',
  'subtitle', 'Professional one-to-one classes for children and adults in Noorani Qaida, Tajweed, Hifz, Arabic and Islamic studies — taught live by male and female teachers at times that suit your family.',
  'primary_label', 'Book a 7-day free trial',
  'secondary_label', 'Explore courses',
  'badges', jsonb_build_array('7-day free trial — no card needed', 'Female & male teachers', 'Classes in any time zone')
)),
('site.stats', true, 'Numbers', 'Short facts shown under the hero', jsonb_build_array(
  jsonb_build_object('value', '2018', 'label', 'Teaching since'),
  jsonb_build_object('value', '600+', 'label', 'Students learning'),
  jsonb_build_object('value', '1-on-1', 'label', 'Live classes'),
  jsonb_build_object('value', '24/7', 'label', 'Flexible timings')
)),
('site.benefits', true, 'Why choose us', 'Benefits listed on the home page', jsonb_build_array(
  jsonb_build_object('icon', 'badge-percent', 'title', 'Affordable fees', 'text', 'Simple monthly packages with a 15% discount for additional siblings.'),
  jsonb_build_object('icon', 'heart-handshake', 'title', 'Female tutors available', 'text', 'Female teachers for children and sisters, for comfort and privacy.'),
  jsonb_build_object('icon', 'languages', 'title', 'Multilingual teachers', 'text', 'Lessons in English, Urdu, Arabic and other languages.'),
  jsonb_build_object('icon', 'calendar-clock', 'title', 'Your schedule, your pace', 'text', 'Choose class length, days and focus — pacing adjusted to each student.'),
  jsonb_build_object('icon', 'award', 'title', 'Certificates', 'text', 'Formal certificates after final assessments.'),
  jsonb_build_object('icon', 'headset', 'title', 'Always-on support', 'text', 'Coordinators help with rescheduling and make-up classes.')
)),
('site.steps', true, 'How it works', 'Three steps shown on the home page', jsonb_build_array(
  jsonb_build_object('title', 'Book a free trial', 'text', 'Fill in the short form, choose a course and tell us when you are free. We arrange your trial within 24 hours.'),
  jsonb_build_object('title', 'Choose your plan', 'text', 'After the trial, a coordinator agrees timings, teacher preference and a monthly package with you.'),
  jsonb_build_object('title', 'Start regular classes', 'text', 'Meet your teacher live online on your chosen days and track progress every month.')
)),
('site.announcement', true, 'Top bar announcement', 'Small banner above the header', jsonb_build_object(
  'enabled', true,
  'text', '7 days of free classes — no credit card required.',
  'link_label', 'Book now',
  'link', '/free-trial'
)),
('site.forms', true, 'Form wording', 'Consent text and confirmation messages for website forms', jsonb_build_object(
  'consent_version', '2026-10-13',
  'consent_text', 'I agree that Online Quran College may contact me by email, phone or WhatsApp about this request and store my details as described in the privacy policy.',
  'trial_success', 'JazakAllah khair! Your free-trial request is in. Our team will contact you within 24 hours to arrange your class.',
  'contact_success', 'Thank you — your message has reached our team. We usually reply within one working day.'
)),
('site.seo', true, 'Search engines', 'Default title and description', jsonb_build_object(
  'title', 'Online Quran College — Live 1-on-1 Online Quran Classes',
  'description', 'Learn Quran online with live one-to-one classes: Noorani Qaida, Tajweed, Hifz, Arabic and Islamic studies for kids and adults. Female & male teachers. 7-day free trial.'
)),
('finance.defaults', false, 'Finance defaults', 'Invoice currency, payment terms and footer', jsonb_build_object(
  'currency', 'USD',
  'due_days', 7,
  'invoice_footer', 'Thank you for learning with Online Quran College. Please quote the invoice number with your payment.',
  'payment_instructions', 'Pay by card, PayPal or bank transfer. Contact info@onlinequrancollege.com for payment details.'
)),
('academics.defaults', false, 'Academic defaults', 'Class session planning', jsonb_build_object(
  'session_horizon_days', 14,
  'default_duration_min', 30,
  'staff_timezone', 'Asia/Karachi'
))
on conflict (key) do nothing;
