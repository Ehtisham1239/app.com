import { SITE_URL } from "@/lib/config";
import { BRAND_NAME, canonicalUrl } from "@/lib/seo";
import imageManifest from "@/lib/image-manifest.json";
import { heroArt } from "./hero-art";
export function publicImageUrl(src) {
  if (!src) return undefined;
  const image = imageManifest.find(item => item.url === src || item.storage_url === src || item.previous_urls?.includes(src));
  return image ? `${SITE_URL}${image.url}` : src;
}
export function contentMetadata(record, { path, title, description, type = "website", locale = "en_GB" }) {
  const canonical = canonicalUrl(record.canonical_url, path, SITE_URL);
  const displayTitle = record.seo_title || title || record.title;
  const cover = publicImageUrl(record.cover_url || heroArt(path).src);
  const coverAsset = imageManifest.find(item => `${SITE_URL}${item.url}` === cover);
  const coverAlt = coverAsset?.replacesLegacyVisual ? coverAsset.alt : (record.cover_alt || coverAsset?.alt || displayTitle);
  return {
    title: record.seo_title ? { absolute: record.seo_title } : title || record.title,
    description,
    alternates: { canonical, types: { "application/rss+xml": [{ url: "/blog/feed.xml", title: "Online Quran College articles" }] } },
    robots: { index: !record.seo_noindex, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1, googleBot: { index: !record.seo_noindex, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    openGraph: { type, siteName: BRAND_NAME, locale, title: displayTitle, description, url: canonical, images: cover ? [{ url: cover, alt: coverAlt, ...(coverAsset ? { width: coverAsset.width, height: coverAsset.height } : {}) }] : [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: BRAND_NAME }], ...(type === "article" ? { publishedTime: record.published_at, modifiedTime: record.updated_at } : {}) },
    twitter: { card: "summary_large_image", title: displayTitle, description, images: [cover || `${SITE_URL}/opengraph-image`] },
  };
}
