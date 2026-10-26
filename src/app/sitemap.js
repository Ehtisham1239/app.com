import { guideForSlug } from "@/lib/learning-guides";
import { LOCATIONS, isCityState, locationPath, locationCmsSlug } from "@/lib/locations";
import { getPublishedSlugs } from "@/lib/site-data";
import { SITE_URL } from "@/lib/config";
import { shouldIncludeInSitemap } from "@/lib/seo";
import imageManifest from "@/lib/image-manifest.json";
const imageUrl = (src) => new URL(imageManifest.find((image) => image.storage_url === src || image.url === src || image.previous_urls?.includes(src))?.url || src, SITE_URL).href;
const fixedImages = {
  "": "/brand/hero.webp",
  "/contact": "/images/learning/contact-coordinator-r2-1200.webp",
  "/free-trial": "/images/islamic/online-lesson-adult-v1-1200.webp",
  "/pricing": "/images/islamic/online-lesson-adult-v1-1200.webp",
  "/locations": "/images/hero/online-lesson-child-v1-1200.webp",
};
export const revalidate = 3600;
export default async function sitemap() {
  const { courses, posts, pages, teachers } = await getPublishedSlugs();
  const fixed = ["", "/courses", "/pricing", "/free-trial", "/teachers", "/blog", "/faq", "/contact", "/careers", "/locations", "/learn"].map((path) => ({ url: `${SITE_URL}${path}`, ...(fixedImages[path] ? { images: [imageUrl(fixedImages[path])] } : {}), changeFrequency: path === "" ? "weekly" : "monthly", priority: path === "" ? 1 : 0.7 }));
  const locationPages = new Map(pages.map((p) => [p.slug, p]));
  const locations = LOCATIONS.flatMap((country) => [null, ...country.cities.filter((city) => !isCityState(country, city))].flatMap((city) => {
    const path = locationPath(country, city), page = locationPages.get(locationCmsSlug(country, city));
    return shouldIncludeInSitemap(page, path, SITE_URL) ? [{ url: `${SITE_URL}${path}`, ...(page?.updated_at ? { lastModified: page.updated_at } : {}), ...(page?.cover_url ? { images: [imageUrl(page.cover_url)] } : {}), changeFrequency: "monthly", priority: city ? 0.6 : 0.7 }] : [];
  }));
  const content = (rows, prefix, priority) => rows.flatMap((row) => {
    const path = prefix === "" && guideForSlug(row.slug) ? guideForSlug(row.slug).path : `${prefix}/${row.slug}`;
    return shouldIncludeInSitemap(row, path, SITE_URL) ? [{ url: `${SITE_URL}${path}`, lastModified: row.updated_at, ...(row.cover_url ? { images: [imageUrl(row.cover_url)] } : {}), priority }] : [];
  });
  return [...fixed, ...locations, ...content(courses, "/courses", 0.8), ...content(pages.filter((p) => !p.slug.startsWith("locations-")), "", 0.5), ...content(posts, "/blog", 0.6), ...content(teachers, "/teachers", 0.5)];
}
