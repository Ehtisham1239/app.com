-- Add the UAE as a measurable market in the SEO/admissions workspace.
alter table public.seo_growth_tasks drop constraint if exists seo_growth_tasks_market_check;
alter table public.seo_growth_tasks add constraint seo_growth_tasks_market_check check (market in ('USA','Australia','UAE','Both'));
alter table public.seo_growth_metrics drop constraint if exists seo_growth_metrics_market_check;
alter table public.seo_growth_metrics add constraint seo_growth_metrics_market_check check (market in ('USA','Australia','UAE','Both'));

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
  select case
    when lower(trim(country)) in ('united states','usa','us') then 'USA'
    when lower(trim(country)) in ('australia','au') then 'Australia'
    when lower(trim(country)) in ('united arab emirates','uae','emirates') then 'UAE'
   end market,status,kind from leads
 ), totals as (
  select m.market,count(c.kind) leads,count(*) filter(where kind='trial') trials,count(*) filter(where kind='contact') contacts,
   count(*) filter(where kind='trial' and status in ('reviewed','scheduled','completed','enrolled')) reviewed,
   count(*) filter(where kind='trial' and status='enrolled') enrolled
  from (values ('USA'),('Australia'),('UAE')) m(market) left join classified c on c.market=m.market group by m.market
 ) select jsonb_agg(to_jsonb(t)||jsonb_build_object('trial_to_enrolled_percent',round(100.0*enrolled/nullif(trials,0),1)) order by market) into result from totals t;
 return result;
end $$;

insert into public.seo_growth_tasks(task_key,title,workstream,market,status,priority,target_path,notes)
values
('keyword-UAE-01','online Quran classes UAE','keyword','UAE','planned','high','/locations/united-arab-emirates','Validate demand and Search Console query coverage before changing priority.'),
('keyword-UAE-02','online Quran classes Dubai','keyword','UAE','planned','medium','/locations/united-arab-emirates/dubai','City page stays noindex until unique evidence and local proof are reviewed.'),
('keyword-UAE-03','online Quran classes Abu Dhabi','keyword','UAE','planned','medium','/locations/united-arab-emirates/abu-dhabi','City page stays noindex until unique evidence and local proof are reviewed.'),
('keyword-UAE-04','online Quran classes Sharjah','keyword','UAE','planned','medium','/locations/united-arab-emirates/sharjah','City page stays noindex until unique evidence and local proof are reviewed.'),
('keyword-UAE-05','Quran classes for kids UAE','keyword','UAE','planned','medium','/learn/quran-for-kids','Create a UAE-specific supporting guide only after demand and content gap validation.'),
('keyword-UAE-06','online Tajweed classes UAE','keyword','UAE','planned','medium','/courses/tajweed','Align with existing course page; avoid duplicate thin landing pages.'),
('keyword-UAE-07','online Hifz classes UAE','keyword','UAE','planned','medium','/courses/hifz-quran','Align with existing course page; verify actual teacher availability.'),
('keyword-UAE-08','Noorani Qaida online UAE','keyword','UAE','planned','medium','/courses/noorani-qaida','Use course page and local hub internal links.'),
('content-UAE-01','Publish UAE-specific family lesson planning guide','content','UAE','in_progress','high','/locations/united-arab-emirates','Unique copy covers seven emirates, Asia/Dubai time, AED quote process and online-only status.'),
('technical-UAE-01','Verify UAE hub indexing, canonical and sitemap','technical','UAE','planned','high','/locations/united-arab-emirates','Verify production URL and GSC before marking complete.')
on conflict(task_key) do update set title=excluded.title,market=excluded.market,target_path=excluded.target_path,notes=excluded.notes;
