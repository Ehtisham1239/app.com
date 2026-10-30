import { before, test } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { resolve } from "node:path";
import { parentCookieOptions, validToken } from "../src/lib/results/parent-session.js";

let route;
const token = "a".repeat(64);
let fixture;
const request = (method, body, extra = {}) => new Request("https://www.onlinequrancollege.com/api/parent-session", {
  method, headers: { origin: "https://www.onlinequrancollege.com", ...extra }, ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});
before(async () => {
  const bundle = await build({ entryPoints: ["src/app/api/parent-session/route.js"], bundle: true, write: false, format: "esm", platform: "node",
    plugins: [{ name: "isolated-route-boundaries", setup(builder) {
      builder.onResolve({ filter: /^next\/server$|^next\/headers$|^@\/lib\/supabase\/public$/ }, args => ({ path: args.path, namespace: "fixture" }));
      builder.onLoad({ filter: /.*/, namespace: "fixture" }, args => ({ contents: args.path === "next/server" ? "export const NextResponse={json:(value,init)=>Response.json(value,init)};" : args.path === "next/headers" ? "export const cookies=async()=>globalThis.__parentRoute.cookies;" : "export const publicDb={rpc:(...args)=>globalThis.__parentRoute.rpc(...args)};" }));
      builder.onResolve({ filter: /^@\// }, args => ({ path: resolve("src", args.path.slice(2) + ".js") }));
    } }],
  });
  route = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
});
function setup(result = { data: true, error: null }) {
  fixture = { calls: [], saved: [], cookies: { get: () => ({ value: token }), set: (...args) => fixture.saved.push(args) }, rpc: async (...args) => { fixture.calls.push(args); return result; } };
  globalThis.__parentRoute = fixture;
}
test("parent cookie is set only for a confirmed active token and never returns marks", async () => {
  setup(); const response = await route.POST(request("POST", { token }));
  assert.equal(response.status, 200); assert.deepEqual(await response.json(), { ok: true });
  assert.deepEqual(fixture.calls, [["parent_session_active", { p_token: token }]]);
  assert.equal(fixture.saved[0][0], "oqc_parent");
  assert.equal(fixture.saved[0][2].httpOnly, true); assert.equal(fixture.saved[0][2].sameSite, "strict");
  assert.match(response.headers.get("cache-control"), /no-store/);
});
test("foreign origins, malformed and expired credentials cannot set a parent cookie", async () => {
  setup(); assert.equal((await route.POST(request("POST", { token }, { origin: "https://example.test" }))).status, 403);
  assert.equal((await route.POST(request("POST", { token: "bad" }))).status, 400);
  assert.equal(fixture.calls.length, 0); assert.equal(fixture.saved.length, 0);
  setup({ data: false, error: null }); assert.equal((await route.POST(request("POST", { token }))).status, 401); assert.equal(fixture.saved.length, 0);
});
test("database unavailability stays distinct from an invalid session", async () => {
  setup({ data: null, error: { message: "unavailable" } });
  assert.equal((await route.POST(request("POST", { token }))).status, 503);
  assert.equal((await route.GET(request("GET"))).status, 503);
});
test("heartbeat confirms only the current cookie and returns no private data", async () => {
  setup(); const response = await route.GET(request("GET"));
  assert.deepEqual(await response.json(), { ok: true }); assert.equal(fixture.saved.length, 0);
  assert.match(response.headers.get("x-robots-tag"), /noindex/);
  setup({ data: false, error: null }); assert.equal((await route.GET(request("GET"))).status, 401);
});
test("sign-out revokes the session and clears the cookie even during an outage", async () => {
  setup(); assert.equal((await route.DELETE(request("DELETE"))).status, 200);
  assert.equal(fixture.calls[0][0], "parent_sign_out"); assert.equal(fixture.saved[0][1], ""); assert.equal(fixture.saved[0][2].maxAge, 0);
  setup(); fixture.rpc = async () => { throw Error("network down"); };
  assert.equal((await route.DELETE(request("DELETE"))).status, 200); assert.equal(fixture.saved[0][2].maxAge, 0);
});

test("production cookies stay HTTPS-only and tokens cannot contain arbitrary text", () => {
  const previous = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = "production";
    assert.deepEqual(parentCookieOptions(), { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 28800, priority: "high" });
    assert.equal(validToken(token), true);
    for (const value of [null, "x", "a".repeat(65), "<script>", "A".repeat(64)]) assert.equal(validToken(value), false);
  } finally { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous; }
});
