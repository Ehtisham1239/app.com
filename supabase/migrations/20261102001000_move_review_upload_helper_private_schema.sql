-- 2 Nov 2026: keep the review-upload policy helper outside PostgREST's exposed public schema.
-- Already applied to production as version 20261102095054.
create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role;

create or replace function private.review_upload_allowed(p_name text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select p_name ~ '^pending/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[A-Za-z0-9][A-Za-z0-9._-]{0,79}$'
    and (
      select count(*) from storage.objects o
      where o.bucket_id = 'review-media'
        and o.name like split_part(p_name, '/', 1) || '/' || split_part(p_name, '/', 2) || '/%'
    ) < 3
    and (
      select count(*) from storage.objects o
      where o.bucket_id = 'review-media'
        and o.name like 'pending/%'
        and o.created_at > now() - interval '1 hour'
    ) < 200
$$;

revoke all on function private.review_upload_allowed(text) from public;
grant execute on function private.review_upload_allowed(text) to anon, authenticated, service_role;

drop policy if exists "review media public upload" on storage.objects;
create policy "review media public upload" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'review-media'
    and name ~ '^pending/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[A-Za-z0-9][A-Za-z0-9._-]{0,79}$'
    and (select private.review_upload_allowed(name))
  );

revoke all on function public.review_upload_allowed(text) from public, anon, authenticated, service_role;
drop function if exists public.review_upload_allowed(text);
