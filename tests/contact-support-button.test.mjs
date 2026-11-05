import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/components/site/contact-support-button.jsx", import.meta.url), "utf8");

test("floating support control contains only the requested label and approved brand styling", () => {
  assert.match(source, /<span>Contact Support<\/span>/);
  assert.doesNotMatch(source, /Online Quran College|We&apos;re here to help|OQC/);
  assert.match(source, /bg-\[#0B4935\]/);
  assert.match(source, /hover:bg-\[#C5A04A\]/);
  assert.match(source, /href="\/contact"/);
});
