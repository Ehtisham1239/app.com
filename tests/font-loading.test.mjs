import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const layout = read("src/app/layout.jsx");
const css = read("src/app/globals.css");

// 19 Nov 2026: a "≈" beside converted prices pulled 133 KB of Latin fallback faces that do not
// contain it, and the footer verse pulled the full 109 KB Amiri. Fonts per page fell 368 KB → 99–146 KB.
test("Latin fallback faces carry unicode-range so stray symbols do not download them", () => {
  for (const family of ["--font-inter-latin", "--font-inter-extended", "--font-outfit-latin"]) {
    const start = layout.indexOf(`variable: "${family}"`);
    assert.notEqual(start, -1, family);
    const block = layout.slice(start, layout.indexOf("});", start));
    assert.match(block, /prop: "unicode-range", value: "U\+/, `${family} needs a unicode-range`);
    assert.doesNotMatch(block, /U\+2248/, `${family} must not claim "≈"`);
  }
  assert.doesNotMatch(layout.slice(layout.indexOf('variable: "--font-inter"'), layout.indexOf('variable: "--font-inter"') + 80), /unicode-range/, "the primary text face keeps no range");
});

test("Quran text outside the band uses Amiri Quran, already loaded for the band", () => {
  assert.match(css, /\.quran-text \{ font-family: var\(--font-amiri-quran\), var\(--font-arabic\); \}/);
  assert.match(read("src/components/site/footer.jsx"), /className="arabic quran-text [^"]*">رَبِّ زِدْنِي عِلْمًا/);
  assert.match(read("src/app/(site)/quran-study/page.jsx"), /className="arabic quran-text [^"]*">وَلَقَدْ يَسَّرْنَا/);
});

test("home verse shimmer (a repainting background-position animation) runs on hover only", () => {
  const motion = css.slice(css.indexOf(".verse-word { animation:"), css.indexOf("@keyframes verse-arrive"));
  assert.doesNotMatch(motion.split("@media (hover: hover)")[0], /verse-shimmer/);
  assert.match(motion, /@media \(hover: hover\) and \(pointer: fine\) and \(prefers-reduced-motion: no-preference\) \{\s*\.verse-card:hover \.verse-word \{ animation: verse-shimmer/);
});

test("the solid white mobile header gets no backdrop blur", () => {
  assert.doesNotMatch(css, /^\.site-header \{ backdrop-filter: blur/m, "an unscoped blur overrides the mobile rule");
  assert.match(css, /@media \(min-width: 640px\) \{ \.site-header \{ backdrop-filter: blur\(12px\)/);
});
