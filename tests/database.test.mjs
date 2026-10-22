import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
const db = new PGlite({ extensions: { pgcrypto } });
const root = new URL("../", import.meta.url);
const adminId = "11111111-1111-4111-8111-111111111111";
const editorId = "22222222-2222-4222-8222-222222222222";
const noRoleId = "33333333-3333-4333-8333-333333333333";
const sql = (file) => readFileSync(new URL(file, root), "utf8");
async function role(name = "postgres", id = "") {
  await db.exec(`reset role; set role ${name};`);
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
}
before(async () => {
  await db.exec(sql("supabase/tests/local_shim.sql"));
  // Supabase-only cron and HTTP extensions are validated on deployment, not emulated here.
  for (const file of readdirSync(new URL("supabase/migrations", root)).sort()) {
    if (/20261013000800|20261013001400/.test(file)) continue;
    await db.exec(sql(`supabase/migrations/${file}`));
  }
  for (const [id, name] of [[adminId, "admissions"], [editorId, "content_editor"], [noRoleId, null]]) {
    await db.query("insert into auth.users (id,email,raw_app_meta_data) values ($1,$2,$3)", [id, `${id.slice(0, 4)}@example.test`, name ? { role: name } : {}]);
  }
});
after(async () => { await db.close(); });
test("all location pages seeded, RLS enabled on leads", async () => {
  assert.equal((await db.query("select count(*)::int as n from public.pages where slug like 'locations-%' and status='published'")).rows[0].n, 165);
  const rows = (await db.query("select relrowsecurity from pg_class where relname in ('trial_applications','contact_messages')")).rows;
  assert.equal(rows.length, 2); assert.ok(rows.every((r) => r.relrowsecurity));
});
test("public contact form requires consent, saves campaign and hides private data", async () => {
  await role("anon");
  const payload = { name: "Test Parent", email: "parent@example.test", message: "Please explain online lessons", consent: false, source: "google", utm: { utm_source: "google", utm_medium: "cpc", utm_campaign: "london-quran" } };
  await assert.rejects(db.query("select public.submit_contact_message($1::jsonb)", [payload]), /agree to the privacy/);
  payload.consent = true;
  const result = await db.query("select public.submit_contact_message($1::jsonb) as result", [payload]);
  assert.ok(result.rows[0].result.reference.startsWith("MSG-"));
  await assert.rejects(db.query("select * from public.contact_messages"), /permission denied/);
  await role();
  const row = (await db.query("select source,utm from public.contact_messages where email='parent@example.test'")).rows[0];
  assert.equal(row.source, "google"); assert.equal(row.utm.utm_campaign, "london-quran");
});
test("public trial form retains country, city and ad attribution", async () => {
  await role("anon");
  const payload = { learner_name: "Test Learner", age_band: "adult", email: "learner@example.test", phone: "+447700900123", country: "United Kingdom", city: "London", timezone: "Europe/London", consent: true, source: "google", utm: { utm_source: "google", utm_medium: "cpc", utm_campaign: "london-quran" } };
  const result = await db.query("select public.submit_trial_application($1::jsonb) as result", [payload]);
  assert.ok(result.rows[0].result.reference);
  await assert.rejects(db.query("select * from public.trial_applications"), /permission denied/);
  await role();
  const row = (await db.query("select city,utm from public.trial_applications where email='learner@example.test'")).rows[0];
  assert.equal(row.city, "London"); assert.equal(row.utm.utm_source, "google");
});
test("anonymous and non-staff users cannot read campaign reports", async () => {
  await role("anon");
  await assert.rejects(db.query("select public.campaign_report(current_date,current_date)"), /permission denied/);
  await role("authenticated", noRoleId);
  await assert.rejects(db.query("select public.campaign_report(current_date,current_date)"), /permission/);
});
test("admissions report groups both form types and validates date ranges", async () => {
  await role("authenticated", adminId);
  const result = (await db.query("select public.campaign_report(current_date - 1,current_date + 1) as report")).rows[0].report;
  const row = result.find((r) => r.campaign === "london-quran");
  assert.equal(row.leads, 2); assert.equal(row.trials, 1); assert.equal(row.contacts, 1); assert.equal(row.enrolled, 0);
  await assert.rejects(db.query("select public.campaign_report(current_date,current_date-1)"), /valid date range/);
});
test("content editor updates a city page; anonymous readers see published changes", async () => {
  await role("authenticated", editorId);
  await db.query("update public.pages set title='London Quran lessons — edited' where slug='locations-united-kingdom-london'");
  await role("anon");
  assert.equal((await db.query("select title from public.pages where slug='locations-united-kingdom-london'")).rows[0].title, "London Quran lessons — edited");
});
test("staff cannot elevate their own role", async () => {
  await role("authenticated", editorId);
  await assert.rejects(db.query("update public.profiles set role='super_admin' where id=$1", [editorId]), /only change your own name/);
});
test("location seed is repeatable and preserves CMS edits", async () => {
  await role();
  await db.exec(sql("supabase/migrations/20261022000200_location_content.sql"));
  assert.equal((await db.query("select title from public.pages where slug='locations-united-kingdom-london'")).rows[0].title, "London Quran lessons — edited");
});

test("CMS editors can persist indexing controls without granting public writes", async () => {
  await role("authenticated", editorId);
  await db.query("update public.pages set seo_noindex=true,canonical_url='/locations/united-kingdom/london',seo_focus_keyword='Quran London' where slug='locations-united-kingdom-london'");
  await role("anon");
  const row = (await db.query("select seo_noindex,canonical_url,seo_focus_keyword from public.pages where slug='locations-united-kingdom-london'")).rows[0];
  assert.equal(row.seo_noindex, true); assert.equal(row.seo_focus_keyword, "Quran London");
  await assert.rejects(db.query("update public.pages set seo_noindex=false where slug='locations-united-kingdom-london'"), /permission denied/);
});

test("SEO follow-up preserves custom content and is repeatable", async () => {
  await role();
  const privacy = (await db.query("select body_html from pages where slug='privacy-policy'")).rows[0].body_html;
  assert.equal(privacy.split('id="campaign-attribution"').length - 1, 1);
  const about = (await db.query("select body_html from pages where slug='about'")).rows[0].body_html;
  assert.equal(about.includes("background check"), false);
  assert.equal(about.includes("started in 2018"), false);
  const migration = sql("supabase/migrations/20261022000400_seo_audit_followup.sql");
  await db.exec("update pages set body_html='<p>Owner reviewed teacher information.</p>' where slug='about'");
  await db.exec(migration);
  assert.equal((await db.query("select body_html from pages where slug='privacy-policy'")).rows[0].body_html, privacy);
  assert.equal((await db.query("select body_html from pages where slug='about'")).rows[0].body_html, '<p>Owner reviewed teacher information.</p>');
});
test("growth planning is private, editable by content staff and requires completion evidence", async()=>{
  await role('anon');
  await assert.rejects(db.query('select * from public.seo_growth_tasks'),/permission denied/);
  await assert.rejects(db.query('select * from public.seo_growth_metrics'),/permission denied/);
  await assert.rejects(db.query('select public.market_lead_report(current_date,current_date)'),/permission denied/);
  await role('authenticated',noRoleId);
  assert.equal((await db.query('select * from public.seo_growth_tasks')).rows.length,0);
  await assert.rejects(db.query('select public.market_lead_report(current_date,current_date)'),/permission/);
  await role('authenticated',editorId);
  assert.equal((await db.query("select count(*)::int n from public.seo_growth_tasks where task_key like 'keyword-%'")).rows[0].n,60);
  await assert.rejects(db.query("update public.seo_growth_tasks set status='complete' where task_key='regional'"),/check constraint/);
  await db.query("update public.seo_growth_tasks set status='complete',evidence_url='Reviewed release and route checks' where task_key='regional'");
  await assert.rejects(db.query("insert into public.seo_growth_metrics(title,market,source,period_start,period_end,clicks,evidence_url) values('Bad sample','USA','Search Console',current_date,current_date,-1,'https://example.test/source')"),/check constraint/);
  await db.query("insert into public.seo_growth_metrics(title,market,source,period_start,period_end,clicks,impressions,evidence_url) values('Local test only','USA','Search Console',current_date,current_date,12,200,'https://example.test/source')");
  await assert.rejects(db.query("insert into public.seo_growth_metrics(title,market,source,period_start,period_end,organic_sessions,evidence_url) values('Wrong source','USA','Search Console',current_date,current_date,12,'https://example.test/source')"),/check constraint/);
});
test("market cohort reports use real submissions and distinguish an empty denominator",async()=>{
  await role('anon');
  const payload={learner_name:'Market Test',age_band:'adult',email:'market@example.test',phone:'+447700900123',country:'United States',city:'Denver',timezone:'America/Denver',consent:true};
  await db.query('select public.submit_trial_application($1::jsonb)',[payload]);
  await role('authenticated',adminId);
  const rows=(await db.query('select public.market_lead_report(current_date-1,current_date+1) report')).rows[0].report;
  const us=rows.find(r=>r.market==='USA'),au=rows.find(r=>r.market==='Australia');
  assert.equal(us.trials,1);assert.equal(us.enrolled,0);assert.equal(us.trial_to_enrolled_percent,0);
  assert.equal(au.trials,0);assert.equal(au.trial_to_enrolled_percent,null);
  await assert.rejects(db.query('select public.market_lead_report(current_date,current_date-1)'),/valid range/);
});
test("growth launch preserves edits on repeat and publishes distinct guide/article routes",async()=>{
 await role();
 assert.equal((await db.query("select count(*)::int n from public.blog_posts where slug in ('choose-online-quran-teacher-usa','quran-lessons-australia-time-zones','noorani-qaida-or-quran-reading','adult-quran-beginner-first-month','prepare-child-first-online-quran-trial','tajweed-practice-with-feedback','hifz-revision-with-school','questions-before-quran-course-enrolment','online-quran-lesson-setup-accessibility','parent-teacher-quran-progress-review','family-quran-learning-multiple-children','quran-translation-and-arabic-difference') and status='published'")).rows[0].n,12);
 const original=(await db.query("select body_html from pages where slug='locations-australia'")).rows[0].body_html;
 await db.exec("update blog_posts set title='Owner reviewed title' where slug='quran-translation-and-arabic-difference'");
 await db.exec(sql('supabase/migrations/20261022000800_growth_launch_content.sql'));
 assert.equal((await db.query("select title from blog_posts where slug='quran-translation-and-arabic-difference'")).rows[0].title,'Owner reviewed title');
 assert.equal((await db.query("select body_html from pages where slug='locations-australia'")).rows[0].body_html,original);
 assert.equal(original.split('oqc-market-guide-australia-v1').length-1,1);
});
