import { LOCATIONS, getLocation, locationPath, locationCmsSlug, defaultLocationNoindex } from "./src/lib/locations.js";
import { LEARNING_GUIDES } from "./src/lib/learning-guides.js";
import { readFileSync } from "node:fs";
import { legacyImageRedirects } from "./src/lib/legacy-image-redirects.js";
const imageManifest = JSON.parse(readFileSync(new URL("./src/lib/image-manifest.json", import.meta.url), "utf8"));
/** @type {import('next').NextConfig} */
const securityHeaders = [
  // Disallow HTML event-handler attributes even on cacheable public pages.
  // This is separate from the nonce-based script policy on staff/auth routes.
  { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; script-src-attr 'none'; upgrade-insecure-requests" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Origin-Agent-Cluster", value: "?1" },
];

// Hostinger's shared Node.js hosting caps threads and processes per account. Its
// webpack build (`npm run build:hostinger`) sets OQC_BUILD_CPUS so page-data
// collection starts a few workers instead of one per host CPU. Unset on Vercel.
const hostBuildCpus = Number.parseInt(process.env.OQC_BUILD_CPUS ?? "", 10);

const nextConfig = {
  poweredByHeader: false,
  ...(hostBuildCpus > 0 ? { experimental: { cpus: hostBuildCpus } } : {}),
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
      // The production alias (appcom-online-quran-college.vercel.app) serves the same pages as
      // www.onlinequrancollege.com. Keep every *.vercel.app host out of search indexes so only the
      // canonical domain is indexed; links stay followable. (From #65, 3 Nov 2026.)
      { source: "/:path*", has: [{ type: "host", value: "(?<vercelhost>.+\\.vercel\\.app)" }], headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }] },
      // The Hostinger mirror (*.hostingersite.com) is the same site on a temporary host; keep it out
      // of search indexes too so Google only ranks www.onlinequrancollege.com.
      { source: "/:path*", has: [{ type: "host", value: "(?<hostingerhost>.+\\.hostingersite\\.com)" }], headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }] },
    ];
  },
  // /blog stays static; only filtered or paged lists render per request, at the same address.
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/blog", has: [{ type: "query", key: "page" }], destination: "/blog/browse" },
        { source: "/blog", has: [{ type: "query", key: "category" }], destination: "/blog/browse" },
        // USA Google Ads landing page: static, self-contained files in public/usa-quran-classes.
        { source: "/usa-quran-classes", destination: "/usa-quran-classes/index.html" },
        { source: "/usa-quran-classes/thank-you", destination: "/usa-quran-classes/thank-you/index.html" },
      ],
    };
  },
  // Keep links from the previous WordPress site working
  async redirects() {
    const courses = ["noorani-qaida", "quran-nazara", "hifz-quran", "arabic-language", "quran-translation", "hadith-translation"];
    return [
      // Canonical host: the bare domain always moves to www. Vercel did this at the domain
      // level; on Hostinger both names reach the app, so the app does it (8 Nov 2026).
      { source: "/:path*", has: [{ type: "host", value: "onlinequrancollege.com" }], destination: "https://www.onlinequrancollege.com/:path*", permanent: true },
      // Short customer-review link (/review). /copoloit was shared briefly on 2 Nov 2026; keep it working.
      { source: "/review", destination: "/reviews", permanent: true },
      { source: "/copoloit", destination: "/reviews", permanent: true },
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
      // Old WordPress pages still in the search index (2 Nov 2026 site: check) that now 404.
      // Only exact-intent targets: /ramzan-course has no current equivalent and stays a 404.
      { source: "/quran-nazara-course", destination: "/courses/quran-nazara", permanent: true },
      { source: "/services", destination: "/courses", permanent: true },
      // Recovered original articles reviewed in the 31 October migration proposal.
      { source: "/how-to-learn-quran-by-heart-2", destination: "/blog/memorization-techniques-for-beginners", permanent: true },
      { source: "/start-teaching-the-quran-to-your-children", destination: "/blog/help-your-kids-learn-quran-online", permanent: true },
      { source: "/terms-conditions", destination: "/terms-and-conditions", permanent: true },
      { source: "/login.html", destination: "/admin/login", permanent: false },
      { source: "/login", destination: "/admin/login", permanent: false },
      { source: "/register", destination: "/free-trial", permanent: false },
    ];
  },
};

export default nextConfig;
