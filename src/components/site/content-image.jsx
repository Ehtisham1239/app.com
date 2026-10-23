import manifest from "@/lib/image-manifest.json";

// Pre-encoded responsive files avoid runtime image transformation and reserve layout space.
export function ContentImage({ src, alt, className, sizes = "(max-width: 768px) 100vw, 900px", priority = false, branded = true }) {
  const asset = manifest.find((item) => item.url === src || item.storage_url === src);
  const photo = <picture className="block size-full">
    {asset?.avif?.length > 0 && <source type="image/avif" srcSet={asset.avif.map(v => `${v.url} ${v.width}w`).join(", ")} sizes={sizes} />}
    <img src={asset?.url || src} alt={alt ?? asset?.alt ?? ""} width={asset?.width || 1200} height={asset?.height || 800}
    srcSet={asset ? asset.variants.map((v) => `${v.url} ${v.width}w`).join(", ") : undefined}
    sizes={asset ? sizes : undefined} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" className={className} />
  </picture>;
  if (!branded || asset?.kind === "map") return photo;
  return <span className="brand-visual relative block size-full overflow-hidden" data-visual-kind="photo">{photo}<span className="visual-logo" aria-hidden="true"><img src="/brand/logo-160.webp" width={160} height={160} alt="" loading="lazy" decoding="async" /></span></span>;
}
