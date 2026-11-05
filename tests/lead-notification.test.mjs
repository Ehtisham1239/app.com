import { test } from "node:test";
import assert from "node:assert/strict";
import { buildContactEmail, buildLeadEmail, notificationConfig, sendLeadEmail } from "../src/lib/usa-lead-notification.js";

const config = notificationConfig({
  RESEND_API_KEY: "re_test_0123456789abcdef",
  LEAD_NOTIFICATION_FROM: "OQC Website <leads@example.test>",
  LEAD_NOTIFICATION_TO: "admissions@example.test, marketing@example.test",
});

test("contact notification is built from saved CMS fields and safely escapes HTML", () => {
  const lead = {
    id: "11111111-2222-4333-8444-555555555555",
    reference: "MSG-2026-00012",
    created_at: "2026-11-05T10:12:00.000Z",
    name: "Test Parent",
    email: "parent@example.test",
    phone: "+15552345678",
    country: "United States",
    city: "Denver",
    subject: "Course enquiry",
    message: "<script>alert(1)</script> Please explain class times.",
    source: "google",
    utm: { utm_campaign: "usa-search" },
  };
  const email = buildContactEmail(lead);
  assert.match(email.subject, /MSG-2026-00012/);
  assert.match(email.text, /Test Parent/);
  assert.match(email.text, /Course enquiry/);
  assert.match(email.text, /Please explain class times/);
  assert.match(email.text, /Admin → Contacts/);
  assert.match(email.html, /&lt;script&gt;alert\(1\)&lt;\\/script&gt;/);
  assert.doesNotMatch(email.html, /<script>/);
  assert.doesNotMatch(email.text, /parent@example\.test.*to:/i);
});

test("generic website trial email is distinct from the USA landing notification", () => {
  const lead = {
    id: "11111111-2222-4333-8444-555555555555",
    reference: "TR-2026-00042",
    created_at: "2026-11-05T10:12:00.000Z",
    learner_name: "Learner",
    guardian_name: "Parent",
    email: "parent@example.test",
    phone: "+15552345678",
    country: "United States",
    timezone: "America/Chicago",
    age_band: "child_8_12",
    course: "Tajweed",
    teacher_gender_pref: "any",
    notes: "",
    source: "website",
    utm: {},
  };
  assert.match(buildLeadEmail(lead, { sourceLabel: "website form" }).subject, /New website trial request/);
  assert.match(buildLeadEmail(lead).subject, /New USA trial request/);
});

test("contact and trial notifications use only the configured internal recipients", async () => {
  const sent = [];
  const result = await sendLeadEmail({
    config,
    message: buildContactEmail({
      reference: "MSG-2026-00012", created_at: "2026-11-05T10:12:00.000Z",
      name: "Test Parent", email: "parent@example.test", subject: "Course enquiry",
      message: "A short enquiry", source: "website", utm: {},
    }),
    reference: "MSG-2026-00012",
    source: "website_contact",
    fetchImpl: async (_url, init) => {
      sent.push(JSON.parse(init.body));
      return Response.json({ id: "email_1" });
    },
  });
  assert.deepEqual(result, { ok: true, id: "email_1" });
  assert.deepEqual(sent[0].to, ["admissions@example.test", "marketing@example.test"]);
  assert.deepEqual(sent[0].tags, [{ name: "source", value: "website_contact" }]);
  assert.ok(!sent[0].to.includes("parent@example.test"));
});
