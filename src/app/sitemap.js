import { TRIAL_GUIDE_VIDEO } from "@/lib/trial-guide-video";
import { isVideoPageSlug, pageVideo, videoSitemapEntry } from "@/lib/page-video";
import { guideForSlug } from "@/lib/learning-guides";
import { getPublishedPageVideos, getPublishedSlugs } from "@/lib/site-data";
import { SITE_URL } from "@/lib/config";
import { shouldIncludeInSitemap } from "@/lib/seo";
import imageManifest from "@/lib/image-manifest.json";
import { heroArt } from "@/lib/hero-art";
const imageUrl = (src) => new URL(imageManifest.find((image) => image.storage_url === src || image.url === src || image.previous_urls?.includes(src))?.url || src, SITE_URL).href;
const fixedImages = {
  "": "/brand/hero.webp",
  "/contact": heroArt("/contact").src,
  "/free-trial": heroArt("/free-trial").src,
  "/pricing": heroArt("/pricing").src,
};
export const revalidate = 3600;
export default async function sitemap() {
  const [{ courses, posts, pages, teachers }, videoPages] = await Promise.all([getPublishedSlugs(), getPublishedPageVideos()]);
  const videos = new Map(videoPages.filter((page) => page.template === "standard" && isVideoPageSlug(page.slug) && !guideForSlug(page.slug)).map((page) => [page.slug, pageVideo(page.video)]));
  const fixed = ["", "/courses", "/pricing", "/free-trial", "/teachers", "/blog", "/faq", "/contact", "/careers", "/learn", "/quran-study"].map((path) => ({ url: `${SITE_URL}${path}`, ...(fixedImages[path] ? { images: [imageUrl(fixedImages[path])] } : {}), changeFrequency: path === "" ? "weekly" : "monthly", priority: path === "" ? 1 : 0.7 }));
  const content = (rows, prefix, priority) => rows.flatMap((row) => {
    const path = prefix === "" && guideForSlug(row.slug) ? guideForSlug(row.slug).path : `${prefix}/${row.slug}`;
    const video = prefix === "" ? videos.get(row.slug) : null;
    return shouldIncludeInSitemap(row, path, SITE_URL) ? [{ url: `${SITE_URL}${path}`, lastModified: row.updated_at, ...(row.cover_url ? { images: [imageUrl(row.cover_url)] } : {}), ...(video?.primary ? { videos: [videoSitemapEntry(video)] } : {}), priority }] : [];
  });
  const trialVideo = { url: `${SITE_URL}/trial-video`, videos: [videoSitemapEntry(pageVideo(TRIAL_GUIDE_VIDEO))] };
  return [...fixed, trialVideo, ...content(courses, "/courses", 0.8), ...content(pages.filter((p) => !p.slug.startsWith("locations-")), "", 0.5), ...content(posts, "/blog", 0.6), ...content(teachers, "/teachers", 0.5)];
}
