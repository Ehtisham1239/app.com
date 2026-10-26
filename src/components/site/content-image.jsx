import { getImageProps } from "next/image";
import manifest from "@/lib/image-manifest.json";

// CMS uploads in Supabase storage (often multi-megabyte PNGs) go through the
// Next image optimizer, which serves cached AVIF/WebP at the requested width.
const CMS_STORAGE = /^https:\/\/lgbwidraztavhhbnbfhr\.supabase\.co\/storage\/v1\/object\/public\//;

// Pre-encoded responsive files avoid runtime image transformation and reserve layout space.
export function ContentImage({ src, alt, className, sizes = "(max-width: 768px) 100vw, 900px", priority = false }) {
  const asset = manifest.find((item) => item.url === src || item.storage_url === src || item.previous_urls?.includes(src));
  if (!asset && typeof src === "string" && CMS_STORAGE.test(src)) {
    const { props } = getImageProps({ src, alt: alt ?? "", width: 1200, height: 800, sizes, quality: 75 });
    return <img {...props} alt={props.alt} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" className={className} />;
  }
  // Keep the picture element in its native inline flow. A 100%-height wrapper
  // stretches to the whole grid column and leaves a large gap on contact pages.
  return <picture>
    {asset?.avif?.length > 0 && <source type="image/avif" srcSet={asset.avif.map(v => `${v.url} ${v.width}w`).join(", ")} sizes={sizes} />}
    <img src={asset?.url || src} alt={asset?.replacesLegacyVisual ? asset.alt : (alt ?? asset?.alt ?? "")} width={asset?.width || 1200} height={asset?.height || 800}
    srcSet={asset ? asset.variants.map((v) => `${v.url} ${v.width}w`).join(", ") : undefined}
    sizes={asset ? sizes : undefined} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" className={className} />
  </picture>;
}
