-- 2 Nov 2026: low-rating attention and one-time five-day escalation.
-- Public feedback remains private to OQC staff. No review is auto-posted to Trustpilot
-- or Google, and no rating is filtered from public-review invitations.

alter table public.review_submissions
  add column if not exists escalated_at timestamptz;

create index if not exists review_submissions_unresolved_low_rating_idx
  on public.review_submissions (created_at)
  where status = 'new' and rating <= 2 and escalated_at is null and deleted_at is null;

create or replace function private.tg_review_after() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status <> 'spam' then
    if new.rating <= 2 then
      perform private.notify_permission(
        'testimonials:read', 'review.negative',
        'Needs attention: ' || new.rating || '★ feedback from ' || left(new.name, 40),
        left(new.comment, 160), '/admin/reviews/' || new.id,
        'review_submission', new.id
      );
    else
      perform private.notify_permission(
        'testimonials:read', 'review.new',
        'New review: ' || new.rating || '★ from ' || left(new.name, 40),
        left(new.comment, 120), '/admin/reviews/' || new.id,
        'review_submission', new.id
      );
    end if;
  end if;
  return new;
end $$;

create or replace function private.escalate_unresolved_low_reviews()
returns integer
language plpgsql security definer set search_path = '' as $$
declare
  item record;
  sent integer := 0;
begin
  for item in
    select id, reference, name, rating, comment, created_at
    from public.review_submissions
    where status = 'new'
      and rating <= 2
      and escalated_at is null
      and deleted_at is null
      and created_at <= now() - interval '5 days'
    order by created_at asc
    for update skip locked
  loop
    perform private.notify_permission(
      'testimonials:read', 'review.escalated',
      '5-day escalation: unresolved ' || item.rating || '★ review',
      'Review ' || item.reference || ' from ' || left(item.name, 40) ||
        ' remains in New status. Please investigate and record the outcome.',
      '/admin/reviews/' || item.id, 'review_submission', item.id
    );
    update public.review_submissions set escalated_at = now() where id = item.id;
    sent := sent + 1;
  end loop;
  return sent;
end $$;

revoke all on function private.escalate_unresolved_low_reviews() from public, anon, authenticated;
grant execute on function private.escalate_unresolved_low_reviews() to postgres, service_role;

select cron.schedule(
  'oqc-review-five-day-escalation',
  '30 2 * * *',
  $$select private.escalate_unresolved_low_reviews()$$
);
