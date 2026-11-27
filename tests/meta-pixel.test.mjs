import test from "node:test";
import assert from "node:assert/strict";
import { metaPixelId, readMetaPixelConsent, saveMetaPixelConsent, createMetaPixelController, META_PIXEL_CONSENT_KEY } from "../src/lib/meta-pixel.js";

// Test-only Pixel ID. The fake document records script loads; no network requests occur.
const id = "1234567890123456";
function fakeBrowser() {
  const win = new EventTarget(), document = new EventTarget(), scripts = [], storage = new Map();
  document.head = { appendChild: script => scripts.push(script) };
  document.getElementById = scriptId => scripts.find(script => script.id === scriptId);
  document.createElement = () => ({});
  Object.assign(win, { document, localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) } });
  return { win, scripts, storage };
}
const lead = detail => new CustomEvent("oqc:lead-saved", { detail });
const calls = win => win.fbq.queue.map(args => Array.from(args));

test("pixel id must be digits only; script code or URLs switch it off", () => {
  assert.equal(metaPixelId(id), id);
  for (const bad of ["", undefined, "<script>alert(1)</script>", "https://x.test/1234567890", "12ab"]) assert.equal(metaPixelId(bad), "");
});

test("nothing loads or is stored before the visitor accepts", () => {
  const { win, scripts, storage } = fakeBrowser();
  const pixel = createMetaPixelController(win, id);
  win.dispatchEvent(lead({ event: "generate_lead", form_type: "trial", market: "UK" }));
  assert.equal(scripts.length, 0); assert.equal(storage.size, 0); assert.equal(win.fbq, undefined); assert.equal(pixel.isActive(), false);
});

test("accepting loads the Pixel once and sends one PageView", () => {
  const { win, scripts } = fakeBrowser();
  const pixel = createMetaPixelController(win, id);
  assert.equal(pixel.grant(), true); assert.equal(pixel.grant(), false);
  assert.equal(scripts.length, 1); assert.equal(scripts[0].src, "https://connect.facebook.net/en_US/fbevents.js");
  assert.deepEqual(calls(win), [["consent", "grant"], ["init", id], ["track", "PageView"]]);
});

test("Lead carries only form type and market, with a dedup eventID, and ignores bad signals", () => {
  const { win } = fakeBrowser();
  createMetaPixelController(win, id).grant();
  win.dispatchEvent(lead({ event: "generate_lead", form_type: "trial", market: "USA", email: "private@example.test", reference: "TR-1234" }));
  win.dispatchEvent(lead({ event: "generate_lead", form_type: "other", market: "USA" }));
  win.dispatchEvent(lead({ event: "generate_lead", form_type: "trial", market: "Mars" }));
  const leads = calls(win).filter(call => call[1] === "Lead");
  assert.equal(leads.length, 1);
  assert.deepEqual(leads[0][2], { content_category: "trial", content_name: "USA" });
  assert.match(leads[0][3].eventID, /^lead_[a-z0-9]+_[a-z0-9]+$/);
  assert.ok(!JSON.stringify(calls(win)).includes("private@example.test"));
});

test("revoking stops Lead events and consent choices persist", () => {
  const { win } = fakeBrowser();
  const pixel = createMetaPixelController(win, id);
  pixel.grant(); pixel.revoke();
  win.dispatchEvent(lead({ event: "generate_lead", form_type: "contact", market: "UK" }));
  assert.equal(calls(win).filter(call => call[1] === "Lead").length, 0);
  assert.ok(calls(win).some(call => call[0] === "consent" && call[1] === "revoke"));
  assert.equal(readMetaPixelConsent(win), null);
  assert.equal(saveMetaPixelConsent(win, "granted"), true); assert.equal(readMetaPixelConsent(win), "granted");
  assert.equal(saveMetaPixelConsent(win, "maybe"), false); assert.equal(win.localStorage.getItem(META_PIXEL_CONSENT_KEY), "granted");
});

test("an invalid pixel id never loads anything", () => {
  const { win, scripts } = fakeBrowser();
  assert.equal(createMetaPixelController(win, "bad").grant(), false);
  assert.equal(scripts.length, 0);
});

test("accepting after withdrawal restores consent without reinitializing the pixel", () => {
  const { win, scripts } = fakeBrowser();
  const pixel = createMetaPixelController(win, id);
  pixel.grant();
  pixel.revoke();
  pixel.grant();
  assert.equal(scripts.length, 1);
  assert.deepEqual(calls(win).filter(call => call[0] === "consent"), [
    ["consent", "grant"],
    ["consent", "revoke"],
    ["consent", "grant"],
  ]);
  assert.equal(calls(win).filter(call => call[0] === "init").length, 1);
  assert.equal(pixel.isActive(), true);
});
