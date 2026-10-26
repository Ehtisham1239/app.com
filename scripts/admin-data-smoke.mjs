// Real React/Chromium regression: delayed responses must not replace newer
// records, expose the previous record, turn null into an object, or survive unmount.
// Uses only in-memory requests; never connects to Supabase or sends staff data.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const fixture = `
import React, {StrictMode, useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {useLoad} from './src/lib/admin/db.js';
window.pending = [];
function Fixture() {
  const [record, select] = useState('one');
  const value = useLoad(() => new Promise(resolve => window.pending.push({record, resolve})), [record]);
  useEffect(() => { window.select = select; window.reload = value.reload; });
  return <output>{JSON.stringify({loading:value.loading, data:value.data, count:value.count, error:value.error?.message || null})}</output>;
}
const app = createRoot(document.getElementById('app'));
app.render(<StrictMode><Fixture /></StrictMode>);
window.unmount = () => app.unmount();
`;
const bundle = await build({
  stdin: { contents: fixture, resolveDir: root, sourcefile: 'admin-data-fixture.jsx', loader: 'jsx' },
  bundle: true, write: false, format: 'iife', define: { 'process.env.NODE_ENV': '"development"' },
  plugins: [{ name: 'isolated-public-imports', setup(builder) {
    builder.onResolve({ filter: /^@\/lib\/supabase\/browser$|^sonner$/ }, args => ({ path: args.path, namespace: 'in-memory' }));
    builder.onLoad({ filter: /.*/, namespace: 'in-memory' }, args => ({ contents: args.path === 'sonner' ? 'export const toast = {error(){}}' : 'export function getBrowserClient(){throw Error("Unexpected real database access")}' }));
    builder.onResolve({ filter: /^@\// }, args => ({ path: resolve(root, 'src', args.path.slice(2) + '.js') }));
  } }],
});
const server = createServer((request, response) => {
  if (request.url === '/fixture.js') { response.setHeader('content-type', 'application/javascript'); response.end(bundle.outputFiles[0].text); }
  else { response.setHeader('content-type', 'text/html'); response.end('<!doctype html><title>Isolated admin loading regression</title><div id="app"></div><script src="/fixture.js"></script>'); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: JSON.parse(process.env.CHROMIUM_ARGS_JSON || '["--no-sandbox"]') });
const checks = [], errors = [];
try {
  const page = await browser.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  const state = async () => JSON.parse(await page.locator('output').innerText());
  await page.waitForFunction(() => window.pending.length === 1);
  checks.push('Strict Mode starts one request');
  await page.evaluate(() => window.select('two'));
  await page.waitForFunction(() => window.pending.length === 2);
  assert.equal((await state()).data, null);
  await page.evaluate(() => window.pending[1].resolve({ data: { id: 'two' }, count: 1 }));
  await page.waitForFunction(() => document.querySelector('output').textContent.includes('"id":"two"'));
  await page.evaluate(() => window.pending[0].resolve({ data: { id: 'one' } }));
  await page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
  assert.equal((await state()).data.id, 'two');
  checks.push('late old response cannot replace newer record');
  await page.evaluate(() => window.select('empty'));
  await page.waitForFunction(() => window.pending.length === 3);
  assert.deepEqual(await state(), { loading: true, data: null, count: null, error: null });
  await page.evaluate(() => window.pending[2].resolve({ data: null, count: 0 }));
  await page.waitForFunction(() => document.querySelector('output').textContent.includes('"loading":false'));
  assert.deepEqual(await state(), { loading: false, data: null, count: 0, error: null });
  checks.push('empty record remains null and previous data never leaks');
  await page.evaluate(() => window.select('error'));
  await page.waitForFunction(() => window.pending.length === 4);
  await page.evaluate(() => window.pending[3].resolve({ error: { message: 'Temporary failure' } }));
  await page.waitForFunction(() => document.querySelector('output').textContent.includes('Temporary failure'));
  await page.evaluate(() => { void window.reload(); });
  await page.waitForFunction(() => window.pending.length === 5);
  assert.equal((await state()).error, null);
  await page.evaluate(() => window.pending[4].resolve({ data: { id: 'recovered' } }));
  await page.waitForFunction(() => document.querySelector('output').textContent.includes('recovered'));
  checks.push('reload clears error and renders successful recovery');
  await page.evaluate(() => window.select('unmounted'));
  await page.waitForFunction(() => window.pending.length === 6);
  await page.evaluate(() => { window.unmount(); window.pending[5].resolve({ data: { id: 'discarded' } }); });
  await page.evaluate(() => new Promise(done => requestAnimationFrame(done)));
  assert.equal(await page.locator('output').count(), 0);
  assert.deepEqual(errors, []);
  checks.push('unmounted request ignored without browser errors');
  console.log(JSON.stringify({ checks, browserErrors: errors, network: 'localhost fixture only; no database or enquiry writes' }, null, 2));
} finally { await browser.close(); server.closeAllConnections(); await new Promise(done => server.close(done)); }
