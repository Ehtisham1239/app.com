import { LOCATIONS, locationPath, locationCmsSlug } from "@/lib/locations";
import { getPublishedSlugs } from "@/lib/site-data";
import { SITE_URL } from "@/lib/config";
import { shouldIncludeInSitemap } from "@/lib/seo";
export const revalidate = 3600;
export default async function sitemap() {
  const { courses, posts, pages, teachers } = await getPublishedSlugs();
  const fixed = ["", "/courses", "/pricing", "/free-trial", "/teachers", "/blog", "/faq", "/contact", "/verify-certificate", "/locations"].map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: path === "" ? "weekly" : "monthly", priority: path === "" ? 1 : 0.7 }));
  const locationPages = new Map(pages.map((p) => [p.slug, p]));
  const locations = LOCATIONS.flatMap((country) => [null, ...country.cities].flatMap((city) => {
    const path = locationPath(country, city), page = locationPages.get(locationCmsSlug(country, city));
    return shouldIncludeInSitemap(page, path, SITE_URL) ? [{ url: `${SITE_URL}${path}`, ...(page?.updated_at ? { lastModified: page.updated_at } : {}), changeFrequency: "monthly", priority: city ? 0.6 : 0.7 }] : [];
  }));
  const content = (rows, prefix, priority) => rows.flatMap((row) => {
    const path = `${prefix}/${row.slug}`;
    return shouldIncludeInSitemap(row, path, SITE_URL) ? [{ url: `${SITE_URL}${path}`, lastModified: row.updated_at, priority }] : [];
  });
  return [...fixed, ...locations, ...content(courses, "/courses", 0.8), ...content(pages.filter((p) => !p.slug.startsWith("locations-")), "", 0.5), ...content(posts, "/blog", 0.6), ...content(teachers, "/teachers", 0.5)];
}
