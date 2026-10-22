-- Catalog (courses, teachers, pricing) and website content (pages, blog, FAQs, testimonials, menus, media).

-- Shared status vocabulary for publishable content
-- draft → review → scheduled/published → archived

-- ---------------------------------------------------------------------------
-- Courses
-- ---------------------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 2 and 120),
  arabic_title text,
  summary text not null default '',
  description_html text not null default '',
  age_group text not null default 'Children & adults',
  level text not null default 'Beginner',
  duration_text text,
  category text not null default 'quran',
  icon text not null default 'book-open',
  cover_url text,
  outcomes text[] not null default '{}',
  is_featured boolean not null default false,
  sort_order int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'review', 'scheduled', 'published', 'archived')),
  seo_title text,
  seo_description text,
  scheduled_at timestamptz,
  published_at timestamptz,
  version int not null default 1,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index courses_public_idx on public.courses(status, sort_order) where deleted_at is null;

create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  objectives text not null default '',
  topics text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index course_modules_course_idx on public.course_modules(course_id, sort_order);

-- ---------------------------------------------------------------------------
-- Teachers
-- ---------------------------------------------------------------------------
create table public.teachers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  display_name text not null,
  headline text not null default '',
  gender text not null default 'female' check (gender in ('female', 'male')),
  bio text not null default '',
  qualifications text not null default '',
  languages text[] not null default '{}',
  specialties text[] not null default '{}',
  years_experience int check (years_experience between 0 and 80),
  photo_url text,
  timezone text not null default 'Asia/Karachi',
  shift text check (shift in ('morning', 'night', 'both')),
  -- private (never granted to the public API role)
  email text,
  phone text,
  employee_code text,
  verification_note text,
  is_active boolean not null default true,
  is_public boolean not null default false,
  sort_order int not null default 0,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index teachers_public_idx on public.teachers(is_public, is_active, sort_order) where deleted_at is null;

alter table public.profiles
  add constraint profiles_teacher_id_fkey foreign key (teacher_id) references public.teachers(id) on delete set null;
create unique index profiles_teacher_unique on public.profiles(teacher_id) where teacher_id is not null;

create table public.teacher_courses (
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (teacher_id, course_id)
);
create index teacher_courses_course_idx on public.teacher_courses(course_id);

create table public.teacher_availability (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  timezone text not null default 'Asia/Karachi',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);
create index teacher_availability_idx on public.teacher_availability(teacher_id, weekday);

-- ---------------------------------------------------------------------------
-- Pricing
-- ---------------------------------------------------------------------------
create table public.pricing_plans (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete set null,
  name text not null,
  tagline text not null default '',
  course_type text not null default '',
  billing_period text not null default 'monthly' check (billing_period in ('monthly', 'quarterly', 'yearly', 'one_time')),
  classes_per_week int not null check (classes_per_week between 1 and 7),
  duration_min int not null default 30 check (duration_min between 15 and 180),
  trial_days int not null default 0 check (trial_days between 0 and 60),
  features text[] not null default '{}',
  is_featured boolean not null default false,
  is_public boolean not null default true,
  sort_order int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'review', 'scheduled', 'published', 'archived')),
  scheduled_at timestamptz,
  published_at timestamptz,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index pricing_plans_public_idx on public.pricing_plans(status, is_public, sort_order) where deleted_at is null;

create table public.pricing_plan_prices (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.pricing_plans(id) on delete cascade,
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  amount_minor int not null check (amount_minor >= 0),
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, currency)
);

-- ---------------------------------------------------------------------------
-- Website pages (CMS)
-- ---------------------------------------------------------------------------
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  locale text not null default 'en' check (locale ~ '^[a-z]{2}$'),
  title text not null,
  excerpt text not null default '',
  template text not null default 'standard' check (template in ('standard', 'landing', 'policy')),
  body_html text not null default '',
  cover_url text,
  show_in_footer boolean not null default false,
  sort_order int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'review', 'scheduled', 'published', 'archived')),
  seo_title text,
  seo_description text,
  canonical_url text,
  scheduled_at timestamptz,
  published_at timestamptz,
  version int not null default 1,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (slug, locale)
);

create table public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  type text not null check (type in ('hero', 'rich_text', 'features', 'steps', 'stats', 'courses', 'pricing',
                                     'teachers', 'testimonials', 'faq', 'cta', 'image_text')),
  data jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index page_sections_page_idx on public.page_sections(page_id, sort_order);

-- ---------------------------------------------------------------------------
-- Blog ("Journal")
-- ---------------------------------------------------------------------------
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  locale text not null default 'en' check (locale ~ '^[a-z]{2}$'),
  title text not null,
  excerpt text not null default '',
  body_html text not null default '',
  cover_url text,
  category text not null default 'Learning',
  tags text[] not null default '{}',
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null default 'OQC Editorial Team',
  reading_minutes int,
  status text not null default 'draft' check (status in ('draft', 'review', 'scheduled', 'published', 'archived')),
  seo_title text,
  seo_description text,
  scheduled_at timestamptz,
  published_at timestamptz,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (slug, locale)
);
create index blog_posts_public_idx on public.blog_posts(status, published_at desc) where deleted_at is null;

-- ---------------------------------------------------------------------------
-- FAQs, testimonials, menus, redirects
-- ---------------------------------------------------------------------------
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text not null default 'General',
  course_id uuid references public.courses(id) on delete cascade,
  locale text not null default 'en',
  sort_order int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'review', 'scheduled', 'published', 'archived')),
  scheduled_at timestamptz,
  published_at timestamptz,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index faqs_public_idx on public.faqs(status, sort_order);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  relation text not null default 'Parent',
  country text not null default '',
  quote text not null,
  rating smallint check (rating between 1 and 5),
  course_id uuid references public.courses(id) on delete set null,
  avatar_url text,
  consent_recorded_at timestamptz,
  source_note text,
  sort_order int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'review', 'scheduled', 'published', 'archived')),
  scheduled_at timestamptz,
  published_at timestamptz,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  menu text not null check (menu in ('header', 'footer_courses', 'footer_company', 'footer_legal')),
  label text not null,
  href text not null,
  parent_id uuid references public.menu_items(id) on delete cascade,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  opens_new_tab boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index menu_items_menu_idx on public.menu_items(menu, sort_order);

create table public.redirects (
  id uuid primary key default gen_random_uuid(),
  from_path text not null unique check (from_path ~ '^/'),
  to_path text not null,
  status_code int not null default 308 check (status_code in (301, 302, 307, 308)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Media library (files live in the public Storage bucket "media")
-- ---------------------------------------------------------------------------
create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'media',
  path text not null unique,
  public_url text not null,
  file_name text not null default '',
  mime_type text not null default '',
  size_bytes bigint not null default 0,
  width int,
  height int,
  alt_text text not null default '',
  caption text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Revision history for edited content
-- ---------------------------------------------------------------------------
create table public.content_revisions (
  id bigint generated always as identity primary key,
  entity_type text not null,
  entity_id uuid not null,
  snapshot jsonb not null,
  author_id uuid,
  author_email text,
  created_at timestamptz not null default now()
);
create index content_revisions_entity_idx on public.content_revisions(entity_type, entity_id, created_at desc);
