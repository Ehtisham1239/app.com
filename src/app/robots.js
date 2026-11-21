import { SITE_URL } from "../lib/config.js";

const PRIVATE_PATHS = ["/admin", "/auth", "/api/", "/parents"];

// Search/indexing agents are listed explicitly so the intended public-search
// policy is auditable. Training-only agents are not named: the wildcard allows them.
// Content Signals (contentsignals.org) state the publisher's choice for AI use of the
// public pages. Owner decision, 20 Nov 2026 (written, in chat): search, AI answers and
// AI training are all allowed. A crawler follows only its own group, so every group carries it.
export const CONTENT_SIGNAL = "search=yes, ai-input=yes, ai-train=yes";
const other = { "Content-Signal": CONTENT_SIGNAL };
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
      { userAgent: SEARCH_AGENTS, allow: "/", disallow: PRIVATE_PATHS, other },
      { userAgent: "PerplexityBot", allow: "/", disallow: PRIVATE_PATHS, other },
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS, other },
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/sitemap.txt`],
  };
}
