-- 2 Nov 2026 (owner request): parents and students can send a review from the
-- floating "Reviews" button on every page. The comment is required; up to three
-- photos/videos are optional. Submissions are private (staff only) and are never
-- published automatically: staff turn an approved one into a Testimonial draft.

create table public.review_submissions (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  relation text not null default 'Parent' check (relation in ('Parent', 'Student')),
  country text check (country is null or char_length(country) <= 80),
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 10 and 2000),
  media_paths text[] not null default '{}' check (cardinality(media_paths) <= 3),
  page_path text check (page_path is null or char_length(page_path) <= 300),
  consent_text_version text not null,
  consent_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new', 'approved', 'rejected', 'spam', 'archived')),
  spam_score int not null default 0,
  testimonial_id uuid references public.testimonials(id) on delete set null,
  internal_note text,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index review_submissions_status_idx on public.review_submissions (status, created_at desc) where deleted_at is null;
create index review_submissions_testimonial_idx on public.review_submissions (testimonial_id);
create trigger review_submissions_updated_at before update on public.review_submissions
  for each row execute function private.tg_set_updated_at();

alter table public.review_submissions enable row level security;
-- Staff with testimonial permissions read/update/delete; the public never reads or writes
-- the table directly (submissions go through public.submit_review only).
select private.apply_staff_policies('review_submissions', 'testimonials');
revoke all on public.review_submissions from anon;

-- Private bucket: files are only reachable by staff through short-lived signed URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review-media', 'review-media', false, 20971520,
        array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'video/mp4', 'video/quicktime', 'video/webm'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Visitors may only add new files under pending/<random uuid>/<safe name>; they cannot
-- read, list, overwrite or delete anything in the bucket.
create policy "review media public upload" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'review-media'
              and name ~ '^pending/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[A-Za-z0-9][A-Za-z0-9._-]{0,79}$');
create policy "review media staff read" on storage.objects for select to authenticated
  using (bucket_id = 'review-media' and (select public.has_permission('testimonials:read')));
create policy "review media staff delete" on storage.objects for delete to authenticated
  using (bucket_id = 'review-media' and (select public.has_permission('testimonials:delete')));

create or replace function private.tg_review_after() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status <> 'spam' then
    perform private.notify_permission('testimonials:read', 'review.new',
      'New review: ' || new.rating || '★ from ' || left(new.name, 40),
      left(new.comment, 120), '/admin/reviews/' || new.id, 'review_submission', new.id);
  end if;
  return new;
end $$;
create trigger review_submissions_after after insert on public.review_submissions
  for each row execute function private.tg_review_after();

create or replace function public.submit_review(payload jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_ip text := private.request_ip_hash();
  v_name text := trim(coalesce(payload ->> 'name', ''));
  v_email text := lower(trim(coalesce(payload ->> 'email', '')));
  v_relation text := coalesce(nullif(trim(payload ->> 'relation'), ''), 'Parent');
  v_comment text := trim(coalesce(payload ->> 'comment', ''));
  v_rating int;
  v_token text := lower(trim(coalesce(payload ->> 'upload_token', '')));
  v_paths text[] := '{}';
  v_path text;
  v_links int;
  v_score int := 0;
  v_ref text;
  v_consent_version text;
  v_year text := to_char(now() at time zone 'Asia/Karachi', 'YYYY');
begin
  -- Honeypot: bots that fill the hidden field get a normal-looking reply and nothing is saved.
  if coalesce(payload ->> 'website', '') <> '' then
    return jsonb_build_object('ok', true, 'reference', 'REV-RECEIVED');
  end if;
  if not private.hit_rate_limit('review:' || v_ip, 5, interval '1 hour') then
    raise exception 'Too many reviews from your connection. Please try again later.';
  end if;
  if char_length(v_name) < 2 or char_length(v_name) > 80 then raise exception 'Please enter your name.'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(v_email) > 254 then
    raise exception 'Please enter a valid email address.';
  end if;
  if v_relation not in ('Parent', 'Student') then raise exception 'Please choose parent or student.'; end if;
  begin v_rating := (payload ->> 'rating')::int; exception when others then v_rating := null; end;
  if v_rating is null or v_rating < 1 or v_rating > 5 then raise exception 'Please choose a star rating.'; end if;
  if char_length(v_comment) < 10 then raise exception 'Please write your comment (at least 10 characters).'; end if;
  if char_length(v_comment) > 2000 then raise exception 'Please keep your comment under 2000 characters.'; end if;
  if coalesce((payload ->> 'consent')::boolean, false) is not true then
    raise exception 'Please agree to the privacy notice before sending.';
  end if;

  -- Optional media: only files this visitor just uploaded under their own random folder.
  if jsonb_typeof(payload -> 'media') = 'array' and jsonb_array_length(payload -> 'media') > 0 then
    if jsonb_array_length(payload -> 'media') > 3 then raise exception 'Please attach up to 3 files.'; end if;
    if v_token !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'The upload could not be matched. Please attach the files again.';
    end if;
    for v_path in select jsonb_array_elements_text(payload -> 'media') loop
      if position(('pending/' || v_token || '/') in v_path) <> 1
         or not exists (select 1 from storage.objects o where o.bucket_id = 'review-media' and o.name = v_path) then
        raise exception 'The upload could not be matched. Please attach the files again.';
      end if;
      v_paths := array_append(v_paths, v_path);
    end loop;
    if exists (select 1 from public.review_submissions r where r.media_paths && v_paths) then
      raise exception 'These files were already sent with another review.';
    end if;
  end if;

  v_links := (select count(*) from regexp_matches(v_comment, 'https?://', 'g'));
  if v_links > 1 then v_score := v_score + 60; end if;
  if v_comment ~* '(casino|crypto|viagra|seo services|backlinks|loan offer)' then v_score := v_score + 60; end if;
  select value ->> 'consent_version' into v_consent_version from public.settings where key = 'site.forms';
  v_ref := 'REV-' || v_year || '-' || lpad(private.next_counter('review-' || v_year)::text, 5, '0');

  insert into public.review_submissions (reference, name, email, relation, country, rating, comment, media_paths,
                                         page_path, consent_text_version, status, spam_score, ip_hash, user_agent)
  values (v_ref, left(v_name, 80), v_email, v_relation,
          nullif(left(trim(coalesce(payload ->> 'country', '')), 80), ''),
          v_rating, v_comment, v_paths,
          nullif(left(coalesce(payload ->> 'page_path', ''), 300), ''),
          coalesce(v_consent_version, '2026-10-13'),
          case when v_score >= 60 then 'spam' else 'new' end, v_score, v_ip, private.request_user_agent());
  return jsonb_build_object('ok', true, 'reference', v_ref);
end $$;

revoke execute on function public.submit_review(jsonb) from public;
grant execute on function public.submit_review(jsonb) to anon, authenticated, service_role;
revoke all on function private.tg_review_after() from public, anon, authenticated;

