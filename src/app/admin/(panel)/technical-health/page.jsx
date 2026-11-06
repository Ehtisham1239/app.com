"use client";

import { useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, RefreshCw, ShieldCheck } from "lucide-react";
import { Card, EmptyState, ErrorState, Loading, PageHeader, StatCard } from "@/components/admin/ui";
import { useAccess } from "@/lib/admin/access";

function dateLabel(value) {
  try { return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi" }).format(new Date(value)) + " PKT"; }
  catch { return value || "—"; }
}

export default function TechnicalHealthPage() {
  const { can } = useAccess();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  async function runAudit() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/site-health", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "The audit failed.");
      setReport(data);
    } catch (e) { setError(e); }
    finally { setLoading(false); }
  }
  if (!can("pages:read")) return <Card title="Access restricted"><p className="text-sm text-ink-soft">Your CMS role cannot run technical website audits.</p></Card>;
  const summary = report?.summary;
  return <>
    <PageHeader title="Technical health centre" subtitle="Run a live, read-only crawl of the public sitemap and inspect page response and essential SEO metadata." actions={<button className="btn btn-primary btn-sm" type="button" onClick={runAudit} disabled={loading}>{loading ? <RefreshCw className="size-4 animate-spin"/> : <Activity className="size-4"/>}{report ? "Run audit again" : "Run site audit"}</button>}/>
    <Card className="mb-6" title="Audit safety and coverage">
      <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-leaf-700"/><div className="text-sm text-ink-soft"><p>This scan is read-only: it does not edit pages, redirects, robots rules, database records or analytics. It checks up to 40 same-domain URLs from the live XML sitemap per run, including HTTP status, title, meta description, canonical and viewport tags. If the sitemap has more URLs, the result is explicitly marked partial.</p><p className="mt-2">Findings are recommendations for review, not automatic fixes. This prevents a crawler from changing course pages, pricing, canonical URLs or indexing directives without an authorised content decision.</p></div></div>
    </Card>
    {loading && <Card title="Scanning public pages"><Loading rows={5}/><p className="px-5 pb-5 text-sm text-ink-soft">Checking sitemap pages in small batches. Slow or unavailable pages may be reported as timeouts.</p></Card>}
    {error && <ErrorState error={error} onRetry={runAudit}/>}
    {report && !loading && <>
      <p className="mb-4 text-xs text-ink-faint">Last scan: {dateLabel(report.scannedAt)} · {report.scannedUrls} of {report.totalUrls} sitemap URLs · {report.partial ? "Partial scan" : "Full sitemap scan"}</p>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pages scanned" value={report.scannedUrls}/>
        <StatCard label="Pages with findings" value={summary.pagesWithIssues}/>
        <StatCard label="HTTP failures / timeouts" value={summary.httpErrors}/>
        <StatCard label="Total findings" value={summary.issueCount}/>
      </div>
      <Card title="Issue breakdown"><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-leaf-50 p-4"><p className="text-xs text-ink-soft">Missing titles</p><p className="mt-1 text-2xl font-bold">{summary.missingTitles}</p></div><div className="rounded-xl bg-leaf-50 p-4"><p className="text-xs text-ink-soft">Missing descriptions</p><p className="mt-1 text-2xl font-bold">{summary.missingDescriptions}</p></div><div className="rounded-xl bg-leaf-50 p-4"><p className="text-xs text-ink-soft">Missing canonicals</p><p className="mt-1 text-2xl font-bold">{summary.missingCanonicals}</p></div></div></Card>
      <Card className="mt-6" title="Findings">
        {!report.issues.length ? <EmptyState icon={CheckCircle2} title="No issues detected in the scanned checks" text="This is a bounded technical check, not proof of Google indexing, rankings, Core Web Vitals or conversion performance."/> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{["Finding","HTTP","Page"].map(x=><th key={x} className="border-b border-line p-3">{x}</th>)}</tr></thead><tbody>{report.issues.map((issue,i)=><tr key={issue.url+issue.finding+i}><td className="border-b border-line p-3"><span className="inline-flex items-center gap-2"><AlertTriangle className="size-4 text-amber-600"/>{issue.finding}</span></td><td className="border-b border-line p-3">{issue.status || "—"}</td><td className="max-w-[30rem] border-b border-line p-3"><a className="break-all text-leaf-700 underline" href={issue.url} target="_blank" rel="noreferrer">{issue.url}</a></td></tr>)}</tbody></table></div>}
      </Card>
    </>}
    {!report && !loading && !error && <Card title="Ready to scan"><EmptyState icon={Activity} title="No audit has been run in this session" text="Run the scan to retrieve fresh page-level evidence from the public sitemap."/></Card>}
  </>;
}
