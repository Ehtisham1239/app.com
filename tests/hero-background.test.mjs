import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { heroBackgroundUrls } from "../scripts/lib/hero-background.mjs";

const statePageCss = await readFile(new URL("../public/usa-state-pages/state-pages.css", import.meta.url), "utf8");

test("the state-page hero CSS exposes its existing AVIF and WebP assets to the quality audit", () => {
  const urls = heroBackgroundUrls(statePageCss);
  assert.ok(urls.includes("/images/learning/usa-online-quran-learning-r2-1200.avif"));
  assert.ok(urls.includes("/images/learning/usa-online-quran-learning-r2-1200.webp"));
});

test("unrelated card backgrounds are not treated as hero visuals", () => {
  assert.deepEqual(heroBackgroundUrls(".card{background-image:url('/images/card.webp')}"), []);
});
