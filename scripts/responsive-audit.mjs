// Responsive audit of the live site (or SMOKE_BASE_URL): opens the main public
// pages at phone, tablet and desktop widths and fails when a page scrolls
// sideways, i.e. something is wider than the screen outside a scrollable box.
// Also checks the five country-hub hreflang cluster and that retired city pages
// permanently redirect to their country hub (owner decision, 16 Nov 2026). Screenshots at 390px go to RESPONSIVE_SHOTS_DIR when set.
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
  "/locations/united-kingdom", "/locations/united-states", "/locations/united-states/dallas", "/locations/canada", "/locations/australia", "/locations/united-arab-emirates",
];
const TABLE_PAGE = "/locations/united-states/dallas";
const HUBS = ["/locations/united-kingdom", "/locations/united-states", "/locations/canada", "/locations/australia", "/locations/united-arab-emirates"];
// Every city page is live on its own address and none redirects, city-states included
// (owner decisions 18 and 20 Nov 2026, #367).
const CITY_PAGES = [["/locations/united-states/houston", "/locations/united-states/houston"], ["/locations/united-kingdom/london", "/locations/united-kingdom/london"], ["/locations/monaco/monaco", "/locations/monaco/monaco"]];

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

// Production edge protection can return HTTP 429, and the host can return a brief
// 502/503/504 under load, when the full viewport matrix is requested quickly.
// Retry only those statuses with bounded backoff; 404/500 and persistent
// failures remain visible to the audit and are never converted into success.
const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);
export async function gotoWithRetry(page, url, { retryDelays = RATE_LIMIT_RETRY_DELAYS_MS } = {}) {
  let response;
  for (let attempt = 0; attempt <= retryDelays.length; attempt++) {
    response = await page.goto(url, { waitUntil: "load", timeout: 60_000 });
    if (!RETRYABLE_STATUSES.has(response?.status())) return response;
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

async function auditTableResponsiveness(page, width, failures) {
  const report = await page.evaluate(() => {
    const tables = [...document.querySelectorAll(".prose-oqc .article-table-scroll > table")];
    const wrappers = [...document.querySelectorAll(".prose-oqc .article-table-scroll")];
    const actual = {
      tableCount: tables.length,
      wrapperCount: wrappers.length,
      tables: tables.map((table) => ({
        display: getComputedStyle(table).display,
        rows: table.rows.length,
        columns: table.rows[0]?.cells.length || 0,
        parentOverflowX: getComputedStyle(table.parentElement).overflowX,
      })),
    };

    // Exercise genuinely wide tables in both the public renderer and CMS editor.
    // This verifies that horizontal scrolling stays inside the table wrapper at
    // phone, tablet, laptop and large desktop widths instead of widening the page.
    const makeWideTable = () => {
      const table = document.createElement("table");
      const row = document.createElement("tr");
      for (let index = 0; index < 20; index += 1) {
        const cell = document.createElement("th");
        cell.textContent = `Wide column ${index + 1}`;
        row.append(cell);
      }
      const head = document.createElement("thead");
      head.append(row);
      table.append(head);
      const body = document.createElement("tbody");
      const bodyRow = document.createElement("tr");
      for (let index = 0; index < 20; index += 1) {
        const cell = document.createElement("td");
        cell.textContent = `Column value ${index + 1}`;
        bodyRow.append(cell);
      }
      body.append(bodyRow);
      table.append(body);
      return table;
    };
    const publicProbe = document.createElement("div");
    publicProbe.className = "prose-oqc";
    publicProbe.style.cssText = "position:absolute;left:0;top:0;width:100%;max-width:100%;visibility:hidden;pointer-events:none";
    const publicWrapper = document.createElement("div");
    publicWrapper.className = "article-table-scroll";
    publicWrapper.append(makeWideTable());
    publicProbe.append(publicWrapper);

    const editorProbe = document.createElement("div");
    editorProbe.className = "rich-content";
    editorProbe.style.cssText = "position:absolute;left:0;top:0;width:100%;max-width:100%;visibility:hidden;pointer-events:none";
    const editorWrapper = document.createElement("div");
    editorWrapper.className = "tableWrapper";
    editorWrapper.append(makeWideTable());
    editorProbe.append(editorWrapper);
    document.body.append(publicProbe, editorProbe);

    const measure = (wrapper) => ({
      overflowX: getComputedStyle(wrapper).overflowX,
      clientWidth: wrapper.clientWidth,
      scrollWidth: wrapper.scrollWidth,
      containsOverflow: wrapper.scrollWidth > wrapper.clientWidth + 1,
    });
    const result = {
      actual,
      public: measure(publicWrapper),
      editor: measure(editorWrapper),
      viewportWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
    };
    publicProbe.remove();
    editorProbe.remove();
    return result;
  });

  if (report.actual.tableCount !== 2 || report.actual.wrapperCount !== 2) {
    failures.push(`${TABLE_PAGE} @${width}px: expected 2 real tables in 2 responsive wrappers, got ${report.actual.tableCount} tables / ${report.actual.wrapperCount} wrappers`);
  }
  const actualShape = report.actual.tables.map(({ rows, columns }) => [rows, columns]);
  if (JSON.stringify(actualShape) !== JSON.stringify([[5, 2], [4, 2]])) {
    failures.push(`${TABLE_PAGE} @${width}px: table rows/columns changed: ${JSON.stringify(actualShape)}`);
  }
  if (report.actual.tables.some((table) => table.display !== "table" || !["auto", "scroll"].includes(table.parentOverflowX))) {
    failures.push(`${TABLE_PAGE} @${width}px: a real table is not displayed as a table inside a horizontal scroll wrapper: ${JSON.stringify(report.actual.tables)}`);
  }
  for (const surface of ["public", "editor"]) {
    const item = report[surface];
    if (!["auto", "scroll"].includes(item.overflowX) || !item.containsOverflow) {
      failures.push(`${surface} wide table @${width}px: expected an internally scrollable wrapper, got ${JSON.stringify(item)}`);
    }
  }
  if (report.documentScrollWidth > report.viewportWidth + 1) {
    failures.push(`wide public/editor table @${width}px: table caused page overflow (${report.documentScrollWidth}px document / ${report.viewportWidth}px viewport)`);
  }
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
      if (path === TABLE_PAGE) await auditTableResponsiveness(page, width, failures);
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
    for (const path of ["/", "/pricing", "/free-trial", "/courses"]) {
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
  for (const [path, hub] of CITY_PAGES) {
    await auditedGoto(page, `${base}${path}`);
    checks++;
    if (new URL(page.url()).pathname !== hub) failures.push(`${path}: landed on ${new URL(page.url()).pathname}, expected ${hub}`);
  }
  await browser.close();
  console.log(`Responsive audit: ${checks} checks on ${base} (${PAGES.length} pages × ${WIDTHS.length} widths, ${DEVICE_PROFILES.length} device profiles, hreflang on ${HUBS.length} hubs, ${CITY_PAGES.length} city-page checks)`);
  if (failures.length) { console.log(`FAIL (${failures.length}):\n- ${failures.join("\n- ")}`); process.exit(1); }
  console.log("PASS: no sideways scrolling at any width; hreflang as expected; city pages stay on their own address");
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
