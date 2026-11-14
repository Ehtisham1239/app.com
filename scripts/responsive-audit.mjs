// Responsive audit of the live site (or SMOKE_BASE_URL): opens the main public
// pages at phone, tablet and desktop widths and fails when a page scrolls
// sideways, i.e. something is wider than the screen outside a scrollable box.
// Also checks the country-hub hreflang cluster, that the owner-approved city
// pages are indexable and that other cities stay noindex,follow (owner decision,
// 11 Nov 2026: APPROVED_CITY_PAGES in src/lib/locations.js, pinned by
// tests/location-indexing.test.mjs). Screenshots at 390px go to RESPONSIVE_SHOTS_DIR when set.
import { chromium, devices } from "playwright";
import { mkdirSync } from "node:fs";

const base = (process.env.SMOKE_BASE_URL || "https://www.onlinequrancollege.com").replace(/\/$/, "");
const shots = process.env.RESPONSIVE_SHOTS_DIR || "";
const WIDTHS = [320, 360, 390, 430, 768, 820, 1024, 1280, 1440, 1600, 1920, 2560];
const DEVICE_PROFILES = ["iPhone 13", "iPhone 14 Pro Max", "Pixel 7", "iPad Pro 11"];
export const PAGES = [
  "/", "/courses", "/courses/hifz-quran", "/courses/noorani-qaida", "/pricing", "/free-trial", "/teachers",
  "/reviews", "/learn", "/learn/quran-for-adults", "/blog", "/blog/online-quran-class-fees-uk-comparison",
  "/faq", "/about", "/contact", "/locations",
  "/locations/united-kingdom", "/locations/united-states", "/locations/canada", "/locations/australia", "/locations/united-arab-emirates",
  "/locations/united-states/houston", "/locations/australia/perth", "/locations/australia/melbourne",
];
const HUBS = ["/locations/united-kingdom", "/locations/united-states", "/locations/canada", "/locations/australia", "/locations/united-arab-emirates"];
const CITY_PAGES = ["/locations/united-states/houston", "/locations/australia/perth", "/locations/australia/melbourne", "/locations/united-states/new-york", "/locations/australia/sydney"];
// A city outside the owner-approved list must stay noindex.
const NOINDEX_CITY_PAGES = ["/locations/united-kingdom/london", "/locations/canada/toronto"];

// Runs in the page: elements that stick out past the right edge and are not
// inside a box that scrolls or clips horizontally.
function overflowReport() {
  const width = document.documentElement.clientWidth;
  const scrollWidth = document.documentElement.scrollWidth;
  const clipped = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const o = getComputedStyle(p).overflowX;
      if (o === "auto" || o === "scroll" || o === "hidden" || o === "clip") return true;
    }
    return false;
  };
  const offenders = [];
  for (const el of document.body.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (!r.width || r.right <= width + 1 || clipped(el)) continue;
    const s = getComputedStyle(el);
    if (s.position === "fixed" || s.visibility === "hidden" || s.display === "none") continue;
    offenders.push({ tag: el.tagName.toLowerCase(), cls: String(el.className || "").slice(0, 80), text: (el.textContent || "").trim().slice(0, 50), right: Math.round(r.right) });
    if (offenders.length >= 5) break;
  }
  return { width, scrollWidth, offenders };
}

const RATE_LIMIT_RETRY_DELAYS_MS = [2_000, 5_000, 10_000];

// Production edge protection can return HTTP 429 when the full viewport matrix
// is requested too quickly. Retry only 429 responses; other HTTP failures remain
// visible to the audit and are never converted into success.
export async function gotoWithRetry(page, url, { retryDelays = RATE_LIMIT_RETRY_DELAYS_MS } = {}) {
  let response;
  for (let attempt = 0; attempt <= retryDelays.length; attempt++) {
    response = await page.goto(url, { waitUntil: "load", timeout: 60_000 });
    if (response?.status() !== 429) return response;
    if (attempt < retryDelays.length) await page.waitForTimeout(retryDelays[attempt]);
  }
  return response;
}

// Keep the existing full audit matrix, but pace requests so the audit does not
// create its own rate-limit failures on the public production host.
async function auditedGoto(page, url) {
  const response = await gotoWithRetry(page, url);
  await page.waitForTimeout(800);
  return response;
}

async function main() {
  if (shots) mkdirSync(shots, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  const failures = [];
  let checks = 0;
  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width < 768, hasTouch: width < 768, deviceScaleFactor: 1 });
    const page = await context.newPage();
    for (const path of PAGES) {
      const response = await auditedGoto(page, `${base}${path}`);
      if (!response || response.status() !== 200) { failures.push(`${path} @${width}px: HTTP ${response?.status()}`); continue; }
      await page.waitForTimeout(400);
      const report = await page.evaluate(overflowReport);
      checks++;
      if (report.scrollWidth > report.width + 1) {
        failures.push(`${path} @${width}px: page is ${report.scrollWidth}px wide on a ${report.width}px screen; ${report.offenders.map((o) => `<${o.tag} class="${o.cls}"> "${o.text}" ends at ${o.right}px`).join(" | ") || "offender not identified"}`);
      }
      if (width === 390 && shots) await page.screenshot({ path: `${shots}/${(path.replace(/\//g, "_") || "_home")}-390.png`, fullPage: true });
    }
    await context.close();
  }
  // Real browser device descriptors complement width-only desktop checks.
  // These exercise iOS Safari-like and Android touch/mobile viewports.
  for (const deviceName of DEVICE_PROFILES) {
    const descriptor = devices[deviceName];
    if (!descriptor) { failures.push(`Playwright device descriptor missing: ${deviceName}`); continue; }
    const context = await browser.newContext({ ...descriptor });
    const devicePage = await context.newPage();
    for (const path of ["/", "/pricing", "/free-trial", "/locations/united-states"]) {
      const response = await auditedGoto(devicePage, `${base}${path}`);
      if (!response || response.status() !== 200) { failures.push(`${path} on ${deviceName}: HTTP ${response?.status()}`); continue; }
      const report = await devicePage.evaluate(overflowReport);
      checks++;
      if (report.scrollWidth > report.width + 1) failures.push(`${path} on ${deviceName}: page is ${report.scrollWidth}px wide on a ${report.width}px device`);
    }
    await context.close();
  }
  const page = await browser.newPage();
  for (const path of HUBS) {
    await auditedGoto(page, `${base}${path}`);
    const langs = await page.$$eval('link[rel="alternate"][hreflang]', (els) => els.map((e) => `${e.getAttribute("hreflang")}=${new URL(e.href).pathname}`).sort());
    const want = ["en-AE=/locations/united-arab-emirates", "en-AU=/locations/australia", "en-CA=/locations/canada", "en-GB=/locations/united-kingdom", "en-US=/locations/united-states", "x-default=/locations"];
    checks++;
    if (JSON.stringify(langs) !== JSON.stringify(want)) failures.push(`${path}: hreflang ${JSON.stringify(langs)}`);
  }
  for (const path of CITY_PAGES) {
    await auditedGoto(page, `${base}${path}`);
    const robots = await page.$eval('meta[name="robots"]', (m) => m.content).catch(() => "");
    checks++;
    if (!/^index\b/.test(robots) || /\bnofollow\b/.test(robots)) failures.push(`${path}: robots "${robots}" (approved city: expected index, follow)`);
  }
  for (const path of NOINDEX_CITY_PAGES) {
    await auditedGoto(page, `${base}${path}`);
    const robots = await page.$eval('meta[name="robots"]', (m) => m.content).catch(() => "");
    checks++;
    if (!/^noindex\b/.test(robots) || !/\bfollow\b/.test(robots) || /\bnofollow\b/.test(robots)) failures.push(`${path}: robots "${robots}" (unapproved city: expected noindex, follow)`);
  }
  await browser.close();
  console.log(`Responsive audit: ${checks} checks on ${base} (${PAGES.length} pages × ${WIDTHS.length} widths, ${DEVICE_PROFILES.length} device profiles, hreflang on ${HUBS.length} hubs, robots on ${CITY_PAGES.length + NOINDEX_CITY_PAGES.length} city pages)`);
  if (failures.length) { console.log(`FAIL (${failures.length}):\n- ${failures.join("\n- ")}`); process.exit(1); }
  console.log("PASS: no sideways scrolling at any width; hreflang as expected; approved city pages indexable, other cities noindex,follow");
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
