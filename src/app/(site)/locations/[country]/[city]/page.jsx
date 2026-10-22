import { notFound } from "next/navigation";
import { LocationPage } from "@/components/site/location-page";
import { LOCATIONS, getLocation, locationPath, locationCmsSlug } from "@/lib/locations";
import { getPage } from "@/lib/site-data";
export const revalidate = 300;
export function generateStaticParams() { return LOCATIONS.flatMap((c) => c.cities.map((city) => ({ country: c.slug, city: city.slug }))); }
async function resolve(params) {
  const p = await params;
  const country = getLocation(p.country);
  const city = country?.cities.find((c) => c.slug === p.city);
  if (!country || !city) notFound();
  return { country, city };
}
export async function generateMetadata({ params }) {
  const { country, city } = await resolve(params);
  const page = await getPage(locationCmsSlug(country, city));
  const place = city ? `${city.name}, ${country.name}` : country.name;
  return { title: page?.seo_title || page?.title || `Online Quran classes in ${place}`, description: page?.seo_description || `Live one-to-one Quran lessons for children and adults in ${place}. Flexible online classes and fee enquiries in ${country.currency}.`, alternates: { canonical: locationPath(country, city) } };
}
export default async function Page({ params }) { return <LocationPage {...await resolve(params)} />; }
