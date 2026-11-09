import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const block = css.slice(css.indexOf("/* Buttons: brand greens"), css.indexOf("/* Form controls */"));

const luminance = (hex) => {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrastWithWhite = (hex) => 1.05 / (luminance(hex) + 0.05);

test("primary buttons keep white text at 4.5:1 or better across the whole gradient", () => {
  const gradient = block.match(/\.btn-primary, \.btn-gold \{[^}]*linear-gradient\(([^)]*)\)/);
  assert.ok(gradient, "primary buttons use the brand gradient");
  const stops = [...gradient[1].matchAll(/#([0-9a-f]{6})/gi)].map((m) => m[1]);
  assert.ok(stops.length >= 1);
  for (const stop of [...stops, "0c6c0c", "0a560b"]) assert.ok(contrastWithWhite(stop) >= 4.5, `#${stop}`);
});

test("buttons have a visible keyboard focus ring, a 46px touch target and motion only when allowed", () => {
  assert.match(block, /\.btn:focus-visible \{ outline: 3px solid var\(--color-gold-500\)/);
  assert.match(block, /min-height: 2\.875rem/);
  assert.match(block, /@media \(hover: hover\) and \(prefers-reduced-motion: no-preference\) \{[^}]*transform: translateY\(-1px\)/);
  assert.match(block, /@media \(prefers-reduced-motion: no-preference\) \{\s*\.btn:active:not\(:disabled\) \{ transform/);
  assert.doesNotMatch(block.replace(/@media[^{]*\{[^}]*\{[^}]*\}\s*\}/g, ""), /transform:/, "no movement outside the motion media queries");
});
