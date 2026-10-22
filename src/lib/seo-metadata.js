import { SITE_URL } from "@/lib/config";
import { BRAND_NAME, canonicalUrl } from "@/lib/seo";
export function contentMetadata(record, { path, title, description, type = "website", locale = "en_GB" }) {
  const canonical = canonicalUrl(record.canonical_url, path, SITE_URL);
  const displayTitle = record.seo_title || title || record.title;
  return {
    title: record.seo_title ? { absolute: record.seo_title } : title || record.title,
    description,
    alternates: { canonical },
    robots: { index: !record.seo_noindex, follow: true },
    openGraph: { type, siteName: BRAND_NAME, locale, title: displayTitle, description, url: canonical, images: record.cover_url ? [{ url: record.cover_url, alt: record.cover_alt || record.title }] : [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: BRAND_NAME }], ...(type === "article" ? { publishedTime: record.published_at, modifiedTime: record.updated_at } : {}) },
    twitter: { card: "summary_large_image", title: displayTitle, description, images: [record.cover_url || `${SITE_URL}/opengraph-image`] },
  };
}
