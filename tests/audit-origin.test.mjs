import test from 'node:test';
import assert from 'node:assert/strict';
import { auditOrigin } from '../scripts/lib/audit-origin.mjs';

test('audit targets accept the real deployment while rejecting lookalikes and credential-bearing URLs', () => {
  for (const origin of ['https://www.onlinequrancollege.com', 'https://project-umber-three-93.vercel.app', 'http://127.0.0.1:3027', 'http://localhost:3027']) assert.equal(auditOrigin(origin).origin, origin);
  for (const target of ['https://project-umber-three-93.vercel.app.evil.test', 'https://www.onlinequrancollege.com@evil.test', 'https://user:secret@www.onlinequrancollege.com', 'https://www.onlinequrancollege.com/blog', 'https://www.onlinequrancollege.com?target=other', 'https://www.onlinequrancollege.com#test', 'http://www.onlinequrancollege.com', 'file:///etc/passwd']) assert.throws(() => auditOrigin(target));
});
