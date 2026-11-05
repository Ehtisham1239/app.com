import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/config";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const response = (body, status = 200) => NextResponse.json(body, {
  status,
  headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" },
});
const clean = (value = "") => value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').trim();
const tag = (html, pattern) => clean(html.match(pattern)?.[1] || "");

async function inspectPage(url, origin) {
  const findings = [];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7500);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "OQC-SiteHealth/1.0 (+https://www.onlinequrancollege.com/)" },
      cache: "no-store",
    });
    const finalUrl = new URL(res.url);
    if (finalUrl.origin !== origin) return { url, status: res.status, findings: ["Redirect leaves the OQC website; review manually."] };
    if (!res.ok) {
      findings.push(`HTTP response ${res.status}`);
      return { url, status: res.status, findings };
    }
    const html = await res.text();
    const title = tag(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const description = tag(html, /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
      || tag(html, /<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
    const canonical = tag(html, /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i)
      || tag(html, /<link\s+[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["'][^>]*>/i);
    const viewport = /<meta\s+[^>]*name=["']viewport["']/i.test(html);
    const robots = tag(html, /<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    if (!title) findings.push("Missing page title");
    if (!description) findings.push("Missing meta description");
    if (!canonical) findings.push("Missing canonical link");
    if (!viewport) findings.push("Missing viewport meta");
    if (/noindex/i.test(robots)) findings.push("Page declares noindex (verify intended indexing)");
    return { url, status: res.status, title: title.slice(0, 180), findings };
  } catch (error) {
    findings.push(error?.name === "AbortError" ? "Request timed out" : "Could not fetch page");
    return { url, status: 0, findings };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  const supabase = await getServerClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return response({ error: "Sign in to the CMS first." }, 401);
  const { data: allowed, error: permissionError } = await supabase.rpc("has_permission", { p_permission: "pages:read" });
  if (permissionError || allowed !== true) return response({ error: "You do not have permission to run this audit." }, 403);

  let root;
  try { root = new URL(SITE_URL); } catch { return response({ error: "The public site URL is not configured." }, 503); }
  if (root.protocol !== "https:" && root.hostname !== "localhost") return response({ error: "The public site URL must use HTTPS." }, 503);

  try {
    const sitemapResponse = await fetch(new URL("/sitemap.xml", root), { cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!sitemapResponse.ok) return response({ error: `Sitemap returned HTTP ${sitemapResponse.status}.` }, 502);
    const xml = await sitemapResponse.text();
    const urls = [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
      .map((match) => clean(match[1]))
      .map((value) => { try { return new URL(value, root); } catch { return null; } })
      .filter((url) => url && url.origin === root.origin && ["http:", "https:"].includes(url.protocol))
      .map((url) => url.href);
    const unique = [...new Set(urls)];
    if (!unique.length) return response({ error: "The sitemap did not contain any valid same-site URLs." }, 502);
    const limit = 60;
    const selected = unique.slice(0, limit);
    const pages = [];
    for (let i = 0; i < selected.length; i += 6) {
      const batch = await Promise.all(selected.slice(i, i + 6).map((url) => inspectPage(url, root.origin)));
      pages.push(...batch);
    }
    const issues = pages.flatMap((page) => page.findings.map((finding) => ({ url: page.url, status: page.status, finding })));
    return response({
      ok: true,
      scannedAt: new Date().toISOString(),
      sitemapUrl: new URL("/sitemap.xml", root).href,
      totalUrls: unique.length,
      scannedUrls: pages.length,
      partial: unique.length > pages.length,
      pages,
      issues,
      summary: {
        pagesWithIssues: pages.filter((page) => page.findings.length).length,
        issueCount: issues.length,
        httpErrors: pages.filter((page) => page.status >= 400 || page.status === 0).length,
        missingTitles: issues.filter((issue) => issue.finding === "Missing page title").length,
        missingDescriptions: issues.filter((issue) => issue.finding === "Missing meta description").length,
        missingCanonicals: issues.filter((issue) => issue.finding === "Missing canonical link").length,
      },
    });
  } catch {
    return response({ error: "The site audit could not complete. Check the public sitemap and retry." }, 502);
  }
}
