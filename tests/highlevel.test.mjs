import assert from "node:assert/strict";
import test from "node:test";
import { highLevelConfig, upsertHighLevelContact } from "../src/lib/server/highlevel.js";

const config = { token: "test-token", locationId: "test-location" };
const contact = { email: " GUARDIAN@example.com ", name: "Test Guardian", phone: "+1 (202) 555-0100" };

test("HighLevel configuration requires both the sub-account and its token", () => {
  assert.equal(highLevelConfig({ GHL_LOCATION_ID: config.locationId }), null);
  assert.deepEqual(highLevelConfig({
    GHL_LOCATION_ID: config.locationId,
    GHL_PRIVATE_INTEGRATION_TOKEN: config.token,
  }), config);
});

test("HighLevel contact upsert sends only admissions contact fields to the configured location", async () => {
  const result = await upsertHighLevelContact({ ...contact, learner_name: "Private", notes: "Private" }, {
    config,
    fetchImpl: async (url, request) => {
      assert.equal(url, "https://services.leadconnectorhq.com/contacts/upsert");
      assert.equal(request.method, "POST");
      assert.equal(request.headers.Version, "v3");
      assert.equal(request.headers.Authorization, "Bearer test-token");
      assert.equal(request.redirect, "error");
      assert.deepEqual(JSON.parse(request.body), {
        locationId: config.locationId, email: "guardian@example.com", name: "Test Guardian", phone: "+12025550100",
      });
      return Response.json({ contact: { id: "contact-1", email: contact.email } });
    },
  });
  assert.deepEqual(result, { ok: true, contactId: "contact-1" });
});

test("HighLevel failures return retry information without leaking provider payloads", async () => {
  for (const [status, retryable] of [[401, false], [429, true], [503, true]]) {
    const result = await upsertHighLevelContact(contact, {
      config,
      fetchImpl: async () => new Response("Private provider response", { status }),
    });
    assert.deepEqual(result, { ok: false, reason: "provider_rejected", status, retryable });
  }
  const result = await upsertHighLevelContact(contact, { config, fetchImpl: async () => {
    throw new Error("Private transport error");
  } });
  assert.deepEqual(result, { ok: false, reason: "provider_unavailable", retryable: true });
});
