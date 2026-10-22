-- Row Level Security for every table, API grants, and teacher self-service.

-- ---------------------------------------------------------------------------
-- Turn RLS on everywhere in public
-- ---------------------------------------------------------------------------
do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', r.tablename);
  end loop;
end $$;

-- Standard staff CRUD policies: <module>:read/create/update/delete
create or replace function private.apply_staff_policies(p_table text, p_module text) returns void
language plpgsql set search_path = '' as $$
begin
  execute format('create policy %I on public.%I for select to authenticated using ((select public.has_permission(%L)))',
                 'staff read', p_table, p_module || ':read');
  execute format('create policy %I on public.%I for insert to authenticated with check ((select public.has_permission(%L)))',
                 'staff create', p_table, p_module || ':create');
  execute format('create policy %I on public.%I for update to authenticated using ((select public.has_permission(%L))) with check ((select public.has_permission(%L)))',
                 'staff update', p_table, p_module || ':update', p_module || ':update');
  execute format('create policy %I on public.%I for delete to authenticated using ((select public.has_permission(%L)))',
                 'staff delete', p_table, p_module || ':delete');
end $$;

select private.apply_staff_policies(t, m) from (values
  ('courses', 'courses'), ('course_modules', 'courses'),
  ('teachers', 'teachers'), ('teacher_courses', 'teachers'), ('teacher_availability', 'teachers'),
  ('pricing_plans', 'pricing'), ('pricing_plan_prices', 'pricing'),
  ('pages', 'pages'), ('page_sections', 'pages'),
  ('blog_posts', 'blog'), ('faqs', 'faqs'), ('testimonials', 'testimonials'),
  ('menu_items', 'menus'), ('redirects', 'redirects'), ('media_assets', 'media'),
  ('trial_applications', 'trials'), ('contact_messages', 'contacts'), ('complaints', 'complaints'),
  ('students', 'students'), ('guardians', 'guardians'), ('student_guardians', 'guardians'),
  ('enrollments', 'enrollments'), ('class_schedules', 'schedules'), ('class_sessions', 'sessions'),
  ('attendance', 'attendance'), ('progress_records', 'progress'), ('certificates', 'certificates'),
  ('invoices', 'invoices'), ('invoice_items', 'invoices'), ('payments', 'payments')
) as x(t, m);

-- ---------------------------------------------------------------------------
-- Public website reads (publishable key, role anon)
-- ---------------------------------------------------------------------------
create policy "public read" on public.courses for select to anon, authenticated
  using (status = 'published' and deleted_at is null);
create policy "public read" on public.course_modules for select to anon, authenticated
  using (exists (select 1 from public.courses c where c.id = course_id and c.status = 'published' and c.deleted_at is null));
create policy "public read" on public.teachers for select to anon
  using (is_public and is_active and deleted_at is null);
create policy "public read" on public.teacher_courses for select to anon
  using (exists (select 1 from public.teachers t where t.id = teacher_id and t.is_public and t.is_active and t.deleted_at is null));
create policy "public read" on public.pricing_plans for select to anon, authenticated
  using (status = 'published' and is_public and deleted_at is null);
create policy "public read" on public.pricing_plan_prices for select to anon, authenticated
  using (is_public and exists (select 1 from public.pricing_plans p where p.id = plan_id
                               and p.status = 'published' and p.is_public and p.deleted_at is null));
create policy "public read" on public.pages for select to anon, authenticated
  using (status = 'published' and deleted_at is null);
create policy "public read" on public.page_sections for select to anon, authenticated
  using (is_visible and exists (select 1 from public.pages p where p.id = page_id and p.status = 'published' and p.deleted_at is null));
create policy "public read" on public.blog_posts for select to anon, authenticated
  using (status = 'published' and deleted_at is null);
create policy "public read" on public.faqs for select to anon, authenticated using (status = 'published');
create policy "public read" on public.testimonials for select to anon, authenticated using (status = 'published');
create policy "public read" on public.menu_items for select to anon, authenticated using (is_visible);
create policy "public read" on public.redirects for select to anon, authenticated using (true);
create policy "public read" on public.settings for select to anon, authenticated using (is_public);

-- ---------------------------------------------------------------------------
-- Staff-only system tables
-- ---------------------------------------------------------------------------
create policy "staff read" on public.app_roles for select to authenticated using ((select public.is_staff()));
create policy "roles manage" on public.app_roles for all to authenticated
  using ((select public.has_permission('roles:update'))) with check ((select public.has_permission('roles:update')));
create policy "staff read" on public.app_role_permissions for select to authenticated using ((select public.is_staff()));
create policy "roles manage" on public.app_role_permissions for all to authenticated
  using ((select public.has_permission('roles:update'))) with check ((select public.has_permission('roles:update')));

create policy "own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "staff read" on public.profiles for select to authenticated using ((select public.has_permission('users:read')));
create policy "colleague names" on public.profiles for select to authenticated using ((select public.is_staff()) and is_active);
create policy "own profile update" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "staff update" on public.profiles for update to authenticated
  using ((select public.has_permission('users:update'))) with check ((select public.has_permission('users:update')));

create policy "staff read" on public.settings for select to authenticated using ((select public.has_permission('settings:read')));
create policy "staff create" on public.settings for insert to authenticated with check ((select public.has_permission('settings:update')));
create policy "staff update" on public.settings for update to authenticated
  using ((select public.has_permission('settings:update'))) with check ((select public.has_permission('settings:update')));
create policy "staff delete" on public.settings for delete to authenticated using ((select public.has_permission('settings:delete')));

create policy "staff read" on public.audit_logs for select to authenticated using ((select public.has_permission('audit:read')));
create policy "staff read" on public.content_revisions for select to authenticated using ((select public.is_staff()));

create policy "own notifications" on public.notifications for select to authenticated using (user_id = (select auth.uid()));
create policy "own notifications update" on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own notifications delete" on public.notifications for delete to authenticated using (user_id = (select auth.uid()));

create policy "staff read" on public.trial_history for select to authenticated using ((select public.has_permission('trials:read')));
create policy "staff read" on public.trial_notes for select to authenticated using ((select public.has_permission('trials:read')));
create policy "staff create" on public.trial_notes for insert to authenticated
  with check ((select public.has_permission('trials:read')) and author_id = (select auth.uid()));
create policy "own notes update" on public.trial_notes for update to authenticated
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy "own notes delete" on public.trial_notes for delete to authenticated
  using (author_id = (select auth.uid()) or (select public.has_permission('trials:delete')));

-- ---------------------------------------------------------------------------
-- Teachers: their own profile, classes, attendance and progress notes
-- ---------------------------------------------------------------------------
create policy "teacher own" on public.teachers for select to authenticated using (id = (select public.my_teacher_id()));
create policy "teacher own" on public.class_sessions for select to authenticated
  using (teacher_id = (select public.my_teacher_id()));
create policy "teacher own update" on public.class_sessions for update to authenticated
  using (teacher_id = (select public.my_teacher_id())) with check (teacher_id = (select public.my_teacher_id()));
create policy "teacher own" on public.enrollments for select to authenticated
  using (teacher_id = (select public.my_teacher_id()));
create policy "teacher own" on public.attendance for select to authenticated
  using (exists (select 1 from public.class_sessions s where s.id = session_id and s.teacher_id = (select public.my_teacher_id())));
create policy "teacher own insert" on public.attendance for insert to authenticated
  with check (exists (select 1 from public.class_sessions s where s.id = session_id and s.teacher_id = (select public.my_teacher_id())));
create policy "teacher own update" on public.attendance for update to authenticated
  using (exists (select 1 from public.class_sessions s where s.id = session_id and s.teacher_id = (select public.my_teacher_id())))
  with check (exists (select 1 from public.class_sessions s where s.id = session_id and s.teacher_id = (select public.my_teacher_id())));
create policy "teacher own" on public.progress_records for select to authenticated
  using (exists (select 1 from public.enrollments e where e.id = enrollment_id and e.teacher_id = (select public.my_teacher_id())));
create policy "teacher own insert" on public.progress_records for insert to authenticated
  with check (exists (select 1 from public.enrollments e where e.id = enrollment_id and e.teacher_id = (select public.my_teacher_id())));
create policy "teacher own update" on public.progress_records for update to authenticated
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));

-- A teacher's timetable without parents' contact details
create or replace function public.my_classes(p_from timestamptz, p_to timestamptz) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(x order by x.starts_at), '[]'::jsonb) from (
    select s.id, s.kind, s.status, s.starts_at, s.ends_at, s.meeting_url, s.notes, s.enrollment_id, s.student_id,
           coalesce(st.full_name, ta.learner_name) as learner,
           coalesce(st.timezone, ta.timezone) as learner_timezone,
           coalesce(st.age_band, ta.age_band) as age_band,
           coalesce(c.title, c2.title) as course,
           ta.level as trial_level, ta.notes as trial_notes,
           a.status as attendance,
           (select pr.summary from public.progress_records pr where pr.session_id = s.id order by pr.created_at desc limit 1) as progress
    from public.class_sessions s
    left join public.students st on st.id = s.student_id
    left join public.trial_applications ta on ta.id = s.trial_id
    left join public.enrollments e on e.id = s.enrollment_id
    left join public.courses c on c.id = e.course_id
    left join public.courses c2 on c2.id = ta.course_id
    left join public.attendance a on a.session_id = s.id and a.student_id = s.student_id
    where s.teacher_id = public.my_teacher_id()
      and s.starts_at >= p_from and s.starts_at < p_to
  ) x
$$;

-- Public certificate check (number → name, course, date) for issued certificates only
create or replace function public.verify_certificate(p_number text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce((
    select jsonb_build_object('number', c.number, 'student', s.full_name, 'title', c.title,
                              'course', co.title, 'issued_on', c.issued_on, 'signed_by', c.signed_by)
    from public.certificates c
    join public.students s on s.id = c.student_id
    left join public.courses co on co.id = c.course_id
    where c.number = upper(trim(p_number)) and c.status = 'issued'
  ), 'null'::jsonb)
$$;

-- ---------------------------------------------------------------------------
-- Grants. Tables: the public role only sees what the website needs.
-- ---------------------------------------------------------------------------
revoke all on all tables in schema public from anon;
grant select on public.courses, public.course_modules, public.pricing_plans, public.pricing_plan_prices,
  public.pages, public.page_sections, public.blog_posts, public.faqs, public.testimonials, public.menu_items,
  public.redirects, public.settings, public.teacher_courses to anon;
grant select (id, slug, display_name, headline, gender, bio, qualifications, languages, specialties,
  years_experience, photo_url, is_active, is_public, sort_order, deleted_at, created_at, updated_at)
  on public.teachers to anon;

grant select, insert, update, delete on all tables in schema public to authenticated;
revoke insert, update, delete on public.audit_logs, public.content_revisions, public.trial_history from authenticated;
grant all on all tables in schema public to service_role;

-- Functions: lock down, then open what each role needs.
revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated, service_role;
grant execute on function public.submit_trial_application(jsonb), public.submit_contact_message(jsonb),
  public.verify_certificate(text), public.has_permission(text), public.is_staff(), public.my_teacher_id(),
  public.get_my_access() to anon;

revoke all on all functions in schema private from public, anon, authenticated;
