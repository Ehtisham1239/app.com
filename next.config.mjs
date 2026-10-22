/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  // Keep links from the previous WordPress site working
  async redirects() {
    const courses = ["noorani-qaida", "quran-nazara", "hifz-quran", "arabic-language", "quran-translation", "hadith-translation"];
    return [
      ...courses.map((slug) => ({ source: `/${slug}`, destination: `/courses/${slug}`, permanent: true })),
      { source: "/terms-conditions", destination: "/terms-and-conditions", permanent: true },
      { source: "/login.html", destination: "/admin/login", permanent: false },
      { source: "/register", destination: "/free-trial", permanent: false },
    ];
  },
};

export default nextConfig;
