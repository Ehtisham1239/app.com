import { auditPage, launchAuditBrowser } from './lib/browser-audit.mjs';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';

const base = (process.argv[2] || 'http://127.0.0.1:3017').replace(/\/$/, '');
const expectedId = process.argv[3] || 'G-57TGPTDNT4';
const out = process.argv[4] || 'artifacts/analytics-install';
const report = { base, expectedId, cases: [], browserErrors: [], realGoogleRequests: 0, formSubmissions: 0, googleLibrary: 'stubbed; this verifies installation, not a GA4 reporting receipt' };
mkdirSync(out, { recursive: true });
for (const width of [390, 1440]) {
  const browser = await launchAuditBrowser();
  try {
    const session = await auditPage(browser, base, report, { viewport: { width, height: 1000 } });
    const { page } = session;
    const loads = [];
    page.on('request', req => {
      const url = new URL(req.url());
      if (url.hostname === 'www.googletagmanager.com') loads.push(url.href);
      if (/google-analytics|doubleclick/.test(url.hostname)) report.realGoogleRequests++;
      if (!['GET', 'HEAD'].includes(req.method())) report.formSubmissions++;
    });
    await page.goto(base + '/contact', { waitUntil: 'load' });
    await page.getByRole('region', { name: 'Analytics preferences', exact: true }).waitFor();
    assert.equal(loads.length, 0);
    if (new URL(base).protocol === 'http:') {
      const heights = await page.getByRole('region', { name: 'Analytics preferences' }).getByRole('button').evaluateAll(buttons => buttons.map(button => button.getBoundingClientRect().height));
      assert.ok(heights.every(height => height >= 44), 'Consent buttons must remain usable on touch screens');
    }
    await page.getByRole('button', { name: 'Reject analytics', exact: true }).click();
    await page.reload({ waitUntil: 'load' });
    await page.getByRole('button', { name: 'Analytics preferences', exact: true }).waitFor();
    assert.equal(loads.length, 0);
    await page.getByRole('button', { name: 'Analytics preferences', exact: true }).click();
    await page.getByRole('button', { name: 'Allow analytics', exact: true }).click();
    await page.waitForFunction(id => document.getElementById('oqc-google-analytics')?.src.includes(id), expectedId);
    await page.waitForFunction(() => window.dataLayer.some(item => item[0] === 'event' && item[1] === 'page_view'));
    assert.equal(loads.length, 1);
    assert.equal(new URL(loads[0]).searchParams.get('id'), expectedId);
    await page.locator('header a[href="/"]').first().click();
    await page.waitForURL(url => url.pathname === '/');
    await page.waitForFunction(() => window.dataLayer.filter(item => item[0] === 'event' && item[1] === 'page_view').length === 2);
    const commands = await page.evaluate(() => window.dataLayer.map(item => typeof item.length === 'number' ? Array.from(item) : item));
    const configurations = commands.filter(item => item[0] === 'config');
    assert.equal(configurations.length, 1);
    assert.equal(configurations[0][1], expectedId);
    assert.equal(configurations[0][2].send_page_view, false);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.getByRole('button', { name: 'Analytics preferences', exact: true }).click();
    await Promise.all([page.waitForEvent('load'), page.getByRole('button', { name: 'Reject analytics', exact: true }).click()]);
    await page.getByRole('button', { name: 'Analytics preferences', exact: true }).waitFor();
    assert.equal(await page.locator('#oqc-google-analytics').count(), 0);
    assert.equal(loads.length, 1);
    await session.close();
    report.cases.push({ width, ownerId: expectedId, beforeConsentLoads: 0, loaderCount: 1, pageViews: 2, rejectionPersists: true, revocationStopsLoader: true });
  } finally { await browser.close(); }
}
assert.deepEqual(report.browserErrors, []);
assert.equal(report.realGoogleRequests, 0); assert.equal(report.formSubmissions, 0);
writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
