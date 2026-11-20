import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { leadDeliveryStatus } from "../src/lib/server/lead-delivery-status.js";

const OK = {
  RESEND_API_KEY: "re_test_0123456789abcdef", LEAD_NOTIFICATION_FROM: "OQC <leads@example.test>", LEAD_NOTIFICATION_TO: "info@example.test",
  GHL_ADMISSIONS_SYNC: "true", GHL_PRIVATE_INTEGRATION_TOKEN: "pit-secret-value", GHL_LOCATION_ID: "loc123", CRON_SECRET: "x".repeat(32),
};

test("everything configured reads as ok", () => {
  const s = leadDeliveryStatus(OK);
  assert.deepEqual([s.email.ok, s.ghl.ok, s.worker.ok], [true, true, true]);
});

test("production on 20 Nov 2026: bad Resend key, GHL off, no worker secret — by name, never by value", () => {
  const s = leadDeliveryStatus({ ...OK, RESEND_API_KEY: "sk_wrong_secretvalue", GHL_ADMISSIONS_SYNC: "", GHL_PRIVATE_INTEGRATION_TOKEN: "", GHL_LOCATION_ID: "", CRON_SECRET: "" });
  assert.equal(s.email.ok, false);
  assert.match(s.email.issues[0], /^RESEND_API_KEY invalid/);
  assert.equal(s.ghl.ok, false);
  assert.deepEqual(s.ghl.issues, ['GHL_ADMISSIONS_SYNC is not "true" (GoHighLevel delivery is off)', "GHL_PRIVATE_INTEGRATION_TOKEN missing", "GHL_LOCATION_ID missing"]);
  assert.equal(s.worker.ok, false);
  assert.doesNotMatch(JSON.stringify(s), /secretvalue|pit-secret|loc123/);
});

test("half a pipeline setting is reported", () => {
  const s = leadDeliveryStatus({ ...OK, GHL_ADMISSIONS_PIPELINE_ID: "p1" });
  assert.equal(s.ghl.ok, false);
  assert.match(s.ghl.issues.join(), /must be set together/);
});

test("admin technical health shows the status", () => {
  assert.match(readFileSync(new URL("../src/app/api/admin/site-health/route.js", import.meta.url), "utf8"), /leadDelivery: leadDeliveryStatus\(\)/);
  assert.match(readFileSync(new URL("../src/app/admin/(panel)/technical-health/page.jsx", import.meta.url), "utf8"), /Lead delivery \(website forms\)/);
});
