import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
const base = (process.argv[2] || "http://localhost:3012").replace(/\/$/, "");
const out = process.argv[3] || "artifacts/blog-browser";
mkdirSync(out, { recursive: true });
const report = { base, cases: [], errors: [], writes: 0, scope: "Chromium desktop/mobile emulation, vendor stubbed; owned-site GETs only; no forms submitted" };
const launch = () => chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", args: process.env.CHROMIUM_ARGS_JSON ? JSON.parse(process.env.CHROMIUM_ARGS_JSON) : ["--no-sandbox"] });
let browser;
try {
  for (const width of [390, 1440]) {
    browser = await launch();
    const context = await browser.newContext({ viewport: { width, height: 1000 } });
    const page = await context.newPage();
    page.on("pageerror", e => report.errors.push(e.message));
    await page.route("**/*", async route => {
      const req = route.request(), url = new URL(req.url());
      if (url.hostname === "app.hatchium.ai") return route.fulfill({ contentType: "application/javascript", body: "/* test vendor stub */" });
      if (!["GET", "HEAD"].includes(req.method())) { report.writes++; return route.abort(); }
      if (base.startsWith("https://") && url.origin === new URL(base).origin) {
        const r = await fetch(req.url(), { method: req.method(), headers: await req.allHeaders(), redirect: "manual", signal: AbortSignal.timeout(30000) });
        const headers = Object.fromEntries(r.headers); delete headers["content-length"]; delete headers["content-encoding"];
        return route.fulfill({ status: r.status, headers, body: Buffer.from(await r.arrayBuffer()) });
      }
      return route.continue();
    });
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
    await image.evaluate(img => img.decode());
    assert.ok(await image.getAttribute("alt"));
    const toc = page.getByRole("navigation", { name: "In this article" }).getByRole("link").first();
    const target = await toc.getAttribute("href"); await toc.click();
    await page.waitForURL(url => url.hash === target);
    assert.equal(await page.locator(target).count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({ path: `${out}/article-${width}.png` });
    report.cases.push({ width, categories: 8, pagination: true, imageLoaded: true, dateVisible: true, tableOfContents: true, overflow: false });
    await context.close(); await browser.close();
  }
  browser = await launch();
  const context = await browser.newContext({ javaScriptEnabled: false });
  if (base.startsWith("https://")) await context.route(`${base}/**`, async route => {
    const r = await fetch(route.request().url(), { redirect: "manual", signal: AbortSignal.timeout(30000) });
    const headers = Object.fromEntries(r.headers); delete headers["content-length"]; delete headers["content-encoding"];
    return route.fulfill({ status: r.status, headers, body: Buffer.from(await r.arrayBuffer()) });
  });
  const page = await context.newPage(); await page.goto(base + "/blog/help-your-kids-learn-quran-online");
  assert.ok((await page.locator(".prose-oqc").innerText()).length > 1000);
  report.noJavaScriptArticle = true; await context.close();
} finally { await browser?.close(); }
assert.deepEqual(report.errors, []); assert.equal(report.writes, 0);
writeFileSync(`${out}/summary.json`, JSON.stringify(report, null, 2)); console.log(JSON.stringify(report, null, 2));
