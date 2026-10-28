import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { auditPage, launchAuditBrowser } from './lib/browser-audit.mjs';

const base = process.argv[2];
const out = process.argv[3] || 'artifacts/public-performance';
mkdirSync(out, { recursive: true });
const report = { base, errors: [], writes: 0, checks: [] };
const browser = await launchAuditBrowser();
try {
  for (const [width, deviceScaleFactor, expectedMark] of [[390, 3, 176], [1440, 1, 64]]) {
    const session = await auditPage(browser, base, report, { viewport: { width, height: 900 }, deviceScaleFactor });
    try {
      const { page } = session;
      await page.addInitScript(() => {
        const NativeObserver = window.IntersectionObserver;
        window.IntersectionObserver = class extends NativeObserver {
          constructor(callback, options) {
            super((entries, observer) => {
              if (entries.some(entry => entry.target.closest('#courses'))) window.__oqcObservedCourses = true;
              callback(entries, observer);
            }, options);
          }
        };
      });
      const response = await page.goto(base, { waitUntil: 'load' });
      assert.match(response.headers()['content-security-policy'], /script-src-attr 'none'/);
      const mark = page.locator('header img').first();
      await mark.evaluate(image => image.decode());
      assert.ok((await mark.evaluate(image => image.currentSrc)).endsWith(`/mark-v2-${expectedMark}.png`));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      // The new policy blocks DOM event-handler injection while React's
      // addEventListener-based controls continue to work.
      await page.evaluate(() => {
        window.__oqcHandlerBlocked = false;
        document.addEventListener('securitypolicyviolation', event => {
          if (event.effectiveDirective === 'script-src-attr') window.__oqcHandlerBlocked = true;
        });
        const probe = document.createElement('button');
        probe.setAttribute('onclick', 'window.__oqcHandlerExecuted = true');
        document.body.appendChild(probe);
        probe.click();
        probe.remove();
      });
      await page.waitForFunction(() => window.__oqcHandlerBlocked);
      assert.notEqual(await page.evaluate(() => window.__oqcHandlerExecuted), true);
      if (width === 390) {
        assert.equal(await page.locator('#mobile-navigation').count(), 0);
        const trigger = page.getByRole('button', { name: 'Open menu', exact: true });
        await trigger.click();
        await page.getByRole('button', { name: 'Close menu', exact: true }).waitFor();
        await page.keyboard.press('Escape');
        assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
        assert.equal(await trigger.evaluate(button => document.activeElement === button), true);
      } else {
        assert.equal(await page.locator('#desktop-course-links').count(), 0);
        const trigger = page.getByRole('button', { name: 'Courses', exact: true });
        await trigger.click();
        await page.locator('#desktop-course-links').waitFor({ state: 'visible' });
        await page.keyboard.press('Escape');
        assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
        assert.equal(await trigger.evaluate(button => document.activeElement === button), true);
      }
      assert.equal(await page.locator('.home-hero .home-reveal').count(), 0);
      await page.waitForFunction(() => window.__oqcObservedCourses);
      await page.locator('#courses h2').scrollIntoViewIfNeeded();
      await page.waitForFunction(() => document.querySelector('#courses .home-reveal'));
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(() => document.querySelectorAll('.home-reveal').length === 0);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `${out}/home-${width}.png` });
      report.checks.push({ width, deviceScaleFactor, markWidth: expectedMark, eventHandlerBlocked: true, reducedMotion: true, revealOnScroll: true, overflow: false });
    } finally { await session.close(); }
  }
  assert.deepEqual(report.errors, []);
  assert.equal(report.writes, 0);
} finally { await browser.close(); }
writeFileSync(`${out}/summary.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
