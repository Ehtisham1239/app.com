import { locationFromCmsSlug, locationSearchTitle } from "./locations.js";
export const BRAND_NAME = "Online Quran College";
export function textContent(html = "") {
  return String(html).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]*>/g, " ").replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (_, entity) => ({ nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" })[entity]).replace(/\s+/g, " ").trim();
}
export function validCanonical(value = "") {
  if (!value) return true;
  if (/[\s<>]/.test(value) || value.startsWith("//")) return false;
  try { const url = new URL(value, "https://example.com"); return (value.startsWith("/") || /^https?:\/\//i.test(value)) && ["http:", "https:"].includes(url.protocol) && !url.hash && !url.username && !url.password; } catch { return false; }
}
export function canonicalUrl(value, path, siteUrl) {
  return new URL(validCanonical(value) && value ? value : path, siteUrl).href;
}
export function searchTitle(record) {
  const location = locationFromCmsSlug(record.slug);
  return record.seo_title || (location ? locationSearchTitle(location.country, location.city) : `${record.title || "Untitled"} · ${BRAND_NAME}`);
}
export function searchDescription(record) {
  return record.seo_description || record.excerpt || record.summary || textContent(record.body_html || record.description_html).slice(0, 158);
}
export function analyzeSeo(record = {}) {
  const title = searchTitle(record), description = searchDescription(record);
  const html = record.body_html || record.description_html || "";
  const text = textContent(html), words = text ? text.split(/\s+/).length : 0;
  const images = html.match(/<img\b[^>]*>/gi) || [];
  const missingAlt = images.filter((tag) => !/(?:^|\s)alt\s*=/i.test(tag)).length;
  const brokenLinks = (html.match(/<a\b[^>]*>/gi) || []).filter((tag) => {
    const match = tag.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const href = (match?.[1] ?? match?.[2] ?? match?.[3] ?? "").trim();
    return !href || href === "#" || /^(javascript|data|vbscript):/i.test(href);
  }).length;
  const keyword = String(record.seo_focus_keyword || "").trim().toLowerCase();
  const checks = [
    { id: "title", label: `Search title: ${title.length} characters`, pass: title.length >= 30 && title.length <= 60, advice: "Aim for a descriptive title around 30–60 characters. Search engines may rewrite it." },
    { id: "description", label: `Search description: ${description.length} characters`, pass: description.length >= 100 && description.length <= 160, advice: "Write a useful summary around 100–160 characters. This is a guide, not a ranking rule." },
    { id: "canonical", label: "Canonical URL is valid", pass: validCanonical(record.canonical_url), advice: "Use an absolute http(s) URL or a path starting with /. Avoid fragments, credentials and spaces." },
    { id: "headings", label: "Content has a section heading", pass: /<h[2-6]\b/i.test(html), advice: "Use descriptive H2/H3 headings to organise the main content." },
    { id: "h1", label: "Content avoids an extra H1", pass: !/<h1\b/i.test(html), advice: "The page template already renders the main H1. Use H2 for content sections." },
    { id: "content", label: `${words} words in the main content`, pass: words >= 150, advice: "Add useful, original detail where it helps readers. Word count alone is not a ranking factor." },
    { id: "alt", label: `${missingAlt} images without an alt attribute`, pass: missingAlt === 0, advice: "Describe informative images. Keep alt=\"\" for purely decorative images." },
    { id: "links", label: `${brokenLinks} empty or placeholder links`, pass: brokenLinks === 0, advice: "Replace empty and # links with a useful destination." },
  ];
  if (keyword) checks.push({ id: "focus", label: "Focus phrase appears naturally in the title or content", pass: `${title} ${text}`.toLowerCase().includes(keyword), advice: "Use your focus phrase naturally where relevant. Do not repeat it just to satisfy this check." });
  return { title, description, words, checks, recommendations: checks.filter((c) => !c.pass), score: Math.round(100 * checks.filter((c) => c.pass).length / checks.length) };
}
export function duplicateMetadata(records) {
  const groups = new Map();
  for (const row of records) for (const [field, value] of [["title", searchTitle(row)], ["description", searchDescription(row)]]) {
    const key = `${field}:${value.trim().toLowerCase().replace(/\s+/g, " ")}`;
    if (!value.trim()) continue;
    const group = groups.get(key) || { field, value, ids: [] };
    group.ids.push(row.auditId); groups.set(key, group);
  }
  return [...groups.values()].filter((g) => g.ids.length > 1);
}
export function shouldIncludeInSitemap(record, path, siteUrl) {
  return !record?.seo_noindex && (!record?.canonical_url || canonicalUrl(record.canonical_url, path, siteUrl) === new URL(path, siteUrl).href);
}
export function safeJsonLd(value) { return JSON.stringify(value).replace(/</g, "\\u003c"); }

export function breadcrumbSchema(items, siteUrl) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: new URL(item.path, siteUrl).href })) };
}
