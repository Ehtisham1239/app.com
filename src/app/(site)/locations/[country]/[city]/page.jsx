import { contentMetadata } from "@/lib/seo-metadata";
import { locationImage } from "@/lib/location-image";
import { notFound } from "next/navigation";
import { LocationPage } from "@/components/site/location-page";
import { getLocation, locationPath, locationCmsSlug, locationSearchTitle, locationLocale, locationSearchIntro, locationIndexRecord, locationHeading, isLiveLocation, RESTORED_LOCATION_PATHS } from "@/lib/locations";
import { getPage } from "@/lib/site-data";
import { SEARCH_INTENTS } from "@/lib/search-intent";
export const revalidate = 3600;
// Owner decision (18 Nov 2026): every city page in RESTORED_LOCATION_PATHS is live.
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
  const image = locationImage(country, city);
  return contentMetadata({ ...locationIndexRecord(page, country, city), cover_url: page?.cover_url || image.url, cover_alt: page?.cover_url ? page.cover_alt : image.alt, seo_title: page?.seo_title || locationSearchTitle(country, city) }, { path: locationPath(country, city), locale: locationLocale(country), title: locationHeading(country, city, page?.title), description: page?.seo_description || SEARCH_INTENTS[locationPath(country, city)]?.description || locationSearchIntro(country, city) });
}
export default async function Page({ params }) { return <LocationPage {...await resolve(params)} />; }
