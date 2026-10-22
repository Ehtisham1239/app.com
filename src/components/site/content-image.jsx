import manifest from "@/lib/image-manifest.json";

// Pre-encoded responsive files avoid runtime image transformation and reserve layout space.
export function ContentImage({ src, alt, className, sizes = "(max-width: 768px) 100vw, 900px", priority = false }) {
  const asset = manifest.find((item) => item.url === src || item.storage_url === src);
  return <img src={asset?.url || src} alt={alt || asset?.alt || ""} width={asset?.width || 1200} height={asset?.height || 800}
    srcSet={asset ? asset.variants.map((v) => `${v.url} ${v.width}w`).join(", ") : undefined}
    sizes={asset ? sizes : undefined} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" className={className} />;
}
