import Link from "next/link";
import { Globe2, ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/site/chrome";
import { LOCATIONS, locationPath } from "@/lib/locations";

export const metadata = { title: "Online Quran classes by country & city", description: "Find live online Quran classes in the USA, UK, Canada, Australia and across Europe, with local currency fee enquiries and flexible class times.", alternates: { canonical: "/locations" } };
export default function LocationsPage() {
  return <><PageHero eyebrow="Learn from anywhere" title="One college. Your local time." intro="Explore online Quran classes for your country and city. Our teachers meet you online, wherever your family calls home." />
    <section className="page-wrap py-16"><p className="mb-8 text-ink-soft">All classes are online. These pages describe the communities we welcome, rather than physical college branches.</p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{LOCATIONS.map((country) => <Link className="surface group p-6 hover:border-leaf-600" key={country.slug} href={locationPath(country)}><div className="flex items-center justify-between"><Globe2 className="size-6 text-leaf-700" /><span className="chip">{country.currency}</span></div><h2 className="mt-4 text-xl">{country.name}</h2><p className="mt-2 text-sm text-ink-soft">{country.cities.map((city) => city.name).join(" · ")}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-leaf-700">Explore classes <ArrowUpRight className="size-4" /></span></Link>)}</div>
    </section></>;
}
