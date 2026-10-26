import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { NextRequest } from 'next/server.js';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));
const result = await build({
  entryPoints: [root + 'src/proxy.js'], bundle: true, write: false, format: 'esm', platform: 'node',
  plugins: [{ name: 'isolated-auth', setup(builder) {
    builder.onResolve({ filter: /^next\/server$/ }, () => ({ path: pathToFileURL(require.resolve('next/server')).href, external: true }));
    builder.onResolve({ filter: /^@supabase\/ssr$|^@\/lib\/config$/ }, args => ({ path: args.path, namespace: 'auth-fixture' }));
    builder.onLoad({ filter: /.*/, namespace: 'auth-fixture' }, args => ({ contents: args.path === '@/lib/config'
      ? 'export const SUPABASE_URL="https://college.supabase.co", SUPABASE_KEY="public-test-placeholder", SUPABASE_CONFIGURED=true'
      : 'export function createServerClient(url,key,{cookies}) { return {auth:{async getUser(){ cookies.setAll([{name:"test-session",value:"refreshed",options:{httpOnly:true,sameSite:"lax",path:"/"}}]); return {data:{user:globalThis.__OQC_PROXY_TEST_USER || null}} }}} }' }));
    builder.onResolve({ filter: /^@\/lib\/staff-csp$/ }, () => ({ path: root + 'src/lib/staff-csp.js' }));
  } }],
});
const { proxy } = await import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'));

test('staff responses have fresh strict nonces and never become public-cacheable', async () => {
  globalThis.__OQC_PROXY_TEST_USER = null;
  const a = await proxy(new NextRequest('https://college.test/admin/login'));
  const b = await proxy(new NextRequest('https://college.test/admin/login'));
  assert.equal(a.status, 200);
  assert.match(a.headers.get('content-security-policy'), /'nonce-[A-Za-z0-9+/]{22}=='/);
  assert.notEqual(a.headers.get('content-security-policy'), b.headers.get('content-security-policy'));
  assert.equal(a.headers.get('x-frame-options'), 'DENY');
  assert.match(a.headers.get('cache-control'), /private.*no-store/);
});

test('signed-out protection and signed-in redirects retain refreshed cookies', async () => {
  globalThis.__OQC_PROXY_TEST_USER = null;
  const denied = await proxy(new NextRequest('https://college.test/admin/reports'));
  assert.equal(denied.status, 307);
  assert.equal(new URL(denied.headers.get('location')).pathname, '/admin/login');
  assert.equal(denied.cookies.get('test-session').value, 'refreshed');
  globalThis.__OQC_PROXY_TEST_USER = { id: 'fixture-user' };
  const signedIn = await proxy(new NextRequest('https://college.test/admin/login'));
  assert.equal(new URL(signedIn.headers.get('location')).pathname, '/admin');
  assert.equal(signedIn.cookies.get('test-session').value, 'refreshed');
  delete globalThis.__OQC_PROXY_TEST_USER;
});
