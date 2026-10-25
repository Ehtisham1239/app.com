// Read-only regional acceptance checks. No enquiries, analytics calls or staff writes.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';

const base = (process.argv[2] || 'http://localhost:3012').replace(/\/$/, '');
const output = process.argv[3] || 'artifacts/market-agent';
mkdirSync(output, { recursive: true });
const report = { base, layouts: [], olderClockDatabase: false, unexpectedWrites: 0, browserErrors: [], transportErrors: [] };
try {
  for (const device of ['desktop', 'mobile']) {
    const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: process.env.CHROMIUM_ARGS_JSON ? JSON.parse(process.env.CHROMIUM_ARGS_JSON) : ['--no-sandbox'] });
    try {
      const page = await browser.newPage({ viewport: device === 'desktop' ? { width: 1440, height: 1000 } : { width: 390, height: 844 } });
      page.setDefaultNavigationTimeout(45000);
      page.on('pageerror', error => report.browserErrors.push(error.message));
      if (device === 'mobile') await page.addInitScript(() => {
        const Original = Intl.DateTimeFormat;
        function LegacyClockData(...args) {
          if (['America/Vancouver', 'America/Edmonton'].includes(args[1]?.timeZone)) throw new RangeError('Simulated old device zone database');
          return new Original(...args);
        }
        Object.setPrototypeOf(LegacyClockData, Original);
        LegacyClockData.prototype = Original.prototype;
        Intl.DateTimeFormat = LegacyClockData;
      });
      await page.route('**/*', async route => {
        const request = route.request(), url = new URL(request.url());
        if (!['GET', 'HEAD'].includes(request.method())) { report.unexpectedWrites++; return route.abort(); }
        if (url.hostname === 'app.hatchium.ai') return route.fulfill({ contentType: 'application/javascript', body: '/* QA stub */' });
        if (url.origin !== new URL(base).origin) return route.abort();
        if (!base.startsWith('https://')) return route.continue();
        try {
          const response = await fetch(request.url(), { method: request.method(), headers: await request.allHeaders(), redirect: 'manual', signal: AbortSignal.timeout(30000) });
          const headers = Object.fromEntries(response.headers); delete headers['content-length']; delete headers['content-encoding'];
          return route.fulfill({ status: response.status, headers, body: Buffer.from(await response.arrayBuffer()) });
        } catch (error) { report.transportErrors.push({ path: url.pathname, error: error.message }); return route.abort(); }
      });
      for (const [slug, language] of [['united-states', 'en-US'], ['united-kingdom', 'en-GB'], ['canada', 'en-CA'], ['australia', 'en-AU']]) {
        const response = await page.goto(base + '/locations/' + slug, { waitUntil: 'load' }); assert.equal(response.status(), 200);
        assert.equal(await page.locator('main [lang]').first().getAttribute('lang'), language);
        assert.equal(await page.locator('meta[property="og:locale"]').getAttribute('content'), language.replace('-', '_'));
        assert.equal(await page.locator('h1').count(), 1);
        if (['canada', 'united-kingdom'].includes(slug)) {
          await page.locator('#local-guide-title').scrollIntoViewIfNeeded();
          await page.screenshot({ path: `${output}/${device}-${slug}.png` });
          const links = page.locator('[aria-labelledby="local-guide-title"] a[href^="/"]');
          assert.equal(await links.count(), 2);
          assert.ok((await links.first().getAttribute('href')).includes(slug === 'canada' ? 'currency=CAD' : 'currency=GBP'));
        }
        if (slug === 'canada') {
          for (const [city, expected] of [['vancouver', '06:00'], ['calgary', '05:00'], ['st-johns', '02:30'], ['halifax', '03:00']]) {
            await page.getByLabel('City for time zone').selectOption(city);
            await page.getByLabel('Preferred lesson date').fill('2026-11-10');
            await page.getByLabel('Preferred local time').fill('18:00');
            await page.getByText(/College coordination time:/).filter({ hasText: expected }).waitFor();
          }
          if (device === 'mobile') report.olderClockDatabase = await page.evaluate(() => { try { new Intl.DateTimeFormat('en', { timeZone: 'America/Vancouver' }); return false; } catch { return true; } });
          await page.getByLabel('City for time zone').selectOption('vancouver');
          await page.getByRole('link', { name: 'Request a trial for Vancouver', exact: true }).click();
          await page.waitForURL('**/free-trial?**');
          const query = new URL(page.url()).searchParams;
          assert.equal(query.get('currency'), 'CAD'); assert.equal(query.get('lesson_timezone'), 'America/Vancouver'); assert.equal(query.get('lesson_date'), '2026-11-10');
        }
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        report.layouts.push({ device, slug, language }); console.log(`PASS ${device} ${slug}`);
      }
      await page.goto(base + '/', { waitUntil: 'load' });
      assert.equal(new URL(page.url()).pathname, '/'); assert.equal(await page.locator('#c-name,#t-name').count(), 0);
      assert.equal(await page.locator('.home-hero .hero-portrait img').getAttribute('src'), '/brand/hero.webp');
    } finally { await browser.close(); }
  }
  assert.equal(report.layouts.length, 8); assert.equal(report.olderClockDatabase, true);
  assert.equal(report.unexpectedWrites, 0); assert.deepEqual(report.browserErrors, []); assert.deepEqual(report.transportErrors, []);
} catch (error) { report.failure = error.message; throw error; }
finally { writeFileSync(output + '/summary.json', JSON.stringify(report, null, 2) + '\n'); }
console.log(JSON.stringify(report, null, 2));
