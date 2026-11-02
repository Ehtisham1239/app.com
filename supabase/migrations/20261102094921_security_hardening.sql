-- 2 Nov 2026: security hardening found in the Supabase security advisor review.
--
-- 1. public.rls_auto_enable() is the ensure_rls event-trigger function. It is not an
--    API endpoint, so signed-in users must not be able to call it through /rest/v1/rpc.
--    Event triggers keep firing for DDL run by the database owner.
do $
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end
$;

-- 2. Anonymous review attachments: the upload policy already restricts the path to
--    pending/<random uuid>/<file>. Also cap each review folder at 3 files (the form's
--    limit) and all anonymous review uploads at 200 per hour.
create or replace function public.review_upload_allowed(p_name text)
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

revoke all on function public.review_upload_allowed(text) from public;
grant execute on function public.review_upload_allowed(text) to anon, authenticated, service_role;

drop policy if exists "review media public upload" on storage.objects;
create policy "review media public upload" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'review-media' and name ~ '^pending/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[A-Za-z0-9][A-Za-z0-9._-]{0,79}$' and (select public.review_upload_allowed(name)));
