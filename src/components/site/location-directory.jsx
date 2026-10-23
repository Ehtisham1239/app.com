"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Globe2, Search } from "lucide-react";

const aliases = { 'united-kingdom': 'uk britain england scotland wales', 'united-states': 'usa us america', australia: 'aus' };
export function LocationDirectory({ countries }) {
  const [query, setQuery] = useState('');
  const term = query.trim().toLocaleLowerCase();
  const matches = countries.filter(country => `${country.name} ${aliases[country.slug] || ''} ${country.cities.map(city => city.name).join(' ')}`.toLocaleLowerCase().includes(term));
  return <>
    <div className="mb-8 max-w-xl">
      <label htmlFor="location-search" className="field-label">Find your country or city</label>
      <div className="relative"><Search className="pointer-events-none absolute left-4 top-3.5 size-5 text-leaf-700" aria-hidden="true" /><input id="location-search" type="search" className="input pl-12" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try USA, Australia or Sydney" autoComplete="off" aria-describedby="location-results" /></div>
      <p id="location-results" role="status" className="mt-3 text-sm text-ink-soft">{matches.length} {matches.length === 1 ? 'country' : 'countries'}{term ? ' found' : ' available'}</p>
      {term && <button type="button" className="mt-2 rounded-lg px-3 py-3 text-sm font-semibold text-leaf-700 underline" onClick={() => setQuery('')}>Clear search</button>}
    </div>
    {!matches.length ? <div className="surface p-8"><h2 className="text-xl">No matching location</h2><p className="mt-3 text-ink-soft">Try a country name or <Link className="font-semibold text-leaf-700 underline" href="/contact">ask us about classes in your time zone</Link>.</p></div> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{matches.map(country => <article className="surface p-6" key={country.slug}>
      <div className="flex items-center justify-between"><Globe2 className="size-6 text-leaf-700" aria-hidden="true" /><span className="chip">{country.currency}</span></div>
      <h2 className="mt-4 text-xl"><Link href={country.path} className="hover:text-leaf-700">{country.name}</Link></h2>
      <p className="mt-2 text-sm text-ink-soft">{country.cities.map(city => city.name).join(' · ')}</p>
      {term && country.cities.filter(city => city.name.toLocaleLowerCase().includes(term)).map(city => <Link key={city.path} href={city.path} className="mt-3 block py-2 text-sm font-semibold text-leaf-700 underline">Classes in {city.name}</Link>)}
      <Link href={country.path} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-leaf-700">Explore {country.name} classes <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" /></Link>
    </article>)}</div>}
  </>;
}
