import { TRIAL_GUIDE_VIDEO } from "@/lib/trial-guide-video";
import { isVideoPageSlug, pageVideo, videoSitemapEntry } from "@/lib/page-video";
import { guideForSlug } from "@/lib/learning-guides";
import { INDEXED_MARKETS, RESTORED_LOCATION_PATHS, getLocation, locationPath, locationCmsSlug, locationIndexRecord, locationLastModified } from "@/lib/locations";
import { MARKET_GUIDES } from "@/lib/market-guides";
import { locationImage } from "@/lib/location-image";
import { getPublishedPageVideos, getPublishedSlugs } from "@/lib/site-data";
import { SITE_URL } from "@/lib/config";
import { shouldIncludeInSitemap } from "@/lib/seo";
import { contentVisual } from "@/lib/content-visual";
import { publicImageUrl } from "@/lib/seo-metadata";
import { heroArt } from "@/lib/hero-art";
const imageUrl = (src) => new URL(publicImageUrl(src), SITE_URL).href;
const fixedImages = {
  "": "/brand/oqc-home-hero-v3-640.webp",
  "/courses": "/images/quran-courses-family.webp",
  "/quran-study": "/images/quran-study-rehal-1200.webp",
  "/blog": heroArt("/blog").src,
  "/contact": heroArt("/contact").src,
  "/free-trial": heroArt("/free-trial").src,
  "/pricing": heroArt("/pricing").src,
  "/locations": heroArt("/courses").src,
};
export const revalidate = 3600;
export default async function sitemap() {
  const [{ courses, posts, pages, teachers }, videoPages] = await Promise.all([getPublishedSlugs(), getPublishedPageVideos()]);
  const videos = new Map(videoPages.filter((page) => page.template === "standard" && isVideoPageSlug(page.slug) && !guideForSlug(page.slug)).map((page) => [page.slug, pageVideo(page.video)]));
  const fixed = ["", "/courses", "/pricing", "/free-trial", "/teachers", "/blog", "/faq", "/contact", "/careers", "/locations", "/learn", "/quran-study", "/reviews", "/verify-certificate", "/usa-quran-classes", "/at-a-glance", ...(courses.some((c) => c.category === "academic") ? ["/academic-subjects"] : [])].map((path) => ({ url: `${SITE_URL}${path}`, ...(fixedImages[path] ? { images: [imageUrl(fixedImages[path])] } : {}), changeFrequency: path === "" ? "weekly" : "monthly", priority: path === "" ? 1 : 0.7 }));
  const statePages = ["/usa-quran-classes/states", "/maryland-quran-classes", "/massachusetts-quran-classes", "/north-carolina-quran-classes", "/minnesota-quran-classes", "/arizona-quran-classes", "/wisconsin-quran-classes", "/missouri-quran-classes", "/connecticut-quran-classes", "/indiana-quran-classes", "/tennessee-quran-classes"].map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: "monthly", priority: 0.6 }));
  const locationPages = new Map(pages.map((p) => [p.slug, p]));
  const locationEntries = [...INDEXED_MARKETS.map((slug) => [slug, null]), ...RESTORED_LOCATION_PATHS.map((p) => p.split("/"))];
  const locations = locationEntries.flatMap(([countrySlug, citySlug]) => {
    const country = getLocation(countrySlug), city = citySlug ? country?.cities.find((c) => c.slug === citySlug) : null;
    if (!country || (citySlug && !city)) return [];
    const path = locationPath(country, city), page = locationPages.get(locationCmsSlug(country, city));
    return shouldIncludeInSitemap(locationIndexRecord(page, country, city), path, SITE_URL) ? [{ url: `${SITE_URL}${path}`, lastModified: locationLastModified(page, city ? undefined : MARKET_GUIDES[country.slug]?.updatedAt), images: [imageUrl(locationImage(country, city).url)], changeFrequency: "monthly", priority: city ? 0.5 : 0.7 }] : [];
  });
  const content = (rows, prefix, priority) => rows.flatMap((row) => {
    const path = prefix === "" && guideForSlug(row.slug) ? guideForSlug(row.slug).path : `${prefix}/${row.slug}`;
    const video = prefix === "" ? videos.get(row.slug) : null;
    const cover = prefix === "/blog" ? contentVisual(row).src : row.cover_url;
    return shouldIncludeInSitemap(row, path, SITE_URL) ? [{ url: `${SITE_URL}${path}`, lastModified: row.updated_at, ...(cover ? { images: [imageUrl(cover)] } : {}), ...(video?.primary ? { videos: [videoSitemapEntry(video)] } : {}), priority }] : [];
  });
  const trialVideo = { url: `${SITE_URL}/trial-video`, videos: [videoSitemapEntry(pageVideo(TRIAL_GUIDE_VIDEO))] };
  return [...fixed, ...statePages, trialVideo, ...locations, ...content(courses, "/courses", 0.8), ...content(pages.filter((p) => !p.slug.startsWith("locations-")), "", 0.5), ...content(posts, "/blog", 0.6), ...content(teachers, "/teachers", 0.5)];
}
