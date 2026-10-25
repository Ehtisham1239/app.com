import { stripHtml } from "./format.js";

// Reject malformed/polluted filters rather than serving duplicate first pages.
export function blogParams(params = {}) {
  if (Array.isArray(params.page) || Array.isArray(params.category)) return null;
  const rawPage = params.page === undefined ? "1" : String(params.page);
  if (!/^[1-9]\d{0,3}$/.test(rawPage)) return null;
  const category = params.category === undefined ? "" : params.category;
  if (typeof category !== "string" || category.length > 100) return null;
  return { page: Number(rawPage), category: category.trim() };
}

export function blogUrl(page = 1, category = "") {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  return `/blog${params.size ? `?${params}` : ""}`;
}

export function articleDates(post) {
  const valid = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value) && Number.isFinite(Date.parse(value));
  const published = valid(post.published_at) ? new Date(post.published_at).toISOString() : undefined;
  const modified = valid(post.updated_at) && (!published || Date.parse(post.updated_at) >= Date.parse(published)) ? new Date(post.updated_at).toISOString() : undefined;
  return { published, modified, showModified: Boolean(published && modified && modified.slice(0, 10) > published.slice(0, 10)) };
}

export function articleAuthor(name) {
  const authorName = String(name || "").trim() || "Online Quran College";
  const organization = /\b(editorial|team|college|academy|school|institute|organisation|organization)\b/i.test(authorName);
  return { "@type": organization ? "Organization" : "Person", name: authorName };
}

export function blogPosting(post, { siteUrl, visual, html, description }) {
  const dates = articleDates(post);
  const author = articleAuthor(post.author_name);
  const words = stripHtml(html).trim();
  const url = `${siteUrl}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description,
    inLanguage: "en-GB",
    ...(post.category ? { articleSection: post.category } : {}),
    ...(post.tags?.length ? { keywords: post.tags.join(", ") } : {}),
    ...(dates.published ? { datePublished: dates.published } : {}),
    ...(dates.modified ? { dateModified: dates.modified } : {}),
    image: new URL(visual.src, siteUrl).href,
    author: { ...author, ...(author["@type"] === "Organization" ? { url: `${siteUrl}/about` } : {}) },
    publisher: { "@type": "EducationalOrganization", "@id": `${siteUrl}/#organization`, name: "Online Quran College", logo: { "@type": "ImageObject", url: `${siteUrl}/brand/logo.webp` } },
    wordCount: words ? words.split(/\s+/).length : 0,
    mainEntityOfPage: url,
    isPartOf: { "@type": "Blog", "@id": `${siteUrl}/blog#blog`, url: `${siteUrl}/blog`, name: "Quran learning articles" },
  };
}

export function xmlText(value = "") {
  return String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").replace(/[<>&"']/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]);
}

export function articleFeed(posts, siteUrl) {
  const items = posts.map(post => {
    const url = `${siteUrl}/blog/${post.slug}`, dates = articleDates(post);
    return `<item><title>${xmlText(post.title)}</title><link>${xmlText(url)}</link><guid isPermaLink="true">${xmlText(url)}</guid><description>${xmlText(stripHtml(post.excerpt || ""))}</description>${post.category ? `<category>${xmlText(post.category)}</category>` : ""}${dates.published ? `<pubDate>${new Date(dates.published).toUTCString()}</pubDate>` : ""}</item>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Online Quran College articles</title><link>${xmlText(siteUrl)}/blog</link><description>Practical Quran learning articles for learners and parents.</description><language>en-GB</language><atom:link href="${xmlText(siteUrl)}/blog/feed.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
}
