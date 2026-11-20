import { test } from "node:test";
import assert from "node:assert/strict";
import robots from "../src/app/robots.js";

test("major search and answer-engine crawlers can discover public OQC pages", async () => {
  const policy = await robots();
  const explicit = policy.rules.find(rule => Array.isArray(rule.userAgent));
  assert.ok(explicit, "explicit search crawler group exists");
  for (const agent of ["Googlebot", "bingbot", "Applebot", "DuckDuckBot", "YandexBot", "OAI-SearchBot", "Claude-SearchBot", "Claude-User"]) {
    assert.ok(explicit.userAgent.includes(agent), `${agent} is explicitly allowed`);
  }
  assert.equal(explicit.allow, "/");
  assert.deepEqual(explicit.disallow, ["/admin", "/auth", "/api/", "/parents"]);
});

test("Perplexity search crawler remains allowed without exposing private routes", async () => {
  const policy = await robots();
  const perplexity = policy.rules.find(rule => rule.userAgent === "PerplexityBot");
  assert.ok(perplexity);
  assert.equal(perplexity.allow, "/");
  assert.deepEqual(perplexity.disallow, ["/admin", "/auth", "/api/", "/parents"]);
});

test("wildcard policy preserves existing public crawling and sitemap discovery", async () => {
  const policy = await robots();
  const wildcard = policy.rules.find(rule => rule.userAgent === "*");
  assert.ok(wildcard);
  assert.equal(wildcard.allow, "/");
  assert.deepEqual(wildcard.disallow, ["/admin", "/auth", "/api/", "/parents"]);
  const sitemaps = [].concat(policy.sitemap).map((url) => new URL(url));
  assert.deepEqual(sitemaps.map((url) => url.pathname), ["/sitemap.xml", "/sitemap.txt"]);
  for (const sitemap of sitemaps) {
    assert.ok(["http:", "https:"].includes(sitemap.protocol));
    assert.ok(sitemap.hostname);
  }
});

test("every robots group declares the owner's Content-Signal (20 Nov 2026: search, ai-input and ai-train all yes)", async () => {
  const policy = await robots();
  assert.ok(policy.rules.length >= 3);
  for (const rule of policy.rules) {
    assert.deepEqual(rule.other, { "Content-Signal": "search=yes, ai-input=yes, ai-train=yes" });
  }
});
