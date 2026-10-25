// Explicit, bounded notification of changed PUBLIC URLs. Default is dry-run.
// This is a public host-ownership token, not a Google/Bing account credential.
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
const config = JSON.parse(readFileSync(new URL("../content/seo-agent/indexnow.json", import.meta.url)));
assert.equal(config.origin, "https://project-umber-three-93.vercel.app");
assert.equal(config.endpoint, "https://api.indexnow.org/indexnow");
assert.match(config.keyPath, /^\/indexnow-[a-f0-9]{32}\.txt$/);
const key = readFileSync(new URL(`../public${config.keyPath}`, import.meta.url), "utf8").trim();
assert.match(key, /^[a-f0-9]{32}$/);
const submit = process.argv.includes("--submit");
const args = process.argv.slice(2).filter(arg => arg !== "--submit");
assert.ok(args.length > 0 && args.length <= 250, "Supply 1–250 changed canonical public URLs/paths; no automatic full-site resubmission.");
const urls = [...new Set(args.map(path => {
  const url = new URL(path, config.origin);
  assert.equal(url.origin, config.origin);
  assert.ok(!url.username && !url.password && !url.search && !url.hash && !/^\/(admin|api|auth)(\/|$)/.test(url.pathname));
  return url.href;
}))];
const keyLocation = config.origin + config.keyPath;
const ownership = await fetch(keyLocation, { redirect: "manual", signal: AbortSignal.timeout(20000) });
assert.equal(ownership.status, 200, "Deploy and verify ownership file before notifying search engines.");
assert.equal((await ownership.text()).trim(), key, "Ownership file does not match local configuration.");
const sitemapResponse = await fetch(config.origin + "/sitemap.xml", { signal: AbortSignal.timeout(20000) });
assert.equal(sitemapResponse.status, 200);
const sitemap = await sitemapResponse.text();
const declared = new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1].replace(/&amp;/g, "&")).href));
for (const url of urls) {
  assert.ok(declared.has(url), "Only current sitemap canonical pages may be submitted by this script.");
  const r = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(20000) });
  assert.equal(r.status, 200, "Non-200 URL; stopped before submission.");
  const html = await r.text();
  assert.ok(!/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html));
  assert.ok(!/noindex/.test(r.headers.get("x-robots-tag") || ""));
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  assert.ok(canonical, "Missing canonical; stopped before submission.");
  assert.equal(new URL(canonical.replace(/&amp;/g, "&")).href, url);
}
let receipt = { checkedAt: new Date().toISOString(), origin: config.origin, mode: submit ? "SUBMIT" : "DRY_RUN", checkedUrls: urls.length, urlList: urls, status: null, received: false, indexingConfirmed: false };
if (submit) {
  const response = await fetch(config.endpoint, { method: "POST", redirect: "error", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify({ host: new URL(config.origin).host, key, keyLocation, urlList: urls }), signal: AbortSignal.timeout(30000) });
  receipt = { ...receipt, status: response.status, received: [200, 202].includes(response.status), validationPending: response.status === 202 };
  await response.arrayBuffer();
}
mkdirSync("artifacts/indexnow", { recursive: true });
writeFileSync(`artifacts/indexnow/${submit ? "receipt" : "dry-run"}.json`, JSON.stringify(receipt, null, 2));
console.log(JSON.stringify(receipt, null, 2));
if (submit) assert.ok(receipt.received, "Search endpoint did not accept the batch; no retries were sent.");
