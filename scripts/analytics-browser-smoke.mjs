// Local-only fixture tests. Test Google libraries are intercepted; no live Google events.
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
const base = process.argv[2] || "http://127.0.0.1:3012";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname), "Fixture test must stay local");
const out = "artifacts/analytics-browser"; mkdirSync(out, { recursive: true });
const report = { cases: [], browserErrors: [], realGoogleRequests: 0, formSubmissions: 0, scope: "Local production-build fixtures; Google script stubbed; no real GA4/GTM property receives data" };
for (const mode of ["ga4", "gtm"]) for (const width of [390, 1440]) {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", args: process.env.CHROMIUM_ARGS_JSON ? JSON.parse(process.env.CHROMIUM_ARGS_JSON) : ["--no-sandbox"] });
  try {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    const vendorLoads = [];
    page.on("pageerror", error => report.browserErrors.push(error.message));
    await page.route("**/*", async route => {
      const req = route.request(), url = new URL(req.url());
      if (url.hostname === "www.googletagmanager.com") { vendorLoads.push(url.href); return route.fulfill({ contentType: "application/javascript", body: "/* Google stub: do not transmit QA events */" }); }
      if (url.origin !== new URL(base).origin) { if (/google-analytics|doubleclick/.test(url.hostname)) report.realGoogleRequests++; return route.abort(); }
      if (!["GET", "HEAD"].includes(req.method())) { report.formSubmissions++; return route.abort(); }
      return route.continue();
    });
    const path = `/analytics-qa/${mode}`;
    await page.goto(`${base}${path}?email=private@example.test#private`, { waitUntil: "load" });
    await page.getByRole("region", { name: "Analytics preferences" }).waitFor();
    assert.equal(vendorLoads.length, 0);
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("oqc:lead-saved", { detail: { event: "generate_lead", form_type: "contact", market: "USA" } })));
    await page.getByRole("button", { name: "Reject analytics", exact: true }).click();
    await page.reload({ waitUntil: "load" });
    await page.getByRole("button", { name: "Analytics preferences", exact: true }).waitFor();
    assert.equal(vendorLoads.length, 0);
    await page.getByRole("button", { name: "Analytics preferences", exact: true }).click();
    await page.getByRole("button", { name: "Allow analytics", exact: true }).click();
    await page.waitForFunction(() => !!document.getElementById("oqc-google-analytics"));
    await page.waitForFunction(() => window.dataLayer.some(item => item.event === "oqc_page_view" || item[0] === "event" && item[1] === "page_view"));
    await page.waitForFunction(() => document.getElementById("oqc-google-analytics")?.src.includes("googletagmanager.com"));
    await page.getByRole("link", { name: "Next page", exact: true }).click();
    await page.waitForURL(url => url.pathname === path + "/next");
    await page.waitForFunction(() => window.dataLayer.filter(item => item.event === "oqc_page_view" || item[0] === "event" && item[1] === "page_view").length === 2);
    await page.getByRole("link", { name: "First page", exact: true }).click();
    await page.waitForURL(url => url.pathname === path);
    await page.waitForFunction(() => window.dataLayer.filter(item => item.event === "oqc_page_view" || item[0] === "event" && item[1] === "page_view").length === 3);
    await page.evaluate(() => {
      document.querySelector('a[href^="tel:"]').addEventListener("click", event => event.preventDefault());
      window.dispatchEvent(new CustomEvent("oqc:lead-saved", { detail: { event: "generate_lead", form_type: "contact", market: "USA", email: "private@example.test", reference: "MSG-PRIVATE" } }));
    });
    await page.getByRole("link", { name: "Phone test" }).click();
    const data = await page.evaluate(() => window.dataLayer.map(item => typeof item.length === "number" ? Array.from(item) : item));
    const events = data.filter(item => mode === "gtm" ? item.event?.startsWith("oqc_") : item[0] === "event");
    assert.equal(events.length, 5); // Three views, one persisted-lead signal and one distinct contact click.
    assert.equal(vendorLoads.length, 1);
    assert.ok(vendorLoads[0].includes(mode === "gtm" ? "/gtm.js?id=GTM-TEST123" : "/gtag/js?id=G-TEST123456"));
    assert.ok(!JSON.stringify(data).includes("private@example.test"));
    assert.ok(!JSON.stringify(data).includes("MSG-PRIVATE"));
    for (const item of data.filter(item => item[0] === "consent")) for (const field of ["ad_storage", "ad_user_data", "ad_personalization"]) assert.equal(item[2][field], "denied");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.getByRole("button", { name: "Analytics preferences", exact: true }).click();
    await page.screenshot({ path: `${out}/${mode}-${width}-consent.png` });
    await page.evaluate(() => { document.cookie = "_ga=TEST; Path=/; SameSite=Lax"; });
    await Promise.all([page.waitForEvent("load"), page.getByRole("button", { name: "Reject analytics", exact: true }).click()]);
    await page.getByRole("button", { name: "Analytics preferences", exact: true }).waitFor();
    assert.equal(await page.locator("#oqc-google-analytics").count(), 0);
    assert.equal((await page.context().cookies()).some(cookie => cookie.name === "_ga"), false);
    assert.equal(vendorLoads.length, 1);
    report.cases.push({ mode, width, beforeConsentLoads: 0, loaderCount: 1, pageViews: 3, savedLeadEvents: 1, contactClicks: 1, piiExcluded: true, adConsentDenied: true, revocationReload: true });
  } finally { await browser.close(); }
}
assert.deepEqual(report.browserErrors, []); assert.equal(report.realGoogleRequests, 0); assert.equal(report.formSubmissions, 0);
writeFileSync(`${out}/summary.json`, JSON.stringify(report, null, 2)); console.log(JSON.stringify(report, null, 2));
