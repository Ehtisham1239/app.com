// OQC lead shifts (owner schedule, 11 Nov 2026). Mirrors the database functions in
// supabase/migrations/20261111090000_lead_shift_schedule.sql; tests/lead-shift-db.test.mjs
// checks that both give the same answer.
//
//   Day shift    08:00–19:59 PKT
//   Night shift  20:00–07:59 PKT (belongs to the date on which it started)
//
// Lead forms never close. A lead's shift and shift date are fixed from the moment
// it was submitted. At each handover (08:00 and 20:00 PKT) every lead still awaiting
// follow-up moves to the incoming shift's queue; the recorded shift never changes.

export const SHIFT_TIME_ZONE = "Asia/Karachi";
export const DAY_START_HOUR = 8;
export const NIGHT_START_HOUR = 20;

export const LEAD_SHIFTS = [
  { value: "day", label: "Day shift", hours: "08:00–19:59 PKT", tone: "amber" },
  { value: "night", label: "Night shift", hours: "20:00–07:59 PKT", tone: "violet" },
];

// Statuses that still need a follow-up and therefore pass from shift to shift.
export const PENDING_TRIAL_STATUSES = ["new", "reviewed"];
export const PENDING_CONTACT_STATUSES = ["new", "read"];

const partsFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: SHIFT_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
});

function toDate(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) throw new TypeError("A valid date or timestamp is required.");
  return d;
}

function karachiParts(d) {
  const p = Object.fromEntries(partsFormat.formatToParts(d).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) };
}

function previousDay(isoDate) {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** "day" or "night" for the moment a lead was submitted. */
export function leadShiftFor(value) {
  const { hour } = karachiParts(toDate(value));
  return hour >= DAY_START_HOUR && hour < NIGHT_START_HOUR ? "day" : "night";
}

/** The PKT calendar date the shift started on (a 03:00 lead belongs to the previous evening's night shift). */
export function shiftDateFor(value) {
  const { date, hour } = karachiParts(toDate(value));
  return hour < DAY_START_HOUR ? previousDay(date) : date;
}

/** The handover (08:00 or 20:00 PKT) at or before `value`, as a Date. PKT has no daylight saving. */
export function lastHandoverAt(value) {
  const d = toDate(value);
  const { date, hour } = karachiParts(d);
  const startHour = hour >= NIGHT_START_HOUR ? NIGHT_START_HOUR : hour >= DAY_START_HOUR ? DAY_START_HOUR : NIGHT_START_HOUR;
  const startDate = hour < DAY_START_HOUR ? previousDay(date) : date;
  return new Date(`${startDate}T${String(startHour).padStart(2, "0")}:00:00+05:00`);
}

/** The next handover after `value`. */
export function nextHandoverAt(value) {
  return new Date(lastHandoverAt(value).getTime() + 12 * 60 * 60 * 1000);
}

export function shiftLabel(value) {
  return LEAD_SHIFTS.find((s) => s.value === value)?.label ?? "—";
}

/** Everything the admin queue banner needs about the shift that is on now. */
export function currentShiftInfo(now = new Date()) {
  const shift = leadShiftFor(now);
  return {
    shift,
    label: shiftLabel(shift),
    hours: LEAD_SHIFTS.find((s) => s.value === shift).hours,
    shiftDate: shiftDateFor(now),
    startedAt: lastHandoverAt(now),
    endsAt: nextHandoverAt(now),
  };
}
