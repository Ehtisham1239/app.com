import { contentMetadata } from "@/lib/seo-metadata";
import { notFound } from "next/navigation";
import { LocationPage } from "@/components/site/location-page";
import { getLocation, locationPath, locationCmsSlug, locationSearchTitle, locationLocale, locationSearchIntro, locationIndexRecord, locationHeading, isLiveLocation, RESTORED_LOCATION_PATHS } from "@/lib/locations";
import { getPage } from "@/lib/site-data";
import { SEARCH_INTENTS } from "@/lib/search-intent";
export const revalidate = 300;
// Owner decision (18 Nov 2026): only the city pages in RESTORED_LOCATION_PATHS are live; next.config.mjs redirects every other city.
export function generateStaticParams() { return RESTORED_LOCATION_PATHS.filter((p) => p.includes("/")).map((p) => { const [country, city] = p.split("/"); return { country, city }; }); }
async function resolve(params) {
  const p = await params;
  const country = getLocation(p.country);
  const city = country?.cities.find((c) => c.slug === p.city) || null;
  if (!country || !city || !isLiveLocation(country, city)) notFound();
  return { country, city };
}
export async function generateMetadata({ params }) {
  const { country, city } = await resolve(params);
  const page = await getPage(locationCmsSlug(country, city));
  return contentMetadata({ ...locationIndexRecord(page, country, city), seo_title: page?.seo_title || locationSearchTitle(country, city) }, { path: locationPath(country, city), locale: locationLocale(country), title: locationHeading(country, city, page?.title), description: page?.seo_description || SEARCH_INTENTS[locationPath(country, city)]?.description || locationSearchIntro(country, city) });
}
export default async function Page({ params }) { return <LocationPage {...await resolve(params)} />; }
