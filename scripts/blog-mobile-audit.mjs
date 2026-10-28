// Read-only rendered audit of every article in the source content snapshot.
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { auditOrigin } from './lib/audit-origin.mjs';
import { auditPage, launchAuditBrowser, loadedImage } from './lib/browser-audit.mjs';

const base = auditOrigin(process.argv[2]).origin;
const out = process.argv[3] || 'artifacts/blog-mobile';
const posts = JSON.parse(readFileSync(new URL('../src/lib/seed-content.json', import.meta.url))).posts;
const report = { base, width: 390, articles: [], errors: [], writes: 0, scope: 'Chromium touch viewport; live owned-site GETs bridged through trusted host TLS; vendors stubbed; no enquiries; not physical Safari or field CWV' };
mkdirSync(out, { recursive: true });
const browser = await launchAuditBrowser();
const session = await auditPage(browser, base, report, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
try {
  for (const post of posts) {
    const path = `/blog/${post.slug}`;
    const { page } = session;
    const response = await page.goto(base + path, { waitUntil: 'load' });
    assert.equal(response.status(), 200, path);
    assert.equal(await page.locator('h1').count(), 1, `${path}: H1`);
    await loadedImage(page, '[data-hero-visual] img');
    assert.ok((await page.locator('[data-hero-visual] img').getAttribute('alt'))?.trim(), `${path}: cover alt`);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    assert.equal(canonical, base + path, `${path}: canonical`);
    const toc = await page.locator('.article-toc a[href^="#"]').evaluateAll(links => links.map(a => ({ href: a.getAttribute('href'), valid: !!document.getElementById(decodeURIComponent(a.hash.slice(1))) })));
    assert.ok(toc.length > 0 && toc.every(link => link.valid), `${path}: TOC destinations`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${path}: overflow`);
    assert.ok(await page.locator('article time').count(), `${path}: visible date`);
    report.articles.push({ path, status: 200, singleH1: true, canonical, coverDecoded: true, coverAlt: true, tocTargets: toc.length, overflow: false });
    writeFileSync(`${out}/summary.json`, JSON.stringify(report, null, 2));
    console.log(`Verified mobile ${report.articles.length}/${posts.length}: ${path}`);
  }
  assert.deepEqual(report.errors, []);
  assert.equal(report.writes, 0);
} finally {
  await session.close();
  await browser.close();
  writeFileSync(`${out}/summary.json`, JSON.stringify(report, null, 2));
}
