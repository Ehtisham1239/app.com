import { auditPage, launchAuditBrowser, loadedImage } from "./lib/browser-audit.mjs";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
const base = (process.argv[2] || "http://localhost:3012").replace(/\/$/, "");
const out = process.argv[3] || "artifacts/blog-browser";
mkdirSync(out, { recursive: true });
const report = { base, cases: [], errors: [], writes: 0, scope: "Chromium desktop/mobile emulation, vendor stubbed; owned-site GETs only; no forms submitted" };
const launch = launchAuditBrowser;
let browser;
try {
  for (const width of [390, 1440]) {
    browser = await launch();
    const session = await auditPage(browser, base, report, { viewport: { width, height: 1000 } });
    const { page } = session;
    const r = await page.goto(base + "/blog", { waitUntil: "load" }); assert.equal(r.status(), 200);
    const topics = page.getByRole("navigation", { name: "Article topics" });
    assert.equal(await topics.getByRole("link").count(), 9);
    for (const category of ["Parents", "Tajweed", "Hifz"]) {
      await topics.getByRole("link", { name: category, exact: true }).click();
      await page.waitForURL(url => url.searchParams.get("category") === category);
      await page.locator('a[aria-current="page"]').filter({ hasText: category }).waitFor();
      assert.ok(await page.locator('main a[href^="/blog/"]').count() > 0);
      assert.match(await page.locator('meta[name="robots"]').getAttribute("content"), /noindex/);
      await topics.getByRole("link", { name: "All articles", exact: true }).click();
      await page.waitForURL(url => url.pathname === "/blog" && !url.search);
    }
    await page.getByRole("link", { name: "Next articles" }).click();
    await page.waitForURL(url => url.searchParams.get("page") === "2");
    await page.getByRole("heading", { level: 1 }).filter({ hasText: "Page 2" }).waitFor();
    assert.match(await page.locator('link[rel="canonical"]').getAttribute("href"), /\/blog\?page=2$/);
    await page.getByRole("link", { name: "Previous articles" }).click();
    await page.waitForURL(url => !url.search);
    const article = await page.locator('main a[href^="/blog/"]').first().getAttribute("href");
    await page.locator('main a[href^="/blog/"]').first().click();
    await page.waitForURL(url => url.pathname === article);
    await page.locator(".prose-oqc").waitFor();
    assert.equal(await page.getByRole("heading", { level: 1 }).count(), 1);
    assert.ok(await page.locator("article time").count() >= 1);
    const image = page.locator("[data-hero-visual] img");
    await loadedImage(page, "[data-hero-visual] img");
    assert.ok(await image.getAttribute("alt"));
    await page.locator(".article-toc summary").click();
    const toc = page.getByRole("navigation", { name: "In this article" }).getByRole("link").first();
    const target = await toc.getAttribute("href"); await toc.click();
    await page.waitForURL(url => url.hash === target);
    assert.equal(await page.locator(target).count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({ path: `${out}/article-${width}.png` });
    report.cases.push({ width, categories: 8, pagination: true, imageLoaded: true, dateVisible: true, tableOfContents: true, overflow: false });
    await page.evaluate(() => { navigator.clipboard.writeText = async value => { window.__copiedArticle = value; }; window.print = () => { window.__printedArticle = true; }; });
    const reject = page.getByRole('button', { name: 'Reject analytics', exact: true });
    if (await reject.count()) await reject.click();
    await page.getByRole('button', { name: 'Copy article link', exact: true }).click();
    assert.equal(await page.evaluate(() => new URL(window.__copiedArticle).pathname), article);
    await page.getByRole('button', { name: 'Print or save PDF', exact: true }).click();
    assert.equal(await page.evaluate(() => window.__printedArticle), true);
    await page.emulateMedia({ media: 'print' });
    assert.equal(await page.locator('.site-header').isVisible(), false);
    assert.equal(await page.locator('.article-print-source').isVisible(), true);
    await page.emulateMedia({ media: 'screen' });
    await session.close(); await browser.close();
  }
} finally { await browser?.close(); }
assert.deepEqual(report.errors, []); assert.equal(report.writes, 0);
writeFileSync(`${out}/summary.json`, JSON.stringify(report, null, 2)); console.log(JSON.stringify(report, null, 2));
