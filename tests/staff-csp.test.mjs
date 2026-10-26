import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { staffContentSecurityPolicy } from '../src/lib/staff-csp.js';

test('staff scripts require a fresh nonce with no inline/eval escape in production', () => {
  const nonce = randomBytes(16).toString('base64');
  const csp = staffContentSecurityPolicy(nonce, 'https://college.supabase.co');
  const script = csp.split('; ').find(value => value.startsWith('script-src'));
  assert.ok(script.includes(`'nonce-${nonce}'`));
  assert.ok(script.includes("'strict-dynamic'"));
  assert.ok(!script.includes("'unsafe-inline'"));
  assert.ok(!script.includes("'unsafe-eval'"));
  assert.ok(csp.includes("frame-ancestors 'none'"));
  assert.ok(csp.includes("object-src 'none'"));
  assert.ok(csp.includes('wss://college.supabase.co'));
});

test('CSP rejects header injection and unsafe API origins; eval is development only', () => {
  const nonce = randomBytes(16).toString('base64');
  for (const value of ["x'; script-src *", '', 'nonce\r\nheader']) assert.throws(() => staffContentSecurityPolicy(value, 'https://college.supabase.co'));
  for (const origin of ['http://college.supabase.co', 'https://user:password@college.supabase.co']) assert.throws(() => staffContentSecurityPolicy(nonce, origin));
  assert.ok(staffContentSecurityPolicy(nonce, 'https://college.supabase.co', true).includes("'unsafe-eval'"));
});
