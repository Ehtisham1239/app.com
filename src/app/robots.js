import { SITE_URL } from "../lib/config.js";

const PRIVATE_PATHS = ["/admin", "/auth", "/api/", "/parents"];

// Search/indexing agents are listed explicitly so the intended public-search
// policy is auditable. Training-only agents are deliberately not named here:
// their access remains governed by the existing wildcard policy until the
// publisher makes a separate, informed training-data choice.
const SEARCH_AGENTS = [
  "Googlebot",
  "bingbot",
  "Applebot",
  "DuckDuckBot",
  "YandexBot",
  "OAI-SearchBot",
  "Claude-SearchBot",
  "Claude-User",
];

// Match the sitemap/metadata origin in production and isolated QA builds.
export default function robots() {
  return {
    rules: [
      { userAgent: SEARCH_AGENTS, allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: "PerplexityBot", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
