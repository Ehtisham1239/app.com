// USA landing page admissions email: request parsing, configuration, email
// content, Resend idempotency and the API route. Synthetic data only; Resend and
// the database are replaced by local fakes, so nothing is sent.
import { before, beforeEach, after, test } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { resolve } from "node:path";
import {
  RESEND_ENDPOINT, buildLeadEmail, idempotencyKey, notificationConfig, parseNotificationRequest, sendLeadEmail,
} from "../src/lib/usa-lead-notification.js";

const KEY = "re_test_0123456789abcdef";
const ENV = { RESEND_API_KEY: KEY, LEAD_NOTIFICATION_FROM: "OQC Website <leads@example.test>", LEAD_NOTIFICATION_TO: "admissions@example.test, ceo@example.test" };
const lead = (extra = {}) => ({
  id: "6f1d2c3b-1111-4222-8333-444455556666", reference: "TR-2026-00042", created_at: "2026-11-05T10:12:00.000Z",
  learner_name: "Child of Test Parent", guardian_name: "Test Parent", email: "parent@example.test", phone: "+15552345678",
  country: "United States", timezone: "America/Chicago", age_band: "child_8_12", course: "Hifz-ul-Quran", teacher_gender_pref: "female",
  notes: "Source: USA landing page (/usa-quran-classes).\nStudent age: 9–12 years.\nPreferred days and time (in the parent’s words): Mon & Wed after 5 pm",
  source: "google", utm: { landing_page: "/usa-quran-classes", gclid: "test-gclid", utm_source: "google", utm_campaign: "usa-search" },
  repeat_of: null, repeat_of_created_at: null, ...extra,
});

test("the browser must send a database reference, matching email and 256-bit notification token", () => {
  assert.deepEqual(parseNotificationRequest({ reference: " TR-2026-00042 ", email: " Parent@Example.TEST ", notification_token: "A".repeat(64) }), { reference: "TR-2026-00042", email: "parent@example.test", notificationToken: "a".repeat(64) });
  for (const bad of [null, [], "x", {}, { reference: "TR-RECEIVED", email: "a@b.co" }, { reference: "TR-2026-42", email: "a@b.co" },
    { reference: "TR-2026-00042", email: "not-an-email", notification_token: "a".repeat(64) },
    { reference: "TR-2026-00042", email: "a@b.co" }, { reference: "TR-2026-00042", email: "a@b.co", notification_token: "short" }, { reference: "TR-2026-00042", email: "a@b.co\r\nBcc: x@y.z" },
    { reference: "TR-2026-00042; drop", email: "a@b.co" }, { reference: "TR-2026-00042", email: `${"a".repeat(250)}@b.co` }]) {
    assert.equal(parseNotificationRequest(bad), null, JSON.stringify(bad));
  }
});

test("configuration comes only from server environment variables and must be complete", () => {
  assert.deepEqual(notificationConfig(ENV), { apiKey: KEY, from: ENV.LEAD_NOTIFICATION_FROM, to: ["admissions@example.test", "ceo@example.test"] });
  assert.deepEqual(notificationConfig({ ...ENV, LEAD_NOTIFICATION_FROM: "leads@example.test" }).from, "leads@example.test");
  for (const broken of [{}, { ...ENV, RESEND_API_KEY: "" }, { ...ENV, RESEND_API_KEY: "sk_live_123456789" }, { ...ENV, LEAD_NOTIFICATION_TO: "" },
    { ...ENV, LEAD_NOTIFICATION_TO: "admissions@example.test, nope" }, { ...ENV, LEAD_NOTIFICATION_FROM: "OQC <leads@example.test>\r\nBcc: x@y.z" },
    { ...ENV, LEAD_NOTIFICATION_FROM: "OQC Website" }]) {
    assert.equal(notificationConfig(broken), null, JSON.stringify(broken));
  }
});

test("the email carries every lead detail, escaped, with the timestamp, and is identical on every retry", () => {
  const email = buildLeadEmail(lead(), { siteUrl: "https://www.onlinequrancollege.com/" });
  assert.deepEqual(buildLeadEmail(lead(), { siteUrl: "https://www.onlinequrancollege.com/" }), email, "deterministic for idempotency");
  assert.equal(email.subject, "New USA trial request TR-2026-00042 – Hifz-ul-Quran");
  for (const part of ["TR-2026-00042", "Test Parent", "Child of Test Parent", "parent@example.test", "+15552345678", "Hifz-ul-Quran",
    "Child (8–12)", "Female teacher", "Central (CT)", "5 Nov 2026, 3:12 pm Pakistan time", "5 Nov 2026, 4:12 am parent's time",
    "gclid: test-gclid", "campaign usa-search", "Mon & Wed after 5 pm", "https://www.onlinequrancollege.com/admin/trials/6f1d2c3b-1111-4222-8333-444455556666",
    "Nothing was sent to the parent"]) {
    assert.ok(email.text.includes(part), `text: ${part}`);
  }
  assert.ok(email.html.includes("Mon &amp; Wed after 5 pm"));
  const hostile = buildLeadEmail(lead({ guardian_name: "<img src=x onerror=alert(1)>", notes: "<script>alert(1)</script>", course: "Hifz\r\nBcc: x@y.z" }));
  assert.doesNotMatch(hostile.html, /<script>|<img src=x/);
  assert.match(hostile.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(hostile.subject, /[\r\n]/);
  const adult = buildLeadEmail(lead({ age_band: "adult", guardian_name: null, learner_name: "Adult Learner", course: null }));
  assert.match(adult.text, /Adult learner: Adult Learner/);
  assert.match(adult.subject, /– Not sure yet$/);
  const repeat = buildLeadEmail(lead({ repeat_of: "TR-2026-00040", repeat_of_created_at: "2026-11-04T06:00:00.000Z" }));
  assert.match(repeat.subject, /TR-2026-00042 \(repeat\)/);
  assert.match(repeat.text, /Repeat request: Yes — same email or phone and course as TR-2026-00040 \(4 Nov 2026, 11:00 am Pakistan time\)/);
});

test("Resend requests carry the API key, one idempotency key per lead, and no parent recipient", async () => {
  const config = notificationConfig(ENV), calls = [];
  const fake = async (url, init) => { calls.push({ url, init }); return Response.json({ id: "email_1" }); };
  const result = await sendLeadEmail({ config, message: buildLeadEmail(lead()), reference: "TR-2026-00042", fetchImpl: fake });
  assert.deepEqual(result, { ok: true, id: "email_1" });
  assert.equal(calls[0].url, RESEND_ENDPOINT);
  assert.equal(calls[0].init.headers.Authorization, `Bearer ${KEY}`);
  assert.equal(calls[0].init.headers["Idempotency-Key"], idempotencyKey("TR-2026-00042", config));
  assert.match(calls[0].init.headers["Idempotency-Key"], /^oqc-usa-lead\/TR-2026-00042\/[0-9a-f]{12}$/);
  const body = JSON.parse(calls[0].init.body);
  assert.deepEqual(body.to, ["admissions@example.test", "ceo@example.test"]);
  assert.equal(body.reply_to, undefined); assert.equal(body.cc, undefined); assert.equal(body.bcc, undefined);
  assert.ok(!JSON.stringify(body.to).includes("parent@example.test"));
  assert.notEqual(idempotencyKey("TR-2026-00043", config), idempotencyKey("TR-2026-00042", config));
});

test("Resend outcomes: duplicates count as sent, failures are reported without detail", async () => {
  const config = notificationConfig(ENV), message = buildLeadEmail(lead());
  const answer = (status, body) => async () => Response.json(body, { status });
  const run = (fetchImpl) => sendLeadEmail({ config, message, reference: "TR-2026-00042", fetchImpl });
  assert.deepEqual(await run(answer(409, { name: "concurrent_idempotent_requests" })), { ok: true, pending: true });
  assert.deepEqual(await run(answer(409, { name: "invalid_idempotent_request" })), { ok: true, alreadySent: true });
  assert.deepEqual(await run(answer(403, { name: "validation_error", message: "The example.test domain is not verified" })), { ok: false, reason: "resend_403_validation_error" });
  assert.deepEqual(await run(answer(500, {})), { ok: false, reason: "resend_500" });
  assert.deepEqual(await run(async () => { throw new TypeError("fetch failed"); }), { ok: false, reason: "resend_network" });
  assert.deepEqual(await run(async () => { throw Object.assign(new Error("t"), { name: "TimeoutError" }); }), { ok: false, reason: "resend_timeout" });
});

// ---------- API route ----------
let route, fixture;
const realFetch = globalThis.fetch, realEnv = { ...process.env };
const consoleLines = [], allConsoleLines = [];
const request = (body, headers = {}) => new Request("https://www.onlinequrancollege.com/api/usa-lead-notification", {
  method: "POST", headers: { origin: "https://www.onlinequrancollege.com", "content-type": "application/json", ...headers },
  body: typeof body === "string" ? body : JSON.stringify(body),
});
const valid = { reference: "TR-2026-00042", email: "parent@example.test", notification_token: "a".repeat(64) };

before(async () => {
  const bundle = await build({ entryPoints: ["src/app/api/usa-lead-notification/route.js"], bundle: true, write: false, format: "esm", platform: "node",
    plugins: [{ name: "isolated-route-boundaries", setup(builder) {
      builder.onResolve({ filter: /^next\/server$|^@\/lib\/supabase\/public$/ }, (args) => ({ path: args.path, namespace: "fixture" }));
      builder.onLoad({ filter: /.*/, namespace: "fixture" }, (args) => ({ contents: args.path === "next/server"
        ? "export const NextResponse={json:(value,init)=>Response.json(value,init)};"
        : "export const publicDb={rpc:(...args)=>globalThis.__leadRoute.rpc(...args)};" }));
      builder.onResolve({ filter: /^@\// }, (args) => ({ path: resolve("src", args.path.slice(2) + ".js") }));
    } }],
  });
  route = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
  for (const level of ["info", "warn", "error"]) console[level] = (...args) => { consoleLines.push(args.join(" ")); allConsoleLines.push(args.join(" ")); };
});
after(() => { globalThis.fetch = realFetch; process.env = realEnv; });

// A Resend stand-in that honours Idempotency-Key the way the API documents it:
// same key → the first response, no second email; in-flight duplicate → 409.
function fakeResend({ status = 200, delay = 0 } = {}) {
  const state = { requests: 0, delivered: [], keys: new Map(), inflight: new Set() };
  globalThis.fetch = async (url, init) => {
    assert.equal(url, RESEND_ENDPOINT);
    state.requests += 1;
    const key = init.headers["Idempotency-Key"];
    if (state.inflight.has(key)) return Response.json({ name: "concurrent_idempotent_requests" }, { status: 409 });
    if (state.keys.has(key)) return Response.json(state.keys.get(key));
    state.inflight.add(key);
    if (delay) await new Promise((r) => setTimeout(r, delay));
    state.inflight.delete(key);
    if (status !== 200) return Response.json({ name: "application_error" }, { status });
    const reply = { id: `email_${state.delivered.length + 1}` };
    state.delivered.push(JSON.parse(init.body)); state.keys.set(key, reply);
    return Response.json(reply);
  };
  return state;
}
function setup({ data = lead(), error = null, env = ENV } = {}) {
  process.env = { ...realEnv, ...env };
  consoleLines.length = 0;
  fixture = { calls: [], rpc: async (...args) => { fixture.calls.push(args); return { data, error }; } };
  globalThis.__leadRoute = fixture;
}
beforeEach(() => { globalThis.fetch = async () => { throw new Error("unexpected network call"); }; });

test("a confirmed lead produces exactly one admissions email", async () => {
  setup(); const resend = fakeResend();
  const response = await route.POST(request(valid));
  assert.equal(response.status, 200); assert.deepEqual(await response.json(), { ok: true });
  assert.deepEqual(fixture.calls, [["usa_lead_for_notification", { p_reference: "TR-2026-00042", p_email: "parent@example.test", p_notification_token: "a".repeat(64) }]]);
  assert.equal(resend.delivered.length, 1);
  assert.match(resend.delivered[0].subject, /TR-2026-00042/);
  assert.match(response.headers.get("cache-control"), /no-store/); assert.match(response.headers.get("x-robots-tag"), /noindex/);
});

test("repeated and simultaneous calls for the same lead still deliver one email", async () => {
  setup(); const resend = fakeResend({ delay: 30 });
  const burst = await Promise.all([1, 2, 3].map(() => route.POST(request(valid))));
  for (const response of burst) assert.equal(response.status, 200);
  for (let i = 0; i < 3; i += 1) assert.equal((await route.POST(request(valid))).status, 200);
  assert.equal(resend.requests, 6);
  assert.equal(resend.delivered.length, 1, "Resend delivered once for six calls");
  setup({ data: lead({ reference: "TR-2026-00043" }) });
  assert.equal((await route.POST(request({ ...valid, reference: "TR-2026-00043" }))).status, 200);
  assert.equal(resend.delivered.length, 2, "a different lead gets its own email");
});

test("requests that are not a just-saved landing-page lead never reach Resend", async () => {
  setup(); const resend = fakeResend();
  assert.equal((await route.POST(request(valid, { origin: "https://evil.example" }))).status, 403);
  assert.equal((await route.POST(request(valid, { "sec-fetch-site": "cross-site" }))).status, 403);
  assert.equal((await route.POST(request(valid, { "content-type": "text/plain" }))).status, 415);
  assert.equal((await route.POST(request("{not json"))).status, 400);
  assert.equal((await route.POST(request({ reference: "TR-RECEIVED", email: "parent@example.test" }))).status, 400);
  assert.equal((await route.POST(request(JSON.stringify({ ...valid, pad: "x".repeat(3000) })))).status, 400);
  assert.equal(fixture.calls.length, 0);
  setup({ data: null });
  const missing = await route.POST(request(valid));
  assert.equal(missing.status, 404); assert.deepEqual(await missing.json(), { ok: false, error: "not_found" });
  setup({ data: lead({ reference: "TR-2026-00099" }) });
  assert.equal((await route.POST(request(valid))).status, 404, "the database row must be the requested reference");
  assert.equal(resend.requests, 0);
});

test("outages and missing configuration fail clearly and are logged without personal data or secrets", async () => {
  setup({ env: { RESEND_API_KEY: "", LEAD_NOTIFICATION_FROM: "", LEAD_NOTIFICATION_TO: "" } });
  assert.equal((await route.POST(request(valid))).status, 503);
  assert.equal(fixture.calls.length, 0);
  assert.match(consoleLines.join("\n"), /"outcome":"not_configured","reference":"TR-2026-00042"/);
  setup({ data: null, error: { message: "database unavailable", details: "parent@example.test" } });
  assert.equal((await route.POST(request(valid))).status, 503);
  assert.match(consoleLines.join("\n"), /"outcome":"lookup_failed"/);
  setup(); fakeResend({ status: 500 });
  const failed = await route.POST(request(valid));
  assert.equal(failed.status, 502); assert.deepEqual(await failed.json(), { ok: false, error: "email_failed" });
  assert.match(consoleLines.join("\n"), /"outcome":"resend_500_application_error"/);
  setup(); fakeResend(); await route.POST(request(valid));
  assert.match(consoleLines.join("\n"), /"outcome":"sent","reference":"TR-2026-00042"/);
  for (const secret of [KEY, "parent@example.test", "+15552345678", "Test Parent", "database unavailable", "a".repeat(64)]) assert.ok(!allConsoleLines.join("\n").includes(secret), secret);
});
