-- Add UK and Canada to OQC SEO growth markets and seed four-market work queues.
alter table public.seo_growth_tasks drop constraint if exists seo_growth_tasks_market_check;
alter table public.seo_growth_tasks add constraint seo_growth_tasks_market_check
  check (market = any (array['USA'::text, 'UK'::text, 'Canada'::text, 'Australia'::text, 'UAE'::text, 'Both'::text]));

alter table public.seo_growth_metrics drop constraint if exists seo_growth_metrics_market_check;
alter table public.seo_growth_metrics add constraint seo_growth_metrics_market_check
  check (market = any (array['USA'::text, 'UK'::text, 'Canada'::text, 'Australia'::text, 'UAE'::text, 'Both'::text]));

insert into public.seo_growth_tasks (task_key,title,workstream,market,status,priority,target_path,notes)
values
('UK-ORG-01','Validate UK keyword clusters and intent using Search Console and keyword evidence','keyword','UK','in_progress','high','/locations/united-kingdom','UK is the primary market. Record source, date, intent, country and qualified-lead relevance; do not invent search volumes.'),
('UK-ORG-02','Audit UK country hub content, metadata, canonical and internal links','content','UK','in_progress','high','/locations/united-kingdom','Keep online-only positioning, GBP quote accuracy, GMT/BST scheduling and parent-led enquiry context.'),
('UK-ORG-03','Build eligible UK editorial and community citation prospect register','authority','UK','planned','medium','/locations/united-kingdom','Only publishers that accept an overseas online provider; verify actual legal identity and no fake local NAP.'),
('UK-ORG-04','Review UK parent consent, PECR marketing and non-essential cookie controls','technical','UK','planned','high','/privacy','Check ICO guidance and actual data flows before claiming compliance.'),
('UK-ORG-05','Establish UK country-level lead and enrolment measurement baseline','measurement','UK','planned','high','/locations/united-kingdom','Reconcile GSC, GA4 and CRM; do not send PII to analytics.'),
('USA-ORG-01','Validate US keyword clusters and city intent against query and conversion data','keyword','USA','in_progress','high','/locations/united-states','Prioritise national intent and New York, Los Angeles, Chicago, Houston and Dallas only where demand is evidenced.'),
('USA-ORG-02','Audit US country hub content, metadata, canonical and local-time UX','content','USA','in_progress','high','/locations/united-states','USD quote process, city/date-aware time zones, online-only disclosure and parent-led trial CTA.'),
('USA-ORG-03','Build eligible US national/community editorial citation prospect register','authority','USA','planned','medium','/locations/united-states','No fictitious US address, school approval, incorporation or Google Business Profile.'),
('USA-ORG-04','Review COPPA applicability, parent consent, data minimisation and CAN-SPAM','technical','USA','planned','high','/privacy','Map child data collection, vendors, analytics tags, parent notices and marketing opt-outs.'),
('USA-ORG-05','Establish US country-level qualified-lead and enrolment baseline','measurement','USA','planned','high','/locations/united-states','Track USD, source/medium, trial attendance, paid enrolment and retention without PII in analytics.'),
('CAN-ORG-01','Validate Canadian keyword clusters and province/city search demand','keyword','Canada','in_progress','high','/locations/canada','Validate Toronto, Vancouver, Montreal, Calgary and Ottawa demand before city indexation.'),
('CAN-ORG-02','Audit Canada country hub content, CAD quote, local time and internal links','content','Canada','in_progress','high','/locations/canada','Avoid single-zone assumptions; explain online-only delivery and parent/guardian contact.'),
('CAN-ORG-03','Build eligible Canadian community and editorial citation prospect register','authority','Canada','planned','medium','/locations/canada','Accept only publishers permitting international online providers; no invented Canadian NAP.'),
('CAN-ORG-04','Review CASL consent evidence, unsubscribe and provincial privacy applicability','technical','Canada','planned','high','/privacy','Review federal/provincial privacy applicability and child consent process with qualified counsel.'),
('CAN-ORG-05','Establish Canada country-level lead and enrolment measurement baseline','measurement','Canada','planned','high','/locations/canada','Track CAD, source/medium, trial attendance, paid enrolment and retention without PII.'),
('AUS-ORG-01','Validate Australian keyword clusters and state/city search demand','keyword','Australia','in_progress','high','/locations/australia','Validate Sydney, Melbourne, Brisbane, Perth and Adelaide demand before city indexation.'),
('AUS-ORG-02','Audit Australia country hub content, AUD quote, state clocks and internal links','content','Australia','in_progress','high','/locations/australia','Use city/date-aware zones and accurate daylight-saving explanations; no local branch claims.'),
('AUS-ORG-03','Build eligible Australian Muslim/community/editorial citation prospect register','authority','Australia','planned','medium','/locations/australia','Only accept overseas online providers; do not fabricate ABN, local phone, office or accreditation.'),
('AUS-ORG-04','Review Australian Consumer Law claims, Spam Act consent and unsubscribe workflow','technical','Australia','planned','high','/policies','Review pricing, trial, cancellation/refund statements, consent logs and opt-out handling.'),
('AUS-ORG-05','Establish Australia country-level qualified-lead and enrolment measurement baseline','measurement','Australia','planned','high','/locations/australia','Track AUD, source/medium, trial attendance, paid enrolment and retention without PII.')
on conflict (task_key) do nothing;
