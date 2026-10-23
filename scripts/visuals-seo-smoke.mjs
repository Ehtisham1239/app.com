// Verified HTTPS bridge is for this executor's browser CA environment only.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const base = (process.argv[2] || 'http://localhost:3012').replace(/\/$/, '');
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const report = { base, pages: [], imageSitemap: false, homeFaqSchema: false, vendor: 'stubbed; no chat messages or forms submitted' };
try {
  for (const width of [320, 390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('https://**/*', async route => {
      const req = route.request();
      if (req.url().includes('app.hatchium.ai')) return route.fulfill({ contentType: 'text/javascript', body: '/* vendor stub */' });
      const r = await fetch(req.url(), { headers: await req.allHeaders(), redirect: 'manual' });
      const headers = Object.fromEntries(r.headers);
      delete headers['content-length']; delete headers['content-encoding'];
      await route.fulfill({ status: r.status, headers, body: Buffer.from(await r.arrayBuffer()) });
    });
    for (const path of ['/?view=global', '/about', '/contact', '/free-trial']) {
      await page.goto(base + path, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('main h1').count(), 1, path);
      assert.equal(await page.getByRole('link', { name: 'Chat with Online Quran College on WhatsApp', exact: true }).count(), 0);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      assert.equal(new URL(canonical).pathname, path.split('?')[0]);
      assert.ok((await page.locator('meta[name="description"]').getAttribute('content')).length > 90);
      assert.ok(await page.locator('meta[property="og:image"]').count());
      if (path === '/contact' || path === '/free-trial') {
        assert.equal(new URL(await page.locator('meta[property="og:url"]').getAttribute('content')).pathname, path);
        assert.ok((await page.locator('meta[property="og:image:alt"]').getAttribute('content')).length > 20);
      }
      const pictures = page.locator('main img[srcset^="/images/learning/"]:visible');
      assert.ok(await pictures.count(), `Missing images: ${path}`);
      const sources = [];
      for (const pic of await pictures.all()) {
        await pic.scrollIntoViewIfNeeded();
        await pic.evaluate(img => img.decode());
        const data = await pic.evaluate(img => ({ source: new URL(img.currentSrc).pathname, width: img.naturalWidth, alt: img.alt, lazy: img.loading }));
        assert.ok(data.width > 0 && data.alt.length > 20, path);
        assert.equal(data.lazy, 'lazy', 'Supporting images should not compete with the hero');
        sources.push(data.source);
      }
      if (path.startsWith('/?')) {
        assert.ok(sources.some(s => s.includes('family-online-quran-study')));
        const faq = await page.locator('script[type="application/ld+json"]').evaluateAll(scripts => scripts.map(s => JSON.parse(s.textContent)).find(s => s['@type'] === 'FAQPage'));
        assert.ok(faq.mainEntity.length > 0);
        for (const item of faq.mainEntity) {
          assert.ok(await page.getByText(item.name, { exact: true }).count());
          assert.ok(item.acceptedAnswer.text.length > 0);
        }
        report.homeFaqSchema = true;
        if (width === 390) { await page.locator('#about').scrollIntoViewIfNeeded(); await page.screenshot({ path: 'artifacts/professional-images-mobile.png' }); }
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, path);
      report.pages.push({ path, width, images: sources.length });
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
  const xml = await (await fetch(base + '/sitemap.xml')).text();
  assert.match(xml, /<image:loc>[^<]+\/images\/learning\/family-online-quran-study-1200.webp<\/image:loc>/);
  assert.doesNotMatch(xml, /<image:loc>[^<]+supabase\.co[^<]+\/generated\//);
  report.imageSitemap = true;
} finally { await browser.close(); }
console.log(JSON.stringify(report, null, 2));
