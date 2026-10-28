// Public read-only checks for the search settings/learning-hub release.
// Vendors and all writes are intercepted by auditPage; no real enquiry is sent.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { auditPage, launchAuditBrowser } from "./lib/browser-audit.mjs";

const base = (process.argv[2] || "http://127.0.0.1:3012").replace(/\/$/, "");
const out = process.argv[3] || "artifacts/search-readiness";
mkdirSync(out, { recursive: true });
const report = { base, cases: [], browserErrors: [], formSubmissions: 0, scope: "Rendered public content, schema agreement and navigation; not search rankings, Google ownership or actual GA4 delivery." };
const browser = await launchAuditBrowser();
try {
  for (const width of [320, 390, 1440]) {
    const session = await auditPage(browser, base, report, { viewport: { width, height: 1000 } });
    try {
      const { page } = session;
      await page.goto(`${base}/learn`, { waitUntil: "networkidle" });
      await page.getByRole("heading", { name: "Which Quran course should I start with?", exact: true }).waitFor();
      const details = await page.evaluate(() => {
        const root = document.documentElement;
        const list = [...document.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent)).find(node => node["@type"] === "ItemList");
        const anchors = [...document.querySelectorAll('nav[aria-label="On this learning guide"] a')].map(node => ({ href: node.getAttribute("href"), target: Boolean(document.querySelector(node.getAttribute("href"))) }));
        const resourceLinks = [...document.querySelectorAll("#learning-guides a, #practical-articles li a")].map(node => ({ path: node.getAttribute("href"), text: node.querySelector("h2")?.textContent || node.textContent.trim() }));
        return { overflow: root.scrollWidth > innerWidth, h1: document.querySelectorAll("h1").length, rows: document.querySelectorAll("table tbody tr").length, list, anchors, resourceLinks, trialTerms: document.querySelector("#before-enrolling").textContent };
      });
      assert.equal(details.overflow, false);
      assert.equal(details.h1, 1);
      assert.equal(details.rows, 6);
      assert.ok(details.anchors.every(anchor => anchor.target));
      assert.equal(details.list.numberOfItems, details.resourceLinks.length);
      for (const item of details.list.itemListElement) assert.ok(details.resourceLinks.some(link => new URL(item.url).pathname === link.path && link.text.includes(item.name)), `Schema resource not visible: ${item.name}`);
      assert.match(details.trialTerms, /Weekend plan is excluded/);
      await page.getByRole("link", { name: "Compare courses", exact: true }).click();
      assert.equal(new URL(page.url()).hash, "#course-comparison");
      const table = page.getByRole("region", { name: "Quran course comparison", exact: true });
      await table.focus();
      assert.equal(await table.evaluate(node => node === document.activeElement), true);
      await page.screenshot({ path: `${out}/learn-${width}.png`, fullPage: true });
      await page.getByRole("link", { name: "Request a three-day trial", exact: false }).click();
      await page.waitForURL("**/free-trial");
      await page.locator("#q-learner_name").waitFor();
      assert.equal(new URL(page.url()).pathname, "/free-trial");
      await page.goto(`${base}/locations/united-kingdom`, { waitUntil: "networkidle" });
      await page.getByRole("heading", { name: "Online Quran classes for children and adult beginners in the UK", exact: true }).waitFor();
      assert.equal(await page.getByRole("link", { name: "Read the parent learning guide", exact: true }).getAttribute("href"), "/learn/quran-for-kids");
      await page.getByRole("link", { name: "Read the adult beginner guide", exact: true }).click();
      await page.waitForURL("**/learn/quran-for-adults");
      await page.getByRole("heading", { name: "Quran Learning for Adult Beginners", exact: true }).waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      report.cases.push({ width, comparisonRows: details.rows, linkedResources: details.resourceLinks.length, schemaMatchesVisibleResources: true, validJumpLinks: true, tableKeyboardAccessible: true, trialDestination: "/free-trial", ukAdultGuideNavigation: true, overflow: false });
    } finally { await session.context.close(); }
  }
  const session = await auditPage(browser, base, report, { viewport: { width: 390, height: 1000 }, javaScriptEnabled: false });
  try {
    await session.page.goto(`${base}/learn`, { waitUntil: "load" });
    assert.equal(await session.page.getByRole("heading", { name: "Which Quran course should I start with?", exact: true }).count(), 1);
    assert.equal(await session.page.locator("table tbody tr").count(), 6);
    report.withoutJavaScript = "Course comparison and text remain readable";
  } finally { await session.context.close(); }
} finally { await browser.close(); }
assert.deepEqual(report.browserErrors, []);
assert.equal(report.formSubmissions, 0);
writeFileSync(`${out}/summary.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
