import test from "node:test";
import assert from "node:assert/strict";
import { analyticsConfig, analyticsSettingsError, publicAnalyticsUrl, createAnalyticsController, saveAnalyticsConsent, readAnalyticsConsent, cookielessAnalyticsConfig, shieldAnalyticsCookies, pageClientId, ANALYTICS_CONSENT_KEY } from "../src/lib/analytics.js";

// Test-only IDs. The fake document records script loads; no network requests occur.
const ga4Id = "G-TEST123456", gtmId = "GTM-TEST123";
function fakeBrowser() {
  const win = new EventTarget(), document = new EventTarget(), scripts = [], storage = new Map();
  document.title = "Online Quran College";
  document.head = { appendChild: script => scripts.push(script) };
  document.getElementById = id => scripts.find(script => script.id === id);
  document.createElement = () => ({});
  Object.assign(win, { document, location: new URL("https://college.test/contact?email=private@example.test#secret"), Event, localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) } });
  return { win, scripts, storage };
}
const leadEvent = detail => new CustomEvent("oqc:lead-saved", { detail });

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

test("GTM mode never loads direct GA4 and lead events contain only allowlisted fields", () => {
  const { win, scripts } = fakeBrowser();
  const adapter = createAnalyticsController(win, analyticsConfig({ enabled: true, ga4_measurement_id: ga4Id, gtm_container_id: gtmId }));
  const detail = { event: "generate_lead", form_type: "contact", market: "USA", email: "private@example.test", reference: "MSG-123" };
  win.dispatchEvent(leadEvent(detail));
  assert.equal(win.dataLayer.filter(item => item.event === "oqc_generate_lead").length, 0);
  adapter.setConsent(true); adapter.pageView("/contact"); win.dispatchEvent(leadEvent(detail));
  assert.equal(scripts.length, 1); assert.ok(scripts[0].src.includes("/gtm.js?"));
  assert.deepEqual(win.dataLayer.find(item => item.event === "oqc_generate_lead"), { event: "oqc_generate_lead", form_type: "contact", market: "USA" });
  assert.ok(!JSON.stringify(win.dataLayer).includes("private@example.test"));
  const count = win.dataLayer.length; adapter.destroy(); win.dispatchEvent(leadEvent(detail)); assert.equal(win.dataLayer.length, count + 1);
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
  const updates = win.dataLayer.map(item => Array.from(item)).filter(item => item[0] === "consent");
  assert.equal(updates.at(-1)[1], "update");
  assert.equal(updates.at(-1)[2].analytics_storage, "granted");
  for (const update of updates) {
    assert.equal(update[2].ad_storage, "denied");
    assert.equal(update[2].ad_user_data, "denied");
    assert.equal(update[2].ad_personalization, "denied");
  }
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
    assert.equal(consents.at(-1)[2].analytics_storage, "granted"); assert.equal(consents.at(-1)[2].ad_storage, "denied");
  adapter.destroy();
});

// GA4 ignores client_storage "none", so its cookies are held in page memory only.
class FakeDocument { constructor() { this.stored = new Map(); } }
Object.defineProperty(FakeDocument.prototype, "cookie", {
  configurable: true,
  get() { return [...this.stored].map(([k, v]) => `${k}=${v}`).join("; "); },
  set(text) { const [pair] = String(text).split(";"); const at = pair.indexOf("="); const k = pair.slice(0, at).trim(); if (/max-age=0/i.test(text)) this.stored.delete(k); else this.stored.set(k, pair.slice(at + 1)); },
});

test("Google Analytics cookies never reach the device but GA can still read them in the page", () => {
  const doc = new FakeDocument();
  assert.equal(shieldAnalyticsCookies(doc), true);
  assert.equal(shieldAnalyticsCookies(doc), false, "installs once");
  doc.cookie = "_ga=GA1.1.123.456; path=/; domain=.college.test; max-age=63072000";
  doc.cookie = "_ga_TEST123=GS2.1.s1$o1; path=/";
  doc.cookie = "site_pref=1; path=/";
  assert.deepEqual([...doc.stored.keys()], ["site_pref"], "only non-Google cookies are stored");
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
