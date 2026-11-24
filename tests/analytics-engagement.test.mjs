import test from "node:test";
import assert from "node:assert/strict";
import { analyticsConfig, createAnalyticsController, pageTypeFor } from "../src/lib/analytics.js";

function setup(path = "/blog/arabic-for-quran-readers") {
  const listeners = {}, winListeners = {};
  const doc = {
    title: "OQC", referrer: "", head: { appendChild() {} }, getElementById: () => null, createElement: () => ({}),
    documentElement: { scrollHeight: 4000 }, body: { scrollHeight: 4000 },
    addEventListener: (n, fn) => { (listeners[n] ||= []).push(fn); },
    removeEventListener: (n, fn) => { listeners[n] = (listeners[n] || []).filter(x => x !== fn); },
  };
  const win = new EventTarget();
  Object.assign(win, { document: doc, location: new URL("https://www.onlinequrancollege.com" + path), Event, innerHeight: 800, scrollY: 0, requestAnimationFrame: fn => { fn(); return 1; } });
  const origAdd = win.addEventListener.bind(win), origRemove = win.removeEventListener.bind(win);
  win.addEventListener = (n, fn, o) => { (winListeners[n] ||= []).push(fn); origAdd(n, fn, o); };
  win.removeEventListener = (n, fn) => { winListeners[n] = (winListeners[n] || []).filter(x => x !== fn); origRemove(n, fn); };
  const controller = createAnalyticsController(win, analyticsConfig({ enabled: true, gtm_container_id: "GTM-TEST123" }));
  controller.setConsent(true);
  controller.pageView(win.location.href);
  const scrollTo = y => { win.scrollY = y; (winListeners.scroll || []).forEach(fn => fn()); };
  const click = href => (listeners.click || []).forEach(fn => fn({ target: { closest: () => ({ getAttribute: () => href }) } }));
  const events = name => win.dataLayer.filter(i => i?.event === name);
  return { win, controller, scrollTo, click, events, winListeners, listeners };
}

test("pageTypeFor groups public paths and never uses query strings", () => {
  const cases = { "/": "home", "/blog": "blog_index", "/blog/x-y": "blog_article", "/courses/tajweed": "course", "/locations/united-kingdom/london": "location", "/learn/quran-for-adults": "learn", "/pricing": "pricing", "/free-trial": "free-trial", "/free-trial/thank-you": "thank_you", "/usa-quran-classes": "usa-quran-classes", "/about": "other" };
  for (const [path, type] of Object.entries(cases)) assert.equal(pageTypeFor(path), type, path);
});

test("page_view carries page_type", () => {
  const { events } = setup("/courses/tajweed");
  assert.equal(events("oqc_page_view")[0].page_type, "course");
});

test("scroll_depth fires once per milestone and resets on a new page view", () => {
  const { scrollTo, events, controller, win } = setup();
  scrollTo(100); // 22% of 4000: below the first milestone
  assert.equal(events("oqc_scroll_depth").length, 0);
  scrollTo(2200); // (2200+800)/4000 = 75%
  scrollTo(2200);
  assert.deepEqual(events("oqc_scroll_depth").map(e => e.percent_scrolled), [25, 50, 75]);
  assert.equal(events("oqc_scroll_depth")[0].non_interaction, true);
  win.location = new URL("https://www.onlinequrancollege.com/pricing");
  controller.pageView(win.location.href);
  scrollTo(3200); // 100%
  assert.equal(events("oqc_scroll_depth").filter(e => e.page_path === "/pricing").length, 4);
});

test("short pages report no scroll depth", () => {
  const { win, scrollTo, events } = setup("/contact");
  win.document.documentElement.scrollHeight = 850; win.document.body.scrollHeight = 850;
  scrollTo(50);
  assert.equal(events("oqc_scroll_depth").length, 0);
});

test("blog_read needs 75% depth and 20 seconds, on articles only, once", () => {
  const realNow = Date.now; let now = realNow();
  Date.now = () => now;
  try {
    const { scrollTo, events } = setup();
    now += 5000; scrollTo(2200);
    assert.equal(events("oqc_blog_read").length, 0, "too soon");
    now += 20000; scrollTo(2300); scrollTo(2400);
    assert.deepEqual(events("oqc_blog_read"), [{ event: "oqc_blog_read", page_path: "/blog/arabic-for-quran-readers", article_slug: "arabic-for-quran-readers" }]);
    const other = setup("/pricing");
    now += 30000; other.scrollTo(3200);
    assert.equal(other.events("oqc_blog_read").length, 0);
  } finally { Date.now = realNow; }
});

test("blog_read still fires when the reader stops scrolling at the end", () => {
  const realNow = Date.now, realSet = globalThis.setTimeout; let now = realNow(); const timers = [];
  Date.now = () => now; globalThis.setTimeout = fn => { timers.push(fn); return timers.length; };
  try {
    const { scrollTo, events } = setup();
    now += 3000; scrollTo(3200);
    assert.equal(events("oqc_blog_read").length, 0);
    assert.equal(timers.length, 1, "one timer is waiting for the 20 seconds");
    scrollTo(3200);
    assert.equal(timers.length, 1, "no second timer");
    now += 18000; timers[0]();
    assert.equal(events("oqc_blog_read").length, 1);
  } finally { Date.now = realNow; globalThis.setTimeout = realSet; }
});

test("outbound_click reports only the domain of external links", () => {
  const { click, events } = setup("/");
  click("https://www.trustpilot.com/review/onlinequrancollege.com?x=1");
  click("https://wa.me/123");
  click("https://www.onlinequrancollege.com/pricing");
  click("/pricing");
  click("tel:+17869645678");
  assert.deepEqual(events("oqc_outbound_click"), [{ event: "oqc_outbound_click", link_domain: "www.trustpilot.com", page_path: "/" }]);
});

test("destroy removes the scroll and outbound listeners; nothing is sent without consent", () => {
  const { controller, winListeners, listeners, scrollTo, events } = setup();
  controller.destroy();
  assert.equal((winListeners.scroll || []).length, 0);
  scrollTo(3200);
  assert.equal(events("oqc_scroll_depth").length, 0);
  assert.equal((listeners.click || []).length, 0);
});
