import { contentMetadata } from "@/lib/seo-metadata";
import { notFound } from "next/navigation";
import { LocationPage } from "@/components/site/location-page";
import { LOCATIONS, getLocation, locationPath, locationCmsSlug, locationSearchTitle, locationLocale, locationSearchIntro, locationIndexRecord, locationHeading, INDEXED_MARKETS, marketHreflang } from "@/lib/locations";
import { SITE_URL } from "@/lib/config";
import { getPage } from "@/lib/site-data";
import { shouldIncludeInSitemap } from "@/lib/seo";
import { SEARCH_INTENTS } from "@/lib/search-intent";
export const revalidate = 300;
export function generateStaticParams() { return LOCATIONS.map((c) => ({ country: c.slug })); }
async function resolve(params) {
  const p = await params;
  const country = getLocation(p.country);
  const city = null;
  if (!country) notFound();
  return { country, city };
}
async function indexableMarketLanguages(currentSlug, currentPage) {
  const alternates = await Promise.all(Object.entries(marketHreflang(SITE_URL)).map(async ([language, url]) => {
    if (language === "x-default") return [language, url];
    const path = new URL(url).pathname;
    const country = getLocation(path.split("/").at(-1));
    const page = country.slug === currentSlug ? currentPage : await getPage(locationCmsSlug(country));
    return shouldIncludeInSitemap(locationIndexRecord(page, country, null), path, SITE_URL)
      ? [language, url]
      : null;
  }));
  const entries = alternates.filter(Boolean);
  return entries.some(([, url]) => url === `${SITE_URL}/locations/${currentSlug}`)
    ? Object.fromEntries(entries)
    : undefined;
}
export async function generateMetadata({ params }) {
  const { country, city } = await resolve(params);
  const page = await getPage(locationCmsSlug(country, city));
  const languages = INDEXED_MARKETS.includes(country.slug)
    ? await indexableMarketLanguages(country.slug, page)
    : undefined;
  return contentMetadata({ ...locationIndexRecord(page, country, city), seo_title: page?.seo_title || locationSearchTitle(country, city) }, { path: locationPath(country, city), locale: locationLocale(country), languages, title: locationHeading(country, city, page?.title), description: page?.seo_description || SEARCH_INTENTS[locationPath(country)]?.description || SEARCH_INTENTS[locationPath(country)]?.intro || locationSearchIntro(country, city) });
}
export default async function Page({ params }) { return <LocationPage {...await resolve(params)} />; }
