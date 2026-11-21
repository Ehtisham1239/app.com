import test from "node:test";
import assert from "node:assert/strict";
import { GET } from "../src/app/login/route.js";

test("/login is a crawlable noindex page that links to the staff sign-in", async () => {
  const res = GET();
  assert.equal(res.status, 200);
  assert.match(res.headers.get("x-robots-tag"), /noindex/);
  const body = await res.text();
  assert.match(body, /<meta name="robots" content="noindex/);
  assert.match(body, /href="\/admin\/login"/);
});
