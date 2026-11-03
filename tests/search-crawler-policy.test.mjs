import { test } from "node:test";
import assert from "node:assert/strict";
import robots from "../src/app/robots.js";

test("major search and answer-engine crawlers can discover public OQC pages", async () => {
  const policy = await robots();
  const explicit = policy.rules.find(rule => Array.isArray(rule.userAgent));
  assert.ok(explicit, "explicit search crawler group exists");
  for (const agent of ["Googlebot", "bingbot", "Applebot", "DuckDuckBot", "YandexBot", "OAI-SearchBot", "Claude-SearchBot"]) {
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
  const sitemap = new URL(policy.sitemap);
  assert.ok(["http:", "https:"].includes(sitemap.protocol));
  assert.equal(sitemap.pathname, "/sitemap.xml");
  assert.ok(sitemap.hostname);
});
