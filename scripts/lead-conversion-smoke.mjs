// Local-only browser check of lead conversion tracking (owner decisions, 18 Nov 2026).
//
//   node scripts/lead-conversion-smoke.mjs [local site, default http://127.0.0.1:3000] [local API, default http://127.0.0.1:54321]
//
// The local production build is served under https://www.onlinequrancollege.com by request
// interception, so the analytics host check passes without touching the live site. Google
// Tag Manager is replaced by a stub that imitates the conversion linker (stores _gcl_aw from
// a gclid) and an analytics cookie write. Form saves go to a local stand-in API. Nothing is
// sent to Google, the live site or the real database. Synthetic data only.
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";

const base = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/$/, "");
const api = (process.argv[3] || "http://127.0.0.1:54321").replace(/\/$/, "");
for (const url of [base, api]) assert.ok(["localhost", "127.0.0.1"].includes(new URL(url).hostname), `${url} must be local`);
const SITE = "https://www.onlinequrancollege.com";
const apiPort = new URL(api).port;
const out = "artifacts/lead-conversion";
mkdirSync(out, { recursive: true });

const report = { base, api, scope: "Local build, stubbed GTM, local stand-in API; no live Google or database traffic", cases: [], gtmLoads: 0, blockedExternal: 0, browserErrors: [] };
const LEAD_EVENTS = ["free_trial_submission", "contact_form_submission", "oqc_generate_lead", "generate_lead", "thanku_generate_lead"];
const PII = ["Synthetic Learner", "Synthetic Parent", "qa-check@example.invalid", "7700900123", "2025550143"];

const GTM_STUB = `(() => {
  const click = new URLSearchParams(location.search).get('gclid');
  if (click) document.cookie = '_gcl_aw=GCL.' + Math.floor(Date.now() / 1000) + '.' + click + '; path=/; max-age=7776000; SameSite=Lax; Secure';
  document.cookie = '_ga=GA1.1.111.222; path=/; max-age=63072000; SameSite=Lax; Secure';
  window.__gtmStubLoads = (window.__gtmStubLoads || 0) + 1;
})();`;

async function proxy(route, target) {
  const req = route.request();
  const headers = { ...req.headers() };
  delete headers.host;
  const res = await fetch(target, { method: req.method(), headers, body: ["GET", "HEAD"].includes(req.method()) ? undefined : req.postDataBuffer(), redirect: "manual" });
  const h = Object.fromEntries(res.headers);
  delete h["content-length"]; delete h["content-encoding"]; delete h["transfer-encoding"];
  if (h.location?.startsWith(base)) h.location = SITE + h.location.slice(base.length);
  return route.fulfill({ status: res.status, headers: h, body: Buffer.from(await res.arrayBuffer()) });
}

async function newContext(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: "America/New_York" });
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "www.googletagmanager.com") { report.gtmLoads++; return route.fulfill({ contentType: "application/javascript", body: GTM_STUB }); }
    // The USA landing page only accepts a *.supabase.co API address: point it at the stand-in.
    if (url.origin === SITE && url.pathname === "/api/public-form-config") return route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, supabaseUrl: "https://local-qa.supabase.co", supabaseKey: "sb_publishable_local_test_only" }) });
    if (url.origin === SITE) return proxy(route, base + url.pathname + url.search);
    if ((url.hostname === "127.0.0.1" && url.port === apiPort) || url.hostname === "local-qa.supabase.co") return proxy(route, api + url.pathname + url.search);
    report.blockedExternal++;
    return route.abort();
  });
  return context;
}

async function openPage(context) {
  const page = await context.newPage();
  page.on("pageerror", (error) => report.browserErrors.push(error.message));
  return page;
}

const dataLayer = (page) => page.evaluate(() => (window.dataLayer || []).map((item) => (item && typeof item.length === "number" && typeof item !== "string" ? Array.from(item) : item)));
const leadEvents = async (page) => (await dataLayer(page)).filter((item) => LEAD_EVENTS.includes(item?.event));
// Start the deferred tags the way a visitor would (interaction), then wait for the page view.
async function startTags(page, path) {
  await page.mouse.move(10, 10); await page.mouse.wheel(0, 40);
  await page.waitForFunction((p) => (window.dataLayer || []).some((item) => item?.event === "oqc_page_view" && item.page_path === p), path, { timeout: 15000 });
  await page.waitForTimeout(400);
}
async function noLeadAfterSettling(page, label) {
  await page.waitForTimeout(800);
  const events = await leadEvents(page);
  assert.deepEqual(events, [], `${label}: no lead event expected`);
}
function assertNoPii(data, label) {
  const text = JSON.stringify(data);
  for (const secret of PII) assert.ok(!text.includes(secret), `${label}: dataLayer must not contain "${secret}"`);
}
function consentOf(data) {
  const consent = data.filter((item) => Array.isArray(item) && item[0] === "consent");
  return { default: consent[0]?.[2], update: consent.at(-1)?.[2] };
}

async function fillTrialForm(page, name) {
  await page.locator("#q-age-0").click();
  await page.locator("#q-learner_name").fill(name);
  if (await page.locator("#q-guardian_name").count()) await page.locator("#q-guardian_name").fill("Synthetic Parent");
  await page.locator("#q-country").selectOption("United States");
  await page.locator("#q-phone").fill("+1 202 555 0143");
  await page.locator("#q-email").fill("qa-check@example.invalid");
  await page.locator("#q-consent").check();
}

async function fillContactForm(page, { subject, careers = false } = {}) {
  await page.locator("#c-name").fill("Synthetic Parent");
  await page.locator("#c-email").fill("qa-check@example.invalid");
  if (subject) await page.locator("#c-subject").selectOption(subject);
  if (careers) for (const id of ["#c-role", "#c-qualification", "#c-skills"]) await page.locator(id).fill("Synthetic careers detail");
  await page.getByText("Add contact details").click(); // optional details are folded away
  await page.locator("#c-country").selectOption("United Kingdom");
  await page.locator("#c-message").fill("Synthetic local verification message, not a real enquiry.");
  await page.locator("#c-consent").check();
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
try {
  // 1. Google Ads landing → trial form → thank-you → refresh → revisit.
  {
    const context = await newContext(browser), page = await openPage(context);
    const loaded = Date.now();
    await page.goto(`${SITE}/free-trial?gclid=QA-GCLID-0001&utm_source=google&utm_medium=cpc`, { waitUntil: "load" });
    // No interaction: an ad-click landing must start the tags at once (the normal path waits 4 s).
    await page.waitForFunction(() => window.__gtmStubLoads === 1, null, { timeout: 3000 });
    const startMs = Date.now() - loaded;
    let cookies = await context.cookies(SITE);
    assert.ok(cookies.some((c) => c.name === "_gcl_aw" && c.value.endsWith("QA-GCLID-0001")), "_gcl_aw stored on the device");
    assert.ok(!cookies.some((c) => /^_ga/.test(c.name)), "_ga stays in page memory");
    const landingData = await dataLayer(page);
    const consent = consentOf(landingData);
    assert.deepEqual(consent.default, { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    assert.deepEqual(consent.update, { analytics_storage: "granted", ad_storage: "granted", ad_user_data: "granted", ad_personalization: "denied" });
    const set = landingData.find((item) => Array.isArray(item) && item[0] === "set")?.[1];
    assert.equal(set.allow_ad_personalization_signals, false); assert.equal(set.allow_google_signals, false);

    await fillTrialForm(page, "Synthetic Learner");
    await page.getByRole("button", { name: /Request my free trial/ }).click();
    await page.waitForURL((url) => url.pathname === "/free-trial/thank-you");
    const ref = new URL(page.url()).searchParams.get("ref");
    assert.match(ref, /^TR-LOCAL\d{4}$/);
    await page.waitForFunction(() => (window.dataLayer || []).some((item) => item?.event === "free_trial_submission"), null, { timeout: 10000 });
    await page.waitForTimeout(800);
    const data = await dataLayer(page);
    const events = data.filter((item) => LEAD_EVENTS.includes(item?.event));
    assert.deepEqual(events.map(({ event, form_id, form_type, lead_type, market, lead_id, transaction_id }) => ({ event, form_id, form_type, lead_type, market, lead_id, transaction_id })),
      [{ event: "free_trial_submission", form_id: "free_trial", form_type: "trial", lead_type: "free_trial", market: "USA", lead_id: ref, transaction_id: ref }]);
    const at = data.findIndex((item) => item?.event === "free_trial_submission");
    assert.equal(data[at - 1]?.event, "oqc_page_view"); assert.equal(data[at - 1]?.page_path, "/free-trial/thank-you");
    assertNoPii(data, "trial");
    cookies = await context.cookies(SITE);
    assert.ok(cookies.some((c) => c.name === "_gcl_aw"), "_gcl_aw still present on the thank-you page");
    await page.screenshot({ path: `${out}/trial-thank-you.png` });

    await page.reload({ waitUntil: "load" });
    await startTags(page, "/free-trial/thank-you");
    await noLeadAfterSettling(page, "trial thank-you refresh");

    await page.goto(`${SITE}/`, { waitUntil: "load" });
    await page.goto(`${SITE}/free-trial/thank-you?ref=${ref}`, { waitUntil: "load" });
    await startTags(page, "/free-trial/thank-you");
    await noLeadAfterSettling(page, "trial thank-you revisit");
    report.cases.push({ case: "Ad landing → free trial → thank-you", gtmStartedWithoutInteractionMs: startMs, gclidCookieStored: true, analyticsCookieOnDevice: false, consent: consent.update, leadEvents: 1, transactionId: ref, refreshEvents: 0, revisitEvents: 0, piiInDataLayer: false });
    await context.close();
  }

  // 2. Direct visit to a thank-you page in a fresh browser.
  {
    const context = await newContext(browser), page = await openPage(context);
    await page.goto(`${SITE}/free-trial/thank-you?ref=TR-LOCAL0001`, { waitUntil: "load" });
    await startTags(page, "/free-trial/thank-you");
    await noLeadAfterSettling(page, "direct thank-you visit");
    report.cases.push({ case: "Direct visit to /free-trial/thank-you", leadEvents: 0 });
    await context.close();
  }

  // 3. Failed save: error shown, no pending lead, no event.
  {
    const context = await newContext(browser), page = await openPage(context);
    await page.goto(`${SITE}/free-trial`, { waitUntil: "load" });
    await startTags(page, "/free-trial");
    await fillTrialForm(page, "FORCE-FAIL Synthetic Learner");
    await page.getByRole("button", { name: /Request my free trial/ }).click();
    await page.getByRole("alert").filter({ hasText: "could not send your request" }).waitFor();
    assert.equal(new URL(page.url()).pathname, "/free-trial");
    assert.equal(await page.evaluate(() => sessionStorage.getItem("oqc-pending-lead")), null);
    await noLeadAfterSettling(page, "failed trial save");
    report.cases.push({ case: "Failed trial save", stayedOnForm: true, pendingLead: null, leadEvents: 0 });
    await context.close();
  }

  // 4. Contact form: course enquiry counts; support message and careers application do not.
  for (const { label, path, subject, careers, expected } of [
    { label: "Contact course enquiry", path: "/contact", subject: "Course enquiry", expected: 1 },
    { label: "Contact existing-student support", path: "/contact", subject: "Existing student support", expected: 0 },
    { label: "Careers application", path: "/careers", careers: true, expected: 0 },
  ]) {
    const context = await newContext(browser), page = await openPage(context);
    await page.goto(`${SITE}${path}`, { waitUntil: "load" });
    await startTags(page, path);
    await fillContactForm(page, { subject, careers });
    await page.locator("form").filter({ has: page.locator("#c-name") }).locator('button[type="submit"]').click();
    await page.waitForURL((url) => url.pathname === "/contact/thank-you");
    const ref = new URL(page.url()).searchParams.get("ref");
    if (expected) await page.waitForFunction(() => (window.dataLayer || []).some((item) => item?.event === "contact_form_submission"), null, { timeout: 10000 });
    await page.waitForTimeout(800);
    const data = await dataLayer(page);
    const events = data.filter((item) => LEAD_EVENTS.includes(item?.event));
    assert.equal(events.length, expected, label);
    if (expected) assert.deepEqual([events[0].event, events[0].lead_type, events[0].market, events[0].transaction_id], ["contact_form_submission", "course_enquiry", "UK", ref]);
    assertNoPii(data, label);
    await page.reload({ waitUntil: "load" });
    await startTags(page, "/contact/thank-you");
    await noLeadAfterSettling(page, `${label} refresh`);
    report.cases.push({ case: label, leadEvents: expected, transactionId: expected ? ref : null, refreshEvents: 0 });
    await context.close();
  }

  // 5. USA Google Ads landing page (static page, full-page move to its thank-you page).
  {
    const context = await newContext(browser), page = await openPage(context);
    await page.goto(`${SITE}/usa-quran-classes?gclid=QA-GCLID-USA1`, { waitUntil: "load" });
    await page.waitForFunction(() => window.__gtmStubLoads === 1, null, { timeout: 3000 });
    const consent = consentOf(await dataLayer(page));
    assert.deepEqual(consent.update, { analytics_storage: "granted", ad_storage: "granted", ad_user_data: "granted", ad_personalization: "denied" });
    assert.ok((await context.cookies(SITE)).some((c) => c.name === "_gcl_aw" && c.value.endsWith("QA-GCLID-USA1")));
    const form = page.locator("form").filter({ has: page.locator("#f-name") });
    await page.locator("#f-name").fill("Synthetic Parent");
    await page.locator("#f-email").fill("qa-check@example.invalid");
    await page.locator("#f-phone").fill("2025550143");
    await page.locator("#f-age").selectOption("6-8");
    await page.locator("#f-course").selectOption({ index: 1 });
    await page.locator("#f-tz").selectOption("ET");
    for (const box of await form.locator('input[type="checkbox"][required]').all()) await box.check();
    await form.locator("[data-submit]").click();
    await page.waitForURL((url) => url.pathname.replace(/\/$/, "") === "/usa-quran-classes/thank-you", { timeout: 15000 });
    await page.waitForFunction(() => (window.dataLayer || []).some((item) => item?.event === "free_trial_submission"), null, { timeout: 10000 });
    await page.waitForTimeout(800);
    const data = await dataLayer(page);
    const events = data.filter((item) => LEAD_EVENTS.includes(item?.event));
    assert.equal(events.length, 1, "USA thank-you: exactly one lead event");
    assert.match(events[0].transaction_id, /^TR-LOCAL\d{4}$/);
    assert.deepEqual([events[0].form_id, events[0].form_type, events[0].lead_type, events[0].market], ["usa_trial", "trial", "free_trial", "USA"]);
    assertNoPii(data, "USA");
    assert.ok((await context.cookies(SITE)).some((c) => c.name === "_gcl_aw"), "_gcl_aw survives the full-page move");
    await page.screenshot({ path: `${out}/usa-thank-you.png` });
    const ref = events[0].transaction_id;
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1200);
    await noLeadAfterSettling(page, "USA thank-you refresh");
    report.cases.push({ case: "USA ad landing → thank-you", consent: consent.update, gclidCookieStored: true, leadEvents: 1, transactionId: ref, refreshEvents: 0 });
    await context.close();
  }
} finally {
  await browser.close();
}
assert.deepEqual(report.browserErrors, [], "no uncaught page errors");
writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
