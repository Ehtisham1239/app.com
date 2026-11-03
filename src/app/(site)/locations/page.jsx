import { locationImage } from "@/lib/location-image";
import { contentMetadata } from "@/lib/seo-metadata";
import { LocationDirectory } from "@/components/site/location-directory";
import { PageHero } from "@/components/site/chrome";
import { LOCATIONS, locationPath } from "@/lib/locations";

export const metadata = contentMetadata({ title: "Online Quran classes by country & city", seo_noindex: false }, { path: "/locations", description: "Browse country and city time-zone guides for online Quran lessons. Admissions confirms teacher availability, fees and payment options before enrolment." });
export default function LocationsPage() {
  return <><PageHero immersive path="/locations" eyebrow="Learn from anywhere" title="Online Quran lesson guides by country" titleAccent="by country" intro="Explore online Quran classes by country and city with practical scheduling guides for local time zones. Admissions confirms availability, teacher matching and payment options before enrolment." />
    <section className="page-wrap py-16"><p className="mb-8 text-ink-soft">Browse online Quran classes by country using these practical time-zone and currency guides. Lessons are live and online only; a guide does not represent a local branch or guarantee that a specific teacher or payment option is available in every country.</p>
      <LocationDirectory countries={LOCATIONS.map(country => { const image = locationImage(country); return { name: country.name, slug: country.slug, currency: country.currency, image: { src: image.url, alt: image.alt, variants: image.variants, avif: image.avif, width: image.width, height: image.height }, path: locationPath(country), cities: country.cities.map(city => ({ name: city.name, path: locationPath(country, city) })) }; })} />
      <details className="mt-8 text-xs text-ink-soft"><summary className="cursor-pointer py-3">About the learning imagery</summary><p>AI-generated editorial scenes illustrate Quran learning at home. They do not depict documented students, teachers or local college branches.</p></details>
    </section></>;
}
