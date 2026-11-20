import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CALLING_CODES, internationalPhone, localTimeLabel, trialReplyText } from "../src/lib/phone.js";
import { COUNTRIES } from "../src/lib/constants.js";

// 20 Nov 2026: real leads were saved as "0757…", "0744…", "76055…"; the admin WhatsApp button
// stripped non-digits only, so wa.me opened a wrong or invalid chat.
test("every country the forms offer has a calling code", () => {
  for (const [name] of COUNTRIES) if (name !== "Other") assert.ok(CALLING_CODES[name], name);
});

test("local numbers get the family's calling code and lose the trunk 0", () => {
  assert.deepEqual(internationalPhone("0757 312 345", "Kenya"), { digits: "254757312345", code: "254", added: true });
  assert.deepEqual(internationalPhone("07442 123456", "United Kingdom"), { digits: "447442123456", code: "44", added: true });
  assert.deepEqual(internationalPhone("0300-1234567", "Pakistan"), { digits: "923001234567", code: "92", added: true });
  assert.deepEqual(internationalPhone("(469) 555-0123", "United States"), { digits: "14695550123", code: "1", added: true });
  assert.equal(internationalPhone("06 06 123 4567", "Italy").digits, "3906061234567", "Italy keeps its leading 0");
  assert.equal(internationalPhone("8 029 123 4567", "Belarus").digits, "375291234567");
});

test("numbers already in international form are left alone", () => {
  assert.deepEqual(internationalPhone("+1 469 555 0123", "United States"), { digits: "14695550123", code: null, added: false });
  assert.deepEqual(internationalPhone("+44 7864 710821", "Kenya"), { digits: "447864710821", code: null, added: false }, "a + number wins over the country field");
  assert.equal(internationalPhone("0044 7864 710821", "United Kingdom").digits, "447864710821");
  assert.deepEqual(internationalPhone("254757312345", "Kenya"), { digits: "254757312345", code: "254", added: false });
  assert.deepEqual(internationalPhone("14695550123", "United States"), { digits: "14695550123", code: "1", added: false });
});

test("no usable number or no known country: nothing invented", () => {
  assert.equal(internationalPhone("", "Kenya"), null);
  assert.equal(internationalPhone("123", "Kenya"), null);
  assert.deepEqual(internationalPhone("0757312345", "Other"), { digits: "0757312345", code: null, added: false });
});

test("trial reply names the family's local time zone", () => {
  assert.equal(localTimeLabel("America/Chicago"), "Chicago time");
  assert.equal(localTimeLabel("UTC"), "your local time");
  const text = trialReplyText({ guardian_name: "Amina", learner_name: "Yusuf", reference: "TR-2026-00001", timezone: "Europe/Brussels" });
  assert.match(text, /^Assalamu alaikum Amina, .*3-day free trial request for Yusuf \(TR-2026-00001\)\. Which days and times suit you in Brussels time\?/);
  assert.doesNotMatch(trialReplyText({ guardian_name: "Sam", learner_name: "Sam", reference: "R", timezone: "Asia/Dubai" }), / for Sam/);
});

test("admin trial and contact pages use the international number", () => {
  for (const page of ["src/app/admin/(panel)/trials/[id]/page.jsx", "src/app/admin/(panel)/contacts/[id]/page.jsx"]) {
    const src = readFileSync(new URL(`../${page}`, import.meta.url), "utf8");
    assert.match(src, /internationalPhone\((t|m)\.phone, (t|m)\.country\)/, page);
    assert.match(src, /whatsappLink\(intl\.digits/, page);
  }
});
