-- OQC Teacher Excellence Center: role-specific, subject-specific teacher development.
-- Additive only. Does not alter public website content, routes, DNS or existing academic records.

insert into public.app_roles (key, name, description, sort_order)
values ('master_trainer', 'Master Trainer', 'Teacher development, subject assessment, mentoring and Islamic tarbiyah', 9)
on conflict (key) do update set name = excluded.name, description = excluded.description;

insert into public.app_role_permissions (role, permission)
select role, permission from (values
  ('admin', 'teacher_excellence:*'),
  ('academic', 'teacher_excellence:*'),
  ('master_trainer', 'teacher_excellence:read'),
  ('master_trainer', 'teacher_excellence:create'),
  ('master_trainer', 'teacher_excellence:update'),
  ('master_trainer', 'teachers:read'),
  ('qa', 'teacher_excellence:read'),
  ('qa', 'teacher_excellence:create'),
  ('teacher', 'teacher_excellence:self')
) as p(role, permission)
on conflict do nothing;

create table public.teacher_role_assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  role_title text not null check (char_length(role_title) between 2 and 120),
  responsibilities text not null default '',
  assigned_by uuid references public.profiles(id) on delete set null,
  starts_on date not null default current_date,
  ends_on date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on is null or ends_on >= starts_on)
);
create index teacher_role_assignments_teacher_idx on public.teacher_role_assignments(teacher_id, is_active);

create table public.teacher_subject_assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  subject_name text not null check (char_length(subject_name) between 2 and 120),
  teaching_level text not null default 'All levels',
  rubric jsonb not null default '{
    "subject_expertise": {"weight": 30, "label": "Subject expertise"},
    "teaching_effectiveness": {"weight": 25, "label": "Teaching effectiveness"},
    "student_progress": {"weight": 15, "label": "Student learning progress"},
    "lesson_planning": {"weight": 10, "label": "Lesson planning"},
    "islamic_adab": {"weight": 10, "label": "Islamic adab and professional ethics"},
    "communication": {"weight": 5, "label": "Communication and class management"},
    "punctuality": {"weight": 5, "label": "Punctuality and responsibility"}
  }'::jsonb,
  assigned_by uuid references public.profiles(id) on delete set null,
  starts_on date not null default current_date,
  ends_on date,
  is_primary boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(rubric) = 'object'),
  check (ends_on is null or ends_on >= starts_on)
);
create index teacher_subject_assignments_teacher_idx on public.teacher_subject_assignments(teacher_id, is_active);
create index teacher_subject_assignments_course_idx on public.teacher_subject_assignments(course_id);

create table public.teacher_assessments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  subject_assignment_id uuid not null references public.teacher_subject_assignments(id) on delete restrict,
  assessed_by uuid references public.profiles(id) on delete set null,
  assessment_date date not null default current_date,
  dimension_scores jsonb not null default '{}'::jsonb,
  rubric_snapshot jsonb not null default '{}'::jsonb,
  overall_score numeric(5,2) check (overall_score between 0 and 100),
  critical_quran_accuracy_issue boolean not null default false,
  evidence_notes text not null default '',
  strengths text not null default '',
  improvement_actions text not null default '',
  reassessment_due date,
  status text not null default 'draft' check (status in ('draft', 'reviewed', 'action_required', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(dimension_scores) = 'object'),
  check (jsonb_typeof(rubric_snapshot) = 'object')
);
create index teacher_assessments_teacher_idx on public.teacher_assessments(teacher_id, assessment_date desc);
create index teacher_assessments_subject_idx on public.teacher_assessments(subject_assignment_id, assessment_date desc);
create index teacher_assessments_critical_idx on public.teacher_assessments(critical_quran_accuracy_issue) where critical_quran_accuracy_issue;

create table public.teacher_issues (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  subject_assignment_id uuid references public.teacher_subject_assignments(id) on delete set null,
  assessment_id uuid unique references public.teacher_assessments(id) on delete set null,
  category text not null check (category in ('academic_accuracy','teaching_method','student_progress','communication','islamic_tarbiyah','technology','time_management','workload','professionalism','motivation','management_blocker','other')),
  priority text not null default 'P3' check (priority in ('P1','P2','P3','P4')),
  title text not null check (char_length(title) between 3 and 180),
  description text not null default '',
  evidence text not null default '',
  root_cause text not null default '',
  action_plan text not null default '',
  owner_id uuid references public.profiles(id) on delete set null,
  due_date date,
  status text not null default 'open' check (status in ('open','investigating','coaching','reassessment','resolved','escalated')),
  resolution_note text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create or replace function private.tg_escalate_critical_teacher_assessment() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.critical_quran_accuracy_issue then
    insert into public.teacher_issues (
      teacher_id, subject_assignment_id, assessment_id, category, priority, title,
      description, evidence, action_plan, created_by, status
    ) values (
      new.teacher_id, new.subject_assignment_id, new.id, 'academic_accuracy', 'P1',
      'Critical Quran accuracy issue — assessment follow-up',
      'A critical Quran accuracy concern was flagged in a subject assessment. Immediate academic review is required.',
      new.evidence_notes, new.improvement_actions, new.assessed_by, 'escalated'
    ) on conflict (assessment_id) do nothing;
  end if;
  return new;
end $$;
create trigger teacher_assessment_critical_escalation
  after insert or update of critical_quran_accuracy_issue on public.teacher_assessments
  for each row execute function private.tg_escalate_critical_teacher_assessment();

create index teacher_issues_queue_idx on public.teacher_issues(status, priority, due_date);
create index teacher_issues_teacher_idx on public.teacher_issues(teacher_id, created_at desc);

create table public.teacher_training_modules (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 180),
  category text not null check (category in ('subject_expertise','teaching_method','islamic_tarbiyah','professional_ethics','mentoring','technology')),
  description text not null default '',
  learning_outcomes text[] not null default '{}',
  practical_task text not null default '',
  reference_notes text not null default '',
  sequence_no int not null default 0,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index teacher_training_modules_order_idx on public.teacher_training_modules(is_active, sequence_no);

create table public.teacher_training_records (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  module_id uuid not null references public.teacher_training_modules(id) on delete restrict,
  assigned_by uuid references public.profiles(id) on delete set null,
  status text not null default 'assigned' check (status in ('assigned','in_progress','submitted','passed','needs_revision')),
  score numeric(5,2) check (score between 0 and 100),
  practical_evidence text not null default '',
  trainer_feedback text not null default '',
  assigned_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (teacher_id, module_id)
);
create index teacher_training_records_teacher_idx on public.teacher_training_records(teacher_id, status);

create table public.teacher_class_observations (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  subject_assignment_id uuid references public.teacher_subject_assignments(id) on delete set null,
  observer_id uuid references public.profiles(id) on delete set null,
  observed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  observation_scores jsonb not null default '{}'::jsonb,
  evidence_notes text not null default '',
  agreed_actions text not null default '',
  follow_up_date date,
  created_at timestamptz not null default now(),
  check (jsonb_typeof(observation_scores) = 'object')
);
create index teacher_class_observations_teacher_idx on public.teacher_class_observations(teacher_id, observed_at desc);

create table public.teacher_weekly_plans (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  week_start date not null,
  focus text not null default '',
  actions jsonb not null default '[]'::jsonb,
  owner_id uuid references public.profiles(id) on delete set null,
  status text not null default 'planned' check (status in ('planned','in_progress','review','complete','blocked')),
  review_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (teacher_id, week_start),
  check (jsonb_typeof(actions) = 'array')
);
create index teacher_weekly_plans_week_idx on public.teacher_weekly_plans(week_start desc, status);

-- Parent feedback is intentionally a small supporting signal, not a high-volume scoring system.
-- It is staff-entered after a real contact; do not treat unverified feedback as proof.
create table public.teacher_parent_feedback (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  subject_assignment_id uuid references public.teacher_subject_assignments(id) on delete set null,
  received_on date not null default current_date,
  updated_at timestamptz not null default now(),
  feedback_summary text not null check (char_length(feedback_summary) between 3 and 1200),
  source_note text not null default '',
  verified boolean not null default false,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index teacher_parent_feedback_teacher_idx on public.teacher_parent_feedback(teacher_id, received_on desc);

-- Starter curriculum: topic and practical task only; detailed Islamic references/content require scholarly review.
insert into public.teacher_training_modules (title, category, description, learning_outcomes, practical_task, sequence_no)
select v.title, v.category, v.description, v.outcomes, v.task, v.sequence_no
from (values
  (1, 'Ikhlas and teaching intention', 'islamic_tarbiyah', 'Reflect on sincerity, responsibility and consistency in Quran teaching.', array['Explain the purpose of the teacher role','Set a practical personal improvement intention'], 'Write a short reflective plan and discuss one observable improvement with the trainer.'),
  (2, 'Amanah and respect for the Quran', 'islamic_tarbiyah', 'Understand the responsibility of accurate, careful Quran instruction.', array['Recognise the duty to teach accurately','Know when to pause and seek qualified correction'], 'Demonstrate a lesson segment and identify any point that needs scholarly or subject-specialist verification.'),
  (3, 'Teacher adab and professional conduct', 'professional_ethics', 'Build respectful conduct, reliability, confidentiality and professional boundaries.', array['Apply respectful communication','Protect student and family confidentiality'], 'Complete a scenario-based conduct review and action checklist.'),
  (4, 'Mercy, patience and learner dignity', 'islamic_tarbiyah', 'Use patient, age-appropriate and encouraging teaching practices.', array['Respond calmly to repeated mistakes','Avoid humiliation and harmful comparison'], 'Role-play a supportive correction for a learner who is struggling.'),
  (5, 'Correcting mistakes with wisdom', 'teaching_method', 'Give clear, accurate and proportionate feedback without discouraging learners.', array['Identify the learning gap','Model, practise and check understanding'], 'Record a short correction cycle: model, learner practice, check and feedback.'),
  (6, 'Trust, honesty and accountability', 'professional_ethics', 'Maintain honest records, punctuality and clear accountability.', array['Record lesson outcomes accurately','Escalate concerns without concealment'], 'Complete a sample class record and explain the escalation route for a serious concern.'),
  (7, 'Student character and learner development', 'islamic_tarbiyah', 'Support student confidence, good habits and responsible learning.', array['Set an age-appropriate development goal','Encourage learner independence'], 'Prepare a four-week learner development goal with observable indicators.'),
  (8, 'Respectful parent communication', 'professional_ethics', 'Communicate progress and concerns with clarity and appropriate boundaries.', array['Share evidence-based progress updates','Keep parent feedback proportionate and respectful'], 'Draft one balanced progress update using verified class observations.'),
  (9, 'Islamic conflict resolution and teamwork', 'mentoring', 'Resolve routine disagreements respectfully and escalate serious concerns.', array['Listen before responding','Use the correct escalation pathway'], 'Work through a case study and document the agreed resolution steps.'),
  (10, 'Mentor leadership and teacher motivation', 'mentoring', 'Support colleagues through coaching, encouragement and measurable goals.', array['Set a realistic coaching goal','Give actionable feedback'], 'Conduct a practice mentoring conversation with a clear follow-up date.'),
  (11, 'Class observation and evidence-based feedback', 'teaching_method', 'Observe lessons fairly and separate evidence from assumptions.', array['Use a role- and subject-relevant observation rubric','Agree specific next steps'], 'Complete a supervised class observation and submit evidence-based feedback.'),
  (12, 'Practical mentoring capstone', 'mentoring', 'Integrate subject expertise, teaching skill, adab and reflective improvement.', array['Demonstrate improved practice','Present evidence of progress'], 'Deliver a reviewed lesson demonstration and a personal development plan.')
) as v(sequence_no,title,category,description,outcomes,task)
where not exists (select 1 from public.teacher_training_modules m where m.title = v.title);

-- All records remain staff-only. Public/anonymous roles receive no access.
do $$
declare t text;
begin
  foreach t in array array[
    'teacher_role_assignments','teacher_subject_assignments','teacher_assessments','teacher_issues',
    'teacher_training_modules','teacher_training_records','teacher_class_observations',
    'teacher_weekly_plans','teacher_parent_feedback'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon', t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', t);
    perform private.apply_staff_policies(t, 'teacher_excellence');
    execute format('create trigger %I before update on public.%I for each row execute function private.tg_set_updated_at()',
      t || '_updated_at', t);
  end loop;
end $$;

-- Teachers may view their own assignments, assessments, training and weekly plans only.
create policy "teacher own roles read" on public.teacher_role_assignments
  for select to authenticated using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_active and p.teacher_id = teacher_id)
  );
create policy "teacher own subjects read" on public.teacher_subject_assignments
  for select to authenticated using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_active and p.teacher_id = teacher_id)
  );
create policy "teacher own assessments read" on public.teacher_assessments
  for select to authenticated using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_active and p.teacher_id = teacher_id)
  );
create policy "teacher own training records read" on public.teacher_training_records
  for select to authenticated using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_active and p.teacher_id = teacher_id)
  );
create policy "teacher own weekly plans read" on public.teacher_weekly_plans
  for select to authenticated using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_active and p.teacher_id = teacher_id)
  );

-- Keep the critical accuracy flag visible as a separate escalation signal; it must not be averaged away.

-- Teacher self-service: the authenticated teacher may see only their own public staff
-- profile and training module content assigned to them.
create policy "teacher own profile read" on public.teachers
  for select to authenticated using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_active and p.teacher_id = teachers.id)
  );
create policy "teacher assigned module read" on public.teacher_training_modules
  for select to authenticated using (
    exists (select 1 from public.teacher_training_records tr
      join public.profiles p on p.teacher_id = tr.teacher_id
      where p.id = auth.uid() and p.is_active and tr.module_id = teacher_training_modules.id)
  );
