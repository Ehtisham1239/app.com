import { contentMetadata } from "@/lib/seo-metadata";
import { notFound } from "next/navigation";
import { LocationPage } from "@/components/site/location-page";
import { LOCATIONS, getLocation, locationPath, locationCmsSlug, locationSearchTitle, locationLocale, locationSearchIntro, locationIndexRecord } from "@/lib/locations";
import { getPage } from "@/lib/site-data";
export const revalidate = 300;
export function generateStaticParams() { return LOCATIONS.map((c) => ({ country: c.slug })); }
async function resolve(params) {
  const p = await params;
  const country = getLocation(p.country);
  const city = null;
  if (!country) notFound();
  return { country, city };
}
export async function generateMetadata({ params }) {
  const { country, city } = await resolve(params);
  const page = await getPage(locationCmsSlug(country, city));
  const place = country.name;
  return contentMetadata({ ...locationIndexRecord(page, country, city), seo_title: page?.seo_title || locationSearchTitle(country, city) }, { path: locationPath(country, city), locale: locationLocale(country), title: page?.title || `Online Quran classes in ${place}`, description: page?.seo_description || locationSearchIntro(country, city) });
}
export default async function Page({ params }) { return <LocationPage {...await resolve(params)} />; }
