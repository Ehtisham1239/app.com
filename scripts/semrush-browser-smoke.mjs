// Read-only public regression checks. Never submits enquiries or uses staff data.
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";

const base = process.env.SMOKE_BASE_URL || "http://localhost:3012";
const out = process.env.SMOKE_OUTPUT || "artifacts/semrush/browser";
const sharedIcons = process.env.EXPECT_SHARED_ICONS !== "0";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", headless: true, args: process.env.CHROMIUM_ARGS_JSON ? JSON.parse(process.env.CHROMIUM_ARGS_JSON) : ["--no-sandbox", "--disable-dev-shm-usage"] });
const page = await browser.newPage();
const errors = [], checks = [];
page.on("pageerror", error => errors.push(error.message));
await page.route("https://app.hatchium.ai/**", route => route.abort());
try {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/courses", "/courses/noorani-qaida", "/locations/united-kingdom/london", "/pricing", "/contact", "/free-trial"]) {
      const response = await page.goto(base + path, { waitUntil: "networkidle" });
      assert.equal(response.status(), 200, path);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${path} overflow at ${width}`);
      const iconCount = await page.locator("svg.site-icon use").count();
      if (sharedIcons) {
        assert.ok(iconCount > 0, `${path} missing shared icons`);
        await page.waitForFunction(() => [...document.querySelectorAll("svg.site-icon")].some(svg => {
          const rectangle = svg.getBoundingClientRect();
          return rectangle.width > 0 && rectangle.height > 0 && svg.getBBox().width > 0;
        }));
      }
      const style = await page.locator(".course-card").first().count() ? await page.locator(".course-card h3").first().evaluate(node => {
        const css = getComputedStyle(node);
        return { fontSize: css.fontSize, lineHeight: css.lineHeight, color: css.color, fontWeight: css.fontWeight, width: Math.round(node.getBoundingClientRect().width) };
      }) : null;
      checks.push({ width, path, status: response.status(), iconCount, courseTitleStyle: style });
      if (["/", "/courses/noorani-qaida", "/locations/united-kingdom/london"].includes(path)) {
        await page.screenshot({ path: `${out}/${width}-${path === "/" ? "home" : path.split("/").at(-1)}.png`, fullPage: true });
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: "Areas", exact: true }).click();
  await page.waitForURL("**/locations");
  await page.goto(base + "/courses", { waitUntil: "networkidle" });
  if (sharedIcons) {
    const list = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.map(node => JSON.parse(node.textContent)).find(item => item["@type"] === "ItemList"));
    assert.equal(list.itemListElement.length, await page.locator(".course-card").count());
    await page.goto(base + "/courses/noorani-qaida", { waitUntil: "networkidle" });
    const course = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.map(node => JSON.parse(node.textContent)).find(item => item["@type"] === "Course"));
    assert.ok(course.name && course.description && course.provider.name);
    assert.equal("hasCourseInstance" in course, false);
  }
  await page.goto(base + "/pricing", { waitUntil: "networkidle" });
  await page.getByLabel("Display currency", { exact: true }).first().selectOption("NOK");
  await page.getByText("Ask for the fee in NOK").first().waitFor();
  await page.goto(base + "/admin");
  await page.waitForURL("**/admin/login");
  assert.deepEqual(errors, []);
  writeFileSync(`${out}/checks.json`, JSON.stringify({ checks, errors, menu: "passed", currency: "passed", protectedAdminRedirect: "passed", formsSubmitted: 0, limitations: "Chromium emulation with chat stubbed; no real-device Safari or authenticated staff workflows" }, null, 2));
  console.log(`PASS ${checks.length} route/viewport cases, visible glyphs, menu, currency, schema and admin redirect; no enquiries submitted.`);
} finally {
  await browser.close();
}
