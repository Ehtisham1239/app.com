import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("testimonial ratings expose a screen-reader label without aria-label on a paragraph", () => {
  const sections = read("src/components/site/sections.jsx");
  assert.match(
    sections,
    /<p className="mt-4 flex gap-0\\.5 text-gold-500">\\s*<span className="sr-only">Rated \\{t\\.rating\\} out of 5<\\/span>/,
  );
  assert.doesNotMatch(sections, /<p[^>]*aria-label=/);
});

test("USA phone links use their visible text as accessible names", () => {
  const locationPage = read("src/components/site/location-page.jsx");
  assert.doesNotMatch(locationPage, /href="tel:\\+17869645678" aria-label=/);
  assert.match(locationPage, /href="tel:\\+17869645678">Call our US team · \\+1 \\(786\\) 964-5678/);
  assert.match(locationPage, /href="tel:\\+17869645678">Call \\+1 \\(786\\) 964-5678/);
});
