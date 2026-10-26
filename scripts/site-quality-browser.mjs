import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { auditOrigin } from './lib/audit-origin.mjs';
import { auditPage, launchAuditBrowser, loadedImage } from './lib/browser-audit.mjs';

const base = auditOrigin(process.argv[2]).origin, out = process.argv[3] || 'artifacts/site-quality';
mkdirSync(out, { recursive: true });
const paths = ['/', '/courses', '/courses/noorani-qaida', '/locations', '/locations/united-states', '/locations/united-kingdom/london', '/pricing', '/free-trial', '/contact', '/blog', '/blog?page=2', '/blog/help-your-kids-learn-quran-online'];
const report = { base, widths: [320, 390, 768, 1440], pages: [], journeys: [], errors: [], writes: 0, vendorCode: 'stubbed; no real analytics events or enquiries', coverage: 'Chromium viewport emulation; not physical Safari or field CWV' };
const noOverflow = async (page, label) => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${label}: horizontal overflow`);

try {
  for (const width of report.widths) {
    const browser = await launchAuditBrowser();
    const session = await auditPage(browser, base, report, { viewport: { width, height: 900 }, isMobile: width < 768, hasTouch: width < 1024 });
    const { page } = session;
    try {
      for (const path of paths) {
        console.log(`Checking ${width}px ${path}`);
        const response = await page.goto(base + path, { waitUntil: 'load' });
        assert.equal(response.status(), 200, `${width} ${path}`);
        assert.equal(await page.locator('h1').count(), 1, `${path}: h1`);
        await noOverflow(page, `${width} ${path}`);
        if (await page.locator('main img').count() && await page.locator('main img').first().isVisible()) await loadedImage(page, 'main img');
        if (width === 390 && ['/', '/blog', '/free-trial', '/blog/help-your-kids-learn-quran-online'].includes(path)) {
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
          await page.screenshot({ path: `${out}/${path === '/' ? 'home' : path.replaceAll('/', '_')}-390.png` });
        }
        await loadedImage(page, 'footer img');
        const small = await page.locator('footer a').evaluateAll(links => links.filter(link => link.getBoundingClientRect().height < 43.5).map(link => link.textContent));
        assert.deepEqual(small, [], `${path}: footer targets`);
        assert.equal(await page.locator('img[src*="/map-"]').count(), 0);
        report.pages.push({ width, path, status: response.status(), overflow: false, heroAndFooterDecoded: true });
      }
      if (width < 768) {
        await page.goto(base, { waitUntil: 'load' });
        const trigger = page.getByRole('button', { name: 'Open menu', exact: true });
        assert.ok((await trigger.boundingBox()).height >= 44);
        await trigger.click();
        const close = page.getByRole('button', { name: 'Close menu', exact: true });
        assert.ok((await close.boundingBox()).height >= 44);
        await page.keyboard.press('Escape');
        assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
        assert.equal(await trigger.evaluate(button => document.activeElement === button), true);
        await page.evaluate(() => { document.documentElement.style.fontSize = '32px'; });
        await noOverflow(page, `${width}: 200% text`);
        await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
        report.journeys.push({ width, menuTouchTargets: true, escapeAndFocus: true, text200Percent: true });
      }
      if ([390, 1440].includes(width)) {
        await page.goto(base + '/free-trial', { waitUntil: 'load' });
        const reject = page.getByRole('button', { name: 'Reject analytics', exact: true });
        if (await reject.count()) await reject.click();
        await page.getByRole('button', { name: 'Book my free trial', exact: true }).click();
        await page.locator('#q-learner_name-error').waitFor();
        assert.equal(await page.locator('#q-learner_name').evaluate(input => document.activeElement === input), true);
        await page.locator('#q-learner_name').fill('Local QA Learner');
        await page.getByRole('button', { name: 'Adult (18+)', exact: true }).click();
        await page.locator('#q-country').selectOption('United States');
        await page.locator('#q-zone').selectOption('America/Los_Angeles');
        await page.locator('#q-email').fill('local-qa@example.invalid');
        await page.locator('#q-phone').fill('+12025550123');
        assert.equal(await page.locator('#q-zone').inputValue(), 'America/Los_Angeles');
        assert.equal(await page.locator('#q-email').inputValue(), 'local-qa@example.invalid');
        assert.equal(await page.locator('form button[type="submit"]').count(), 1);
        await noOverflow(page, `${width}: one-step trial`);
        report.journeys.push({ width, oneStepTrial: true, invalidSubmissionBlocked: true, firstErrorFocused: true, timeZoneChoice: true, finalSubmission: 'not performed' });
      }
    } finally { await session.close(); await browser.close(); }
    console.log(`Verified ${width}px (${report.pages.length} page cases)`);
  }
  // Article body, navigation and resource links remain readable without JS.
  const browser = await launchAuditBrowser();
  const session = await auditPage(browser, base, report, { javaScriptEnabled: false });
  try {
    await session.page.goto(base + '/blog/help-your-kids-learn-quran-online', { waitUntil: 'load' });
    assert.ok((await session.page.locator('.prose-oqc').innerText()).length > 1000);
    assert.ok(await session.page.locator('article a[href^="/courses/"]').count() > 0);
    report.noJavaScriptArticle = true;
  } finally { await session.close(); await browser.close(); }
  assert.deepEqual(report.errors, []);
  assert.equal(report.writes, 0);
} finally { writeFileSync(`${out}/browser.json`, JSON.stringify(report, null, 2)); }
console.log(JSON.stringify({ viewportCases: report.pages.length, journeys: report.journeys.length, errors: report.errors.length, writes: report.writes }));
