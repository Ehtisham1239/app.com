import { chromium } from 'playwright';
import { auditOrigin } from './audit-origin.mjs';

export function launchAuditBrowser() {
  return chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: JSON.parse(process.env.CHROMIUM_ARGS_JSON || '["--no-sandbox"]') });
}

// Keep Next's RSC/router headers. Let Node request identity encoding so a proxy
// cannot return Chromium-only compression to route.fulfill's decoded response.
// This bridge uses the trusted host TLS path; it never disables certificates.
export async function auditPage(browser, base, report, options = {}) {
  const origin = auditOrigin(base).origin;
  const { googleLibrary = 'stub', ...contextOptions } = options;
  const context = await browser.newContext(contextOptions);
  const pendingRequests = new AbortController();
  let closing = false;
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.setDefaultNavigationTimeout(30000);
  const errors = report.errors || report.browserErrors;
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    const url = new URL(response.url());
    if (url.origin === origin && response.status() >= 400 && ['stylesheet', 'script', 'font', 'image'].includes(response.request().resourceType())) errors.push(`Asset ${url.pathname}: HTTP ${response.status()}`);
  });
  await context.route('**/*', async route => {
    const req = route.request(), url = new URL(req.url());
    try {
      if (/google-analytics\.com$|doubleclick\.net$/.test(url.hostname)) {
        report.collectionRequestsBlocked = (report.collectionRequestsBlocked || 0) + 1;
        return await route.fulfill({ status: 204, body: '' });
      }
      if (url.hostname === 'www.googletagmanager.com' && googleLibrary === 'real' && (url.pathname.startsWith('/gtag/') || url.pathname === '/gtm.js')) {
        const response = await fetch(url.href, { headers: { 'accept-encoding': 'identity' }, signal: AbortSignal.any([pendingRequests.signal, AbortSignal.timeout(25000)]) });
        if (!response.ok) throw Error(`Google JavaScript: HTTP ${response.status}`);
        return await route.fulfill({ contentType: 'application/javascript', body: await response.text() });
      }
      if (['app.hatchium.ai', 'www.googletagmanager.com'].includes(url.hostname)) return await route.fulfill({ contentType: 'application/javascript', body: '/* inert vendor QA stub */' });
      if (url.origin !== origin) return await route.abort();
      if (url.protocol === 'http:' && url.pathname.startsWith('/_vercel/speed-insights/')) return await route.fulfill({ contentType: 'application/javascript', body: '/* Vercel-only endpoint: inert local QA stub */' });
      if (!['GET', 'HEAD'].includes(req.method())) { report.writes = (report.writes || 0) + 1; return await route.abort(); }
      if (url.protocol === 'http:') return await route.continue();
      const headers = { ...(await req.allHeaders()), 'accept-encoding': 'identity' };
      delete headers.host; delete headers.connection;
      const response = await fetch(req.url(), { method: req.method(), headers, redirect: 'manual', signal: AbortSignal.any([pendingRequests.signal, AbortSignal.timeout(25000)]) });
      if ([401, 403, 429].includes(response.status)) throw Error(`Access/rate wall: ${url.pathname} (${response.status})`);
      const responseHeaders = Object.fromEntries(response.headers);
      for (const key of ['content-length', 'content-encoding', 'transfer-encoding']) delete responseHeaders[key];
      const body = Buffer.from(await response.arrayBuffer());
      await route.fulfill({ status: response.status, headers: responseHeaders, body });
    } catch (error) {
      if (!closing && !page.isClosed() && browser.isConnected()) errors.push(`Request ${url.pathname}: ${error.message}`);
      try { await route.abort(); } catch { /* A closed page has no pending route. */ }
    }
  });
  return { context, page, close: async () => {
    // Assertions have finished. Cancel prefetches rather than waiting for router
    // background requests to drain indefinitely during context teardown.
    closing = true;
    pendingRequests.abort();
    await context.unrouteAll({ behavior: 'ignoreErrors' });
    await context.close();
  } };
}

export async function loadedImage(page, selector) {
  await page.locator(selector).first().scrollIntoViewIfNeeded();
  // Native lazy images can have an empty currentSrc immediately after scrolling.
  // Wait for the request to start/finish before invoking decode().
  await page.waitForFunction(selector => {
    const image = document.querySelector(selector);
    return image?.complete && image.naturalWidth > 0;
  }, selector);
  await page.locator(selector).first().evaluate(image => image.decode());
}
