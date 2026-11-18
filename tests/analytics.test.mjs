import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { analyticsConfig, analyticsSettingsError, publicAnalyticsUrl, createAnalyticsController, saveAnalyticsConsent, readAnalyticsConsent, cookielessAnalyticsConfig, shieldAnalyticsCookies, pageClientId, ANALYTICS_CONSENT_KEY, isAnalyticsHost, hasAdClickId } from "../src/lib/analytics.js";
import { rememberConfirmedLead } from "../src/lib/conversion-events.js";

// Test-only IDs. The fake document records script loads; no network requests occur.
const ga4Id = "G-TEST123456", gtmId = "GTM-TEST123";
function memoryStorage(map = new Map()) {
  return { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, String(value)), removeItem: key => map.delete(key) };
}
function fakeBrowser(href = "https://college.test/contact?email=private@example.test#secret") {
  const win = new EventTarget(), document = new EventTarget(), scripts = [], storage = new Map(), session = new Map();
  document.title = "Online Quran College";
  document.head = { appendChild: script => scripts.push(script) };
  document.getElementById = id => scripts.find(script => script.id === id);
  document.createElement = () => ({});
  Object.assign(win, { document, location: new URL(href), Event, localStorage: memoryStorage(storage), sessionStorage: memoryStorage(session) });
  return { win, scripts, storage, session };
}
const leadEvents = win => win.dataLayer.filter(item => ["free_trial_submission", "contact_form_submission"].includes(item?.event));

test("analytics cannot activate without a real-shaped ID and GTM owns dual-ID mode", () => {
  assert.equal(analyticsConfig({ enabled: true }).enabled, false);
  assert.equal(analyticsConfig({ enabled: true, ga4_measurement_id: '<script>alert(1)</script>' }).enabled, false);
  assert.ok(analyticsSettingsError({ enabled: true }));
  assert.ok(analyticsSettingsError({ gtm_container_id: "GTM-bad<script>" }));
  assert.equal(analyticsConfig({ enabled: true, ga4_measurement_id: ga4Id, gtm_container_id: gtmId }).mode, "gtm");
});

test("analytics URLs strip query/fragment values and reject private or unsafe paths", () => {
  const origin = "https://college.test";
  assert.equal(publicAnalyticsUrl("/contact?email=private@example.test#note", origin), origin + "/contact");
  for (const path of ["/admin", "/auth/callback", "/api/leads", "/verify-certificate?number=private", "/private@example.test", "/person%40example.test", "https://outside.test/"]) assert.equal(publicAnalyticsUrl(path, origin), null);
});

test("Google loads only after consent and GA4 receives one page view per actual path transition", () => {
  const { win, scripts } = fakeBrowser();
  const adapter = createAnalyticsController(win, analyticsConfig({ enabled: true, ga4_measurement_id: ga4Id }));
  adapter.pageView("/contact"); assert.equal(scripts.length, 0);
  adapter.setConsent(false); assert.equal(scripts.length, 0);
  adapter.setConsent(true); adapter.pageView(win.location.href); adapter.pageView("/contact?private=value");
  adapter.pageView("/courses");
  assert.equal(scripts.length, 1); assert.ok(scripts[0].src.includes("/gtag/js?"));
  const events = win.dataLayer.map(item => Array.from(item)).filter(item => item[0] === "event" && item[1] === "page_view");
  assert.equal(events.length, 2);
  assert.equal(events[0][2].page_location, "https://college.test/contact");
  assert.equal(events[1][2].page_referrer, "https://college.test/contact");
  assert.ok(!JSON.stringify(win.dataLayer).includes("private@example.test"));
  adapter.setConsent(false); assert.equal(adapter.pageView("/blog"), false); adapter.destroy();
});

test("GTM mode never loads direct GA4 and a confirmed lead is pushed once, on its thank-you page, with allowlisted fields", () => {
  const { win, scripts } = fakeBrowser("https://college.test/free-trial");
  const config = cookielessAnalyticsConfig(analyticsConfig({ enabled: true, ga4_measurement_id: ga4Id, gtm_container_id: gtmId }));
  let adapter = createAnalyticsController(win, config);
  adapter.setConsent(true); adapter.pageView("/free-trial");
  assert.equal(scripts.length, 1); assert.ok(scripts[0].src.includes("/gtm.js?"));
  // The form confirmed the save; nothing is sent yet on the form page.
  assert.equal(rememberConfirmedLead({ formType: "trial", country: "United States", reference: "TR-2026-0042", email: "private@example.test" }, win), true);
  assert.equal(leadEvents(win).length, 0);
  // Client-side move to the thank-you page.
  win.location = new URL("https://college.test/free-trial/thank-you?ref=TR-2026-0042");
  adapter.pageView("/free-trial/thank-you");
  assert.deepEqual(leadEvents(win), [{ event: "free_trial_submission", form_id: "free_trial", form_type: "trial", lead_type: "free_trial", market: "USA", lead_id: "TR-2026-0042", transaction_id: "TR-2026-0042" }]);
  // The lead event follows that page's page_view, so the container's consent/config already ran.
  const index = win.dataLayer.findIndex(item => item?.event === "free_trial_submission");
  assert.equal(win.dataLayer[index - 1].event, "oqc_page_view");
  assert.equal(win.dataLayer.filter(item => item?.event === "oqc_generate_lead").length, 0, "no pre-redirect lead event");
  assert.ok(!JSON.stringify(win.dataLayer).includes("private@example.test"));
  // Refresh of the thank-you page: a new controller on the same tab sends nothing.
  adapter.destroy();
  adapter = createAnalyticsController(win, config); adapter.setConsent(true); adapter.pageView(win.location.href);
  assert.equal(leadEvents(win).length, 1);
  adapter.destroy();
});

test("a pending lead is never sent while analytics is off, and stays for the page that can send it", () => {
  const { win } = fakeBrowser("https://college.test/contact/thank-you?ref=MSG-ABCD1234");
  rememberConfirmedLead({ formType: "contact", country: "Canada", reference: "MSG-ABCD1234", subject: "Course enquiry" }, win);
  const adapter = createAnalyticsController(win, analyticsConfig({ enabled: true, gtm_container_id: gtmId }));
  assert.equal(adapter.pageView("/contact/thank-you"), false); // consent not yet set
  assert.equal(leadEvents(win).length, 0);
  adapter.setConsent(true); adapter.pageView(win.location.href);
  assert.deepEqual(leadEvents(win).map(item => [item.event, item.lead_type, item.market]), [["contact_form_submission", "course_enquiry", "Canada"]]);
  adapter.destroy();
});

test("direct GA4 mode sends the confirmed lead as generate_lead with the reference as transaction_id", () => {
  const { win } = fakeBrowser("https://college.test/free-trial/thank-you?ref=TR-ABCD1234");
  rememberConfirmedLead({ formType: "trial", country: "United Kingdom", reference: "TR-ABCD1234", packageEnquiry: true }, win);
  const adapter = createAnalyticsController(win, cookielessAnalyticsConfig(analyticsConfig({ enabled: true, ga4_measurement_id: ga4Id })));
  adapter.setConsent(true); adapter.pageView(win.location.href);
  const leads = win.dataLayer.map(item => Array.from(item ?? [])).filter(item => item[0] === "event" && item[1] === "generate_lead");
  assert.equal(leads.length, 1);
  assert.equal(leads[0][2].transaction_id, "TR-ABCD1234");
  assert.equal(leads[0][2].lead_type, "package_enquiry");
  assert.equal(leads[0][2].send_to, ga4Id);
  adapter.destroy();
});

test("an ad-click landing is recognised from gclid, gbraid or wbraid only", () => {
  for (const search of ["?gclid=abc", "?utm_source=google&gbraid=x", "?wbraid=y"]) assert.equal(hasAdClickId(search), true, search);
  for (const search of ["", "?utm_source=google", "?fbclid=1", "?gclid="]) assert.equal(hasAdClickId(search), false, search);
});

test("analytics preference expires and a choice still applies when browser storage is blocked", () => {
  const { win, storage } = fakeBrowser();
  storage.set(ANALYTICS_CONSENT_KEY, JSON.stringify({ value: "granted", expires: Date.now() - 1 }));
  assert.equal(readAnalyticsConsent(win), null);
  saveAnalyticsConsent(win, "denied"); assert.equal(readAnalyticsConsent(win), "denied");
  win.localStorage.setItem = () => { throw Error("storage blocked"); };
  saveAnalyticsConsent(win, "granted"); assert.equal(readAnalyticsConsent(win), "granted");
});

test("cookieless mode uses direct GA4 with no device storage", () => {
  const gtmOnly = cookielessAnalyticsConfig(analyticsConfig({ enabled: true, gtm_container_id: gtmId }));
  assert.equal(gtmOnly.enabled, true); assert.equal(gtmOnly.mode, "gtm");
  const config = cookielessAnalyticsConfig(analyticsConfig({ enabled: true, ga4_measurement_id: ga4Id }));
  assert.equal(config.mode, "ga4");
  const { win, scripts } = fakeBrowser();
  const adapter = createAnalyticsController(win, config);
  adapter.setConsent(true); adapter.pageView("/courses");
  assert.equal(scripts.length, 1); assert.ok(scripts[0].src.includes("/gtag/js?id=" + ga4Id));
  const setup = win.dataLayer.map(item => Array.from(item)).find(item => item[0] === "config");
  assert.equal(setup[2].client_storage, "none");
  assert.equal(setup[2].allow_google_signals, false);
  // Owner decision (26 Oct 2026): reports must receive hits, so analytics
  // storage is granted while client_storage "none" keeps the device clean.
  // Owner decision (18 Nov 2026): ad measurement granted; ad personalisation stays denied.
  const updates = win.dataLayer.map(item => Array.from(item)).filter(item => item[0] === "consent");
  assert.equal(updates[0][1], "default");
  for (const field of ["analytics_storage", "ad_storage", "ad_user_data", "ad_personalization"]) assert.equal(updates[0][2][field], "denied", field);
  assert.equal(updates.at(-1)[1], "update");
  assert.equal(updates.at(-1)[2].analytics_storage, "granted");
  assert.equal(updates.at(-1)[2].ad_storage, "granted");
  assert.equal(updates.at(-1)[2].ad_user_data, "granted");
  for (const update of updates) assert.equal(update[2].ad_personalization, "denied");
  adapter.destroy();
});

test("web vitals reach GA4 as named events with only the metric and public path", () => {
  const config = cookielessAnalyticsConfig(analyticsConfig({ enabled: true, ga4_measurement_id: ga4Id }));
  const { win } = fakeBrowser();
  const adapter = createAnalyticsController(win, config);
  assert.equal(adapter.webVital({ name: "LCP", value: 1800, delta: 1800, id: "v1", rating: "good" }), false); // nothing before load
  adapter.setConsent(true);
  assert.equal(adapter.webVital({ name: "LCP", value: 1834.6, delta: 1834.6, id: "v1-lcp", rating: "good" }), true);
  assert.equal(adapter.webVital({ name: "CLS", value: 0.042, delta: 0.042, id: "v1-cls", rating: "good" }), true);
  assert.equal(adapter.webVital({ name: "Next.js-hydration", value: 20, id: "x" }), false);
  const events = win.dataLayer.map(item => Array.from(item)).filter(item => item[0] === "event" && ["LCP", "CLS"].includes(item[1]));
  assert.equal(events[0][2].value, 1835); assert.equal(events[1][2].value, 42);
  assert.equal(events[0][2].page_path, "/contact");
  assert.ok(!JSON.stringify(events).includes("private@example.test"));
  adapter.destroy();
});

test("with a GTM container set, GTM owns GA4: no direct gtag, same cookieless consent", () => {
  const config = cookielessAnalyticsConfig(analyticsConfig({ enabled: true, ga4_measurement_id: ga4Id, gtm_container_id: gtmId }));
  assert.equal(config.mode, "gtm");
  const { win, scripts } = fakeBrowser();
  const adapter = createAnalyticsController(win, config);
  adapter.setConsent(true);
  assert.deepEqual(scripts.map(s => s.src), ["https://www.googletagmanager.com/gtm.js?id=" + gtmId]);
  const consents = win.dataLayer.map(item => Array.from(item ?? [])).filter(item => item[0] === "consent");
  assert.equal(consents.at(-1)[2].analytics_storage, "granted"); assert.equal(consents.at(-1)[2].ad_storage, "granted");
  assert.equal(consents.at(-1)[2].ad_personalization, "denied");
  const setup = win.dataLayer.map(item => Array.from(item ?? [])).find(item => item[0] === "set")?.[1];
  assert.equal(setup.allow_ad_personalization_signals, false); assert.equal(setup.allow_google_signals, false);
  adapter.destroy();
});

// GA4 ignores client_storage "none", so its cookies are held in page memory only.
class FakeDocument { constructor() { this.stored = new Map(); } }
Object.defineProperty(FakeDocument.prototype, "cookie", {
  configurable: true,
  get() { return [...this.stored].map(([k, v]) => `${k}=${v}`).join("; "); },
  set(text) { const [pair] = String(text).split(";"); const at = pair.indexOf("="); const k = pair.slice(0, at).trim(); if (/max-age=0/i.test(text)) this.stored.delete(k); else this.stored.set(k, pair.slice(at + 1)); },
});

test("Google Analytics cookies never reach the device, GA can still read them, and Ads click cookies persist", () => {
  const doc = new FakeDocument();
  assert.equal(shieldAnalyticsCookies(doc), true);
  assert.equal(shieldAnalyticsCookies(doc), false, "installs once");
  doc.cookie = "_ga=GA1.1.123.456; path=/; domain=.college.test; max-age=63072000";
  doc.cookie = "_ga_TEST123=GS2.1.s1$o1; path=/";
  doc.cookie = "site_pref=1; path=/";
  // Google Ads click cookies must persist to the thank-you page (owner decision, 18 Nov 2026).
  doc.cookie = "_gcl_aw=GCL.1700000000.TESTCLICK; path=/; max-age=7776000";
  doc.cookie = "_gcl_au=1.1.123.456; path=/; max-age=7776000";
  assert.deepEqual([...doc.stored.keys()], ["site_pref", "_gcl_aw", "_gcl_au"], "analytics cookies stay in memory; Ads click cookies are stored");
  assert.match(doc.cookie, /_ga=GA1\.1\.123\.456/);
  assert.match(doc.cookie, /site_pref=1/);
  doc.cookie = "_ga=; Max-Age=0; path=/";
  assert.doesNotMatch(doc.cookie, /_ga=GA1/);
});

test("cookieless analytics sends a fresh page-level client id in both transports", () => {
  assert.match(pageClientId(() => 0.5, () => 1_700_000_000_000), /^\d+\.1700000000$/);
  for (const ids of [{ ga4_measurement_id: ga4Id }, { ga4_measurement_id: ga4Id, gtm_container_id: gtmId }]) {
    const { win } = fakeBrowser();
    const adapter = createAnalyticsController(win, cookielessAnalyticsConfig(analyticsConfig({ enabled: true, ...ids })));
    adapter.setConsent(true);
    const settings = win.dataLayer.map(item => Array.from(item)).filter(item => item[0] === "set" || item[0] === "config").map(item => item.at(-1));
    assert.ok(settings.some(s => s.client_storage === "none" && /^\d+\.\d+$/.test(s.client_id)), JSON.stringify(settings));
    adapter.destroy();
  }
});

test("only the production host reports to GA4", () => {
  assert.equal(isAnalyticsHost("www.onlinequrancollege.com"), true);
  assert.equal(isAnalyticsHost("WWW.OnlineQuranCollege.com"), true);
  for (const host of ["onlinequrancollege.com", "appcom-online-quran-college.vercel.app", "project-umber-three-93.vercel.app", "localhost", "", undefined]) {
    assert.equal(isAnalyticsHost(host), false, String(host));
  }
});

test("the analytics component does not start GA4 on preview or other hosts", () => {
  const src = readFileSync(new URL("../src/components/site/analytics.jsx", import.meta.url), "utf8");
  assert.match(src, /!isAnalyticsHost\(window\.location\.hostname\)\) return;/);
});
