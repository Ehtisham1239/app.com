import { test } from "node:test";
import assert from "node:assert/strict";

// seo-metadata.js imports aliased modules; load only fitTitle's source to test it in isolation.
import { readFileSync } from "node:fs";
const src = readFileSync(new URL("../src/lib/seo-metadata.js", import.meta.url), "utf8");
const start = src.indexOf('const TITLE_SUFFIX');
const end = src.indexOf("export function contentMetadata");
const { fitTitle } = await import("data:text/javascript," + encodeURIComponent(src.slice(start, end)));

test("every page title uses one format: topic · Online Quran College", () => {
  assert.deepEqual(fitTitle("Free Online Quran Trial Classes | Online Quran College"), { absolute: "Free Online Quran Trial Classes · Online Quran College" });
  assert.deepEqual(fitTitle(undefined, "Our Teachers"), { absolute: "Our Teachers · Online Quran College" });
  assert.deepEqual(fitTitle("Online Quran Classes USA | Live Lessons | OQC"), { absolute: "Online Quran Classes USA | Live Lessons · OQC" });
});

test("long titles shorten the brand, then drop it, and never repeat it", () => {
  const medium = "Online Quran Class Fees in the UK: A Comparison Guide | OQC";
  assert.deepEqual(fitTitle(medium), { absolute: "Online Quran Class Fees in the UK: A Comparison Guide · OQC" });
  const long = "Returning to Quran Study After a Long Break: An Adult’s Planning Guide";
  assert.deepEqual(fitTitle(long), { absolute: long });
  for (const t of [medium, long, "Privacy Policy | Online Quran College", "Our Teachers"]) {
    const out = fitTitle(t).absolute;
    assert.ok(out.length <= 60 || !/OQC|Online Quran College$/.test(out), out);
    assert.ok((out.match(/Online Quran College|OQC/g) || []).length <= 1 || /^Online Quran College/.test(out), out);
  }
  assert.deepEqual(fitTitle("Online Quran College — Live 1-on-1 Online Quran Classes"), { absolute: "Online Quran College — Live 1-on-1 Online Quran Classes" });
});

test("a title that already names the brand gets no second brand", () => {
  assert.deepEqual(fitTitle("About Online Quran College | Online Quran Academy"), { absolute: "About Online Quran College | Online Quran Academy" });
  assert.deepEqual(fitTitle(undefined, "Contact Online Quran College"), { absolute: "Contact Online Quran College" });
});
