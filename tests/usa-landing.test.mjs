import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import nextConfig from "../next.config.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const landing = read("public/usa-quran-classes/index.html");
const thankYou = read("public/usa-quran-classes/thank-you/index.html");
const pages = { landing, thankYou };
const seed = JSON.parse(read("src/lib/seed-content.json"));

// Values accepted by public.submit_trial_application (supabase/migrations/20261013000500_logic.sql).
const DB_AGE_BANDS = ["child_4_7", "child_8_12", "teen_13_17", "adult"];
const DB_TEACHER = ["female", "male", "any"];

function mapping() {
  const start = landing.indexOf("/* LP-CMS-MAPPING-START */"), end = landing.indexOf("/* LP-CMS-MAPPING-END */");
  assert.ok(start > 0 && end > start, "mapping markers present");
  const context = {};
  vm.runInNewContext(`${landing.slice(start, end)}; this.cmsPayload = cmsPayload; this.CMS_COURSE = CMS_COURSE; this.CMS_TZ = CMS_TZ;`, context);
  return context;
}
const base = {
  parent_name: "Test Parent", email: " Parent@Example.TEST ", phone: "+15552345678", student_age: "9-12", course: "hifz",
  teacher_pref: "female", timing: "Mon & Wed after 5 pm", time_zone: "CT", sms_consent: false, callback_requested: false,
  plan: "", page_variant: "default", company: "", attribution: { first: null, last: { gclid: "test-gclid", utm_source: "google", utm_campaign: "usa", landing_page: "/usa-quran-classes", ts: 1 } },
};

test("both pages are production builds the site CSP allows", () => {
  for (const [name, html] of Object.entries(pages)) {
    assert.match(html, /mode: 'production'/, name);
    assert.doesNotMatch(html, /<[a-zA-Z][^>]*\son[a-z]+\s*=/, `${name}: inline event handlers are blocked by script-src-attr 'none'`);
    assert.doesNotMatch(html, /class="pv-tools"|Preview build/, `${name}: preview tools removed`);
    assert.match(html, /^<!doctype html>\n<html lang="en-US">\n<head>/, `${name}: real document head`);
    assert.match(html, /<meta name="robots" content="noindex/, `${name}: kept out of search (ads-only page)`);
  }
  assert.match(landing, /<link rel="canonical" href="https:\/\/www\.onlinequrancollege\.com\/usa-quran-classes">/);
  assert.match(landing, /leadBackend: 'oqc-cms'/);
  assert.match(landing, /thankYouUrl: '\/usa-quran-classes\/thank-you'/);
});

test("analytics follow the site's owner decision: GTM-W7CMZS53, cookieless, ad signals denied, live domain only", () => {
  for (const [name, html] of Object.entries(pages)) {
    assert.match(html, /gtmId: 'GTM-W7CMZS53'/, name);
    assert.match(html, /analyticsHosts: \['www\.onlinequrancollege\.com', 'onlinequrancollege\.com'\]/, name);
    assert.match(html, /client_storage: 'none'/, name);
    assert.match(html, /function shieldAnalyticsCookies/, name);
    assert.match(html, /ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'/, name);
    assert.match(html, /event: 'oqc_page_view'/, name);
    assert.doesNotMatch(html, /googletagmanager\.com\/gtag\/js/, `${name}: no direct gtag (the container owns GA4)`);
    assert.doesNotMatch(html, /getJSON\(LS, 'oqc_lp_attr'\)/, `${name}: attribution is session-only`);
  }
  assert.match(landing, /oqcEmit\('generate_lead', \{ form_type: 'trial', market: 'USA' \}\)/);
});

test("the landing page routes are rewritten to the static files", async () => {
  const { beforeFiles } = await nextConfig.rewrites();
  const find = (source) => beforeFiles.find((rule) => rule.source === source)?.destination;
  assert.equal(find("/usa-quran-classes"), "/usa-quran-classes/index.html");
  assert.equal(find("/usa-quran-classes/thank-you"), "/usa-quran-classes/thank-you/index.html");
});

test("lead mapping matches the database function's rules", () => {
  const { cmsPayload, CMS_COURSE, CMS_TZ } = mapping();
  const ages = { "4-5": "child_4_7", "6-8": "child_4_7", "9-12": "child_8_12", "13-17": "teen_13_17", "18+": "adult" };
  for (const [age, band] of Object.entries(ages)) {
    const out = cmsPayload({ ...base, student_age: age }, {});
    assert.equal(out.age_band, band);
    assert.ok(DB_AGE_BANDS.includes(out.age_band));
    assert.ok(out.learner_name.length >= 2 && out.learner_name.length <= 120);
  }
  const child = cmsPayload(base, { age: "9–12 years", course: "Hifz-ul-Quran", teacher: "Female", tz: "Central (CT)" });
  assert.equal(child.learner_name, "Child of Test Parent");
  assert.equal(child.guardian_name, "Test Parent");
  assert.equal(child.email, "parent@example.test");
  assert.equal(child.country, "United States");
  assert.equal(child.timezone, "America/Chicago");
  assert.equal(child.consent, true);
  assert.equal(child.marketing_opt_in, false);
  assert.equal(child.phone_is_whatsapp, false);
  assert.ok(DB_TEACHER.includes(child.teacher_gender_pref));
  assert.equal(child.source, "google");
  assert.deepEqual(JSON.parse(JSON.stringify(child.utm)), { landing_page: "/usa-quran-classes", gclid: "test-gclid", utm_source: "google", utm_campaign: "usa" });
  assert.match(child.notes, /Preferred days and time \(in the parent’s words\): Mon & Wed after 5 pm/);
  assert.ok(child.notes.length <= 2000);
  const adult = cmsPayload({ ...base, student_age: "18+", teacher_pref: "none", attribution: {} }, {});
  assert.equal(adult.learner_name, "Test Parent");
  assert.equal(adult.guardian_name, "");
  assert.equal(adult.teacher_gender_pref, "any");
  assert.equal(adult.source, "usa-landing-page");
  assert.equal(cmsPayload({ ...base, company: "bot" }, {}).website, "bot", "honeypot reaches the database check");
  // Every time zone is a real IANA zone; every course ID is a published course.
  for (const zone of Object.values(CMS_TZ)) assert.doesNotThrow(() => new Intl.DateTimeFormat("en-US", { timeZone: zone }));
  const published = new Set(seed.courses.filter((c) => c.status === "published").map((c) => c.id));
  for (const id of Object.values(CMS_COURSE)) assert.ok(published.has(id), `course ${id} is published`);
});


test("USA campaign publishes only verified contact and content claims", () => {
  assert.match(landing, /phone: null/);
  assert.match(landing, /whatsapp: \{ enabled: false, number: '', text: '' \}/);
  assert.match(landing, /approved: \{\s*pricing: false,\s*teachers: false,\s*testimonials: false,\s*stats: false/s);
  assert.doesNotMatch(landing, /786-964-5678|17869645678|447864710821|telephone/);
  assert.doesNotMatch(landing, /within 24 hours|qualified Quran teachers|1,000\+ students/i);
  assert.doesNotMatch(landing, /Teacher details supplied by the CEO|Reviews 2, 4 and 6 chosen by the CEO/);
});

test("USA campaign trial copy states eligibility and the Weekend exclusion", () => {
  assert.match(landing, /3-day free trial on eligible plans/i);
  assert.match(landing, /Weekend plan is excluded/i);
  assert.match(landing, /no card is needed on eligible plans/i);
  assert.doesNotMatch(landing, /3 days of free classes|no credit card required/i);
});


test("standalone USA landing and thank-you pages include the single-label support link", () => {
  for (const html of [landing, thankYou]) {
    assert.match(html, /class="support-float" href="https:\/\/www\.onlinequrancollege\.com\/contact" aria-label="Contact Support">Contact Support<\/a>/);
    assert.match(html, /\.support-float:hover\{[^}]*background:#C5A04A/);
  }
});


test("USA thank-you page uses verified contact and trial terms", () => {
  assert.doesNotMatch(thankYou, /786-964-5678|17869645678|447864710821|telephone|within 24 hours/i);
  assert.match(thankYou, /phone: null/);
  assert.match(thankYou, /whatsapp: \{ enabled: false, number: '', text: '' \}/);
  assert.match(thankYou, /3-day free trial is available on eligible plans/i);
  assert.match(thankYou, /Weekend plan is excluded/i);
  assert.match(thankYou, /no card is needed on eligible plans/i);
});
