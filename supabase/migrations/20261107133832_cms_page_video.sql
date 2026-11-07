-- Existing page publishing permissions and RLS also protect the video metadata.
alter table public.pages add column if not exists video jsonb
  check (video is null or (jsonb_typeof(video) = 'object' and octet_length(video::text) <= 8192));

-- Keep the existing public media bucket permissions and 10 MB limit.
update storage.buckets
set allowed_mime_types = array_append(allowed_mime_types, 'video/mp4')
where id = 'media' and allowed_mime_types is not null
  and not ('video/mp4' = any(allowed_mime_types));
