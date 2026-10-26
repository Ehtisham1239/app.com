// Anonymous browser checks only; no staff credentials, database writes or forms.
import assert from 'node:assert/strict';
import { auditPage, launchAuditBrowser } from './lib/browser-audit.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';

const base = process.argv[2], out = process.argv[3] || 'artifacts/staff-security';
const report = { base, errors: [], writes: 0, checks: [] };
mkdirSync(out, { recursive: true });
const a = await fetch(base + '/admin/login'), b = await fetch(base + '/admin/login');
const nonceA = a.headers.get('content-security-policy')?.match(/'nonce-([^']+)'/)?.[1];
const nonceB = b.headers.get('content-security-policy')?.match(/'nonce-([^']+)'/)?.[1];
assert.ok(nonceA && nonceB && nonceA !== nonceB);
assert.match(a.headers.get('cache-control'), /no-store/);
assert.equal(a.headers.get('x-frame-options'), 'DENY');
const html = await a.text();
assert.ok(html.includes(`nonce="${nonceA}"`), 'Next framework scripts receive the request nonce');
report.checks.push('fresh request nonces, non-cacheable staff response and nonced framework scripts');
const browser = await launchAuditBrowser();
let session;
try {
  session = await auditPage(browser, base, report, { viewport: { width: 390, height: 844 } });
  const page = session.page;
  await page.goto(base + '/admin/login', { waitUntil: 'load' });
  await page.getByLabel('Email', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Sign in', exact: true }).waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  // Inject into the parser-delivered document, not DevTools' privileged script
  // context. This models untrusted HTML rather than an already-trusted script.
  await session.context.route(base + '/admin/login?csp-probe=1', async route => {
    const response = await fetch(route.request().url());
    const headers = Object.fromEntries(response.headers);
    for (const key of ['content-length', 'content-encoding', 'transfer-encoding']) delete headers[key];
    const body = (await response.text()).replace('</body>', '<script>window.__oqcInlineProbe = true</script></body>');
    await route.fulfill({ status: response.status, headers, body });
  });
  await page.goto(base + '/admin/login?csp-probe=1', { waitUntil: 'load' });
  await page.getByLabel('Email', { exact: true }).waitFor();
  assert.notEqual(await page.evaluate(() => window.__oqcInlineProbe), true, 'nonce-less parser script must be blocked');
  report.checks.push('mobile login hydrates; injected inline script blocked by enforced CSP');
  await page.screenshot({ path: out + '/login-390.png' });
  const denied = await page.goto(base + '/admin/reports', { waitUntil: 'load' });
  assert.equal(new URL(page.url()).pathname, '/admin/login');
  assert.ok(denied.ok());
  report.checks.push('anonymous staff navigation still redirects to sign-in');
  assert.deepEqual(report.errors, []);
  assert.equal(report.writes, 0);
} finally { await session?.close(); await browser.close(); }
writeFileSync(out + '/summary.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
