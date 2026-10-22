-- Scheduled jobs (Supabase pg_cron). Times are UTC.
create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;

-- Publish scheduled pages, posts, courses, FAQs, testimonials and plans every 5 minutes
select cron.schedule('oqc-publish-scheduled', '*/5 * * * *', $$select private.publish_due_content()$$);

-- Nightly (05:10 PKT): create the next two weeks of class sessions, clear old rate-limit entries
select cron.schedule('oqc-daily-maintenance', '10 0 * * *', $$select private.daily_maintenance()$$);
