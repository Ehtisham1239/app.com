import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readContentQuery } from '../src/lib/content-query.js';

const options = { fallback: null, label: 'course test', schemaFallback: () => ({ id: 'seed' }), onSchemaMissing() {} };

test('database outages reject rather than publish a false missing record during ISR', async () => {
  await assert.rejects(readContentQuery(async () => ({ data: null, error: { code: '57014', message: 'query timeout' } }), options), /temporarily unavailable/);
  await assert.rejects(readContentQuery(async () => { throw Error('network unreachable'); }, options), /network unreachable/);
});

test('successful missing/unpublished records do not resurrect seed content', async () => {
  assert.equal(await readContentQuery(async () => ({ data: null, error: null }), options), null);
  assert.deepEqual(await readContentQuery(async () => ({ data: [], error: null }), { ...options, fallback: [] }), []);
  assert.deepEqual(await readContentQuery(async () => ({ data: { id: 'live' }, error: null }), options), { id: 'live' });
});

test('only an uninstalled schema uses the explicit bootstrap fallback', async () => {
  let marked = false;
  assert.deepEqual(await readContentQuery(async () => ({ data: null, error: { code: 'PGRST205' } }), { ...options, onSchemaMissing() { marked = true; } }), { id: 'seed' });
  assert.equal(marked, true);
  await assert.rejects(readContentQuery(async () => ({ data: null, error: { code: '42501' } }), options), /temporarily unavailable/);
});
