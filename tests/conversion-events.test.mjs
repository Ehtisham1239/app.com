import { test } from "node:test";
import assert from "node:assert/strict";
import {
  rememberConfirmedLead, consumeConfirmedLead, leadTypeFor, isLeadReference,
  PENDING_LEAD_KEY, COUNTED_LEADS_KEY, PENDING_LEAD_MAX_AGE, PROSPECT_CONTACT_SUBJECTS,
} from "../src/lib/conversion-events.js";

// Owner decision (18 Nov 2026): a lead conversion is sent once, on its thank-you page,
// only after a database-confirmed save, with the opaque reference as transaction_id.

function storage(map = new Map()) {
  return { map, getItem: (k) => map.get(k) ?? null, setItem: (k, v) => map.set(k, String(v)), removeItem: (k) => map.delete(k) };
}
function tab(href = "https://www.onlinequrancollege.com/free-trial") {
  return { location: new URL(href), sessionStorage: storage(), localStorage: storage() };
}
function goTo(win, href) { win.location = new URL(href); }
function consume(win, now) {
  const lead = consumeConfirmedLead(win, now);
  if (!lead) return null;
  lead.markCounted();
  return lead.event;
}

test("a confirmed trial lead fires exactly once on its thank-you page, with no personal data", () => {
  const win = tab();
  assert.equal(rememberConfirmedLead({
    formType: "trial", country: "United States", reference: "TR-2026-0042",
    email: "private@example.test", phone: "+1 555 0100", learner_name: "Private Name",
  }, win), true);
  assert.equal(consume(win), null, "nothing on the form page itself");
  goTo(win, "https://www.onlinequrancollege.com/free-trial/thank-you?ref=TR-2026-0042");
  const event = consume(win);
  assert.deepEqual(event, {
    event: "free_trial_submission", form_id: "free_trial", form_type: "trial", lead_type: "free_trial",
    market: "USA", lead_id: "TR-2026-0042", transaction_id: "TR-2026-0042",
  });
  const text = JSON.stringify(event);
  for (const secret of ["private@example.test", "555", "Private Name"]) assert.ok(!text.includes(secret), secret);
  assert.equal(win.sessionStorage.map.has(PENDING_LEAD_KEY), false);
  assert.deepEqual(JSON.parse(win.localStorage.map.get(COUNTED_LEADS_KEY)), ["TR-2026-0042"]);
});

test("refresh, revisit and direct visits to a thank-you page never produce a conversion", () => {
  const win = tab();
  rememberConfirmedLead({ formType: "trial", country: "United Kingdom", reference: "TR-REFRESH1" }, win);
  goTo(win, "https://www.onlinequrancollege.com/free-trial/thank-you?ref=TR-REFRESH1");
  assert.ok(consume(win));
  assert.equal(consume(win), null, "refresh");
  // Revisit later in the same browser, even if a stale pending record were restored.
  win.sessionStorage.setItem(PENDING_LEAD_KEY, JSON.stringify({ form_type: "trial", lead_type: "free_trial", market: "UK", reference: "TR-REFRESH1", at: Date.now() }));
  assert.equal(consume(win), null, "already counted on this device");
  // Direct visit in a new tab: no pending record.
  const fresh = tab("https://www.onlinequrancollege.com/free-trial/thank-you?ref=TR-REFRESH1");
  assert.equal(consume(fresh), null, "direct visit");
  const contact = tab("https://www.onlinequrancollege.com/contact/thank-you");
  assert.equal(consume(contact), null, "direct visit, no ref");
});

test("failed, spam and placeholder submissions are never remembered", () => {
  const win = tab();
  for (const input of [
    { formType: "trial" },
    { formType: "trial", reference: "TR-RECEIVED" },
    { formType: "contact", reference: "MSG-RECEIVED", subject: "Course enquiry" },
    { formType: "trial", reference: "TR-ABCD1234", honeypot: "bot" },
    { formType: "trial", reference: "MSG-ABCD1234" },
    { formType: "trial", reference: "TR-<script>" },
    { formType: "unknown", reference: "TR-ABCD1234" },
  ]) assert.equal(rememberConfirmedLead(input, win), false, JSON.stringify(input));
  assert.equal(win.sessionStorage.map.size, 0);
});

test("only prospect contact enquiries count; careers, support, partnership and other do not", () => {
  for (const subject of PROSPECT_CONTACT_SUBJECTS) assert.equal(leadTypeFor({ formType: "contact", subject }), "course_enquiry", subject);
  for (const subject of ["Existing student support", "Partnership", "Other", "Careers & Opportunities", ""]) assert.equal(leadTypeFor({ formType: "contact", subject }), null, subject);
  assert.equal(leadTypeFor({ formType: "contact", subject: "Course enquiry", careers: true }), null, "careers form");
  assert.equal(leadTypeFor({ formType: "trial" }), "free_trial");
  assert.equal(leadTypeFor({ formType: "trial", packageEnquiry: true }), "package_enquiry");

  const careers = tab("https://www.onlinequrancollege.com/careers");
  assert.equal(rememberConfirmedLead({ formType: "contact", reference: "MSG-JOB12345", subject: "Careers & Opportunities", careers: true }, careers), false);
  goTo(careers, "https://www.onlinequrancollege.com/contact/thank-you?type=careers&ref=MSG-JOB12345");
  assert.equal(consume(careers), null);

  const enquiry = tab("https://www.onlinequrancollege.com/contact");
  assert.equal(rememberConfirmedLead({ formType: "contact", country: "Pakistan", reference: "MSG-ENQ12345", subject: "Fees and payment" }, enquiry), true);
  goTo(enquiry, "https://www.onlinequrancollege.com/contact/thank-you?ref=MSG-ENQ12345");
  assert.deepEqual(consume(enquiry), {
    event: "contact_form_submission", form_id: "contact", form_type: "contact", lead_type: "course_enquiry",
    market: "Other", lead_id: "MSG-ENQ12345", transaction_id: "MSG-ENQ12345",
  });
});

test("the thank-you page must match the lead's form and reference, within 30 minutes", () => {
  const start = Date.now();
  const wrongPage = tab();
  rememberConfirmedLead({ formType: "trial", country: "Canada", reference: "TR-MATCH001" }, wrongPage);
  goTo(wrongPage, "https://www.onlinequrancollege.com/contact/thank-you?ref=TR-MATCH001");
  assert.equal(consume(wrongPage), null);
  assert.equal(wrongPage.sessionStorage.map.has(PENDING_LEAD_KEY), true, "kept until its own thank-you page");

  const wrongRef = tab();
  rememberConfirmedLead({ formType: "trial", country: "Canada", reference: "TR-MATCH002" }, wrongRef);
  goTo(wrongRef, "https://www.onlinequrancollege.com/free-trial/thank-you?ref=TR-OTHER999");
  assert.equal(consume(wrongRef), null);
  assert.equal(wrongRef.sessionStorage.map.has(PENDING_LEAD_KEY), false, "a mismatched reference discards the record");

  const expired = tab();
  rememberConfirmedLead({ formType: "trial", country: "Canada", reference: "TR-MATCH003" }, expired);
  goTo(expired, "https://www.onlinequrancollege.com/free-trial/thank-you/?ref=TR-MATCH003");
  assert.equal(consume(expired, start + PENDING_LEAD_MAX_AGE + 60_000), null);
});

test("blocked storage or a broken window never interrupts a saved enquiry", () => {
  const blocked = { location: new URL("https://www.onlinequrancollege.com/free-trial"), get sessionStorage() { throw Error("blocked"); }, get localStorage() { throw Error("blocked"); } };
  assert.equal(rememberConfirmedLead({ formType: "trial", reference: "TR-ABCD1234" }, blocked), false);
  assert.equal(consumeConfirmedLead(blocked), null);
  const throwing = tab(); throwing.sessionStorage.setItem = () => { throw Error("quota"); };
  assert.equal(rememberConfirmedLead({ formType: "trial", reference: "TR-ABCD1234" }, throwing), false);
  assert.equal(rememberConfirmedLead({ formType: "trial", reference: "TR-ABCD1234" }, undefined), false);
  assert.equal(consumeConfirmedLead(null), null);
  assert.equal(isLeadReference("trial", "TR-AB"), false);
});

test("the counted list stays bounded", () => {
  const win = tab();
  for (let i = 0; i < 60; i++) {
    const ref = `TR-BOUND${String(i).padStart(3, "0")}`;
    goTo(win, "https://www.onlinequrancollege.com/free-trial");
    rememberConfirmedLead({ formType: "trial", reference: ref }, win);
    goTo(win, `https://www.onlinequrancollege.com/free-trial/thank-you?ref=${ref}`);
    assert.ok(consume(win), ref);
  }
  const counted = JSON.parse(win.localStorage.map.get(COUNTED_LEADS_KEY));
  assert.equal(counted.length, 50);
  assert.equal(counted.at(-1), "TR-BOUND059");
});
