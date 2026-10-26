import { auditPage, launchAuditBrowser } from './lib/browser-audit.mjs';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';

const base = (process.argv[2] || 'http://127.0.0.1:3017').replace(/\/$/, '');
const expectedId = process.argv[3] || 'G-57TGPTDNT4';
const out = process.argv[4] || 'artifacts/analytics-install';
const realLibrary = process.argv.includes('--real-google-script');
const report = { base, expectedId, mode: 'GA4 with Google storage denied', cases: [], browserErrors: [], collectionRequestsBlocked: 0, formSubmissions: 0, googleLibrary: realLibrary ? 'Actual public gtag JavaScript; all collection requests intercepted, no data sent to Google collectors' : 'Inert stub; verifies installation/controller, not GA4 reporting or vendor cookie behaviour' };
mkdirSync(out, { recursive: true });
for (const width of realLibrary ? [390] : [390, 1440]) {
  const browser = await launchAuditBrowser();
  let session;
  try {
    session = await auditPage(browser, base, report, { viewport: { width, height: 1000 }, googleLibrary: realLibrary ? 'real' : 'stub' });
    const { page } = session, loads = [];
    await page.addInitScript(() => { localStorage.setItem('oqc-analytics-consent-v1', '{"value":"granted","expires":9999999999999}'); document.cookie = '_ga=GA1.1.123.456; Path=/; SameSite=Lax'; });
    page.on('request', req => { const url = new URL(req.url()); if (url.hostname === 'www.googletagmanager.com' && url.pathname === '/gtag/js') loads.push(url.href); if (url.origin === new URL(base).origin && !['GET', 'HEAD'].includes(req.method())) report.formSubmissions++; });
    await page.goto(base + '/contact', { waitUntil: 'load' });
    await page.waitForFunction(id => document.getElementById('oqc-google-analytics')?.src.includes(id), expectedId);
    await page.waitForFunction(() => window.dataLayer.some(item => item[0] === 'event' && item[1] === 'page_view'));
    assert.equal(await page.getByRole('region', { name: 'Analytics preferences', exact: true }).count(), 0);
    assert.equal(loads.length, 1);
    assert.equal(new URL(loads[0]).searchParams.get('id'), expectedId);
    await page.locator('header a[href="/"]').first().click();
    await page.waitForURL(url => url.pathname === '/');
    await page.waitForFunction(() => window.dataLayer.filter(item => item[0] === 'event' && item[1] === 'page_view').length === 2);
    const commands = await page.evaluate(() => window.dataLayer.filter(item => typeof item.length === 'number').map(item => Array.from(item)));
    const configurations = commands.filter(item => item[0] === 'config');
    assert.equal(configurations.length, 1); assert.equal(configurations[0][1], expectedId);
    assert.equal(configurations[0][2].send_page_view, false);
    assert.equal(configurations[0][2].allow_google_signals, false);
    const consent = commands.filter(item => item[0] === 'consent');
    assert.ok(consent.length >= 2);
    for (const item of consent) for (const key of ['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization']) assert.equal(item[2][key], 'denied');
    const storage = await page.evaluate(() => ({ analyticsCookies: document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(n => /^_ga(?:_|$)/.test(n)), preference: localStorage.getItem('oqc-analytics-consent-v1') }));
    assert.deepEqual(storage.analyticsCookies, []); assert.equal(storage.preference, null);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    report.cases.push({ width, ownerId: expectedId, loaderCount: 1, manualPageViews: 2, googleStorageAlwaysDenied: true, legacyCookieRemoved: true, noAnalyticsCookieObserved: true, noBanner: true });
  } finally { await session?.close(); await browser.close(); }
}
assert.deepEqual(report.browserErrors, []);
// In the real-library case Google may attempt POST pings, but the bridge replies
// locally. No enquiries are ever submitted and no collector request leaves QA.
if (!realLibrary) assert.equal(report.formSubmissions, 0);
writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
