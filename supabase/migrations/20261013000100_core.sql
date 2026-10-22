-- Online Quran College — core: roles & permissions, staff profiles, settings, audit, notifications.
-- Staff sign in with Supabase Auth. Access is decided by public.has_permission(), used by every RLS policy.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to postgres, service_role;

-- ---------------------------------------------------------------------------
-- Generic trigger helpers
-- ---------------------------------------------------------------------------
create or replace function private.tg_set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

create or replace function private.tg_bump_version() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.version := coalesce(old.version, 0) + 1;
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Roles and permissions
-- ---------------------------------------------------------------------------
create table public.app_roles (
  key text primary key check (key ~ '^[a-z][a-z_]*$'),
  name text not null,
  description text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.app_role_permissions (
  role text not null references public.app_roles(key) on update cascade on delete cascade,
  permission text not null check (permission ~ '^(\*|[a-z][a-z_-]*:(\*|[a-z][a-z_-]*))$'),
  created_at timestamptz not null default now(),
  primary key (role, permission)
);

-- ---------------------------------------------------------------------------
-- Staff profiles (one per auth user)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  full_name text not null default '',
  role text references public.app_roles(key) on update cascade on delete set null,
  is_active boolean not null default false,
  phone text,
  job_title text,
  department text,
  avatar_url text,
  teacher_id uuid,
  must_change_password boolean not null default false,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_role_idx on public.profiles(role) where is_active;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function private.tg_set_updated_at();

-- ---------------------------------------------------------------------------
-- Permission helpers (used by RLS; safe to expose — they only describe the caller)
-- ---------------------------------------------------------------------------
create or replace function public.has_permission(p_permission text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.profiles p
    join public.app_role_permissions rp on rp.role = p.role
    where p.id = auth.uid()
      and p.is_active
      and (rp.permission = '*'
           or rp.permission = p_permission
           or rp.permission = split_part(p_permission, ':', 1) || ':*')
  )
$$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_active and role is not null)
$$;

create or replace function public.my_teacher_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select teacher_id from public.profiles where id = auth.uid() and is_active
$$;

create or replace function public.get_my_access() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce((
    select jsonb_build_object(
      'id', p.id,
      'email', p.email,
      'full_name', p.full_name,
      'role', p.role,
      'role_name', r.name,
      'is_active', p.is_active,
      'teacher_id', p.teacher_id,
      'must_change_password', p.must_change_password,
      'avatar_url', p.avatar_url,
      'permissions', coalesce((
        select jsonb_agg(rp.permission order by rp.permission)
        from public.app_role_permissions rp where rp.role = p.role
      ), '[]'::jsonb)
    )
    from public.profiles p
    left join public.app_roles r on r.key = p.role
    where p.id = auth.uid()
  ), 'null'::jsonb)
$$;

-- New auth users get a profile. Role/activation come only from app_metadata (admin-controlled).
create or replace function private.handle_new_auth_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_role text := nullif(new.raw_app_meta_data ->> 'role', '');
begin
  if v_role is not null and not exists (select 1 from public.app_roles where key = v_role) then
    v_role := null;
  end if;
  insert into public.profiles (id, email, full_name, role, is_active, must_change_password)
  values (
    new.id,
    lower(coalesce(new.email, '')),
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), nullif(new.raw_app_meta_data ->> 'full_name', ''), split_part(coalesce(new.email, ''), '@', 1)),
    v_role,
    v_role is not null,
    coalesce((new.raw_app_meta_data ->> 'must_change_password')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_auth_user();

create or replace function private.handle_auth_user_email_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles set email = lower(coalesce(new.email, '')) where id = new.id;
  return new;
end $$;

create trigger on_auth_user_email_changed after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function private.handle_auth_user_email_change();

-- Staff may edit their own name/phone/avatar but never their role or activation.
create or replace function private.tg_profiles_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    return new; -- service role / migrations
  end if;
  if not public.has_permission('users:update') then
    if new.id <> auth.uid()
       or new.role is distinct from old.role
       or new.is_active is distinct from old.is_active
       or new.teacher_id is distinct from old.teacher_id
       or new.email is distinct from old.email then
      raise exception 'You can only change your own name, phone, job title and photo.' using errcode = '42501';
    end if;
  elsif (new.role = 'super_admin' or old.role = 'super_admin')
        and (new.role is distinct from old.role or new.is_active is distinct from old.is_active)
        and not exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin' and is_active) then
    raise exception 'Only a Super Admin can change Super Admin accounts.' using errcode = '42501';
  end if;
  if new.id = auth.uid() and (new.is_active is distinct from old.is_active or new.role is distinct from old.role) then
    raise exception 'You cannot change your own role or deactivate yourself.' using errcode = '42501';
  end if;
  return new;
end $$;

create trigger profiles_guard before update on public.profiles
  for each row execute function private.tg_profiles_guard();

-- ---------------------------------------------------------------------------
-- Settings (key/value). Public rows are readable by the website.
-- ---------------------------------------------------------------------------
create table public.settings (
  key text primary key check (key ~ '^[a-z][a-z0-9_.-]*$'),
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  label text not null default '',
  description text not null default '',
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);
create trigger settings_updated_at before update on public.settings
  for each row execute function private.tg_set_updated_at();

-- ---------------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------------
create table public.audit_logs (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  actor_id uuid,
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id text,
  summary text,
  before jsonb,
  after jsonb
);
create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id, created_at desc);
create index audit_logs_actor_idx on public.audit_logs(actor_id, created_at desc);
create index audit_logs_created_idx on public.audit_logs(created_at desc);

create or replace function private.tg_audit() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := auth.uid();
  v_email text;
  v_before jsonb;
  v_after jsonb;
  v_old jsonb;
  v_new jsonb;
begin
  if tg_op in ('UPDATE', 'DELETE') then v_old := to_jsonb(old) - 'updated_at' - 'version'; end if;
  if tg_op in ('INSERT', 'UPDATE') then v_new := to_jsonb(new) - 'updated_at' - 'version'; end if;
  if tg_op = 'UPDATE' then
    select jsonb_object_agg(n.key, n.value) into v_after
      from jsonb_each(v_new) n where v_old -> n.key is distinct from n.value;
    if v_after is null then return new; end if;
    select jsonb_object_agg(o.key, o.value) into v_before
      from jsonb_each(v_old) o where v_after ? o.key;
  elsif tg_op = 'INSERT' then
    v_after := v_new;
  else
    v_before := v_old;
  end if;
  -- keep the log compact
  v_before := v_before - 'body_html' - 'description_html';
  v_after := v_after - 'body_html' - 'description_html';
  if v_actor is not null then
    select email into v_email from auth.users where id = v_actor;
  end if;
  insert into public.audit_logs (actor_id, actor_email, action, entity_type, entity_id, before, after)
  values (v_actor, v_email, lower(tg_op), tg_table_name,
          coalesce(v_new ->> 'id', v_old ->> 'id', v_new ->> 'key', v_old ->> 'key'),
          v_before, v_after);
  return coalesce(new, old);
end $$;

-- ---------------------------------------------------------------------------
-- In-app notifications (also streamed with Supabase Realtime)
-- ---------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null default '',
  link text,
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications(user_id, read_at, created_at desc);

create or replace function private.notify_permission(
  p_permission text, p_kind text, p_title text, p_body text, p_link text,
  p_entity_type text default null, p_entity_id uuid default null
) returns int
language plpgsql security definer set search_path = '' as $$
declare v_count int;
begin
  insert into public.notifications (user_id, kind, title, body, link, entity_type, entity_id)
  select distinct p.id, p_kind, p_title, coalesce(p_body, ''), p_link, p_entity_type, p_entity_id
  from public.profiles p
  join public.app_role_permissions rp on rp.role = p.role
  where p.is_active
    and (rp.permission = '*' or rp.permission = p_permission
         or rp.permission = split_part(p_permission, ':', 1) || ':*');
  get diagnostics v_count = row_count;
  return v_count;
end $$;

-- ---------------------------------------------------------------------------
-- Counters (human-friendly references) and rate limits for public forms
-- ---------------------------------------------------------------------------
create table private.counters (
  name text primary key,
  value bigint not null default 0
);

create or replace function private.next_counter(p_name text) returns bigint
language sql security definer set search_path = '' as $$
  insert into private.counters (name, value) values (p_name, 1)
  on conflict (name) do update set value = private.counters.value + 1
  returning value
$$;

create table private.rate_limits (
  bucket text primary key,
  hits int not null default 0,
  window_start timestamptz not null default now()
);

create or replace function private.hit_rate_limit(p_bucket text, p_max int, p_window interval) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_hits int;
begin
  insert into private.rate_limits as r (bucket, hits, window_start)
  values (p_bucket, 1, now())
  on conflict (bucket) do update
    set hits = case when r.window_start < now() - p_window then 1 else r.hits + 1 end,
        window_start = case when r.window_start < now() - p_window then now() else r.window_start end
  returning hits into v_hits;
  return v_hits <= p_max;
end $$;

create or replace function private.request_ip_hash() returns text
language plpgsql stable security definer set search_path = '' as $$
declare
  v_headers jsonb := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  v_ip text;
begin
  v_ip := coalesce(v_headers ->> 'cf-connecting-ip',
                   nullif(split_part(coalesce(v_headers ->> 'x-forwarded-for', ''), ',', 1), ''),
                   v_headers ->> 'x-real-ip', 'unknown');
  return encode(extensions.digest(trim(v_ip) || ':oqc', 'sha256'), 'hex');
end $$;

create or replace function private.request_user_agent() returns text
language sql stable security definer set search_path = '' as $$
  select left(coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb ->> 'user-agent', 300)
$$;
