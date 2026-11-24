import { auditPage, launchAuditBrowser } from './lib/browser-audit.mjs';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';

const base = (process.argv[2] || 'http://127.0.0.1:3017').replace(/\/$/, '');
const expectedId = process.argv[3] || 'G-57TGPTDNT4';
const expectedGtm = process.env.OQC_EXPECTED_GTM || 'GTM-W7CMZS53';
// Owner decision 18 Nov 2026: a second container loads site-wide through the same loader. Set OQC_EXPECTED_GTM2='' to expect one container only.
const expectedAds = process.env.OQC_EXPECTED_ADS ?? 'AW-16564445897';
const expectedGtm2 = process.env.OQC_EXPECTED_GTM2 ?? 'GTM-52PTXDRF';
const out = process.argv[4] || 'artifacts/analytics-install';
const realLibrary = process.argv.includes('--real-google-script');
const report = { base, expectedId, mode: 'Owner-approved cookieless analytics; GTM owns GA4 when configured', cases: [], browserErrors: [], collectionRequestsBlocked: 0, formSubmissions: 0, googleLibrary: realLibrary ? 'Actual Google loader; collection and other external requests intercepted' : 'Inert vendor stubs; installation checks, not a GA4 reporting receipt or container-cookie audit' };
mkdirSync(out, { recursive: true });
for (const width of realLibrary ? [390] : [390, 1440]) {
  const browser = await launchAuditBrowser();
  let session;
  try {
    session = await auditPage(browser, base, report, { viewport: { width, height: 1000 }, googleLibrary: realLibrary ? 'real' : 'stub' });
    const { page } = session, loads = [];
    await page.addInitScript(() => { localStorage.setItem('oqc-analytics-consent-v1', '{"value":"granted","expires":9999999999999}'); document.cookie = '_ga=GA1.1.123.456; Path=/; SameSite=Lax'; });
    page.on('request', req => {
      const url = new URL(req.url());
      if (url.hostname === 'www.googletagmanager.com' && ['/gtag/js', '/gtm.js'].includes(url.pathname)) loads.push(url.href);
      if (url.origin === new URL(base).origin && !['GET', 'HEAD'].includes(req.method())) report.formSubmissions++;
    });
    await page.goto(base + '/contact', { waitUntil: 'load' });
    // A harmless interaction starts the deferred adapter; never submit an enquiry.
    await page.getByRole('heading', { level: 1 }).click();
    await page.waitForFunction(() => !!document.getElementById('oqc-google-analytics'));
    await page.waitForFunction(() => window.dataLayer?.some(item => item.event === 'oqc_page_view' || item[0] === 'event' && item[1] === 'page_view'));
    assert.equal(await page.getByRole('region', { name: 'Analytics preferences', exact: true }).count(), 0);
    // The containers start from the same idle callback; give both a moment to request before counting.
    for (let i = 0; i < 50 && loads.length < 1 + Number(Boolean(expectedGtm2)) && loads.some(href => href.includes('/gtm.js')); i++) await page.waitForTimeout(100);
    await page.waitForTimeout(500);
    const loaded = loads.map(href => new URL(href)), gtm = loaded.some(item => item.pathname === '/gtm.js');
    const loaderCount = loads.length;
    if (gtm) {
      assert.deepEqual(loaded.map(item => item.pathname), loaded.map(() => '/gtm.js'), 'No separate gtag/js loader beside Tag Manager');
      assert.deepEqual(loaded.map(item => item.searchParams.get('id')).sort(), [expectedGtm, expectedGtm2].filter(Boolean).sort(), 'Each configured container loads exactly once');
    } else {
      assert.equal(loaderCount, 1);
      assert.equal(loaded[0].searchParams.get('id'), expectedId);
    }
    await page.locator('header a[href="/"]').first().click();
    await page.waitForURL(url => url.pathname === '/');
    await page.waitForFunction(() => window.dataLayer.filter(item => item.event === 'oqc_page_view' || item[0] === 'event' && item[1] === 'page_view').length === 2);
    assert.equal(loads.length, loaderCount, 'No extra loader after a route change');
    const commands = await page.evaluate(() => window.dataLayer.filter(item => typeof item.length === 'number').map(item => Array.from(item)));
    const configurations = commands.filter(item => item[0] === 'config');
    if (gtm) {
      // Owner decision 18 Nov 2026: the site still pushes the Google Ads config command; GA4 stays inside the container.
      assert.equal(configurations.some(item => /^G-/.test(String(item[1]))), false, 'GTM must not be combined with direct GA4');
      assert.deepEqual(configurations.map(item => item[1]), expectedAds ? [expectedAds] : [], 'Only the Google Ads config is pushed beside Tag Manager');
      const settings = commands.find(item => item[0] === 'set')?.[1];
      assert.equal(settings?.client_storage, 'none');
      assert.equal(settings?.allow_google_signals, false);
    } else {
      assert.equal(configurations.length, 1);
      assert.equal(configurations[0][1], expectedId);
      assert.equal(configurations[0][2].send_page_view, false);
      assert.equal(configurations[0][2].client_storage, 'none');
      assert.equal(configurations[0][2].allow_google_signals, false);
    }
    const consent = commands.filter(item => item[0] === 'consent');
    assert.equal(consent[0][1], 'default');
    assert.equal(consent[0][2].analytics_storage, 'denied');
    assert.equal(consent.at(-1)[2].analytics_storage, 'granted');
    for (const item of consent) for (const key of ['ad_storage', 'ad_user_data', 'ad_personalization']) assert.equal(item[2][key], 'denied');
    const storage = await page.evaluate(() => ({ analyticsCookies: document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(n => /^_ga(?:_|$)/.test(n)), preference: localStorage.getItem('oqc-analytics-consent-v1') }));
    assert.deepEqual(storage.analyticsCookies, []);
    assert.equal(storage.preference, null);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    report.cases.push({ width, transport: gtm ? 'GTM' : 'GA4', loaderCount, routeViews: 2, noDuplicateTransport: true, analyticsGrantedWithClientStorageNone: true, adsDenied: true, legacyCookieRemoved: true, noBanner: true });
  } finally { await session?.close(); await browser.close(); }
}
assert.deepEqual(report.browserErrors, []);
if (!realLibrary) assert.equal(report.formSubmissions, 0);
writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
