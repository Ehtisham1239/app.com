import test from "node:test";
import assert from "node:assert/strict";
import { gotoWithRetry } from "../scripts/responsive-audit.mjs";

const response = (status) => ({ status: () => status });

test("responsive navigation returns a successful response without retry", async () => {
  const calls = [];
  const waits = [];
  const page = {
    async goto(url, options) { calls.push({ url, options }); return response(200); },
    async waitForTimeout(ms) { waits.push(ms); },
  };
  const result = await gotoWithRetry(page, "https://example.com");
  assert.equal(result.status(), 200);
  assert.equal(calls.length, 1);
  assert.deepEqual(waits, []);
});

test("responsive navigation retries a 429 with bounded backoff", async () => {
  const statuses = [429, 429, 200];
  const waits = [];
  const page = {
    async goto() { return response(statuses.shift()); },
    async waitForTimeout(ms) { waits.push(ms); },
  };
  const result = await gotoWithRetry(page, "https://example.com", { retryDelays: [10, 20] });
  assert.equal(result.status(), 200);
  assert.deepEqual(waits, [10, 20]);
});

test("responsive navigation keeps a persistent 429 as a failure", async () => {
  let calls = 0;
  const waits = [];
  const page = {
    async goto() { calls++; return response(429); },
    async waitForTimeout(ms) { waits.push(ms); },
  };
  const result = await gotoWithRetry(page, "https://example.com", { retryDelays: [10, 20] });
  assert.equal(result.status(), 429);
  assert.equal(calls, 3);
  assert.deepEqual(waits, [10, 20]);
});

for (const status of [404, 500]) {
  test(`responsive navigation preserves HTTP ${status} without retry`, async () => {
    let calls = 0;
    const page = {
      async goto() { calls++; return response(status); },
      async waitForTimeout() { assert.fail('Non-transient responses must not be retried'); },
    };
    assert.equal((await gotoWithRetry(page, 'https://example.com')).status(), status);
    assert.equal(calls, 1);
  });
}

test('responsive navigation propagates network failures', async () => {
  const error = new Error('navigation failed');
  const page = {
    async goto() { throw error; },
    async waitForTimeout() { assert.fail('Network errors must stay visible'); },
  };
  await assert.rejects(gotoWithRetry(page, 'https://example.com'), error);
});

for (const status of [502, 503, 504]) {
  test(`responsive navigation retries a transient HTTP ${status} and recovers`, async () => {
    const statuses = [status, 200];
    const waits = [];
    const page = {
      async goto() { return response(statuses.shift()); },
      async waitForTimeout(ms) { waits.push(ms); },
    };
    const result = await gotoWithRetry(page, 'https://example.com', { retryDelays: [10, 20] });
    assert.equal(result.status(), 200);
    assert.deepEqual(waits, [10]);
  });
}

test('responsive navigation keeps a persistent 504 as a failure', async () => {
  let calls = 0;
  const page = {
    async goto() { calls++; return response(504); },
    async waitForTimeout() {},
  };
  const result = await gotoWithRetry(page, 'https://example.com', { retryDelays: [10, 20] });
  assert.equal(result.status(), 504);
  assert.equal(calls, 3);
});
