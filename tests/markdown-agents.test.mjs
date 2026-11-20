import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { htmlToMarkdown, markdownPathAllowed } from "../src/lib/markdown-agent.js";

test("only plain public page paths get a Markdown copy", () => {
  for (const ok of ["/", "/about", "/courses/hifz-quran", "/locations/united-kingdom/london", "/blog/family-quran-learning-weekly-routine"]) assert.equal(markdownPathAllowed(ok), true, ok);
  for (const bad of ["/admin", "/admin/users", "/api/revalidate", "/parents", "/login", "/auth/callback", "/md/about", "/_next/static/x", "/gone", "/robots.txt", "/blog/feed.xml", "/a//b", "/../etc/passwd", "/about?x=1", "/%2e%2e/x", "about", "", null, `/${"a".repeat(250)}`]) assert.equal(markdownPathAllowed(bad), false, String(bad));
});

test("conversion keeps main content, drops scripts, nav and forms, and makes links absolute", () => {
  const html = `<html><head><title>About &amp; Us | OQC</title><script>evil()</script></head><body><nav><a href="/x">menu</a></nav><main><h1>About</h1><p>We teach <a href="/courses">courses</a> online.</p><ul><li>One</li></ul><form><input name="a"></form><script>track()</script></main><footer>foot</footer></body></html>`;
  const md = htmlToMarkdown(html, { url: "https://www.example.org/about", origin: "https://www.example.org" });
  assert.match(md, /^# About & Us \| OQC/);
  assert.match(md, /Source: https:\/\/www\.example\.org\/about/);
  assert.match(md, /\[courses\]\(https:\/\/www\.example\.org\/courses\)/);
  assert.match(md, /-\s+One/);
  for (const gone of ["evil", "track", "menu", "foot", "<input"]) assert.doesNotMatch(md, new RegExp(gone));
});

test("rewrite fires only for Accept: text/markdown and skips staff and API areas", () => {
  const cfg = readFileSync("next.config.mjs", "utf8");
  assert.match(cfg, /key: "accept", value: "\.\*text\/markdown\.\*"/);
  assert.match(cfg, /\(\?!_next\/\|api\/\|admin\|auth\|parents\|login\|md\/\|gone\)/);
});

test("the Markdown route is never cached and is noindex", () => {
  const route = readFileSync("src/app/md/[[...path]]/route.js", "utf8");
  assert.match(route, /"Cache-Control": "no-store"/);
  assert.match(route, /Vary: "Accept"/);
  assert.match(route, /"X-Robots-Tag": "noindex"/);
  assert.match(route, /markdownPathAllowed\(pathname\)/);
});

test("the home page maps to path / even when the rewrite passes an empty segment", () => {
  const route = readFileSync("src/app/md/[[...path]]/route.js", "utf8");
  assert.match(route, /path\.filter\(Boolean\)/);
  assert.match(route, /segments\.join\("\/"\)/);
});

test('the route treats a lone "md" (what the home rewrite passes) or "index" segment as "/"', () => {
  const route = readFileSync("src/app/md/[[...path]]/route.js", "utf8");
  assert.match(route, /segments\[0\] === "index"/);
  assert.match(route, /segments\[0\] === "md"/);
});
