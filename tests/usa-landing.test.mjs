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
  // Owner decision, 5 Nov 2026: the CEO-supplied US number is shown and clickable.
  assert.match(landing, /phone: \{ e164: '\+17869645678', display: '\(786\) 964-5678' \}/);
  assert.match(landing, /whatsapp: \{ enabled: false, number: '', text: '' \}/);
  assert.match(landing, /approved: \{\s*pricing: false,\s*teachers: false,\s*testimonials: false,\s*stats: false/s);
  assert.doesNotMatch(landing, /447864710821|"telephone"/);
  assert.doesNotMatch(landing, /within 24 hours|qualified Quran teachers|1,000\+ students/i);
  assert.doesNotMatch(landing, /Teacher details supplied by the CEO|Reviews 2, 4 and 6 chosen by the CEO/);
  assert.doesNotMatch(landing, /no business phone or WhatsApp number is configured/);
});

test("every call button is a working tel: link to the US number, even before JavaScript runs", () => {
  const calls = [...landing.matchAll(/<a [^>]*class="[^"]*js-phone-link[^"]*"[^>]*>/g)].map((m) => m[0]);
  assert.equal(calls.length, 4, "header, hero, final and mobile sticky call buttons");
  for (const tag of calls) assert.match(tag, /href="tel:\+17869645678"/, tag);
  assert.equal((landing.match(/class="(?:num )?js-phone-text">\(786\) 964-5678</g) || []).length, 3);
  const tyCall = thankYou.match(/<a [^>]*class="[^"]*js-phone-link[^"]*"[^>]*>/)[0];
  assert.match(tyCall, /href="tel:\+17869645678"/);
});

test("USA campaign trial copy: no eligible-plans wording, 'No card needed' kept (owner, 5 Nov 2026)", () => {
  for (const [name, html] of Object.entries(pages)) {
    assert.doesNotMatch(html, /eligible/i, `${name}: eligible-plans wording removed`);
    assert.match(html, /No card needed/, `${name}: keeps "No card needed"`);
  }
  assert.match(landing, /<p class="form-kicker"><span class="chip chip-gold">No card needed<\/span><\/p>/);
  // The Weekend exclusion (owner decision, 26 Oct 2026) stays in one FAQ answer only, and the
  // FAQ structured data matches the visible answer.
  const faq = "Yes. You get a 3-day free trial and no card is needed. The Weekend plan is not part of the free trial.";
  assert.ok(landing.includes(`<p>${faq}</p>`));
  assert.ok(landing.includes(`"text":"${faq}"`));
  assert.equal((landing.match(/Weekend plan/g) || []).length, 2);
});


test("standalone USA landing and thank-you pages do not show a duplicate Contact Support button", () => {
  for (const html of [landing, thankYou]) {
    assert.doesNotMatch(html, /class="support-float"|aria-label="Contact Support"|>Contact Support<\/a>/);
    assert.doesNotMatch(html, /\.support-float/);
  }
});


test("USA thank-you page uses verified contact and trial terms", () => {
  assert.doesNotMatch(thankYou, /447864710821|"telephone"|within 24 hours/i);
  assert.match(thankYou, /phone: \{ e164: '\+17869645678', display: '\(786\) 964-5678' \}/);
  assert.match(thankYou, /whatsapp: \{ enabled: false, number: '', text: '' \}/);
  assert.match(thankYou, /<h3>3-day free trial<\/h3><p>Join three days of free live classes with your teacher\. No card needed\.<\/p>/);
});

test("the landing page emails admissions only after the lead is saved and uses a short-lived token for safe retries", () => {
  assert.match(landing, /notifyUrl: '\/api\/usa-lead-notification'/);
  // Order: save → (spam stops here) → remember → notify → success.
  const flow = landing.slice(landing.indexOf("submitToCms(p).then(function (r) {"), landing.indexOf("/* ---------- mobile sticky CTA"));
  const at = (s) => { const i = flow.indexOf(s); assert.ok(i > -1, s); return i; };
  const notifyAt = at("notifyAdmissions(b.reference, p.email, b.notification_token).then");
  const successAfterNotify = landing.indexOf("succeed({ ok: true, lead_id: b.reference });", notifyAt);
  assert.ok(at("if (b.reference === 'TR-RECEIVED')") < at("b.notification_token") && at("b.notification_token") < at("setJSON(SS, SENT_KEY") && at("setJSON(SS, SENT_KEY") < notifyAt && notifyAt < successAfterNotify);
  assert.match(landing, /notifyAdmissions\(prior\.ref, p\.email, prior\.token\)/);
  assert.match(landing, /if \(!res\.test && !res\.spam && !res\.repeat\) oqcEmit\('generate_lead'/);
  // Only the reference, typed email and short-lived notification token go to the server; no lead PII is stored in session state.
  assert.match(landing, /\{ reference: reference, email: email, notification_token: token \}/);
  assert.match(landing, /token: b\.notification_token/);
  assert.doesNotMatch(landing, /setJSON\(SS, SENT_KEY, \{[^}]*email/);
});

test("USA campaign copy has no duplicated trial or card wording", () => {
  assert.doesNotMatch(landing, /A A 3-day|no card on eligible plans needed/i);
});
