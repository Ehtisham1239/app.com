import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("testimonial ratings use a valid accessible image role for their rating label", () => {
  const sections = read("src/components/site/sections.jsx");
  assert.match(sections, /<div role="img" aria-label=\{`Rated \$\{t\.rating\} out of 5`\}/);
  assert.doesNotMatch(sections, /<p[^>]*aria-label=\{`Rated/);
});

test("USA phone links retain visible text as their accessible names", () => {
  const locationPage = read("src/components/site/location-page.jsx");
  assert.doesNotMatch(locationPage, /href="tel:\+17869645678" aria-label=/);
  assert.match(locationPage, /href="tel:\+17869645678">Call our US team · \+1 \(786\) 964-5678/);
  assert.match(locationPage, /href="tel:\+17869645678">Call \+1 \(786\) 964-5678/);
});
