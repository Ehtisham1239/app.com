import { DateTime } from "luxon";
import { locationTimeZone } from "./locations.js";

export function schedulePreview(date, time, zone, comparisonZone = "Asia/Karachi") {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const local = DateTime.fromISO(`${date}T${time}`, { zone });
  // DST spring transitions can skip a local time; never silently move the request.
  if (!local.isValid || local.toFormat("yyyy-MM-dd'T'HH:mm") !== `${date}T${time}`) return null;
  const possibilities = local.getPossibleOffsets();
  return {
    local: local.toFormat("ccc, d LLL yyyy, HH:mm ZZZZ"),
    comparison: local.setZone(comparisonZone).toFormat("ccc, d LLL yyyy, HH:mm ZZZZ"),
    utc: local.toUTC().toISO(), ambiguous: possibilities.length > 1,
  };
}
export function schedulingLocations(country, city) {
  return (city ? [city] : country.cities).map((item) => ({ name: item.name, slug: item.slug, timezone: locationTimeZone(country, item) }));
}
