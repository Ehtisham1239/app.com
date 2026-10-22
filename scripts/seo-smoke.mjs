// Focused release checks. No form submissions or authenticated changes.
// For cloud proxy environments use NODE_USE_ENV_PROXY=1 and the supplied CA trust.
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { LOCATIONS, locationPath, locationBreadcrumbs } from "../src/lib/locations.js";
const base = (process.argv[2] || "http://localhost:3010").replace(/\/$/, "");
const canonicalOrigin = process.env.NEXT_PUBLIC_SITE_URL || base;
const report = { base, redirects: 0, locationPages: 0, browserErrors: [], submittedForms: 0 };
async function html(path) { const r = await fetch(base + path); assert.equal(r.status, 200, path); return r.text(); }
for (const city of ["uk", "london", "birmingham", "manchester", "leeds", "bradford", "leicester"]) {
  const r = await fetch(`${base}/online-quran-classes-${city}?utm_source=release-check`, { redirect: "manual" });
  assert.equal(r.status, 308);
  const url = new URL(r.headers.get("location"), base);
  assert.equal(url.pathname, `/locations/united-kingdom${city === "uk" ? "" : `/${city}`}`);
  assert.equal(url.searchParams.get("utm_source"), "release-check"); report.redirects++;
}
const titles = new Set();
for (const country of LOCATIONS) for (const city of [null, ...country.cities]) {
  const path = locationPath(country, city), text = await html(path);
  const title = text.match(/<title>(.*?)<\/title>/)?.[1]; assert.ok(title); assert.equal(titles.has(title), false, title); titles.add(title);
  assert.equal((text.match(/<h1[\s>]/g) || []).length, 1, path);
  const schemas = [...text.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const breadcrumbs = schemas.find((s) => s["@type"] === "BreadcrumbList"); assert.ok(breadcrumbs, path);
  assert.deepEqual(breadcrumbs.itemListElement.map((s) => [s.name, new URL(s.item).pathname]), locationBreadcrumbs(country, city).map((s) => [s.name, s.path]));
  assert.ok(text.includes('id="schedule-title"'), path);
  assert.ok(text.includes('rel="canonical" href="' + canonicalOrigin + path + '"'), path);
  report.locationPages++;
}
const privacy = await html("/privacy-policy"); assert.ok(privacy.includes("sessionStorage")); assert.ok(privacy.includes("24 hours"));
const about = await html("/about"); assert.equal(about.includes("Every teacher goes through a background check"), false);
await html("/careers");
const utility = await html("/verify-certificate"); assert.match(utility, /name="robots" content="noindex, follow"/);
const sitemap = await html("/sitemap.xml"); assert.equal(sitemap.includes("/verify-certificate"), false); assert.ok(sitemap.includes("/careers"));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, timezoneId: "Asia/Karachi" });
  page.on("pageerror", (e) => report.browserErrors.push(e.message));
  page.on("request", (r) => { if (/submit_trial_application|submit_contact_message/.test(r.url())) report.submittedForms++; });
  // The Node fetch uses inherited proxy/CA trust; TLS verification stays enabled.
  await page.route("https://**/*", async (route) => {
    const req = route.request(); if (new URL(req.url()).origin !== new URL(base).origin) return route.continue();
    const r = await fetch(req.url(), { method: req.method(), headers: await req.allHeaders(), redirect: "manual" });
    const headers = Object.fromEntries(r.headers); delete headers["content-length"]; delete headers["content-encoding"];
    await route.fulfill({ status: r.status, headers, body: Buffer.from(await r.arrayBuffer()) });
  });
  await page.goto(base + "/locations/united-states/los-angeles", { waitUntil: "networkidle" });
  await page.getByLabel("Preferred lesson date").fill("2026-07-15");
  assert.ok(await page.getByText(/College coordination time:/).isVisible());
  assert.ok((await page.getByText(/College coordination time:/).innerText()).includes("06:00"));
  const cta = page.getByRole("link", { name: "Book a free trial in Los Angeles", exact: true });
  const contrast = await cta.evaluate((el) => {
    function luminance(color) { const values = color.match(/[\d.]+/g).slice(0, 3).map(Number).map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722; }
    const style = getComputedStyle(el), a = luminance(style.color), b = luminance(style.backgroundColor); return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
  }); assert.ok(contrast >= 4.5, String(contrast)); report.ctaContrast = contrast;
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.goto(base + "/free-trial?country=United%20States&city=Los%20Angeles", { waitUntil: "networkidle" });
  await page.getByLabel("Learner’s full name", { exact: true }).fill("Release Check");
  await page.getByRole("button", { name: /Adult/i }).first().click(); await page.getByRole("button", { name: "Continue", exact: true }).click();
  assert.equal(await page.locator("#t-city").inputValue(), "Los Angeles");
  assert.ok(await page.getByText("We will arrange classes in your time zone (America/Los Angeles).", { exact: true }).isVisible());
  assert.deepEqual(report.browserErrors, []); assert.equal(report.submittedForms, 0);
} finally { await browser.close(); }
console.log(JSON.stringify(report, null, 2));
