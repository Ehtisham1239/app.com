import test from "node:test";
import assert from "node:assert/strict";
import { analyticsConfig, createAnalyticsController } from "../src/lib/analytics.js";

test("CTA and form funnel emits one event per stage with no submitted values", () => {
  const listeners = {};
  const doc = {
    title: "OQC",
    referrer: "",
    head: { appendChild() {} },
    getElementById: () => null,
    createElement: () => ({}),
    addEventListener: (name, fn) => { (listeners[name] ||= []).push(fn); },
    removeEventListener: (name, fn) => { listeners[name] = (listeners[name] || []).filter(x => x !== fn); },
  };
  const win = new EventTarget();
  Object.assign(win, { document: doc, location: new URL("https://www.onlinequrancollege.com/free-trial"), Event });
  const controller = createAnalyticsController(win, analyticsConfig({ enabled: true, gtm_container_id: "GTM-TEST123" }));
  controller.setConsent(true);
  controller.pageView(win.location.href);
  const fire = (name, target) => (listeners[name] || []).forEach(fn => fn({ target }));
  const anchor = { getAttribute: name => name === "href" ? "/free-trial" : name === "data-oqc-cta" ? "home_hero_primary" : null };
  fire("click", { closest: () => anchor });
  const form = { matches: selector => selector === 'form[aria-label="Book a free trial"]' };
  fire("focusin", { closest: () => form });
  fire("focusin", { closest: () => form });
  fire("submit", form);
  fire("submit", form);
  const events = win.dataLayer.filter(item => typeof item?.event === "string" && item.event.startsWith("oqc_trial_"));
  assert.deepEqual(events.map(item => item.event), [
    "oqc_trial_cta_click", "oqc_trial_form_start", "oqc_trial_form_submit_attempt",
  ]);
  assert.deepEqual(events[0], {
    event: "oqc_trial_cta_click", cta_placement: "home_hero_primary",
    destination: "free_trial", page_path: "/free-trial",
  });
  controller.destroy();
});
