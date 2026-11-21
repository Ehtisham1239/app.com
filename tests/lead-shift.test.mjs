// OQC lead shift schedule (owner rule, 11 Nov 2026): Day 08:00–19:59 PKT, Night 20:00–07:59 PKT.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LEAD_SHIFTS, currentShiftInfo, lastHandoverAt, leadShiftFor, nextHandoverAt, shiftDateFor, shiftLabel,
} from "../src/lib/lead-shift.js";

// PKT is UTC+5 with no daylight saving.
const pkt = (local) => `${local}+05:00`;

test("every minute of the day belongs to exactly one shift, with no overlap at 07:00–08:00", () => {
  const cases = [
    ["2026-11-11T00:00:00", "night", "2026-11-10"],
    ["2026-11-11T03:15:00", "night", "2026-11-10"],
    ["2026-11-11T07:00:00", "night", "2026-11-10"],
    ["2026-11-11T07:59:59", "night", "2026-11-10"],
    ["2026-11-11T08:00:00", "day", "2026-11-11"],
    ["2026-11-11T12:45:00", "day", "2026-11-11"],
    ["2026-11-11T19:59:59", "day", "2026-11-11"],
    ["2026-11-11T20:00:00", "night", "2026-11-11"],
    ["2026-11-11T23:59:59", "night", "2026-11-11"],
  ];
  for (const [local, shift, date] of cases) {
    assert.equal(leadShiftFor(pkt(local)), shift, local);
    assert.equal(shiftDateFor(pkt(local)), date, local);
  }
  let day = 0;
  let night = 0;
  for (let m = 0; m < 24 * 60; m++) {
    const at = new Date(Date.parse(pkt("2026-11-11T00:00:00")) + m * 60_000);
    if (leadShiftFor(at) === "day") day++;
    else night++;
  }
  assert.equal(day, 12 * 60);
  assert.equal(night, 12 * 60);
});

test("shift is decided in PKT whatever zone the timestamp is written in", () => {
  assert.equal(leadShiftFor("2026-11-11T02:59:59Z"), "night"); // 07:59:59 PKT
  assert.equal(leadShiftFor("2026-11-11T03:00:00Z"), "day"); // 08:00 PKT
  assert.equal(leadShiftFor("2026-11-11T15:00:00Z"), "night"); // 20:00 PKT
  assert.equal(leadShiftFor("2026-07-01T09:30:00-04:00"), "day"); // New York 09:30 = 18:30 PKT
  assert.equal(leadShiftFor("2026-07-01T11:30:00-04:00"), "night"); // New York 11:30 = 20:30 PKT
});

test("month and year boundaries keep the night shift on its starting date", () => {
  assert.equal(shiftDateFor(pkt("2027-01-01T02:00:00")), "2026-12-31");
  assert.equal(shiftDateFor(pkt("2026-03-01T05:00:00")), "2026-02-28");
  assert.equal(shiftDateFor(pkt("2028-03-01T05:00:00")), "2028-02-29");
});

test("handovers fall at 08:00 and 20:00 PKT", () => {
  assert.equal(lastHandoverAt(pkt("2026-11-11T12:45:00")).toISOString(), "2026-11-11T03:00:00.000Z");
  assert.equal(nextHandoverAt(pkt("2026-11-11T12:45:00")).toISOString(), "2026-11-11T15:00:00.000Z");
  assert.equal(lastHandoverAt(pkt("2026-11-11T08:00:00")).toISOString(), "2026-11-11T03:00:00.000Z");
  assert.equal(lastHandoverAt(pkt("2026-11-11T21:00:00")).toISOString(), "2026-11-11T15:00:00.000Z");
  assert.equal(lastHandoverAt(pkt("2026-11-12T04:00:00")).toISOString(), "2026-11-11T15:00:00.000Z");
  assert.equal(nextHandoverAt(pkt("2026-11-12T04:00:00")).toISOString(), "2026-11-12T03:00:00.000Z");
});

test("current shift summary and labels", () => {
  const info = currentShiftInfo(new Date(pkt("2026-11-11T12:45:00")));
  assert.equal(info.shift, "day");
  assert.equal(info.label, "Day shift");
  assert.equal(info.hours, "08:00–19:59 PKT");
  assert.equal(info.shiftDate, "2026-11-11");
  assert.equal(shiftLabel("night"), "Night shift");
  assert.equal(shiftLabel("evening"), "—");
  assert.deepEqual(LEAD_SHIFTS.map((s) => s.value), ["day", "night"]);
  assert.throws(() => leadShiftFor("not a date"), TypeError);
});
