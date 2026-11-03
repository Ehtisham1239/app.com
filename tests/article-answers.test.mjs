import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { articleAnswer, articleNeedsAnswer } from "../src/lib/article-answers.js";
import { feeAnswer } from "../src/lib/fee-answer.js";

const fx = { base: "USD", rates: { USD: 1, GBP: 0.75 } };
const plans = [
  { name: "Package 1", classes_per_week: 2, duration_min: 30, prices: [{ currency: "USD", amount_minor: 3000 }] },
  { name: "Package 4", classes_per_week: 4, duration_min: 30, prices: [{ currency: "USD", amount_minor: 5000 }] },
];

test("the UK fees article answers its search question with the same figures as /pricing", () => {
  const slug = "online-quran-class-fees-uk-comparison";
  assert.ok(articleNeedsAnswer(slug));
  const a = articleAnswer(slug, { plans, fx });
  assert.equal(a.question, "How much do online Quran classes cost in the UK?");
  assert.equal(a.answer, feeAnswer(plans, fx, "GBP").answer, "never disagrees with the pricing page");
  assert.match(a.answer, /about £23 to £38 a month/);
  assert.equal(a.link.href, "/pricing?currency=GBP");
  assert.equal(articleAnswer(slug, { plans: [], fx }), null, "no plans → no box, never a guessed figure");
  assert.equal(articleNeedsAnswer("hifz-revision-with-school"), false);
});

test("the post page shows the answer first and as FAQPage data", () => {
  const page = readFileSync(new URL("../src/app/(site)/blog/[slug]/page.jsx", import.meta.url), "utf8");
  assert.match(page, /faqSchema\(\[quick\]\)/);
  assert.ok(page.indexOf('id="quick-answer"') < page.indexOf("post.excerpt &&"), "answer comes before the excerpt");
});
