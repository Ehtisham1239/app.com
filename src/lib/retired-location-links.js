import { SITE_URL } from "./config.js";

const siteHosts = new Set(["onlinequrancollege.com", new URL(SITE_URL).hostname.replace(/^www\./, "")]);

export function isRetiredLocationLink(href) {
  if (typeof href !== "string" || !href.trim()) return false;
  const url = URL.parse(href, SITE_URL);
  return Boolean(url && siteHosts.has(url.hostname.replace(/^www\./, "")) &&
    /^\/locations(?:[/-]|$)/i.test(url.pathname));
}
