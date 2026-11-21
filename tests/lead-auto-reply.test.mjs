// Automatic acknowledgement email to the person who submitted a trial request or
// contact message. Synthetic data only; Resend is replaced by a local fake.
import { test } from "node:test";
import assert from "node:assert/strict";
import { autoReplyEnabled, buildAutoReplyEmail, greetingName, sendAutoReply, timeZoneCity } from "../src/lib/lead-auto-reply.js";

const config = { apiKey: "re_test_0123456789abcdef", from: "OQC <leads@example.test>", to: ["admissions@example.test"] };
const trial = (extra = {}) => ({ lead_type: "trial", reference: "TR-2026-00047", email: "jenet@example.test", guardian_name: "Jenet Muktar", learner_name: "Child", age_band: "child_8_12", timezone: "America/Chicago", ...extra });
const contact = (extra = {}) => ({ lead_type: "contact", reference: "MSG-2026-00012", email: "sam@example.test", name: "Sam Parent", message: "Hello", ...extra });

test("trial reply greets by name, asks for days and times in the visitor's time zone, and has no reference number", () => {
  const mail = buildAutoReplyEmail(trial());
  assert.match(mail.text, /^Assalamu alaikum Jenet Muktar,/);
  assert.match(mail.text, /Which days and times suit you in Chicago time\?/);
  assert.match(mail.text, /confirm a teacher and send the class link/);
  assert.match(mail.text, /wa\.me\/|UK \+44 7864 710821/);
  assert.match(mail.html, /https:\/\/wa\.me\/447864710821/);
  assert.match(mail.html, /https:\/\/wa\.me\/17869645678/);
  for (const part of [mail.subject, mail.text, mail.html]) assert.ok(!/(?:TR|MSG|REV)-\d{4}-\d+/.test(part), "no reference number");
  assert.deepEqual(buildAutoReplyEmail(trial()), mail, "deterministic across retries");
});

test("contact reply promises a reply within one working day and offers a trial", () => {
  const mail = buildAutoReplyEmail(contact());
  assert.match(mail.subject, /Thank you for contacting Online Quran College/);
  assert.match(mail.text, /^Assalamu alaikum Sam Parent,/);
  assert.match(mail.text, /within one working day/);
  assert.match(mail.text, /3-day free trial/);
});

test("unsafe names fall back to the plain greeting and markup is escaped", () => {
  for (const bad of ["Win now http://evil.test", "a@b.co", "<script>x</script>", "12345", "", null]) assert.equal(greetingName(bad), "", String(bad));
  assert.equal(greetingName("Ayesha O’Neil-Khan"), "Ayesha O’Neil-Khan");
  const mail = buildAutoReplyEmail(trial({ guardian_name: "<b>x</b>" }));
  assert.match(mail.text, /^Assalamu alaikum,\n/);
  assert.ok(!mail.html.includes("<b>x</b>"));
});

test("time zone becomes a city; unknown zones ask the visitor for theirs", () => {
  assert.equal(timeZoneCity("America/Chicago"), "Chicago time");
  assert.equal(timeZoneCity("America/Argentina/Buenos_Aires"), "Buenos Aires time");
  for (const bad of ["", null, "Chicago", "Not/AZone", "x/<script>"]) assert.equal(timeZoneCity(bad), "", String(bad));
  assert.match(buildAutoReplyEmail(trial({ timezone: "" })).text, /in your local time, together with your country or time zone/);
});

test("sent once per lead to the lead's own address, with reply-to info@ and an Auto-Submitted header", async () => {
  const seen = [];
  const fetchImpl = async (url, init) => { seen.push({ url, init, body: JSON.parse(init.body) }); return Response.json({ id: "em_1" }); };
  const result = await sendAutoReply({ config, lead: trial(), siteUrl: "https://example.test", fetchImpl, env: {} });
  assert.equal(result.ok, true);
  assert.equal(seen.length, 1);
  assert.deepEqual(seen[0].body.to, ["jenet@example.test"]);
  assert.equal(seen[0].body.reply_to, "info@onlinequrancollege.com");
  assert.equal(seen[0].body.headers["Auto-Submitted"], "auto-replied");
  assert.match(seen[0].init.headers["Idempotency-Key"], /^oqc-auto-reply\/TR-2026-00047\//);
  assert.ok(!JSON.stringify(seen[0].body.to).includes("admissions@example.test"));
});

test("off switch, bad recipients, reviews and provider errors never throw or send", async () => {
  const fetchImpl = async () => { throw new Error("must not be called"); };
  assert.equal(autoReplyEnabled({}), true);
  for (const off of ["off", "OFF", "false", "0", "no"]) assert.equal(autoReplyEnabled({ LEAD_AUTO_REPLY: off }), false);
  assert.deepEqual(await sendAutoReply({ config, lead: trial(), fetchImpl, env: { LEAD_AUTO_REPLY: "off" } }), { ok: true, skipped: true });
  assert.deepEqual(await sendAutoReply({ config: null, lead: trial(), fetchImpl, env: {} }), { ok: true, skipped: true });
  assert.deepEqual(await sendAutoReply({ config, lead: { lead_type: "review", reference: "REV-2026-00001", email: "a@b.co" }, fetchImpl, env: {} }), { ok: true, skipped: true });
  for (const email of ["", "nope", "a@b.co\r\nBcc: x@y.z", `${"a".repeat(250)}@b.co`]) {
    assert.equal((await sendAutoReply({ config, lead: trial({ email }), fetchImpl, env: {} })).reason, "invalid_recipient", JSON.stringify(email));
  }
  const failing = async () => Response.json({ name: "validation_error" }, { status: 403 });
  assert.equal((await sendAutoReply({ config, lead: trial(), fetchImpl: failing, env: {} })).ok, false);
});
