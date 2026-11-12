import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../src/app/(site)/verify-certificate/page.jsx", import.meta.url), "utf8");
const component = readFileSync(new URL("../src/components/site/verify-certificate.jsx", import.meta.url), "utf8");
const migration = readFileSync(new URL("../supabase/migrations/20261112032025_public_certificate_privacy.sql", import.meta.url), "utf8");

test("public certificate verification explains that learner identity is withheld", () => {
  assert.match(page, /Learner names are withheld on public verification pages for privacy/);
  assert.match(component, /Withheld for privacy/);
  assert.doesNotMatch(component, /r\.student/);
});

test("public certificate lookup retains rate limiting and omits the learner name", () => {
  assert.match(migration, /private\.hit_rate_limit/);
  assert.match(migration, /'number', c\.number/);
  assert.match(migration, /'title', c\.title/);
  assert.doesNotMatch(migration, /'student'\s*,\s*s\.full_name/);
});
