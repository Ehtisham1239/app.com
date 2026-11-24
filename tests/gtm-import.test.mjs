import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const file = JSON.parse(readFileSync(new URL("../docs/gtm/oqc-advanced-ga4-events.import.json", import.meta.url), "utf8"));
const analytics = readFileSync(new URL("../src/lib/analytics.js", import.meta.url), "utf8");
const cv = file.containerVersion;

test("import targets the GA4-owning container and only adds GA4 event tags", () => {
  assert.equal(cv.container.publicId, "GTM-W7CMZS53");
  assert.ok(cv.tag.length >= 6);
  for (const tag of cv.tag) {
    assert.equal(tag.type, "gaawe", `${tag.name}: no cookie-setting, ad or custom HTML tags`);
    assert.equal(tag.parameter.find(p => p.key === "measurementIdOverride").value, "G-57TGPTDNT4");
    assert.ok(tag.name.startsWith("OQC GA4 - "));
  }
});

test("every trigger listens to a dataLayer event the site really pushes", () => {
  for (const trigger of cv.trigger) {
    const event = trigger.customEventFilter[0].parameter[1].value;
    assert.match(event, /^oqc_[a-z_]+$/);
    assert.ok(analytics.includes(`"${event.slice(4)}"`), `${event} is emitted by analytics.js`);
  }
});

test("tags, triggers and variables reference each other consistently; no overlap with events the container already owns", () => {
  const triggerIds = new Set(cv.trigger.map(t => t.triggerId));
  const variableNames = new Set(cv.variable.map(v => v.name));
  for (const tag of cv.tag) {
    for (const id of tag.firingTriggerId) assert.ok(triggerIds.has(id), tag.name);
    const used = JSON.stringify(tag).match(/\{\{(OQC DLV - [a-z_]+)\}\}/g) || [];
    for (const ref of used) assert.ok(variableNames.has(ref.slice(2, -2)), `${tag.name} -> ${ref}`);
  }
  const owned = ["page_view", "generate_lead", "thanku_generate_lead", "contact_click", "thank_you_view"];
  for (const tag of cv.tag) assert.ok(!owned.includes(tag.parameter.find(p => p.key === "eventName").value), `${tag.name} would double-count`);
});
