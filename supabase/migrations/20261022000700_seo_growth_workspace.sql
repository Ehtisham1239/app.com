-- CMS-only planning and evidence. No fabricated analytics or external account connection.
create table public.seo_growth_tasks (
  id uuid primary key default gen_random_uuid(), task_key text unique,
  title text not null check(char_length(title) between 2 and 200),
  workstream text not null default 'content' check(workstream in ('keyword','content','technical','authority','measurement')),
  market text not null default 'Both' check(market in ('USA','Australia','Both')),
  status text not null default 'planned' check(status in ('planned','in_progress','blocked','complete')),
  priority text not null default 'medium' check(priority in ('high','medium','low')),
  target_path text not null default '' check(target_path='' or target_path like '/%'),
  notes text not null default '', evidence_url text not null default '',
  due_at timestamptz, version int not null default 1,
  check(status<>'complete' or length(trim(evidence_url))>0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.seo_growth_metrics (
  id uuid primary key default gen_random_uuid(), title text not null,
  market text not null check(market in ('USA','Australia','Both')),
  source text not null check(source in ('Search Console','GA4','Manual research')),
  period_start date not null, period_end date not null,
  clicks int check(clicks>=0), impressions int check(impressions>=0),
  organic_sessions int check(organic_sessions>=0),
  evidence_url text not null default '', notes text not null default '',
  version int not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check(period_end>=period_start and period_end-period_start<=366),
  check(evidence_url ~ '^https://'),
  check((source='Search Console' and organic_sessions is null) or (source='GA4' and clicks is null and impressions is null) or source='Manual research'),
  check(clicks is not null or impressions is not null or organic_sessions is not null)
);
alter table public.seo_growth_tasks enable row level security;
alter table public.seo_growth_metrics enable row level security;
revoke all on public.seo_growth_tasks, public.seo_growth_metrics from public,anon;
grant select,insert,update,delete on public.seo_growth_tasks,public.seo_growth_metrics to authenticated;
grant all on public.seo_growth_tasks,public.seo_growth_metrics to service_role;
select private.apply_staff_policies('seo_growth_tasks','pages');
select private.apply_staff_policies('seo_growth_metrics','pages');
create trigger growth_tasks_updated before update on public.seo_growth_tasks for each row execute function private.tg_set_updated_at();
create trigger growth_tasks_version before update on public.seo_growth_tasks for each row execute function private.tg_bump_version();
create trigger growth_tasks_audit after insert or update or delete on public.seo_growth_tasks for each row execute function private.tg_audit();
create trigger growth_metrics_updated before update on public.seo_growth_metrics for each row execute function private.tg_set_updated_at();
create trigger growth_metrics_version before update on public.seo_growth_metrics for each row execute function private.tg_bump_version();
create trigger growth_metrics_audit after insert or update or delete on public.seo_growth_metrics for each row execute function private.tg_audit();

create or replace function public.market_lead_report(p_from date,p_to date) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if not public.has_permission('reports:read') then raise exception 'Report permission required' using errcode='42501'; end if;
 if p_from is null or p_to is null or p_to<p_from or p_to-p_from>366 then raise exception 'Choose a valid range up to 366 days'; end if;
 with leads as (
  select country,status,'trial'::text kind from public.trial_applications
  where public.has_permission('trials:read') and deleted_at is null
   and created_at>=p_from::timestamp at time zone 'Asia/Karachi' and created_at<(p_to+1)::timestamp at time zone 'Asia/Karachi'
  union all
  select country,status,'contact' from public.contact_messages
  where public.has_permission('contacts:read') and deleted_at is null and status<>'spam'
   and created_at>=p_from::timestamp at time zone 'Asia/Karachi' and created_at<(p_to+1)::timestamp at time zone 'Asia/Karachi'
 ), classified as (
  select case when lower(trim(country)) in ('united states','usa','us') then 'USA' when lower(trim(country)) in ('australia','au') then 'Australia' end market,status,kind from leads
 ), totals as (
  select m.market,count(c.kind) leads,count(*) filter(where kind='trial') trials,count(*) filter(where kind='contact') contacts,
   count(*) filter(where kind='trial' and status in ('reviewed','scheduled','completed','enrolled')) reviewed,
   count(*) filter(where kind='trial' and status='enrolled') enrolled
  from (values ('USA'),('Australia')) m(market) left join classified c on c.market=m.market group by m.market
 ) select jsonb_agg(to_jsonb(t)||jsonb_build_object('trial_to_enrolled_percent',round(100.0*enrolled/nullif(trials,0),1)) order by market) into result from totals t;
 return result;
end $$;
revoke all on function public.market_lead_report(date,date) from public,anon;
grant execute on function public.market_lead_report(date,date) to authenticated,service_role;
