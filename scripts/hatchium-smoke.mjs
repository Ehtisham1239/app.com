// Contract checks with a stubbed vendor script. Does not test real chat delivery.
import { chromium } from "playwright";
import assert from "node:assert/strict";
const base = (process.argv[2] || "http://localhost:3011").replace(/\/$/, "");
const widget = "https://app.hatchium.ai/widget.js?v=1784525654";
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
const report = { base, vendorScript: "stubbed", configuredBeforeLoad: false, publicNavigationLoads: 0, cmsIsolated: false, downloadFailureLeavesFormUsable: false, errors: [] };
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", (e) => report.errors.push(e.message));
  await page.route("https://**/*", async (route) => {
    const req = route.request();
    if (req.url() === widget) { report.publicNavigationLoads++; return route.fulfill({ contentType: "application/javascript", body: "window.__hatchiumContractCheck = { configuredBeforeLoad: window.chatWidgetConfig?.key === 'BZrCMwoaC3UYn9OpkcSASivkWFYm5A0B' };" }); }
    if (new URL(req.url()).origin !== new URL(base).origin) return route.abort();
    const r = await fetch(req.url(), { headers: await req.allHeaders(), redirect: "manual" });
    const headers = Object.fromEntries(r.headers); delete headers["content-length"]; delete headers["content-encoding"];
    await route.fulfill({ status: r.status, headers, body: Buffer.from(await r.arrayBuffer()) });
  });
  await page.goto(base + "/?view=global", { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__hatchiumContractCheck?.configuredBeforeLoad === true);
  report.configuredBeforeLoad = true;
  const whatsapp = page.getByRole("link", { name: "Chat with Online Quran College on WhatsApp", exact: true });
  assert.equal(await whatsapp.count(), 0);
  report.leftShortcutRemoved = true;
  // Footer Link uses client navigation, so the public layout is retained.
  await page.locator('footer a[href="/contact"]').first().click();
  await page.waitForURL(base + "/contact"); await page.waitForLoadState("networkidle");
  assert.equal(report.publicNavigationLoads, 1);
  assert.equal(await page.locator('script[src="' + widget + '"]').count(), 1);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  // A fresh CMS document must not load or keep the public chat runtime.
  await page.goto(base + "/admin/login", { waitUntil: "networkidle" });
  assert.equal(await page.locator('script[src*="app.hatchium.ai"]').count(), 0);
  assert.equal(await page.evaluate(() => typeof window.chatWidgetConfig), "undefined"); report.cmsIsolated = true;
  await page.close();
  const failure = await browser.newPage();
  await failure.route("https://**/*", async (route) => {
    const req=route.request(); if(req.url()===widget)return route.abort("failed");
    if(new URL(req.url()).origin!==new URL(base).origin)return route.abort();
    const r=await fetch(req.url(),{headers:await req.allHeaders(),redirect:"manual"});const headers=Object.fromEntries(r.headers);delete headers["content-length"];delete headers["content-encoding"];await route.fulfill({status:r.status,headers,body:Buffer.from(await r.arrayBuffer())});
  });
  await failure.goto(base + "/contact", { waitUntil: "networkidle" });
  await failure.locator("#c-name").fill("Widget Failure Check");
  assert.equal(await failure.locator("#c-name").inputValue(), "Widget Failure Check");
  report.downloadFailureLeavesFormUsable=true;
  assert.deepEqual(report.errors, []);
} finally { await browser.close(); }
console.log(JSON.stringify(report, null, 2));
