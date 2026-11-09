import Link from "next/link";
import { locationImage } from "@/lib/location-image";
import { contentMetadata } from "@/lib/seo-metadata";
import { LocationDirectory } from "@/components/site/location-directory";
import { PageHero } from "@/components/site/chrome";
import { INDEXED_MARKETS, LOCATIONS, getLocation, locationPath } from "@/lib/locations";

export const metadata = contentMetadata({ title: "Online Quran classes by country & city", seo_noindex: false }, { path: "/locations", description: "Browse country and city time-zone guides for online Quran lessons. Admissions confirms teacher availability, fees and payment options before enrolment." });
export default function LocationsPage() {
  return <><PageHero immersive path="/locations" eyebrow="Learn from anywhere" title="Online Quran lesson guides by country" titleAccent="by country" intro="Explore online Quran classes by country and city with practical scheduling guides for local time zones. Admissions confirms availability, teacher matching and payment options before enrolment." />
    <section className="page-wrap py-16"><p className="mb-8 text-ink-soft">Browse online Quran classes by country using these practical time-zone and currency guides. Lessons are live and online only; a guide does not represent a local branch or guarantee that a specific teacher or payment option is available in every country.</p>
      <section className="mb-8 rounded-2xl border border-leaf-100 bg-leaf-50 p-5 sm:p-7" aria-labelledby="popular-market-guides">
        <h2 id="popular-market-guides" className="text-2xl">Plan lessons in your local time</h2>
        <p className="mt-2 text-ink-soft">Use these country guides to compare lesson times, then check fees and teacher availability with Admissions.</p>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {INDEXED_MARKETS.map(getLocation).map(country => <li key={country.slug}><Link className="font-semibold text-leaf-700 underline underline-offset-4" href={locationPath(country)}>{country.name} lesson guide</Link></li>)}
          <li><a className="font-semibold text-leaf-700 underline underline-offset-4" href="#new-zealand-lessons">New Zealand lesson planning</a></li>
        </ul>
        <div id="new-zealand-lessons" className="mt-6 border-t border-leaf-100 pt-5">
          <h3 className="text-lg">Online Quran lessons for families in New Zealand</h3>
          <p className="mt-2 max-w-3xl text-ink-soft">For Auckland, Wellington or Christchurch, suggest a date and time in your local clock, such as after school or early evening. New Zealand moves between NZST and NZDT, so include the date when you ask about a recurring slot. The coordinator confirms the teacher, timetable and payment currency before enrolment.</p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <li><Link className="font-semibold text-leaf-700 underline underline-offset-4" href="/free-trial?country=New+Zealand&lesson_timezone=Pacific%2FAuckland">Discuss a New Zealand lesson time</Link></li>
            <li><a className="text-leaf-700 underline underline-offset-4" href="https://www.govt.nz/browse/recreation-and-the-environment/daylight-saving/">New Zealand Government daylight saving dates</a></li>
          </ul>
        </div>
      </section>
      <LocationDirectory countries={LOCATIONS.map(country => { const image = locationImage(country); return { name: country.name, slug: country.slug, currency: country.currency, image: { src: image.url, alt: image.alt, variants: image.variants, avif: image.avif, width: image.width, height: image.height }, path: locationPath(country), cities: country.cities.map(city => ({ name: city.name, path: locationPath(country, city) })) }; })} />
      <details className="mt-8 text-xs text-ink-soft"><summary className="cursor-pointer py-3">About the learning imagery</summary><p>AI-generated editorial scenes illustrate Quran learning at home. They do not depict documented students, teachers or local college branches.</p></details>
    </section></>;
}
