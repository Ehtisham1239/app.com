import { timeFacts, TIME_FACTS_YEAR } from "@/lib/location-time-facts";

// Computed from the IANA time-zone database; says nothing about local offices or teachers.
export function LocationTimeFacts({ placeName, timeZone }) {
  const f = timeFacts(timeZone);
  return <section aria-labelledby="time-facts-title" className="surface space-y-4 p-6 sm:p-8">
    <h2 id="time-facts-title" className="text-2xl">Lesson times for {placeName}</h2>
    <p className="text-ink-soft">{placeName} uses the {timeZone.replace("_", " ")} time zone: {f.jan} in January and {f.jul} in July.{" "}
      {f.observesDst
        ? `Clocks change on ${f.changes.map((c) => `${c.date} ${TIME_FACTS_YEAR}`).join(" and ")}, so the gap to places that change on other dates, differs for a few weeks around then. Check the converted time again before a lesson near those dates.`
        : "Clocks do not change during the year, so a lesson at a fixed local time stays at the same UTC time; only the UK and US clocks move around it."}
    </p>
    <div className="article-table-scroll" role="region" aria-label={`Time comparisons for ${placeName}`} tabIndex={0}><table className="text-sm">
      <caption className="mb-2 text-left text-ink-soft">What a lesson time in {placeName} is on UK and US East Coast clocks</caption>
      <thead><tr className="border-b border-line"><th scope="col" className="py-2 pr-4">Lesson time in {placeName}</th>{f.conversions[0].zones.flatMap((z) => [<th key={`${z.name}j`} scope="col" className="py-2 pr-4">{z.name}, January</th>, <th key={`${z.name}u`} scope="col" className="py-2 pr-4">{z.name}, July</th>])}</tr></thead>
      <tbody>{f.conversions.map((row) => <tr key={row.local} className="border-b border-line/60"><th scope="row" className="py-2 pr-4 font-semibold">{row.local}</th>{row.zones.flatMap((z) => [<td key={`${z.name}j`} className="py-2 pr-4">{z.jan}</td>, <td key={`${z.name}u`} className="py-2 pr-4">{z.jul}</td>])}</tr>)}</tbody>
    </table></div>
    <p className="text-xs text-ink-soft">Based on the {TIME_FACTS_YEAR} tz database rules. Classes are live and online; the coordinator confirms the exact slot for your learner.</p>
  </section>;
}
