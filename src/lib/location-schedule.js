import { MARKET_TIME_ZONES } from "./market-timezones.js";
import { DateTime, FixedOffsetZone } from "luxon";
import { locationTimeZone } from "./locations.js";

export function schedulePreview(date, time, zone, comparisonZone = "Asia/Karachi") {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  // Verified 25 October 2026: older browser time-zone data can still fall back in November.
  // Applies only to these IANA zones; historical dates and other provinces retain their own rules.
  // Sources: https://www2.gov.bc.ca/gov/content/governments/celebrating-british-columbia/daylight-saving-time
  // https://www.alberta.ca/albertas-new-time-system-abt
  const permanentOffset = date >= "2026-11-01" ? { "America/Vancouver": -420, "America/Edmonton": -360 }[zone] : undefined;
  const local = DateTime.fromISO(`${date}T${time}`, { zone: permanentOffset === undefined ? zone : FixedOffsetZone.instance(permanentOffset) });
  // DST spring transitions can skip a local time; never silently move the request.
  if (!local.isValid || local.toFormat("yyyy-MM-dd'T'HH:mm") !== `${date}T${time}`) return null;
  const possibilities = local.getPossibleOffsets();
  return {
    local: local.toFormat(permanentOffset === undefined ? "ccc, d LLL yyyy, HH:mm ZZZZ" : "ccc, d LLL yyyy, HH:mm 'UTC'ZZ"),
    comparison: local.setZone(comparisonZone).toFormat("ccc, d LLL yyyy, HH:mm ZZZZ"),
    utc: local.toUTC().toISO(), ambiguous: possibilities.length > 1,
  };
}
export function schedulingLocations(country, city) {
  return (city ? [city] : [...country.cities, ...(MARKET_TIME_ZONES[country.name] || [])]).map((item) => ({ name: item.name, slug: item.slug, timezone: locationTimeZone(country, item) }));
}
