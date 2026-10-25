import { locationImage } from "@/lib/location-image";
import { contentMetadata } from "@/lib/seo-metadata";
import { LocationDirectory } from "@/components/site/location-directory";
import { PageHero } from "@/components/site/chrome";
import { LOCATIONS, locationPath } from "@/lib/locations";

export const metadata = contentMetadata({ title: "Online Quran classes by country & city", seo_noindex: false }, { path: "/locations", description: "Find live online Quran classes in the USA, UK, Canada, Australia and across Europe, with local currency fee enquiries and flexible class times." });
export default function LocationsPage() {
  return <><PageHero path="/locations" eyebrow="Learn from anywhere" title="One college. Your local time." intro="Explore online Quran classes for your country and city. Our teachers meet you online, wherever your family calls home." />
    <section className="page-wrap py-16"><p className="mb-8 text-ink-soft">All classes are online. These pages describe the communities we welcome, rather than physical college branches.</p>
      <LocationDirectory countries={LOCATIONS.map(country => ({ name: country.name, slug: country.slug, currency: country.currency, image: { src: locationImage(country).url.replace("-1200.webp", "-400.webp"), srcSet: [400, 800, 1200].map(width => `${locationImage(country).url.replace("1200.webp", `${width}.webp`)} ${width}w`).join(", "), alt: locationImage(country).alt }, path: locationPath(country), cities: country.cities.map(city => ({ name: city.name, path: locationPath(country, city) })) }))} />
      <details className="mt-8 text-xs text-ink-soft"><summary className="cursor-pointer py-3">Regional map credits</summary><p>Outlines: <a href="https://www.naturalearthdata.com/" className="underline">Natural Earth</a> (public domain). Coordinates: <a href="https://www.geonames.org/" className="underline">GeoNames</a>, <a href="https://creativecommons.org/licenses/by/4.0/" className="underline">CC BY 4.0</a>. Maps indicate online service areas, not physical branches.</p></details>
    </section></>;
}
