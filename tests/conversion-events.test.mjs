import { test } from "node:test";
import assert from "node:assert/strict";
import { announceLeadSaved } from "../src/lib/conversion-events.js";

test("saved lead signal contains only form type and mapped market, never form details", () => {
  const events = [];
  const previousWindow = globalThis.window;
  const previousCustomEvent = globalThis.CustomEvent;
  globalThis.CustomEvent = class {
    constructor(type, init) { this.type = type; this.detail = init?.detail; }
  };
  globalThis.window = { dispatchEvent: (event) => events.push(event) };
  try {
    const markets = [
      ["United Kingdom", "UK"],
      ["United States", "USA"],
      ["Canada", "Canada"],
      ["Australia", "Australia"],
      ["United Arab Emirates", "UAE"],
      ["Pakistan", "Other"],
    ];
    for (const [country, market] of markets) {
      assert.equal(announceLeadSaved({
        formType: "trial", country, reference: "TR-20260001",
        email: "private@example.test", phone: "private", learner_name: "Private",
      }), true);
      const event = events.at(-1);
      assert.equal(event.type, "oqc:lead-saved");
      assert.deepEqual(event.detail, { event: "generate_lead", form_type: "trial", market });
    }
    assert.equal(announceLeadSaved({ formType: "trial", reference: "TR-RECEIVED" }), false);
    assert.equal(announceLeadSaved({ formType: "contact", reference: "MSG-RECEIVED" }), false);
    assert.equal(announceLeadSaved({ formType: "trial", reference: "TR-1", honeypot: "bot" }), false);
    assert.equal(announceLeadSaved({ formType: "unknown", reference: "TR-1" }), false);
    assert.equal(announceLeadSaved({ formType: "trial" }), false);
    assert.equal(events.length, markets.length);
  } finally {
    if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow;
    if (previousCustomEvent === undefined) delete globalThis.CustomEvent; else globalThis.CustomEvent = previousCustomEvent;
  }
});

test("instrumentation failure cannot break successful form confirmation", () => {
  const previousWindow = globalThis.window;
  const previousCustomEvent = globalThis.CustomEvent;
  globalThis.CustomEvent = class { constructor(type, init) { this.type = type; this.detail = init?.detail; } };
  globalThis.window = { dispatchEvent() { throw Error("blocked"); } };
  try {
    assert.equal(announceLeadSaved({ formType: "contact", reference: "MSG-1", country: "Australia" }), false);
  } finally {
    if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow;
    if (previousCustomEvent === undefined) delete globalThis.CustomEvent; else globalThis.CustomEvent = previousCustomEvent;
  }
});
