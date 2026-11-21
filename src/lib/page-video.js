import { SITE_URL, SUPABASE_URL } from "./config.js";

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const IMAGE_PATH = /\.(?:avif|gif|jpe?g|png|webp)$/i;

function parseUrl(value, base) {
  if (typeof value !== "string" || !value || /[\s\\]/.test(value) || value.startsWith("//")) return null;
  try {
    const url = new URL(value, base);
    return !url.username && !url.password && !url.hash ? url : null;
  } catch { return null; }
}

export function youtubeVideoId(value) {
  const url = parseUrl(value);
  if (url?.protocol !== "https:" || url.port) return null;
  const hosts = ["youtube.com", "www.youtube.com", "m.youtube.com", "www.youtube-nocookie.com"];
  let id;
  if (url.hostname === "youtu.be") id = url.pathname.match(/^\/([^/]+)\/?$/)?.[1];
  if (hosts.includes(url.hostname)) {
    id = url.pathname === "/watch" ? url.searchParams.get("v") : url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)\/?$/)?.[1];
  }
  return VIDEO_ID.test(id ?? "") ? id : null;
}

function mediaUrl(value, extension, siteUrl, isVideo = false) {
  const url = parseUrl(value, siteUrl);
  if (!url || url.search || !extension.test(url.pathname)) return null;
  if (url.origin === new URL(siteUrl).origin && (!isVideo || url.pathname.startsWith("/videos/"))) return url.href;
  if (url.origin === new URL(SUPABASE_URL).origin && url.pathname.startsWith("/storage/v1/object/public/media/")) return url.href;
  return null;
}

export function pageVideo(value, siteUrl = SITE_URL) {
  if (!value || typeof value !== "object") return null;
  const { url, thumbnail, primary } = value;
  const title = typeof value.title === "string" ? value.title.trim() : "";
  const description = typeof value.description === "string" ? value.description.trim() : "";
  const date = typeof value.uploadDate === "string" ? value.uploadDate : "";
  const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(date) : null;
  if (!title || title.length > 100 || !description || description.length > 1000 || !parsedDate || Number.isNaN(parsedDate.valueOf()) || parsedDate.toISOString().slice(0, 10) !== date) return null;
  const id = youtubeVideoId(url);
  const contentUrl = id ? null : mediaUrl(url, /\.mp4$/i, siteUrl, true);
  const thumbnailUrl = thumbnail ? mediaUrl(thumbnail, IMAGE_PATH, siteUrl) : id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
  if ((!id && !contentUrl) || !thumbnailUrl) return null;
  return {
    title, description, thumbnailUrl, uploadDate: date, primary: primary === true,
    ...(id ? { embedUrl: `https://www.youtube-nocookie.com/embed/${id}`, watchUrl: `https://www.youtube.com/watch?v=${id}` } : { contentUrl }),
  };
}

export function videoSchema(video) {
  const { title, description, thumbnailUrl, uploadDate, embedUrl, contentUrl } = video;
  return {
    "@context": "https://schema.org", "@type": "VideoObject",
    name: title, description, thumbnailUrl: [thumbnailUrl], uploadDate,
    ...(embedUrl ? { embedUrl } : { contentUrl }),
  };
}

// Next's video sitemap serializer emits field values verbatim.
const xml = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);

export function videoSitemapEntry(video) {
  return {
    title: xml(video.title), description: xml(video.description), thumbnail_loc: xml(video.thumbnailUrl),
    publication_date: video.uploadDate,
    ...(video.embedUrl ? { player_loc: xml(video.embedUrl) } : { content_loc: xml(video.contentUrl) }),
  };
}

// These routes have dedicated templates and do not use the generic CMS renderer.
const dedicatedSlugs = new Set([
  "admin", "api", "auth", "blog", "careers", "contact", "courses", "faq", "free-trial", "learn",
  "locations", "parents", "pricing", "quran-study", "reviews", "teachers", "trial-video", "usa-quran-classes", "verify-certificate",
]);

export function isVideoPageSlug(slug) {
  return typeof slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
    && !slug.startsWith("locations-") && !dedicatedSlugs.has(slug);
}
