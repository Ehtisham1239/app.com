import test from "node:test";
import assert from "node:assert/strict";
import { analyticsConfig, analyticsSettingsError, publicAnalyticsUrl, createAnalyticsController, saveAnalyticsConsent, readAnalyticsConsent, cookielessAnalyticsConfig, ANALYTICS_CONSENT_KEY } from "../src/lib/analytics.js";

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

test("cookieless mode uses direct GA4 with no device storage and never loads GTM", () => {
  assert.equal(cookielessAnalyticsConfig(analyticsConfig({ enabled: true, gtm_container_id: gtmId })).enabled, false);
  const config = cookielessAnalyticsConfig(analyticsConfig({ enabled: true, ga4_measurement_id: ga4Id, gtm_container_id: gtmId }));
  assert.equal(config.mode, "ga4"); assert.equal(config.gtmId, "");
  const { win, scripts } = fakeBrowser();
  const adapter = createAnalyticsController(win, config);
  adapter.setConsent(true); adapter.pageView("/courses");
  assert.equal(scripts.length, 1); assert.ok(scripts[0].src.includes("/gtag/js?id=" + ga4Id));
  const setup = win.dataLayer.map(item => Array.from(item)).find(item => item[0] === "config");
  assert.equal(setup[2].client_storage, "none");
  assert.equal(setup[2].allow_google_signals, false);
  const updates = win.dataLayer.map(item => Array.from(item)).filter(item => item[0] === "consent");
  assert.ok(updates.length >= 2);
  for (const update of updates) {
    assert.equal(update[2].analytics_storage, "denied");
    assert.equal(update[2].ad_storage, "denied");
  }
  adapter.destroy();
});
