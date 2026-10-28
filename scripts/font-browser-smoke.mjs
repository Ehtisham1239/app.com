import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { auditPage, launchAuditBrowser } from './lib/browser-audit.mjs';
const base = process.argv[2], out = process.argv[3] || 'artifacts/font-browser';
mkdirSync(out, { recursive: true });
const report = { errors: [], writes: 0, cases: [] };
const browser = await launchAuditBrowser();
try {
  for (const width of [320, 390, 1440]) {
    const session = await auditPage(browser, base, report, { viewport: { width, height: 900 } });
    const { page } = session;
    try {
      await page.goto(base, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      const resources = await page.evaluate(() => performance.getEntriesByType('resource').map(r => r.name));
      assert.ok(resources.some(url => url.includes('oqc_inter_text_v1')));
      assert.ok(resources.some(url => url.includes('oqc_outfit_text_v1')));
      assert.equal(resources.some(url => /\/(?:inter|outfit)_latin_wght/.test(url)), false, 'common homepage must not download the complete Latin fallbacks');
      assert.equal(resources.some(url => /\/locations\/(?:united-states|united-kingdom|canada|australia)\?_rsc=/.test(url)), false, 'country planners must wait for navigation intent');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      const sizes = await page.locator('header .header-brand span').evaluateAll(nodes => nodes.filter(n => n.textContent.trim() === 'College').map(n => parseFloat(getComputedStyle(n).fontSize)));
      assert.ok(sizes.some(size => size >= 12));
      // These less common Latin glyphs are deliberately outside the common
      // subset. Confirm that the original brand faces are still available.
      await page.evaluate(async () => {
        for (const [family, text] of [['var(--font-sans)', 'Þýÿ'], ['var(--font-display)', 'Œœ']]) {
          const span = document.createElement('span'); span.textContent = text;
          span.style.fontFamily = family; document.body.appendChild(span);
          span.getBoundingClientRect(); await document.fonts.ready; span.remove();
        }
      });
      const withFallback = await page.evaluate(() => performance.getEntriesByType('resource').map(r => r.name));
      assert.ok(withFallback.some(url => url.includes('inter_latin_wght')));
      assert.ok(withFallback.some(url => url.includes('outfit_latin_wght')));
      await page.screenshot({ path: `${out}/home-${width}.png` });
      const trial = page.locator('.hero-actions a[href="/free-trial"]');
      const prefetch = page.waitForRequest(request => new URL(request.url()).pathname === '/free-trial');
      await trial.focus(); await prefetch;
      await trial.click(); await page.waitForURL(url => url.pathname === '/free-trial');
      await page.locator('#q-learner_name').waitFor();
      report.cases.push({ width, commonFacesOnlyInitially: true, latinFallbacksLoadOnDemand: true, overflow: false, labelsAtLeast12px: true });
    } finally { await session.context.close(); }
  }
  assert.deepEqual(report.errors, []); assert.equal(report.writes, 0);
} finally { await browser.close(); }
writeFileSync(`${out}/summary.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
