-- Reviews (owner request, 3 Nov 2026): an optional, separate permission to show the
-- reviewer's first name and review on the website. Privacy consent stays required and
-- unchanged; publishing permission defaults to false and is recorded with a timestamp.
-- Additive: older clients that do not send publish_consent keep working (false).
alter table public.review_submissions
  add column if not exists publish_consent boolean not null default false,
  add column if not exists publish_consent_at timestamptz;

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
  -- Optional, separate from the privacy consent: may we show first name + review on the website?
  v_publish boolean := coalesce((payload ->> 'publish_consent')::boolean, false);
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
                                         page_path, consent_text_version, status, spam_score, ip_hash, user_agent,
                                         publish_consent, publish_consent_at)
  values (v_ref, left(v_name, 80), v_email, v_relation,
          nullif(left(trim(coalesce(payload ->> 'country', '')), 80), ''),
          v_rating, v_comment, v_paths,
          nullif(left(coalesce(payload ->> 'page_path', ''), 300), ''),
          coalesce(v_consent_version, '2026-10-13'),
          case when v_score >= 60 then 'spam' else 'new' end, v_score, v_ip, private.request_user_agent(),
          v_publish, case when v_publish then now() end);
  return jsonb_build_object('ok', true, 'reference', v_ref);
end $$;
revoke execute on function public.submit_review(jsonb) from public;
grant execute on function public.submit_review(jsonb) to anon, authenticated, service_role;
