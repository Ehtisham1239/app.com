import { LOCATIONS, getLocation, locationPath, locationCmsSlug, defaultLocationNoindex } from "./src/lib/locations.js";
import { LEARNING_GUIDES } from "./src/lib/learning-guides.js";
import { readFileSync } from "node:fs";
import { legacyImageRedirects } from "./src/lib/legacy-image-redirects.js";
const imageManifest = JSON.parse(readFileSync(new URL("./src/lib/image-manifest.json", import.meta.url), "utf8"));
/** @type {import('next').NextConfig} */
const securityHeaders = [
  // Disallow HTML event-handler attributes even on cacheable public pages.
  // This is separate from the nonce-based script policy on staff/auth routes.
  { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; script-src-attr 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

const nextConfig = {
  poweredByHeader: false,
  // experimental.inlineCss was tried (26 Oct 2026) and rejected: Next 16 embeds
  // the CSS three times per page (style tag plus flight data), tripling HTML.
  // Only CMS uploads from this project's public storage bucket are optimised.
  images: {
    remotePatterns: [new URL("https://lgbwidraztavhhbnbfhr.supabase.co/storage/v1/object/public/**")],
    formats: ["image/avif", "image/webp"],
    qualities: [75],
    minimumCacheTTL: 2678400,
  },
  reactStrictMode: true,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/brand/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=604800" }] },
      { source: "/images/learning/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
      { source: "/images/learning/:asset(.*-(?:r[0-9]+|v[0-9]+)-[0-9]+\\.(?:webp|avif))", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/images/hero/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/images/cms/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/images/islamic/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/icons/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "private, no-store, max-age=0" }] },
    ];
  },
  // Keep links from the previous WordPress site working
  async redirects() {
    const courses = ["noorani-qaida", "quran-nazara", "hifz-quran", "arabic-language", "quran-translation", "hadith-translation"];
    return [
      ...legacyImageRedirects(imageManifest),
      { source: "/images/learning/map-:region([a-z-]+)-r2-:width(400|800|1200).webp", destination: "/images/learning/oqc-learning-:region-v3-:width.webp", permanent: true },
      { source: "/images/learning/map-:region([a-z-]+)-:width(400|800|1200).webp", destination: "/images/learning/oqc-learning-:region-v3-:width.webp", permanent: true },
      ...LOCATIONS.flatMap((country) => [null, ...country.cities].map((city) => ({ source: `/${locationCmsSlug(country, city)}`, destination: locationPath(country, city), permanent: true }))),
      ...LEARNING_GUIDES.map((guide) => ({ source: `/${guide.slug}`, destination: guide.path, permanent: true })),
      { source: "/online-quran-classes-usa", destination: "/locations/united-states", permanent: true },
      { source: "/online-quran-classes-australia", destination: "/locations/australia", permanent: true },
      { source: "/online-quran-classes-uk", destination: "/locations/united-kingdom", permanent: true },
      // Old WordPress city URLs still rank in Search Console. Send them to an indexable
      // page so that standing is not passed to a noindex city page.
      ...["london", "birmingham", "manchester", "leeds", "bradford", "leicester"].map((slug) => {
        const uk = getLocation("united-kingdom"), city = uk.cities.find((c) => c.slug === slug);
        return { source: `/online-quran-classes-${slug}`, destination: defaultLocationNoindex(uk, city) ? locationPath(uk) : locationPath(uk, city), permanent: true };
      }),
      ...courses.map((slug) => ({ source: `/${slug}`, destination: `/courses/${slug}`, permanent: true })),
      { source: "/hifz-ul-quran-course", destination: "/courses/hifz-quran", permanent: true },
      { source: "/terms-conditions", destination: "/terms-and-conditions", permanent: true },
      { source: "/login.html", destination: "/admin/login", permanent: false },
      { source: "/login", destination: "/admin/login", permanent: false },
      { source: "/register", destination: "/free-trial", permanent: false },
    ];
  },
};

export default nextConfig;
