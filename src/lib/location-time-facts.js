// Factual, computed time-zone facts for a place (no claims about local offices or teachers).
// All values come from the IANA tz database through Intl, for a fixed reference year, so the
// output is deterministic and does not drift between renders.
export const TIME_FACTS_YEAR = 2027;
const REFERENCE_ZONES = [["London", "Europe/London"], ["New York", "America/New_York"]];
const LOCAL_HOURS = [7, 16, 18, 20];

function offsetMinutes(timeZone, date) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" }).formatToParts(date);
  const v = Object.fromEntries(parts.filter((p) => p.type !== "literal").map((p) => [p.type, Number(p.value)]));
  return Math.round((Date.UTC(v.year, v.month - 1, v.day, v.hour, v.minute, v.second) - date.getTime()) / 60000);
}
export const formatOffset = (min) => `UTC${min < 0 ? "−" : "+"}${String(Math.floor(Math.abs(min) / 60)).padStart(2, "0")}:${String(Math.abs(min) % 60).padStart(2, "0")}`;
const noonUtc = (m, d) => new Date(Date.UTC(TIME_FACTS_YEAR, m, d, 12));
const fmtTime = (min) => { const m = ((min % 1440) + 1440) % 1440; const h = Math.floor(m / 60), mm = m % 60; return `${h % 12 || 12}${mm ? `:${String(mm).padStart(2, "0")}` : ""} ${h < 12 ? "am" : "pm"}`; };
const dayShift = (min) => (min < 0 ? " (previous day)" : min >= 1440 ? " (next day)" : "");

export function timeFacts(timeZone) {
  const winter = offsetMinutes(timeZone, noonUtc(0, 15)), summer = offsetMinutes(timeZone, noonUtc(6, 15));
  // DST transitions in the reference year: first day (scanning daily) whose offset differs from the previous day.
  const changes = [];
  let prev = offsetMinutes(timeZone, noonUtc(0, 1));
  for (let day = 1; day <= 366; day++) {
    const d = new Date(Date.UTC(TIME_FACTS_YEAR, 0, 1 + day, 12));
    if (d.getUTCFullYear() !== TIME_FACTS_YEAR) break;
    const o = offsetMinutes(timeZone, d);
    if (o !== prev) { changes.push({ date: new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "long" }).format(d), toOffset: o }); prev = o; }
  }
  const observesDst = winter !== summer || changes.length > 0;
  const conversions = LOCAL_HOURS.map((h) => ({
    local: fmtTime(h * 60),
    zones: REFERENCE_ZONES.map(([name, tz]) => {
      const row = {};
      for (const [season, month] of [["jan", 0], ["jul", 6]]) {
        const mins = h * 60 - offsetMinutes(timeZone, noonUtc(month, 15)) + offsetMinutes(tz, noonUtc(month, 15));
        row[season] = `${fmtTime(mins)}${dayShift(mins)}`;
      }
      return { name, ...row };
    }),
  }));
  return { jan: formatOffset(winter), jul: formatOffset(summer), observesDst, changes, conversions };
}
