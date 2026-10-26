import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const base = (process.argv[2] || 'http://localhost:3012').replace(/\/$/, '');
const out = process.argv[3] || 'artifacts/mobile-visual-smoke';
mkdirSync(out, { recursive: true });
let browser;
const paths = ['/', '/courses', '/courses/noorani-qaida', '/locations', '/locations/united-states', '/locations/united-states/new-york', '/locations/united-kingdom/london', '/locations/australia/sydney', '/free-trial', '/contact'];
const report = { base, engine: 'Chromium viewport emulation, not physical Safari', widths: [320, 360, 390, 430, 768, 1024, 1440, 1920], pages: [], errors: [], formsSubmitted: false, chat: 'stubbed' };
try {
  for (const width of report.widths) {
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, headless: true, args: JSON.parse(process.env.CHROMIUM_ARGS_JSON || '["--no-sandbox"]') });
    const context = await browser.newContext({ viewport: { width, height: 980 }, deviceScaleFactor: 1, isMobile: width < 768, hasTouch: width < 1024 });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push({ width, message: error.message }));
    await page.route('**/*', route => route.request().url().includes('app.hatchium.ai') ? route.fulfill({ contentType: 'application/javascript', body: '/* deterministic vendor stub */' }) : route.continue());
    for (const path of paths) {
      const response = await page.goto(base + path, { waitUntil: 'load' });
      assert.equal(response.status(), 200, `${width} ${path}`);
      await page.evaluate(() => document.fonts.ready);
      await page.locator('footer').scrollIntoViewIfNeeded();
      await page.locator('footer img').evaluate(image => image.decode());
      assert.equal(await page.locator('h1').count(), 1, `${path}: h1`);
      const overflow = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
      assert.ok(overflow.scroll <= width + 1, `${width} ${path}: ${JSON.stringify(overflow)}`);
      const undersized = await page.locator('footer a').evaluateAll(links => links.filter(link => link.getBoundingClientRect().height < 43.5).map(link => link.textContent));
      assert.deepEqual(undersized, [], `${width} ${path}: footer touch targets`);
      assert.equal(await page.locator('img[src*="/map-"]').count(), 0, `${path}: map image still rendered`);
      const footerColour = await page.locator('footer').evaluate(footer => getComputedStyle(footer).backgroundImage);
      assert.match(footerColour, /gradient/);
      await page.evaluate(() => window.scrollTo(0, 0));
      if (path !== '/' && path !== '/free-trial' && path !== '/contact') {
        const hero = page.locator('[data-hero-visual] img');
        if (await hero.count()) {
          await hero.evaluate(image => image.decode());
          assert.ok(await hero.evaluate(image => image.naturalWidth > 0), `${path}: hero decode`);
        }
      }
      if (path === '/') {
        assert.equal(new URL(page.url()).pathname, '/');
        assert.equal(await page.locator('[role="dialog"][aria-modal="true"]:visible').count(), 0);
        assert.equal(await page.locator('.home-hero img').getAttribute('src'), '/brand/hero.webp');
      }
      if (width === 390 && ['/courses/noorani-qaida', '/locations/united-states', '/locations/united-kingdom/london'].includes(path)) await page.screenshot({ path: `${out}/${path.split('/').filter(Boolean).join('-')}-390.png` });
      report.pages.push({ width, path, status: response.status(), overflow: false });
    }
    await page.goto(base, { waitUntil: 'load' });
    await page.locator('footer').scrollIntoViewIfNeeded();
    if ([390, 768, 1440].includes(width)) await page.locator('footer').screenshot({ path: `${out}/footer-${width}.png` });
    if (width === 320) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.getByRole('button', { name: 'Open menu', exact: true }).click();
      await page.getByRole('dialog', { name: 'Menu', exact: true }).waitFor();
      await page.keyboard.press('Escape');
      assert.equal(await page.getByRole('button', { name: 'Open menu', exact: true }).getAttribute('aria-expanded'), 'false');
    }
    if (width === 1440) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.getByRole('navigation', { name: 'Main', exact: true }).getByRole('button', { name: 'Courses', exact: true }).click();
      await page.locator('#desktop-course-links a').first().click();
      await page.waitForURL('**/courses/noorani-qaida');
    }
    await context.close();
    await browser.close();
  }
  assert.deepEqual(report.errors, []);
} finally { await browser?.close(); writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2)); }
console.log(JSON.stringify({ checks: report.pages.length, errors: report.errors.length, out }));
