-- Business logic: triggers (timestamps, versions, audit, references, workflows, money) and RPC functions.

-- ---------------------------------------------------------------------------
-- 1. Generic triggers attached to every table that has the column
-- ---------------------------------------------------------------------------
do $$
declare r record; t text;
begin
  for r in
    select c.table_name from information_schema.columns c
    join information_schema.tables t on t.table_schema = c.table_schema and t.table_name = c.table_name
    where c.table_schema = 'public' and c.column_name = 'updated_at' and t.table_type = 'BASE TABLE'
      and c.table_name not in ('profiles', 'settings')
  loop
    execute format('create trigger %I before update on public.%I for each row execute function private.tg_set_updated_at()',
                   r.table_name || '_updated_at', r.table_name);
  end loop;
  for r in
    select c.table_name from information_schema.columns c
    join information_schema.tables t on t.table_schema = c.table_schema and t.table_name = c.table_name
    where c.table_schema = 'public' and c.column_name = 'version' and t.table_type = 'BASE TABLE'
  loop
    execute format('create trigger %I before update on public.%I for each row execute function private.tg_bump_version()',
                   r.table_name || '_version', r.table_name);
  end loop;
  foreach t in array array[
    'app_role_permissions', 'profiles', 'settings', 'courses', 'course_modules', 'teachers', 'teacher_courses',
    'pricing_plans', 'pricing_plan_prices', 'pages', 'page_sections', 'blog_posts', 'faqs', 'testimonials',
    'menu_items', 'redirects', 'media_assets', 'trial_applications', 'contact_messages', 'students', 'guardians',
    'student_guardians', 'enrollments', 'class_schedules', 'class_sessions', 'attendance', 'progress_records',
    'complaints', 'certificates', 'invoices', 'invoice_items', 'payments'
  ]
  loop
    execute format('create trigger %I after insert or update or delete on public.%I for each row execute function private.tg_audit()',
                   t || '_audit', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Human-friendly references
-- ---------------------------------------------------------------------------
create or replace function private.tg_assign_reference() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_year text := to_char(now() at time zone 'Asia/Karachi', 'YYYY');
begin
  case tg_table_name
    when 'trial_applications' then
      if new.reference is null or new.reference = '' then
        new.reference := 'TR-' || v_year || '-' || lpad(private.next_counter('trial-' || v_year)::text, 5, '0');
      end if;
    when 'contact_messages' then
      if new.reference is null or new.reference = '' then
        new.reference := 'MSG-' || v_year || '-' || lpad(private.next_counter('contact-' || v_year)::text, 5, '0');
      end if;
    when 'students' then
      if new.student_code is null or new.student_code = '' then
        new.student_code := 'OQC-' || lpad(private.next_counter('student')::text, 5, '0');
      end if;
    when 'complaints' then
      if new.reference is null or new.reference = '' then
        new.reference := 'CMP-' || v_year || '-' || lpad(private.next_counter('complaint-' || v_year)::text, 4, '0');
      end if;
    when 'invoices' then
      if new.number is null or new.number = '' then
        new.number := 'INV-' || v_year || '-' || lpad(private.next_counter('invoice-' || v_year)::text, 5, '0');
      end if;
    when 'certificates' then
      if new.number is null or new.number = '' then
        new.number := 'OQC-CERT-' || v_year || '-' || lpad(private.next_counter('certificate-' || v_year)::text, 4, '0');
      end if;
    else null;
  end case;
  return new;
end $$;

create trigger trial_applications_reference before insert on public.trial_applications
  for each row execute function private.tg_assign_reference();
create trigger contact_messages_reference before insert on public.contact_messages
  for each row execute function private.tg_assign_reference();
create trigger students_reference before insert on public.students
  for each row execute function private.tg_assign_reference();
create trigger complaints_reference before insert on public.complaints
  for each row execute function private.tg_assign_reference();
create trigger invoices_reference before insert on public.invoices
  for each row execute function private.tg_assign_reference();
create trigger certificates_reference before insert on public.certificates
  for each row execute function private.tg_assign_reference();

-- ---------------------------------------------------------------------------
-- 3. Publishing workflow for website content
-- ---------------------------------------------------------------------------
create or replace function private.content_module(p_table text) returns text
language sql immutable set search_path = '' as $$
  select case p_table
    when 'courses' then 'courses'
    when 'pages' then 'pages'
    when 'blog_posts' then 'blog'
    when 'faqs' then 'faqs'
    when 'testimonials' then 'testimonials'
    when 'pricing_plans' then 'pricing'
    else p_table end
$$;

create or replace function private.tg_content_workflow() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_new jsonb := to_jsonb(new);
begin
  if new.status in ('published', 'scheduled')
     and (tg_op = 'INSERT' or old.status is distinct from new.status)
     and auth.uid() is not null
     and not public.has_permission(private.content_module(tg_table_name) || ':publish') then
    raise exception 'You do not have permission to publish. Save as draft or send for review.' using errcode = '42501';
  end if;
  if new.status = 'scheduled' then
    if new.scheduled_at is null then
      raise exception 'Choose the date and time to publish.' using errcode = '22023';
    end if;
    if new.scheduled_at <= now() then
      new.status := 'published';
      new.published_at := new.scheduled_at;
    end if;
  end if;
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  if v_new ? 'updated_by' and auth.uid() is not null then
    new := jsonb_populate_record(new, jsonb_build_object('updated_by', auth.uid()));
    if tg_op = 'INSERT' and v_new ? 'created_by' and (v_new ->> 'created_by') is null then
      new := jsonb_populate_record(new, jsonb_build_object('created_by', auth.uid()));
    end if;
  end if;
  return new;
end $$;

create or replace function private.tg_content_revision() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_old jsonb := to_jsonb(old) - 'updated_at' - 'version' - 'updated_by';
  v_new jsonb := to_jsonb(new) - 'updated_at' - 'version' - 'updated_by';
  v_email text;
begin
  if v_old = v_new then return new; end if;
  if auth.uid() is not null then
    select email into v_email from auth.users where id = auth.uid();
  end if;
  insert into public.content_revisions (entity_type, entity_id, snapshot, author_id, author_email)
  values (tg_table_name, old.id, to_jsonb(old), auth.uid(), v_email);
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['courses', 'pages', 'blog_posts', 'faqs', 'testimonials', 'pricing_plans'] loop
    execute format('create trigger %I before insert or update on public.%I for each row execute function private.tg_content_workflow()',
                   t || '_workflow', t);
  end loop;
  foreach t in array array['courses', 'pages', 'blog_posts'] loop
    execute format('create trigger %I after update on public.%I for each row execute function private.tg_content_revision()',
                   t || '_revision', t);
  end loop;
end $$;

create or replace function private.publish_due_content() returns int
language plpgsql security definer set search_path = '' as $$
declare v_total int := 0; v_n int; t text;
begin
  foreach t in array array['courses', 'pages', 'blog_posts', 'faqs', 'testimonials', 'pricing_plans'] loop
    execute format('update public.%I set status = ''published'', published_at = coalesce(scheduled_at, now())
                    where status = ''scheduled'' and scheduled_at <= now()', t);
    get diagnostics v_n = row_count;
    v_total := v_total + v_n;
  end loop;
  return v_total;
end $$;

-- ---------------------------------------------------------------------------
-- 4. Free-trial workflow
-- ---------------------------------------------------------------------------
create or replace function private.trial_transition_allowed(p_from text, p_to text) returns boolean
language sql immutable set search_path = '' as $$
  select p_from = p_to or p_to = any (case p_from
    when 'new' then array['reviewed', 'scheduled', 'cancelled']
    when 'reviewed' then array['scheduled', 'cancelled']
    when 'scheduled' then array['completed', 'no_show', 'cancelled']
    when 'completed' then array['enrolled', 'cancelled']
    when 'enrolled' then array['cancelled']
    when 'no_show' then array['scheduled', 'cancelled']
    when 'cancelled' then array['reviewed']
    else array[]::text[] end)
$$;

create or replace function private.tg_trial_workflow() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    if not private.trial_transition_allowed(old.status, new.status) then
      raise exception 'A trial cannot move from "%" to "%".', old.status, new.status using errcode = '22023';
    end if;
    if new.status = 'scheduled' and new.trial_at is null then
      raise exception 'Set the trial class date and time before marking it scheduled.' using errcode = '22023';
    end if;
    if new.status = 'enrolled' and new.student_id is null then
      raise exception 'Convert the trial into a student to mark it enrolled.' using errcode = '22023';
    end if;
  end if;
  if new.email is not null then new.email := lower(trim(new.email)); end if;
  return new;
end $$;

create trigger trial_applications_workflow before insert or update on public.trial_applications
  for each row execute function private.tg_trial_workflow();

create or replace function private.tg_trial_after() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_course text;
begin
  if tg_op = 'INSERT' then
    insert into public.trial_history (trial_id, from_status, to_status, actor_id, note)
    values (new.id, null, new.status, auth.uid(), case when auth.uid() is null then 'Submitted on the website' else 'Created by staff' end);
    select title into v_course from public.courses where id = new.course_id;
    perform private.notify_permission('trials:read', 'trial.new', 'New free-trial request',
      new.learner_name || coalesce(' · ' || v_course, '') || ' · ' || new.country,
      '/admin/trials/' || new.id, 'trial', new.id);
  elsif new.status is distinct from old.status then
    insert into public.trial_history (trial_id, from_status, to_status, actor_id, note)
    values (new.id, old.status, new.status, auth.uid(), nullif(new.outcome_note, old.outcome_note));
  end if;
  if new.assigned_to is not null and (tg_op = 'INSERT' or new.assigned_to is distinct from old.assigned_to)
     and new.assigned_to is distinct from auth.uid() then
    insert into public.notifications (user_id, kind, title, body, link, entity_type, entity_id)
    values (new.assigned_to, 'trial.assigned', 'Trial assigned to you', new.learner_name || ' · ' || new.reference,
            '/admin/trials/' || new.id, 'trial', new.id);
  end if;
  return new;
end $$;

create trigger trial_applications_after after insert or update on public.trial_applications
  for each row execute function private.tg_trial_after();

-- Public: submit the free-trial form (called from the website with the publishable key)
create or replace function public.submit_trial_application(payload jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_ip text := private.request_ip_hash();
  v_email text := lower(trim(coalesce(payload ->> 'email', '')));
  v_phone text := regexp_replace(coalesce(payload ->> 'phone', ''), '[^0-9+]', '', 'g');
  v_name text := trim(coalesce(payload ->> 'learner_name', ''));
  v_tz text := coalesce(nullif(trim(payload ->> 'timezone'), ''), 'UTC');
  v_age text := coalesce(payload ->> 'age_band', '');
  v_course uuid;
  v_dup uuid;
  v_ref text;
  v_consent_version text;
begin
  if coalesce(payload ->> 'website', '') <> '' then
    return jsonb_build_object('ok', true, 'reference', 'TR-RECEIVED');
  end if;
  if not private.hit_rate_limit('trial:' || v_ip, 6, interval '1 hour') then
    raise exception 'Too many requests from your connection. Please try again later or message us on WhatsApp.';
  end if;
  if char_length(v_name) < 2 or char_length(v_name) > 120 then
    raise exception 'Please enter the learner''s full name.';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(v_email) > 254 then
    raise exception 'Please enter a valid email address.';
  end if;
  if char_length(v_phone) < 7 or char_length(v_phone) > 20 then
    raise exception 'Please enter a valid phone or WhatsApp number with country code.';
  end if;
  if v_age not in ('child_4_7', 'child_8_12', 'teen_13_17', 'adult') then
    raise exception 'Please choose the learner''s age group.';
  end if;
  if coalesce(nullif(trim(payload ->> 'country'), ''), '') = '' then
    raise exception 'Please choose your country.';
  end if;
  if coalesce((payload ->> 'consent')::boolean, false) is not true then
    raise exception 'Please agree to the privacy notice so we can contact you.';
  end if;
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = v_tz) then
    v_tz := 'UTC';
  end if;
  if coalesce(payload ->> 'course_id', '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    select id into v_course from public.courses
      where id = (payload ->> 'course_id')::uuid and status = 'published' and deleted_at is null;
  end if;
  select value ->> 'consent_version' into v_consent_version from public.settings where key = 'site.forms';

  select id into v_dup from public.trial_applications
   where (email = v_email or phone = v_phone)
     and course_id is not distinct from v_course
     and created_at > now() - interval '30 days'
     and duplicate_of_id is null and deleted_at is null
   order by created_at limit 1;

  insert into public.trial_applications (
    learner_name, guardian_name, email, phone, phone_is_whatsapp, country, city, timezone, age_band,
    learner_gender, course_id, level, teacher_gender_pref, teaching_language, preferred_days, preferred_times,
    notes, consent_given, consent_text_version, marketing_opt_in, source, utm, duplicate_of_id, ip_hash, user_agent)
  values (
    v_name,
    nullif(left(trim(coalesce(payload ->> 'guardian_name', '')), 120), ''),
    v_email,
    v_phone,
    coalesce((payload ->> 'phone_is_whatsapp')::boolean, true),
    left(trim(payload ->> 'country'), 80),
    nullif(left(trim(coalesce(payload ->> 'city', '')), 80), ''),
    v_tz,
    v_age,
    case when payload ->> 'learner_gender' in ('female', 'male') then payload ->> 'learner_gender' end,
    v_course,
    case when payload ->> 'level' in ('beginner', 'intermediate', 'advanced') then payload ->> 'level' else 'beginner' end,
    case when payload ->> 'teacher_gender_pref' in ('female', 'male', 'any') then payload ->> 'teacher_gender_pref' else 'any' end,
    coalesce(nullif(left(trim(coalesce(payload ->> 'teaching_language', '')), 40), ''), 'English'),
    coalesce(array(select left(x, 12) from jsonb_array_elements_text(coalesce(payload -> 'preferred_days', '[]'::jsonb)) x limit 7), '{}'),
    coalesce(array(select left(x, 20) from jsonb_array_elements_text(coalesce(payload -> 'preferred_times', '[]'::jsonb)) x limit 6), '{}'),
    nullif(left(trim(coalesce(payload ->> 'notes', '')), 2000), ''),
    true,
    coalesce(v_consent_version, '2026-10-13'),
    coalesce((payload ->> 'marketing_opt_in')::boolean, false),
    coalesce(nullif(left(payload ->> 'source', 40), ''), 'website'),
    coalesce(payload -> 'utm', '{}'::jsonb),
    v_dup,
    v_ip,
    private.request_user_agent()
  ) returning reference into v_ref;

  return jsonb_build_object('ok', true, 'reference', v_ref);
end $$;

-- Staff: schedule (or reschedule) the trial class and keep its calendar entry in sync
create or replace function public.schedule_trial(
  p_trial_id uuid, p_teacher_id uuid, p_trial_at timestamptz,
  p_duration_min int default 30, p_meeting_url text default null
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_trial public.trial_applications;
  v_session uuid;
  v_teacher_user uuid;
begin
  if not public.has_permission('trials:update') then
    raise exception 'You do not have permission to schedule trials.' using errcode = '42501';
  end if;
  select * into v_trial from public.trial_applications where id = p_trial_id and deleted_at is null for update;
  if not found then raise exception 'Trial not found.'; end if;
  if v_trial.status not in ('new', 'reviewed', 'scheduled', 'no_show') then
    raise exception 'Only open trials can be scheduled.';
  end if;
  if p_trial_at is null then raise exception 'Choose the trial date and time.'; end if;

  update public.trial_applications
     set assigned_teacher_id = p_teacher_id,
         trial_at = p_trial_at,
         trial_duration_min = coalesce(p_duration_min, 30),
         meeting_url = coalesce(nullif(p_meeting_url, ''), meeting_url),
         status = 'scheduled',
         assigned_to = coalesce(assigned_to, auth.uid())
   where id = p_trial_id;

  select id into v_session from public.class_sessions
   where trial_id = p_trial_id and kind = 'trial' and status = 'planned'
   order by created_at desc limit 1;
  if v_session is null then
    insert into public.class_sessions (trial_id, teacher_id, kind, starts_at, ends_at, meeting_url, notes)
    values (p_trial_id, p_teacher_id, 'trial', p_trial_at,
            p_trial_at + make_interval(mins => coalesce(p_duration_min, 30)),
            nullif(p_meeting_url, ''), 'Free trial: ' || v_trial.learner_name)
    returning id into v_session;
  else
    update public.class_sessions
       set teacher_id = p_teacher_id, starts_at = p_trial_at,
           ends_at = p_trial_at + make_interval(mins => coalesce(p_duration_min, 30)),
           meeting_url = coalesce(nullif(p_meeting_url, ''), meeting_url)
     where id = v_session;
  end if;

  select id into v_teacher_user from public.profiles where teacher_id = p_teacher_id and is_active;
  if v_teacher_user is not null then
    insert into public.notifications (user_id, kind, title, body, link, entity_type, entity_id)
    values (v_teacher_user, 'trial.scheduled', 'New trial class',
            v_trial.learner_name || ' · ' || to_char(p_trial_at at time zone 'Asia/Karachi', 'Dy DD Mon, HH12:MI AM') || ' PKT',
            '/admin/my-classes', 'class_session', v_session);
  end if;
  return jsonb_build_object('ok', true, 'session_id', v_session);
end $$;

-- Staff: convert a completed trial into a student + guardian + enrollment (+ weekly schedule)
create or replace function public.convert_trial_to_student(p_trial_id uuid, payload jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_trial public.trial_applications;
  v_student uuid;
  v_guardian uuid;
  v_enrollment uuid;
  v_plan public.pricing_plans;
  v_currency text := upper(coalesce(nullif(payload ->> 'currency', ''), 'USD'));
  v_fee int;
  v_course uuid;
  v_teacher uuid;
  v_start date := coalesce(nullif(payload ->> 'start_date', '')::date, current_date);
  v_slot jsonb;
  v_generated int := 0;
begin
  if not (public.has_permission('trials:convert')
          or (public.has_permission('students:create') and public.has_permission('enrollments:create'))) then
    raise exception 'You do not have permission to enrol students.' using errcode = '42501';
  end if;
  select * into v_trial from public.trial_applications where id = p_trial_id and deleted_at is null for update;
  if not found then raise exception 'Trial not found.'; end if;
  if v_trial.student_id is not null then raise exception 'This trial has already been converted.'; end if;
  if v_trial.status not in ('scheduled', 'completed') then
    raise exception 'Only a scheduled or completed trial can be converted into an enrolment.';
  end if;

  v_course := coalesce(nullif(payload ->> 'course_id', '')::uuid, v_trial.course_id);
  if v_course is null then raise exception 'Choose the course for the enrolment.'; end if;
  v_teacher := coalesce(nullif(payload ->> 'teacher_id', '')::uuid, v_trial.assigned_teacher_id);

  if nullif(payload ->> 'plan_id', '') is not null then
    select * into v_plan from public.pricing_plans where id = (payload ->> 'plan_id')::uuid;
  end if;
  v_fee := coalesce(nullif(payload ->> 'fee_amount_minor', '')::int,
                    (select amount_minor from public.pricing_plan_prices
                      where plan_id = v_plan.id and currency = v_currency), 0);

  insert into public.students (full_name, gender, age_band, country, city, timezone, email, phone,
                               notes, created_from_trial_id, joined_on)
  values (coalesce(nullif(trim(payload ->> 'student_name'), ''), v_trial.learner_name),
          v_trial.learner_gender, v_trial.age_band, v_trial.country, v_trial.city, v_trial.timezone,
          case when v_trial.age_band = 'adult' then v_trial.email end,
          case when v_trial.age_band = 'adult' then v_trial.phone end,
          v_trial.notes, v_trial.id, v_start)
  returning id into v_student;

  if v_trial.age_band <> 'adult' or v_trial.guardian_name is not null then
    select g.id into v_guardian from public.guardians g
     where g.email = v_trial.email and g.deleted_at is null limit 1;
    if v_guardian is null then
      insert into public.guardians (full_name, email, phone, whatsapp, relationship, country, city)
      values (coalesce(v_trial.guardian_name, 'Parent of ' || v_trial.learner_name), v_trial.email, v_trial.phone,
              case when v_trial.phone_is_whatsapp then v_trial.phone end,
              coalesce(nullif(payload ->> 'relationship', ''), 'Parent'), v_trial.country, v_trial.city)
      returning id into v_guardian;
    end if;
    insert into public.student_guardians (student_id, guardian_id, is_primary)
    values (v_student, v_guardian, true) on conflict do nothing;
  end if;

  insert into public.enrollments (student_id, course_id, teacher_id, plan_id, start_date, classes_per_week,
                                  duration_min, fee_currency, fee_amount_minor, discount_percent, notes)
  values (v_student, v_course, v_teacher, v_plan.id, v_start,
          coalesce(nullif(payload ->> 'classes_per_week', '')::int, v_plan.classes_per_week),
          coalesce(nullif(payload ->> 'duration_min', '')::int, v_plan.duration_min, 30),
          v_currency, v_fee,
          coalesce(nullif(payload ->> 'discount_percent', '')::numeric, 0),
          nullif(payload ->> 'notes', ''))
  returning id into v_enrollment;

  for v_slot in select * from jsonb_array_elements(coalesce(payload -> 'schedule', '[]'::jsonb)) loop
    insert into public.class_schedules (enrollment_id, teacher_id, weekday, start_time, duration_min, timezone,
                                        meeting_url, effective_from)
    values (v_enrollment, v_teacher, (v_slot ->> 'weekday')::smallint, (v_slot ->> 'start_time')::time,
            coalesce(nullif(payload ->> 'duration_min', '')::int, v_plan.duration_min, 30),
            coalesce(nullif(v_slot ->> 'timezone', ''), v_trial.timezone),
            coalesce(nullif(v_slot ->> 'meeting_url', ''), v_trial.meeting_url), v_start);
  end loop;

  if v_trial.status = 'scheduled' then
    update public.trial_applications set status = 'completed' where id = p_trial_id;
    update public.class_sessions set status = 'held'
     where trial_id = p_trial_id and kind = 'trial' and status = 'planned';
  end if;
  update public.trial_applications set student_id = v_student, status = 'enrolled' where id = p_trial_id;

  v_generated := private.generate_sessions_core(v_start, v_start + 13, v_enrollment);

  return jsonb_build_object('ok', true, 'student_id', v_student, 'enrollment_id', v_enrollment,
                            'guardian_id', v_guardian, 'sessions_created', v_generated);
end $$;

-- ---------------------------------------------------------------------------
-- 5. Contact messages
-- ---------------------------------------------------------------------------
create or replace function private.tg_contact_after() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status <> 'spam' then
    perform private.notify_permission('contacts:read', 'contact.new', 'New message: ' || left(new.subject, 60),
      new.name || ' · ' || new.email, '/admin/contacts/' || new.id, 'contact_message', new.id);
  end if;
  return new;
end $$;
create trigger contact_messages_after after insert on public.contact_messages
  for each row execute function private.tg_contact_after();

create or replace function public.submit_contact_message(payload jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_ip text := private.request_ip_hash();
  v_email text := lower(trim(coalesce(payload ->> 'email', '')));
  v_name text := trim(coalesce(payload ->> 'name', ''));
  v_subject text := trim(coalesce(payload ->> 'subject', ''));
  v_message text := trim(coalesce(payload ->> 'message', ''));
  v_links int;
  v_score int := 0;
  v_ref text;
  v_consent_version text;
begin
  if coalesce(payload ->> 'website', '') <> '' then
    return jsonb_build_object('ok', true, 'reference', 'MSG-RECEIVED');
  end if;
  if not private.hit_rate_limit('contact:' || v_ip, 8, interval '1 hour') then
    raise exception 'Too many messages from your connection. Please try again later or message us on WhatsApp.';
  end if;
  if char_length(v_name) < 2 or char_length(v_name) > 120 then raise exception 'Please enter your name.'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(v_email) > 254 then
    raise exception 'Please enter a valid email address.';
  end if;
  if char_length(v_subject) < 2 then v_subject := 'General enquiry'; end if;
  if char_length(v_message) < 5 then raise exception 'Please write a short message.'; end if;
  if coalesce((payload ->> 'consent')::boolean, false) is not true then
    raise exception 'Please agree to the privacy notice so we can reply.';
  end if;
  v_links := (select count(*) from regexp_matches(v_message, 'https?://', 'g'));
  if v_links > 2 then v_score := v_score + 60; end if;
  if v_message ~* '(casino|crypto|viagra|seo services|backlinks|loan offer)' then v_score := v_score + 60; end if;
  select value ->> 'consent_version' into v_consent_version from public.settings where key = 'site.forms';

  insert into public.contact_messages (name, email, phone, country, city, subject, message,
                                       consent_text_version, status, spam_score, ip_hash, user_agent)
  values (left(v_name, 120), v_email,
          nullif(left(regexp_replace(coalesce(payload ->> 'phone', ''), '[^0-9+ ]', '', 'g'), 32), ''),
          nullif(left(trim(coalesce(payload ->> 'country', '')), 80), ''),
          nullif(left(trim(coalesce(payload ->> 'city', '')), 80), ''),
          left(v_subject, 160), left(v_message, 5000),
          coalesce(v_consent_version, '2026-10-13'),
          case when v_score >= 60 then 'spam' else 'new' end, v_score, v_ip, private.request_user_agent())
  returning reference into v_ref;
  return jsonb_build_object('ok', true, 'reference', v_ref);
end $$;

-- ---------------------------------------------------------------------------
-- 6. Complaints (ADM-2: acknowledge within 24h; close standard in 2 business days, E1–E7 in 10)
-- ---------------------------------------------------------------------------
create or replace function private.add_business_days(p_from timestamptz, p_days int) returns timestamptz
language plpgsql immutable set search_path = '' as $$
declare v_ts timestamptz := p_from; v_left int := p_days;
begin
  while v_left > 0 loop
    v_ts := v_ts + interval '1 day';
    if extract(isodow from v_ts at time zone 'Asia/Karachi') < 6 then
      v_left := v_left - 1;
    end if;
  end loop;
  return v_ts;
end $$;

create or replace function private.tg_complaint_workflow() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    new.ack_due_at := coalesce(new.ack_due_at, new.created_at + interval '24 hours');
    new.resolve_due_at := private.add_business_days(new.created_at,
      case when new.complaint_class = 'standard' then 2 else 10 end);
  else
    if new.complaint_class is distinct from old.complaint_class then
      new.resolve_due_at := private.add_business_days(new.created_at,
        case when new.complaint_class = 'standard' then 2 else 10 end);
    end if;
    if old.status = 'open' and new.status <> 'open' and new.acknowledged_at is null then
      new.acknowledged_at := now();
    end if;
    if new.status = 'closed' and old.status <> 'closed' then
      new.closed_at := now();
      if new.acknowledged_at is null then new.acknowledged_at := now(); end if;
    elsif new.status <> 'closed' then
      new.closed_at := null;
    end if;
  end if;
  return new;
end $$;
create trigger complaints_workflow before insert or update on public.complaints
  for each row execute function private.tg_complaint_workflow();

create or replace function private.tg_complaint_after() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    perform private.notify_permission('complaints:read', 'complaint.new',
      'New complaint ' || new.reference || case when new.complaint_class <> 'standard' then ' (' || new.complaint_class || ')' else '' end,
      new.subject, '/admin/complaints/' || new.id, 'complaint', new.id);
  elsif new.assigned_to is distinct from old.assigned_to and new.assigned_to is not null then
    insert into public.notifications (user_id, kind, title, body, link, entity_type, entity_id)
    values (new.assigned_to, 'complaint.assigned', 'Complaint assigned to you', new.reference || ' · ' || new.subject,
            '/admin/complaints/' || new.id, 'complaint', new.id);
  end if;
  return new;
end $$;
create trigger complaints_after after insert or update on public.complaints
  for each row execute function private.tg_complaint_after();

-- ---------------------------------------------------------------------------
-- 7. Classes: session generation, attendance → session status, teacher edit guard
-- ---------------------------------------------------------------------------
create or replace function private.generate_sessions_core(p_from date, p_to date, p_enrollment uuid default null)
returns int
language plpgsql security definer set search_path = '' as $$
declare v_count int;
begin
  insert into public.class_sessions (schedule_id, enrollment_id, student_id, teacher_id, kind, starts_at, ends_at, meeting_url)
  select s.id, s.enrollment_id, e.student_id, coalesce(s.teacher_id, e.teacher_id), 'regular',
         (d::date + s.start_time) at time zone s.timezone,
         ((d::date + s.start_time) at time zone s.timezone) + make_interval(mins => s.duration_min),
         s.meeting_url
  from public.class_schedules s
  join public.enrollments e on e.id = s.enrollment_id and e.status = 'active' and e.deleted_at is null
  join public.students st on st.id = e.student_id and st.status = 'active' and st.deleted_at is null
  cross join lateral generate_series(
      greatest(p_from, s.effective_from, e.start_date)::timestamp,
      least(p_to, coalesce(s.effective_to, p_to), coalesce(e.end_date, p_to))::timestamp,
      interval '1 day') as d
  where s.is_active
    and extract(dow from d) = s.weekday
    and (p_enrollment is null or s.enrollment_id = p_enrollment)
  on conflict (schedule_id, starts_at) do nothing;
  get diagnostics v_count = row_count;
  return v_count;
end $$;

create or replace function public.generate_sessions(p_from date, p_to date) returns int
language plpgsql security definer set search_path = '' as $$
begin
  if not public.has_permission('sessions:create') then
    raise exception 'You do not have permission to create class sessions.' using errcode = '42501';
  end if;
  if p_to < p_from or p_to - p_from > 62 then
    raise exception 'Choose a range of up to 62 days.';
  end if;
  return private.generate_sessions_core(p_from, p_to, null);
end $$;

create or replace function private.tg_attendance_before() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_session public.class_sessions;
begin
  select * into v_session from public.class_sessions where id = new.session_id;
  if new.student_id is null then new.student_id := v_session.student_id; end if;
  if new.enrollment_id is null then new.enrollment_id := v_session.enrollment_id; end if;
  if new.marked_by is null then new.marked_by := auth.uid(); end if;
  return new;
end $$;
create trigger attendance_before before insert or update on public.attendance
  for each row execute function private.tg_attendance_before();

create or replace function private.tg_attendance_after() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.class_sessions
     set status = case when new.status in ('present', 'late') then 'held'
                       when new.status = 'absent' then 'missed'
                       else status end
   where id = new.session_id and status in ('planned', 'held', 'missed');
  return new;
end $$;
create trigger attendance_after after insert or update of status on public.attendance
  for each row execute function private.tg_attendance_after();

create or replace function private.tg_progress_before() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.student_id is null then
    select student_id into new.student_id from public.enrollments where id = new.enrollment_id;
  end if;
  if new.author_id is null then new.author_id := auth.uid(); end if;
  return new;
end $$;
create trigger progress_records_before before insert on public.progress_records
  for each row execute function private.tg_progress_before();

-- Teachers (without sessions:update) may only change status/notes of their own sessions.
create or replace function private.tg_session_teacher_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or public.has_permission('sessions:update') or public.my_teacher_id() is null then
    return new;
  end if;
  if new.starts_at is distinct from old.starts_at or new.ends_at is distinct from old.ends_at
     or new.teacher_id is distinct from old.teacher_id or new.student_id is distinct from old.student_id
     or new.enrollment_id is distinct from old.enrollment_id or new.kind is distinct from old.kind
     or new.schedule_id is distinct from old.schedule_id or new.trial_id is distinct from old.trial_id then
    raise exception 'Teachers can only update the status and notes of their classes.' using errcode = '42501';
  end if;
  if new.status not in ('planned', 'held', 'missed') then
    raise exception 'Ask the academic team to cancel or reschedule a class.' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger class_sessions_teacher_guard before update on public.class_sessions
  for each row execute function private.tg_session_teacher_guard();

-- ---------------------------------------------------------------------------
-- 8. Money: invoice totals, payments, issuing, voiding, monthly billing
-- ---------------------------------------------------------------------------
create or replace function private.recalc_invoice(p_invoice uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.invoices i
     set subtotal_minor = coalesce((select sum(amount_minor) from public.invoice_items where invoice_id = i.id), 0),
         paid_minor = coalesce((select sum(amount_minor) from public.payments
                                 where invoice_id = i.id and deleted_at is null), 0)
   where i.id = p_invoice;
end $$;

create or replace function private.tg_invoice_before() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and old.status in ('paid', 'void') and new.status = old.status
     and (new.currency is distinct from old.currency or new.discount_minor is distinct from old.discount_minor
          or new.student_id is distinct from old.student_id) then
    raise exception 'A paid or void invoice cannot be changed.' using errcode = '22023';
  end if;
  if new.discount_minor > new.subtotal_minor then
    new.discount_minor := new.subtotal_minor;
  end if;
  new.total_minor := greatest(new.subtotal_minor - new.discount_minor, 0);
  if new.status <> 'void' and new.status <> 'draft' then
    if new.total_minor > 0 and new.paid_minor >= new.total_minor then
      new.status := 'paid';
    elsif new.status = 'paid' and new.paid_minor < new.total_minor then
      new.status := 'issued';
    end if;
  end if;
  if new.status = 'void' and (tg_op = 'INSERT' or old.status <> 'void') then
    new.voided_at := now();
  end if;
  return new;
end $$;
create trigger invoices_before before insert or update on public.invoices
  for each row execute function private.tg_invoice_before();

create or replace function private.tg_invoice_item_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_status text;
begin
  select status into v_status from public.invoices where id = coalesce(new.invoice_id, old.invoice_id);
  if v_status is distinct from 'draft' then
    raise exception 'Line items can only be changed while the invoice is a draft.' using errcode = '22023';
  end if;
  return coalesce(new, old);
end $$;
create trigger invoice_items_guard before insert or update or delete on public.invoice_items
  for each row execute function private.tg_invoice_item_guard();

create or replace function private.tg_invoice_item_after() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform private.recalc_invoice(coalesce(new.invoice_id, old.invoice_id));
  return coalesce(new, old);
end $$;
create trigger invoice_items_after after insert or update or delete on public.invoice_items
  for each row execute function private.tg_invoice_item_after();

create or replace function private.tg_payment_before() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_inv public.invoices;
begin
  select * into v_inv from public.invoices where id = new.invoice_id;
  if v_inv.status not in ('issued', 'paid') then
    raise exception 'Payments can only be recorded against an issued invoice.' using errcode = '22023';
  end if;
  new.currency := v_inv.currency;
  if new.recorded_by is null then new.recorded_by := auth.uid(); end if;
  return new;
end $$;
create trigger payments_before before insert on public.payments
  for each row execute function private.tg_payment_before();

create or replace function private.tg_payment_after() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform private.recalc_invoice(coalesce(new.invoice_id, old.invoice_id));
  if tg_op = 'UPDATE' and old.invoice_id is distinct from new.invoice_id then
    perform private.recalc_invoice(old.invoice_id);
  end if;
  return coalesce(new, old);
end $$;
create trigger payments_after after insert or update or delete on public.payments
  for each row execute function private.tg_payment_after();

create or replace function public.issue_invoice(p_invoice_id uuid, p_due_days int default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_inv public.invoices; v_days int;
begin
  if not public.has_permission('invoices:update') then
    raise exception 'You do not have permission to issue invoices.' using errcode = '42501';
  end if;
  select * into v_inv from public.invoices where id = p_invoice_id and deleted_at is null for update;
  if not found then raise exception 'Invoice not found.'; end if;
  if v_inv.status <> 'draft' then raise exception 'Only draft invoices can be issued.'; end if;
  if v_inv.total_minor <= 0 then raise exception 'Add at least one line item before issuing.'; end if;
  v_days := coalesce(p_due_days, (select (value ->> 'due_days')::int from public.settings where key = 'finance.defaults'), 7);
  update public.invoices
     set status = 'issued', issue_date = coalesce(issue_date, current_date),
         due_date = coalesce(due_date, current_date + v_days)
   where id = p_invoice_id;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.void_invoice(p_invoice_id uuid, p_reason text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_inv public.invoices;
begin
  if not public.has_permission('invoices:update') then
    raise exception 'You do not have permission to void invoices.' using errcode = '42501';
  end if;
  select * into v_inv from public.invoices where id = p_invoice_id and deleted_at is null for update;
  if not found then raise exception 'Invoice not found.'; end if;
  if v_inv.status = 'void' then raise exception 'This invoice is already void.'; end if;
  if v_inv.paid_minor > 0 then raise exception 'Remove the recorded payments before voiding this invoice.'; end if;
  if char_length(trim(coalesce(p_reason, ''))) < 3 then raise exception 'Give a short reason for voiding.'; end if;
  update public.invoices set status = 'void', void_reason = trim(p_reason) where id = p_invoice_id;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.generate_monthly_invoices(p_month date) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_start date := date_trunc('month', p_month)::date;
  v_end date := (date_trunc('month', p_month) + interval '1 month - 1 day')::date;
  r record;
  v_inv uuid;
  v_count int := 0;
begin
  if not public.has_permission('invoices:create') then
    raise exception 'You do not have permission to create invoices.' using errcode = '42501';
  end if;
  for r in
    select e.*, c.title as course_title, s.full_name as student_name,
           (select g.id from public.student_guardians sg join public.guardians g on g.id = sg.guardian_id
             where sg.student_id = e.student_id order by sg.is_primary desc limit 1) as guardian_id
    from public.enrollments e
    join public.courses c on c.id = e.course_id
    join public.students s on s.id = e.student_id
    where e.status = 'active' and e.deleted_at is null and s.deleted_at is null and s.status = 'active'
      and e.fee_amount_minor > 0
      and e.start_date <= v_end and (e.end_date is null or e.end_date >= v_start)
      and not exists (select 1 from public.invoices i where i.enrollment_id = e.id and i.period_start = v_start
                       and i.status <> 'void' and i.deleted_at is null)
  loop
    insert into public.invoices (student_id, enrollment_id, guardian_id, bill_to_name, bill_to_email, currency,
                                 period_start, period_end, notes)
    select r.student_id, r.id, r.guardian_id, coalesce(g.full_name, r.student_name), g.email, r.fee_currency,
           v_start, v_end, null
    from (select 1) x left join public.guardians g on g.id = r.guardian_id
    returning id into v_inv;
    insert into public.invoice_items (invoice_id, description, quantity, unit_amount_minor)
    values (v_inv, r.course_title || ' — ' || to_char(v_start, 'FMMonth YYYY')
                   || coalesce(' (' || r.classes_per_week || ' classes/week)', ''), 1, r.fee_amount_minor);
    if r.discount_percent > 0 then
      update public.invoices set discount_minor = round(r.fee_amount_minor * r.discount_percent / 100)::int
       where id = v_inv;
    end if;
    v_count := v_count + 1;
  end loop;
  return jsonb_build_object('ok', true, 'created', v_count, 'period_start', v_start);
end $$;

-- ---------------------------------------------------------------------------
-- 9. Dashboard, reports, search (permission-aware)
-- ---------------------------------------------------------------------------
create or replace function public.dashboard_summary() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v jsonb := '{}'::jsonb;
  v_today_start timestamptz := date_trunc('day', now() at time zone 'Asia/Karachi') at time zone 'Asia/Karachi';
  v_month_start timestamptz := date_trunc('month', now() at time zone 'Asia/Karachi') at time zone 'Asia/Karachi';
  v_teacher uuid := public.my_teacher_id();
begin
  if not public.is_staff() then
    raise exception 'Not allowed.' using errcode = '42501';
  end if;
  if public.has_permission('trials:read') then
    v := v || jsonb_build_object('trials', jsonb_build_object(
      'new', (select count(*) from public.trial_applications where status = 'new' and deleted_at is null and duplicate_of_id is null),
      'this_month', (select count(*) from public.trial_applications where created_at >= v_month_start and deleted_at is null),
      'upcoming', (select count(*) from public.trial_applications where status = 'scheduled' and trial_at >= now() and deleted_at is null),
      'enrolled_90d', (select count(*) from public.trial_applications where status = 'enrolled' and created_at >= now() - interval '90 days' and deleted_at is null),
      'total_90d', (select count(*) from public.trial_applications where created_at >= now() - interval '90 days' and deleted_at is null and duplicate_of_id is null),
      'recent', coalesce((select jsonb_agg(t) from (
         select ta.id, ta.reference, ta.learner_name, ta.country, ta.status, ta.created_at, c.title as course
         from public.trial_applications ta left join public.courses c on c.id = ta.course_id
         where ta.deleted_at is null order by ta.created_at desc limit 6) t), '[]'::jsonb),
      'by_day', coalesce((select jsonb_agg(x order by x.day) from (
         select to_char(d, 'YYYY-MM-DD') as day,
                (select count(*) from public.trial_applications ta
                  where ta.deleted_at is null and (ta.created_at at time zone 'Asia/Karachi')::date = d::date) as count
         from generate_series((now() at time zone 'Asia/Karachi')::date - 13, (now() at time zone 'Asia/Karachi')::date, interval '1 day') d) x), '[]'::jsonb)
    ));
  end if;
  if public.has_permission('contacts:read') then
    v := v || jsonb_build_object('contacts', jsonb_build_object(
      'new', (select count(*) from public.contact_messages where status = 'new' and deleted_at is null)));
  end if;
  if public.has_permission('complaints:read') then
    v := v || jsonb_build_object('complaints', jsonb_build_object(
      'open', (select count(*) from public.complaints where status <> 'closed' and deleted_at is null),
      'overdue', (select count(*) from public.complaints where status <> 'closed' and resolve_due_at < now() and deleted_at is null)));
  end if;
  if public.has_permission('students:read') then
    v := v || jsonb_build_object('students', jsonb_build_object(
      'active', (select count(*) from public.students where status = 'active' and deleted_at is null),
      'paused', (select count(*) from public.students where status = 'paused' and deleted_at is null),
      'new_this_month', (select count(*) from public.students where created_at >= v_month_start and deleted_at is null),
      'by_country', coalesce((select jsonb_agg(x) from (
         select coalesce(nullif(country, ''), 'Unknown') as country, count(*) as count from public.students
          where status = 'active' and deleted_at is null group by 1 order by 2 desc limit 6) x), '[]'::jsonb)));
  end if;
  if public.has_permission('sessions:read') or v_teacher is not null then
    v := v || jsonb_build_object('classes', jsonb_build_object(
      'today', (select count(*) from public.class_sessions
                 where starts_at >= v_today_start and starts_at < v_today_start + interval '1 day'
                   and status <> 'cancelled'
                   and (public.has_permission('sessions:read') or teacher_id = v_teacher)),
      'held_7d', (select count(*) from public.class_sessions where status = 'held' and starts_at >= now() - interval '7 days'
                   and (public.has_permission('sessions:read') or teacher_id = v_teacher)),
      'attendance_rate_30d', (select round(100.0 * count(*) filter (where a.status in ('present', 'late')) / nullif(count(*), 0), 1)
                   from public.attendance a join public.class_sessions s on s.id = a.session_id
                   where s.starts_at >= now() - interval '30 days'
                     and (public.has_permission('sessions:read') or s.teacher_id = v_teacher)),
      'upcoming', coalesce((select jsonb_agg(t) from (
         select s.id, s.kind, s.status, s.starts_at, s.ends_at, s.meeting_url,
                coalesce(st.full_name, ta.learner_name) as student, te.display_name as teacher, c.title as course
         from public.class_sessions s
         left join public.students st on st.id = s.student_id
         left join public.trial_applications ta on ta.id = s.trial_id
         left join public.teachers te on te.id = s.teacher_id
         left join public.enrollments e on e.id = s.enrollment_id
         left join public.courses c on c.id = coalesce(e.course_id, ta.course_id)
         where s.starts_at >= now() - interval '30 minutes' and s.status = 'planned'
           and (public.has_permission('sessions:read') or s.teacher_id = v_teacher)
         order by s.starts_at limit 8) t), '[]'::jsonb)));
  end if;
  if public.has_permission('invoices:read') then
    v := v || jsonb_build_object('finance', jsonb_build_object(
      'outstanding', coalesce((select jsonb_agg(x) from (
         select currency, sum(total_minor - paid_minor) as amount_minor, count(*) as count from public.invoices
          where status = 'issued' and deleted_at is null group by currency order by 2 desc) x), '[]'::jsonb),
      'overdue_count', (select count(*) from public.invoices where status = 'issued' and due_date < current_date and deleted_at is null),
      'collected_this_month', coalesce((select jsonb_agg(x) from (
         select currency, sum(amount_minor) as amount_minor from public.payments
          where received_at >= v_month_start and deleted_at is null group by currency order by 2 desc) x), '[]'::jsonb),
      'draft_count', (select count(*) from public.invoices where status = 'draft' and deleted_at is null)));
  end if;
  return v;
end $$;

create or replace function public.report_summary(p_from date, p_to date) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v jsonb := '{}'::jsonb;
  v_from timestamptz := p_from::timestamp at time zone 'Asia/Karachi';
  v_to timestamptz := (p_to + 1)::timestamp at time zone 'Asia/Karachi';
begin
  if not public.has_permission('reports:read') then
    raise exception 'You do not have permission to view reports.' using errcode = '42501';
  end if;
  if public.has_permission('trials:read') then
    v := v || jsonb_build_object(
      'trials_by_status', coalesce((select jsonb_object_agg(status, n) from (
          select status, count(*) as n from public.trial_applications
           where created_at >= v_from and created_at < v_to and deleted_at is null group by status) x), '{}'::jsonb),
      'trials_by_course', coalesce((select jsonb_agg(x) from (
          select coalesce(c.title, 'Not chosen') as label, count(*) as count from public.trial_applications t
            left join public.courses c on c.id = t.course_id
           where t.created_at >= v_from and t.created_at < v_to and t.deleted_at is null
           group by 1 order by 2 desc) x), '[]'::jsonb),
      'trials_by_country', coalesce((select jsonb_agg(x) from (
          select country as label, count(*) as count from public.trial_applications
           where created_at >= v_from and created_at < v_to and deleted_at is null
           group by 1 order by 2 desc limit 12) x), '[]'::jsonb),
      'trials_by_source', coalesce((select jsonb_agg(x) from (
          select source as label, count(*) as count from public.trial_applications
           where created_at >= v_from and created_at < v_to and deleted_at is null
           group by 1 order by 2 desc limit 12) x), '[]'::jsonb));
  end if;
  if public.has_permission('enrollments:read') then
    v := v || jsonb_build_object(
      'enrollments_by_course', coalesce((select jsonb_agg(x) from (
          select c.title as label, count(*) as count from public.enrollments e join public.courses c on c.id = e.course_id
           where e.status = 'active' and e.deleted_at is null group by 1 order by 2 desc) x), '[]'::jsonb),
      'new_enrollments', (select count(*) from public.enrollments
           where created_at >= v_from and created_at < v_to and deleted_at is null),
      'students_by_country', coalesce((select jsonb_agg(x) from (
          select coalesce(nullif(country, ''), 'Unknown') as label, count(*) as count from public.students
           where status = 'active' and deleted_at is null group by 1 order by 2 desc limit 12) x), '[]'::jsonb));
  end if;
  if public.has_permission('attendance:read') then
    v := v || jsonb_build_object(
      'attendance', coalesce((select jsonb_object_agg(status, n) from (
          select a.status, count(*) as n from public.attendance a join public.class_sessions s on s.id = a.session_id
           where s.starts_at >= v_from and s.starts_at < v_to group by a.status) x), '{}'::jsonb),
      'sessions', coalesce((select jsonb_object_agg(status, n) from (
          select status, count(*) as n from public.class_sessions
           where starts_at >= v_from and starts_at < v_to group by status) x), '{}'::jsonb),
      'teacher_load', coalesce((select jsonb_agg(x) from (
          select te.display_name as label, count(*) filter (where s.status = 'held') as held,
                 count(*) filter (where s.status in ('cancelled', 'missed')) as missed, count(*) as count
            from public.class_sessions s join public.teachers te on te.id = s.teacher_id
           where s.starts_at >= v_from and s.starts_at < v_to group by 1 order by 4 desc limit 20) x), '[]'::jsonb));
  end if;
  if public.has_permission('payments:read') then
    v := v || jsonb_build_object(
      'revenue_by_month', coalesce((select jsonb_agg(x order by x.month, x.currency) from (
          select to_char(date_trunc('month', received_at at time zone 'Asia/Karachi'), 'YYYY-MM') as month, currency,
                 sum(amount_minor) as amount_minor
            from public.payments where received_at >= v_from and received_at < v_to and deleted_at is null
           group by 1, 2) x), '[]'::jsonb),
      'invoiced', coalesce((select jsonb_agg(x) from (
          select currency, sum(total_minor) as total_minor, sum(paid_minor) as paid_minor, count(*) as count
            from public.invoices where issue_date between p_from and p_to and status in ('issued', 'paid')
             and deleted_at is null group by currency) x), '[]'::jsonb));
  end if;
  return v;
end $$;

create or replace function public.global_search(q text) returns jsonb
language plpgsql stable security invoker set search_path = '' as $$
declare
  v_q text := '%' || replace(replace(trim(coalesce(q, '')), '%', ''), '_', '') || '%';
  v jsonb := '[]'::jsonb;
begin
  if char_length(trim(coalesce(q, ''))) < 2 then return v; end if;
  v := v || coalesce((select jsonb_agg(x) from (
      select 'student' as type, id, full_name as title, student_code || ' · ' || coalesce(country, '') as subtitle,
             '/admin/students/' || id as href
        from public.students where deleted_at is null
         and (full_name ilike v_q or student_code ilike v_q or email ilike v_q or phone ilike v_q) limit 6) x), '[]'::jsonb);
  v := v || coalesce((select jsonb_agg(x) from (
      select 'trial' as type, id, learner_name as title, reference || ' · ' || status as subtitle,
             '/admin/trials/' || id as href
        from public.trial_applications where deleted_at is null
         and (learner_name ilike v_q or reference ilike v_q or email ilike v_q or phone ilike v_q
              or guardian_name ilike v_q) limit 6) x), '[]'::jsonb);
  v := v || coalesce((select jsonb_agg(x) from (
      select 'guardian' as type, id, full_name as title, coalesce(email, phone, '') as subtitle,
             '/admin/guardians/' || id as href
        from public.guardians where deleted_at is null
         and (full_name ilike v_q or email ilike v_q or phone ilike v_q) limit 4) x), '[]'::jsonb);
  v := v || coalesce((select jsonb_agg(x) from (
      select 'invoice' as type, id, number as title, status || ' · ' || currency as subtitle,
             '/admin/invoices/' || id as href
        from public.invoices where deleted_at is null and (number ilike v_q or bill_to_name ilike v_q) limit 4) x), '[]'::jsonb);
  v := v || coalesce((select jsonb_agg(x) from (
      select 'teacher' as type, id, display_name as title, headline as subtitle, '/admin/teachers/' || id as href
        from public.teachers where deleted_at is null and display_name ilike v_q limit 4) x), '[]'::jsonb);
  v := v || coalesce((select jsonb_agg(x) from (
      select 'course' as type, id, title, level as subtitle, '/admin/courses/' || id as href
        from public.courses where deleted_at is null and title ilike v_q limit 4) x), '[]'::jsonb);
  v := v || coalesce((select jsonb_agg(x) from (
      select 'complaint' as type, id, subject as title, reference || ' · ' || status as subtitle,
             '/admin/complaints/' || id as href
        from public.complaints where deleted_at is null and (subject ilike v_q or reference ilike v_q
             or raised_by_name ilike v_q) limit 4) x), '[]'::jsonb);
  return v;
end $$;

create or replace function public.mark_all_notifications_read() returns int
language sql security invoker set search_path = '' as $$
  with u as (
    update public.notifications set read_at = now()
     where user_id = auth.uid() and read_at is null returning 1)
  select count(*)::int from u
$$;

create or replace function public.touch_last_seen() returns void
language sql security definer set search_path = '' as $$
  update public.profiles set last_seen_at = now()
   where id = auth.uid() and (last_seen_at is null or last_seen_at < now() - interval '5 minutes')
$$;

-- ---------------------------------------------------------------------------
-- 10. Housekeeping job
-- ---------------------------------------------------------------------------
create or replace function private.daily_maintenance() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_horizon int := coalesce((select (value ->> 'session_horizon_days')::int from public.settings where key = 'academics.defaults'), 14);
  v_sessions int;
begin
  v_sessions := private.generate_sessions_core(current_date, current_date + v_horizon, null);
  return jsonb_build_object('sessions_created', v_sessions);
end $$;
