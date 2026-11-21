-- Extend country-level admissions reporting to the four approved growth markets.
create or replace function public.market_lead_report(p_from date, p_to date)
returns jsonb
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare result jsonb;
begin
  if not public.has_permission('reports:read') then
    raise exception 'Report permission required' using errcode='42501';
  end if;
  if p_from is null or p_to is null or p_to < p_from or p_to - p_from > 366 then
    raise exception 'Choose a valid range up to 366 days';
  end if;

  with leads as (
    select country, status, 'trial'::text kind
    from public.trial_applications
    where public.has_permission('trials:read')
      and deleted_at is null
      and created_at >= p_from::timestamp at time zone 'Asia/Karachi'
      and created_at < (p_to + 1)::timestamp at time zone 'Asia/Karachi'
    union all
    select country, status, 'contact'::text kind
    from public.contact_messages
    where public.has_permission('contacts:read')
      and deleted_at is null
      and status <> 'spam'
      and created_at >= p_from::timestamp at time zone 'Asia/Karachi'
      and created_at < (p_to + 1)::timestamp at time zone 'Asia/Karachi'
  ),
  classified as (
    select case
      when lower(trim(country)) in ('united kingdom','uk','u.k.','great britain','britain','england','scotland','wales','northern ireland') then 'UK'
      when lower(trim(country)) in ('united states','united states of america','usa','us','u.s.','u.s.a.') then 'USA'
      when lower(trim(country)) in ('canada','ca') then 'Canada'
      when lower(trim(country)) in ('australia','au') then 'Australia'
      when lower(trim(country)) in ('united arab emirates','uae','emirates') then 'UAE'
    end market, status, kind
    from leads
  ),
  totals as (
    select m.market,
      count(c.kind) leads,
      count(*) filter (where c.kind = 'trial') trials,
      count(*) filter (where c.kind = 'contact') contacts,
      count(*) filter (where c.kind = 'trial' and c.status in ('reviewed','scheduled','completed','enrolled')) reviewed,
      count(*) filter (where c.kind = 'trial' and c.status = 'enrolled') enrolled
    from (values ('UK'),('USA'),('Canada'),('Australia'),('UAE')) m(market)
    left join classified c on c.market = m.market
    group by m.market
  )
  select jsonb_agg(
    to_jsonb(t) || jsonb_build_object(
      'trial_to_enrolled_percent',
      round(100.0 * enrolled / nullif(trials, 0), 1)
    )
    order by case market when 'UK' then 1 when 'USA' then 2 when 'Canada' then 3 when 'Australia' then 4 else 5 end
  ) into result
  from totals t;

  return result;
end
$function$;
