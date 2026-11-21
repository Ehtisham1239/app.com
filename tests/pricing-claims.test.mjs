import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("public pricing integrates the approved sibling discount from backend settings", () => {
  const pricing = read("src/app/(site)/pricing/page.jsx");
  const compare = read("src/components/site/fee-compare.jsx");
  const answer = read("src/lib/fee-answer.js");
  const siteData = read("src/lib/site-data.js");

  assert.ok(pricing.includes("familyDiscount={settings[\"site.family_discount\"]}"));
  assert.ok(compare.includes("familyDiscount?.eligible_plan_ids"));
  assert.ok(compare.includes("Apply sibling discount"));
  assert.ok(compare.includes("familyMonthlyEstimate(selectedRow.price.amount_minor, learners, appliedPercent"));
  assert.ok(answer.includes("familyDiscount.percent") && answer.includes("each additional child"));
  assert.ok(siteData.includes("return rows;"));
});

test("pricing cards show the published weekly count once and preserve schedule details", async () => {
  const bundle = await build({
    stdin: {
      contents: 'export { PricingCards } from "./src/components/site/pricing-cards.jsx";',
      resolveDir: fileURLToPath(new URL("..", import.meta.url)),
    },
    bundle: true,
    write: false,
    format: "cjs",
    platform: "node",
    packages: "external",
    jsx: "automatic",
  });
  const compiled = { exports: {} };
  new Function("module", "exports", "require", bundle.outputFiles[0].text)(
    compiled, compiled.exports, createRequire(import.meta.url),
  );
  const { PricingCards } = compiled.exports;
  const render = (plan) => renderToStaticMarkup(createElement(PricingCards, {
    plans: [{ id: "package-1", name: "Package 1", ...plan }],
  }));
  const html = render({ classes_per_week: 5, features: ["2 classes a week", "5 days per week", "Weekend scheduling"] });

  assert.equal(html.match(/5 classes a week/g)?.length, 1);
  assert.doesNotMatch(html, /2 classes a week|5 days per week/);
  assert.match(html, /Weekend scheduling/);
  assert.match(render({ classes_per_week: 1 }), /1 class a week/);
  assert.match(render({ features: ["2 classes a week"] }), /2 classes a week/);
});
test("pricing metadata covers all priority markets and states the eligible trial accurately", () => {
  const pricing = read("src/app/(site)/pricing/page.jsx");
  const description = pricing.match(/description: "([^"]+)"/)?.[1] || "";
  assert.match(description, /UK, USA, Canada, Australia and UAE/);
  assert.match(description, /3-day trial eligibility/);
  assert.doesNotMatch(description, /CAD/, "Canada is currently quoted in USD; do not imply an approved CAD price");
});

test("homepage clarifies that its package cards are displayed in USD and points visitors to local fee guidance", () => {
  const home = read("src/app/(site)/page.jsx");
  assert.match(home, /Homepage package prices are shown in US dollars/);
  assert.match(home, /your country guide for local fee guidance/);
  assert.match(home, /Admissions confirms the final fee and payment currency/);
});
