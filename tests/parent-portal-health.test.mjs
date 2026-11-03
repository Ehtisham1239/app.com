import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { portalHealth, parentSignInMessage } from "../src/lib/parent-portal-health.js";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("portal health counts codes, sign-ins, locks and unlinked students", () => {
  const h = portalHealth({
    guardians: [{ id: "a", full_name: "A" }, { id: "b", full_name: "B" }, { id: "c", full_name: "C" }],
    status: [{ guardian_id: "a", issued_at: "2026-11-01T00:00:00Z", locked: false, last_sign_in: "2026-11-02T00:00:00Z" }, { guardian_id: "b", issued_at: "2026-11-01T00:00:00Z", locked: true, last_sign_in: null }],
    students: [{ id: "s1", student_guardians: [{ guardian_id: "a" }] }, { id: "s2", student_guardians: [] }],
    pendingRequests: 2,
  });
  assert.equal(h.total, 3);
  assert.equal(h.withCode, 2);
  assert.deepEqual(h.withoutCode.map((g) => g.id), ["c"]);
  assert.equal(h.signedIn, 1);
  assert.deepEqual(h.neverSignedIn.map((g) => g.id), ["b"]);
  assert.equal(h.locked, 1);
  assert.equal(h.pendingRequests, 2);
  assert.deepEqual(h.studentsWithoutParent.map((s) => s.id), ["s2"]);
  assert.equal(portalHealth({ guardians: [] }).studentsWithoutParent, null, "no student list without students:read");
});

test("sign-in message carries the portal link, Client ID and code only", () => {
  const msg = parentSignInMessage({ name: "Nadia", clientId: "C-10", code: "AB12-CD34", portalUrl: "https://www.onlinequrancollege.com/parents" });
  assert.match(msg, /Assalamu alaikum Nadia,/);
  assert.match(msg, /https:\/\/www\.onlinequrancollege\.com\/parents/);
  assert.match(msg, /Client ID: C-10/);
  assert.match(msg, /Access code: AB12-CD34/);
  assert.match(msg, /keep this code private/);
});

test("admin pages: health card on overview, unlink needs confirmation, last sign-in shown", () => {
  assert.match(read("src/app/admin/(panel)/parent-portal/page.jsx"), /<ParentPortalHealth \/>/);
  const parents = read("src/app/admin/(panel)/results/parents/page.jsx");
  assert.match(parents, /<ConfirmButton title=\{`Unlink \$\{s\.full_name\}\?`\}/);
  assert.doesNotMatch(parents, /onClick=\{\(\) => unlink\(g, s\)\}/, "no one-click unlink");
  assert.match(parents, /Last sign-in \$\{formatDateTime\(g\.access\.last_sign_in\)\}/);
  assert.match(parents, /Copy message for parent/);
  assert.match(parents, /portalUrl: `\$\{window\.location\.origin\}\/parents`/);
  const health = read("src/components/admin/parent-portal-health.jsx");
  assert.match(health, /readStudents \? db\(\)\.from\("students"\)/, "student list only with students:read");
});
