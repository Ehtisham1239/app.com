import { contentMetadata } from "@/lib/seo-metadata";
import { LocationDirectory } from "@/components/site/location-directory";
import { PageHero } from "@/components/site/chrome";
import { LOCATIONS, locationPath } from "@/lib/locations";

export const metadata = contentMetadata({ title: "Online Quran classes by country & city", seo_noindex: false }, { path: "/locations", description: "Find live online Quran classes in the USA, UK, Canada, Australia and across Europe, with local currency fee enquiries and flexible class times." });
export default function LocationsPage() {
  return <><PageHero path="/locations" eyebrow="Learn from anywhere" title="One college. Your local time." intro="Explore online Quran classes for your country and city. Our teachers meet you online, wherever your family calls home." />
    <section className="page-wrap py-16"><p className="mb-8 text-ink-soft">All classes are online. These pages describe the communities we welcome, rather than physical college branches.</p>
      <LocationDirectory countries={LOCATIONS.map(country => ({ name: country.name, slug: country.slug, currency: country.currency, path: locationPath(country), cities: country.cities.map(city => ({ name: city.name, path: locationPath(country, city) })) }))} />
    </section></>;
}
