-- Admissions (free-trial applications, contact messages, complaints) and academics
-- (students, guardians, enrollments, weekly schedules, class sessions, attendance, progress, certificates).

-- ---------------------------------------------------------------------------
-- Free-trial applications
-- ---------------------------------------------------------------------------
create table public.trial_applications (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  learner_name text not null check (char_length(learner_name) between 2 and 120),
  guardian_name text,
  email text not null check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text not null check (char_length(phone) between 6 and 32),
  phone_is_whatsapp boolean not null default true,
  country text not null,
  city text,
  timezone text not null default 'Europe/London',
  age_band text not null check (age_band in ('child_4_7', 'child_8_12', 'teen_13_17', 'adult')),
  learner_gender text check (learner_gender in ('female', 'male')),
  course_id uuid references public.courses(id) on delete set null,
  level text not null default 'beginner' check (level in ('beginner', 'intermediate', 'advanced')),
  teacher_gender_pref text not null default 'any' check (teacher_gender_pref in ('female', 'male', 'any')),
  teaching_language text not null default 'English',
  preferred_days text[] not null default '{}',
  preferred_times text[] not null default '{}',
  notes text,
  consent_given boolean not null check (consent_given),
  consent_text_version text not null,
  consent_at timestamptz not null default now(),
  marketing_opt_in boolean not null default false,
  source text not null default 'website',
  utm jsonb not null default '{}'::jsonb,
  status text not null default 'new'
    check (status in ('new', 'reviewed', 'scheduled', 'completed', 'enrolled', 'cancelled', 'no_show')),
  outcome_note text,
  assigned_to uuid references public.profiles(id) on delete set null,
  assigned_teacher_id uuid references public.teachers(id) on delete set null,
  trial_at timestamptz,
  trial_duration_min int not null default 30 check (trial_duration_min between 15 and 120),
  meeting_url text,
  duplicate_of_id uuid references public.trial_applications(id) on delete set null,
  student_id uuid,
  ip_hash text,
  user_agent text,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index trials_status_idx on public.trial_applications(status, created_at desc) where deleted_at is null;
create index trials_assigned_idx on public.trial_applications(assigned_to, status);
create index trials_email_idx on public.trial_applications(email, created_at desc);
create index trials_phone_idx on public.trial_applications(phone, created_at desc);
create index trials_course_idx on public.trial_applications(course_id);
create index trials_teacher_idx on public.trial_applications(assigned_teacher_id);

create table public.trial_history (
  id bigint generated always as identity primary key,
  trial_id uuid not null references public.trial_applications(id) on delete cascade,
  from_status text,
  to_status text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);
create index trial_history_trial_idx on public.trial_history(trial_id, created_at);

create table public.trial_notes (
  id uuid primary key default gen_random_uuid(),
  trial_id uuid not null references public.trial_applications(id) on delete cascade,
  author_id uuid default auth.uid() references public.profiles(id) on delete set null,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index trial_notes_trial_idx on public.trial_notes(trial_id, created_at);

-- ---------------------------------------------------------------------------
-- Contact messages
-- ---------------------------------------------------------------------------
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text,
  country text,
  city text,
  subject text not null check (char_length(subject) between 2 and 160),
  message text not null check (char_length(message) between 5 and 5000),
  consent_text_version text not null,
  consent_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'spam', 'archived')),
  spam_score int not null default 0,
  assigned_to uuid references public.profiles(id) on delete set null,
  replied_at timestamptz,
  replied_by uuid references public.profiles(id) on delete set null,
  internal_note text,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index contact_messages_status_idx on public.contact_messages(status, created_at desc) where deleted_at is null;

-- ---------------------------------------------------------------------------
-- Students and guardians
-- ---------------------------------------------------------------------------
create table public.students (
  id uuid primary key default gen_random_uuid(),
  student_code text not null unique,
  full_name text not null check (char_length(full_name) between 2 and 120),
  gender text check (gender in ('female', 'male')),
  date_of_birth date,
  age_band text check (age_band in ('child_4_7', 'child_8_12', 'teen_13_17', 'adult')),
  country text not null default '',
  city text,
  timezone text not null default 'Europe/London',
  email text check (email is null or email = lower(email)),
  phone text,
  notes text,
  status text not null default 'active' check (status in ('active', 'paused', 'left', 'completed')),
  joined_on date not null default current_date,
  left_on date,
  left_reason text,
  created_from_trial_id uuid unique references public.trial_applications(id) on delete set null,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index students_status_idx on public.students(status) where deleted_at is null;
create index students_name_idx on public.students(lower(full_name));

alter table public.trial_applications
  add constraint trial_applications_student_id_fkey foreign key (student_id) references public.students(id) on delete set null;

create table public.guardians (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text check (email is null or email = lower(email)),
  phone text,
  whatsapp text,
  relationship text not null default 'Parent',
  country text,
  city text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index guardians_email_idx on public.guardians(email);

create table public.student_guardians (
  student_id uuid not null references public.students(id) on delete cascade,
  guardian_id uuid not null references public.guardians(id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (student_id, guardian_id)
);
create index student_guardians_guardian_idx on public.student_guardians(guardian_id);

-- ---------------------------------------------------------------------------
-- Enrollments and weekly class schedules
-- ---------------------------------------------------------------------------
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete restrict,
  course_id uuid not null references public.courses(id) on delete restrict,
  teacher_id uuid references public.teachers(id) on delete set null,
  plan_id uuid references public.pricing_plans(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'cancelled')),
  start_date date not null default current_date,
  end_date date,
  classes_per_week int check (classes_per_week between 1 and 7),
  duration_min int not null default 30 check (duration_min between 15 and 180),
  fee_currency text not null default 'USD' check (fee_currency ~ '^[A-Z]{3}$'),
  fee_amount_minor int not null default 0 check (fee_amount_minor >= 0),
  discount_percent numeric(5, 2) not null default 0 check (discount_percent between 0 and 100),
  billing_day int not null default 1 check (billing_day between 1 and 28),
  notes text,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (end_date is null or end_date >= start_date)
);
create index enrollments_student_idx on public.enrollments(student_id);
create index enrollments_course_idx on public.enrollments(course_id);
create index enrollments_teacher_idx on public.enrollments(teacher_id);
create index enrollments_status_idx on public.enrollments(status) where deleted_at is null;

create table public.class_schedules (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  teacher_id uuid references public.teachers(id) on delete set null,
  weekday smallint not null check (weekday between 0 and 6), -- 0 = Sunday
  start_time time not null,
  duration_min int not null default 30 check (duration_min between 15 and 180),
  timezone text not null default 'Europe/London',
  meeting_url text,
  effective_from date not null default current_date,
  effective_to date,
  is_active boolean not null default true,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_to is null or effective_to >= effective_from)
);
create index class_schedules_enrollment_idx on public.class_schedules(enrollment_id);
create index class_schedules_teacher_idx on public.class_schedules(teacher_id, weekday);

-- ---------------------------------------------------------------------------
-- Class sessions, attendance, progress
-- ---------------------------------------------------------------------------
create table public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid references public.class_schedules(id) on delete set null,
  enrollment_id uuid references public.enrollments(id) on delete cascade,
  trial_id uuid references public.trial_applications(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  teacher_id uuid references public.teachers(id) on delete set null,
  kind text not null default 'regular' check (kind in ('regular', 'trial', 'makeup', 'assessment')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'planned' check (status in ('planned', 'held', 'cancelled', 'rescheduled', 'missed')),
  cancel_reason text,
  meeting_url text,
  notes text,
  rescheduled_from_id uuid references public.class_sessions(id) on delete set null,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  unique (schedule_id, starts_at)
);
create index class_sessions_teacher_idx on public.class_sessions(teacher_id, starts_at);
create index class_sessions_student_idx on public.class_sessions(student_id, starts_at);
create index class_sessions_starts_idx on public.class_sessions(starts_at);
create index class_sessions_trial_idx on public.class_sessions(trial_id);
create index class_sessions_enrollment_idx on public.class_sessions(enrollment_id);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.class_sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  enrollment_id uuid references public.enrollments(id) on delete set null,
  status text not null check (status in ('present', 'absent', 'late', 'excused')),
  minutes_late int check (minutes_late between 0 and 180),
  note text,
  marked_by uuid default auth.uid() references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, student_id)
);
create index attendance_student_idx on public.attendance(student_id, created_at desc);
create index attendance_enrollment_idx on public.attendance(enrollment_id);

create table public.progress_records (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  session_id uuid references public.class_sessions(id) on delete set null,
  author_id uuid default auth.uid() references public.profiles(id) on delete set null,
  record_date date not null default current_date,
  lesson_ref text,
  level text,
  summary text not null check (char_length(summary) between 2 and 4000),
  homework text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index progress_records_enrollment_idx on public.progress_records(enrollment_id, record_date desc);
create index progress_records_student_idx on public.progress_records(student_id, record_date desc);
create index progress_records_session_idx on public.progress_records(session_id);

-- ---------------------------------------------------------------------------
-- Complaints (ADM-2 status set: Open / Under Review / Action Taken / Follow-up / Closed)
-- ---------------------------------------------------------------------------
create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  student_id uuid references public.students(id) on delete set null,
  guardian_id uuid references public.guardians(id) on delete set null,
  raised_by_name text not null,
  contact_email text,
  contact_phone text,
  channel text not null default 'WhatsApp',
  category text,
  complaint_class text not null default 'standard'
    check (complaint_class in ('standard', 'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7')),
  subject text not null,
  details text not null default '',
  status text not null default 'open' check (status in ('open', 'under_review', 'action_taken', 'follow_up', 'closed')),
  assigned_to uuid references public.profiles(id) on delete set null,
  acknowledged_at timestamptz,
  ack_due_at timestamptz,
  resolve_due_at timestamptz,
  escalated_to text check (escalated_to in ('qa', 'ceo')),
  resolution text,
  closed_at timestamptz,
  created_by uuid default auth.uid() references public.profiles(id) on delete set null,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index complaints_status_idx on public.complaints(status, created_at desc) where deleted_at is null;

-- ---------------------------------------------------------------------------
-- Certificates
-- ---------------------------------------------------------------------------
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  student_id uuid not null references public.students(id) on delete restrict,
  enrollment_id uuid references public.enrollments(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  achievement text not null default '',
  issued_on date not null default current_date,
  signed_by text not null default '',
  status text not null default 'draft' check (status in ('draft', 'issued', 'revoked')),
  notes text,
  created_by uuid default auth.uid() references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index certificates_student_idx on public.certificates(student_id);
