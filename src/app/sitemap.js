import { LOCATIONS, locationPath } from "@/lib/locations";
import { getPublishedSlugs } from "@/lib/site-data";
import { SITE_URL } from "@/lib/config";

export const revalidate = 3600;

export default async function sitemap() {
  const { courses, posts, pages, teachers } = await getPublishedSlugs();
  const now = new Date();
  const fixed = ["", "/courses", "/pricing", "/free-trial", "/teachers", "/blog", "/faq", "/contact", "/verify-certificate"].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : p === "/free-trial" || p === "/courses" ? 0.9 : 0.7,
  }));
  return [
    ...fixed,
    { url: `${SITE_URL}/locations`, priority: 0.7 },
    ...LOCATIONS.flatMap((c) => [c, ...c.cities].map((item) => ({ url: `${SITE_URL}${locationPath(c, item === c ? null : item)}`, changeFrequency: "monthly", priority: item === c ? 0.7 : 0.6 }))),
    ...courses.map((c) => ({ url: `${SITE_URL}/courses/${c.slug}`, lastModified: c.updated_at, priority: 0.8 })),
    ...pages.filter((p) => !p.slug.startsWith("locations-")).map((p) => ({ url: `${SITE_URL}/${p.slug}`, lastModified: p.updated_at, priority: 0.5 })),
    ...posts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.updated_at, priority: 0.6 })),
    ...teachers.map((t) => ({ url: `${SITE_URL}/teachers/${t.slug}`, lastModified: t.updated_at, priority: 0.5 })),
  ];
}
