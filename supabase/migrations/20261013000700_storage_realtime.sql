-- Public "media" bucket for website images (served from Supabase's CDN); staff with media permissions manage it.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "oqc media read" on storage.objects for select to authenticated
  using (bucket_id = 'media' and (select public.has_permission('media:read')));
create policy "oqc media upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (select public.has_permission('media:create')));
create policy "oqc media update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (select public.has_permission('media:update')))
  with check (bucket_id = 'media' and (select public.has_permission('media:update')));
create policy "oqc media delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (select public.has_permission('media:delete')));

-- Live notification badge in the staff portal
alter publication supabase_realtime add table public.notifications;
