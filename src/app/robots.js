import { SITE_URL } from "../lib/config.js";

// Match the sitemap/metadata origin in production and isolated QA builds.
export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/auth", "/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
