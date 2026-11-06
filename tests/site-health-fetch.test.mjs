import test from "node:test";
import assert from "node:assert/strict";
import { fetchWithoutRedirect, readBoundedText } from "../src/lib/site-health-fetch.js";

test("external and private-network redirects are never followed", async () => {
  for (const location of ["https://example.com/steal", "http://127.0.0.1:8080/admin", "http://169.254.169.254/latest/meta-data"]) {
    const result = await fetchWithoutRedirect("https://www.onlinequrancollege.com/page", {}, async (_url, options) => {
      assert.equal(options.redirect, "manual");
      return new Response(null, { status: 302, headers: { location } });
    });
    assert.equal(result.redirected, true);
    assert.equal(result.response.headers.get("location"), location);
  }
});

test("bounded reader rejects an oversized declared sitemap before reading", async () => {
  const response = new Response("x", { headers: { "content-length": "2097153" } });
  await assert.rejects(readBoundedText(response, 2 * 1024 * 1024), RangeError);
});

test("bounded reader rejects an oversized streamed page response", async () => {
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode("1234"));
      controller.enqueue(new TextEncoder().encode("5678"));
      controller.close();
    },
  });
  await assert.rejects(readBoundedText(new Response(body), 7), RangeError);
});

test("bounded reader returns a complete body within its limit", async () => {
  assert.equal(await readBoundedText(new Response("OQC health check"), 100), "OQC health check");
});
