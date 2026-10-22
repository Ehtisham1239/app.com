"use client";
import Link from "next/link";
import { useState } from "react";
import { schedulePreview } from "@/lib/location-schedule";

export function LocationSchedule({ countryName, currency, places }) {
  const [citySlug, setCitySlug] = useState(places[0]?.slug || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("18:00");
  const place = places.find((p) => p.slug === citySlug) || places[0];
  const result = place && date ? schedulePreview(date, time, place.timezone) : null;
  const query = new URLSearchParams({ country: countryName, currency, ...(place ? { city: place.name } : {}) });
  return <section className="surface space-y-5 p-6 sm:p-8" aria-labelledby="schedule-title">
    <h2 id="schedule-title" className="text-2xl">Plan a lesson in your local time</h2>
    <p className="text-ink-soft">Choose a city, date and preferred time to compare it with the college coordination time in Asia/Karachi. This is a planning guide; our team confirms teacher availability and the final schedule.</p>
    <div className="grid gap-5 sm:grid-cols-3"><div><label className="field-label" htmlFor="schedule-city">City for time zone</label><select className="select" id="schedule-city" value={citySlug} onChange={(e) => setCitySlug(e.target.value)}>{places.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}</select></div>
      <div><label className="field-label" htmlFor="schedule-date">Preferred lesson date</label><input id="schedule-date" className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
      <div><label className="field-label" htmlFor="schedule-time">Preferred local time</label><input id="schedule-time" className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div></div>
    <div aria-live="polite" className="space-y-2 text-sm text-ink-soft"><p>Local time zone: <strong>{place?.timezone}</strong>. Seasonal clock changes are calculated for the date you choose.</p>
      {date && (result ? <><p>{place?.name}: <strong>{result.local}</strong></p><p>College coordination time: <strong>{result.comparison}</strong></p>{result.ambiguous && <p>This time occurs twice when clocks change. Confirm the UTC offset with the coordinator before booking.</p>}</> : <p role="alert">Choose a valid date and time. A clock change may skip this local time; try a different time.</p>)}</div>
    <Link className="btn btn-primary" href={`/free-trial?${query}`}>Request a trial for {place?.name || countryName}</Link>
  </section>;
}
