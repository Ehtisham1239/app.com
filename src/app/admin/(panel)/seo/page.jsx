"use client";
import Link from "next/link";
import { useState } from "react";
import { Download, ExternalLink, RefreshCw, Search } from "lucide-react";
import { db, downloadCsv, useLoad } from "@/lib/admin/db";
import { useAccess } from "@/lib/admin/access";
import { RESOURCES } from "@/lib/admin/resources";
import { analyzeSeo, duplicateMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";
import { Card, EmptyState, ErrorState, Loading, PageHeader, StatCard } from "@/components/admin/ui";
const TYPES = [{ key: "pages", table: "pages", label: "Page", permission: "pages:read" }, { key: "blog", table: "blog_posts", label: "Article", permission: "blog:read" }, { key: "courses", table: "courses", label: "Course", permission: "courses:read" }];
const TOOLS = [
  ["Google Search Console", "Inspect indexing, search queries and sitemap submissions after verifying your site.", `https://search.google.com/search-console?resource_id=${encodeURIComponent(SITE_URL + "/")}`],
  ["Bing Webmaster Tools", "Submit your sitemap and inspect your site in Bing. Requires your own verified account.", "https://www.bing.com/webmasters/"],
  ["PageSpeed Insights", "Check mobile performance, Core Web Vitals and improvement suggestions.", `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(SITE_URL)}`],
  ["Rich Results Test", "Validate Google's supported structured data on your public pages.", `https://search.google.com/test/rich-results?url=${encodeURIComponent(SITE_URL)}`],
];
export default function SeoPage() {
  const { can } = useAccess();
  const [query, setQuery] = useState(""); const [filter, setFilter] = useState("all");
  const permissions = TYPES.filter((t) => can(t.permission)).map((t) => t.key).join(",");
  const audit = useLoad(async () => {
    const lists = await Promise.all(TYPES.filter((t) => can(t.permission)).map(async (type) => {
      const rows = [];
      for (let start = 0; ; start += 500) {
        let q = db().from(type.table).select(`id, title, slug, status, seo_title, seo_description, seo_noindex, seo_focus_keyword, canonical_url, ${type.key === "courses" ? "summary, description_html" : "excerpt, body_html"}`).is("deleted_at", null).order("id").range(start, start + 499);
        if (type.key === "pages") q = q.eq("locale", "en");
        const { data, error } = await q; if (error) throw error;
        rows.push(...(data || [])); if (!data || data.length < 500) break;
      }
      return rows.map((row) => ({ ...row, type: type.key, typeLabel: type.label, auditId: `${type.key}:${row.id}`, path: RESOURCES[type.key].publicPath(row), audit: analyzeSeo(row) }));
    }));
    return { data: lists.flat() };
  }, [permissions]);
  const rows = audit.data || [];
  const duplicates = duplicateMetadata(rows.filter((r) => r.status === "published"));
  const duplicateIds = new Set(duplicates.flatMap((group) => group.ids));
  const visible = rows.filter((r) => `${r.title} ${r.path}`.toLowerCase().includes(query.toLowerCase()) && (filter === "all" || filter === "noindex" && r.seo_noindex || filter === "duplicates" && duplicateIds.has(r.auditId) || filter === "recommendations" && r.audit.recommendations.length));
  const exportRows = () => downloadCsv("seo-content-audit.csv", rows.map((r) => ({ type: r.typeLabel, url: SITE_URL + r.path, status: r.status, title: r.audit.title, description: r.audit.description, noindex: r.seo_noindex ? "Yes" : "No", recommendations: r.audit.recommendations.map((c) => c.advice).join("; "), duplicate: duplicateIds.has(r.auditId) ? "Yes" : "No" })), ["type", "url", "status", "title", "description", "noindex", "recommendations", "duplicate"].map((key) => ({ key, label: key })));
  return <><PageHeader title="SEO tools" subtitle="Review your content, control indexing and connect to trusted search tools." actions={<><button className="btn btn-outline btn-sm" onClick={audit.reload}><RefreshCw className="size-4" />Recheck content</button><button className="btn btn-primary btn-sm" disabled={!rows.length} onClick={exportRows}><Download className="size-4" />Export audit</button></>} />
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="Content records" value={rows.length} /><StatCard label="With recommendations" value={rows.filter((r) => r.audit.recommendations.length).length} /><StatCard label="Duplicate metadata groups" value={duplicates.length} /><StatCard label="Marked noindex" value={rows.filter((r) => r.seo_noindex).length} /></div>
    <Card title="Content audit"><p className="mb-5 text-sm text-ink-soft">This checklist reads CMS content, not a live crawl or Google ranking data. Length and word-count suggestions are editorial guidance. Duplicate checks compare published pages you can access.</p><div className="mb-5 flex flex-wrap gap-3"><label className="relative min-w-0 flex-1"><Search className="absolute left-3 top-3 size-4 text-ink-faint" /><input className="adm-input pl-9" aria-label="Search SEO content" placeholder="Search by title or URL" value={query} onChange={(e) => setQuery(e.target.value)} /></label><select className="adm-input w-auto" aria-label="Audit filter" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All content</option><option value="recommendations">Recommendations</option><option value="duplicates">Duplicate metadata</option><option value="noindex">Noindex</option></select></div>
    {audit.loading ? <Loading rows={5} /> : audit.error ? <ErrorState error={audit.error} onRetry={audit.reload} /> : !visible.length ? <EmptyState title="No matching content" text="Try another filter or create a page, course or article." /> : <div className="max-h-[36rem] overflow-auto"><table className="w-full text-left text-sm"><thead className="sticky top-0 bg-white"><tr>{["Content", "Publication / indexing", "Recommendations", ""].map((h) => <th key={h} className="border-b border-line p-3">{h}</th>)}</tr></thead><tbody>{visible.map((r) => <tr key={r.auditId}><td className="min-w-56 border-b border-line p-3"><p className="font-semibold text-mushaf-900">{r.title}</p><p className="mt-1 break-all text-xs text-ink-faint">{r.typeLabel} · {r.path}</p></td><td className="border-b border-line p-3"><p className="capitalize">{r.status}</p><p className="mt-1 text-xs">{r.seo_noindex ? "Noindex" : "Indexable when published"}</p>{duplicateIds.has(r.auditId) && <p className="mt-1 text-xs text-amber-600">Duplicate title or description</p>}</td><td className="min-w-60 border-b border-line p-3"><p>{r.audit.recommendations.length} content suggestions</p><p className="mt-1 text-xs text-ink-soft">{r.audit.recommendations.slice(0, 2).map((c) => c.label).join(" · ") || "Checklist complete"}</p></td><td className="border-b border-line p-3"><Link href={`/admin/${r.type}/${r.id}`} className="btn btn-outline btn-sm">Review</Link></td></tr>)}</tbody></table></div>}</Card>
    <div className="mt-6 grid gap-5 md:grid-cols-2">{TOOLS.map(([name, text, href]) => <Card key={name} title={name}><p className="mb-4 text-sm text-ink-soft">{text}</p><a className="inline-flex items-center gap-2 text-sm font-semibold text-leaf-700" href={href} target="_blank" rel="noopener noreferrer">Open tool <ExternalLink className="size-4" /></a></Card>)}</div>
    <Card className="mt-6" title="Sitemap, verification & redirects"><p className="mb-4 text-sm text-ink-soft">The sitemap automatically excludes noindex pages and pages canonicalised elsewhere. Public tool links do not connect accounts or import analytics. Add your own verification codes in Website settings → Search engines.</p><div className="flex flex-wrap gap-3"><a className="btn btn-outline btn-sm" href={`${SITE_URL}/sitemap.xml`} target="_blank" rel="noopener noreferrer">View sitemap</a><a className="btn btn-outline btn-sm" href={`${SITE_URL}/robots.txt`} target="_blank" rel="noopener noreferrer">View robots.txt</a>{can("settings:read") && <Link className="btn btn-outline btn-sm" href="/admin/settings">Verification settings</Link>}{can("redirects:read") && <Link className="btn btn-outline btn-sm" href="/admin/redirects">Manage redirects</Link>}</div></Card>
  </>;
}
