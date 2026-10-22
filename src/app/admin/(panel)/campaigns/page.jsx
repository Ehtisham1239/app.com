"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { db, downloadCsv, useLoad } from "@/lib/admin/db";
import { Card, EmptyState, ErrorState, Loading, PageHeader, StatCard } from "@/components/admin/ui";
const date = (d) => d.toISOString().slice(0, 10);
const columns = ["source", "medium", "campaign", "leads", "trials", "contacts", "enrolled"].map((key) => ({ key, label: key[0].toUpperCase() + key.slice(1) }));
export default function CampaignsPage() {
  const [from, setFrom] = useState(() => date(new Date(Date.now() - 29 * 864e5)));
  const [to, setTo] = useState(() => date(new Date()));
  const report = useLoad(() => db().rpc("campaign_report", { p_from: from, p_to: to }), [from, to]);
  const rows = Array.isArray(report.data) ? report.data : [];
  const total = (key) => rows.reduce((n, row) => n + Number(row[key] || 0), 0);
  return <><PageHeader title="Campaigns & leads" subtitle="Track website forms and enrolments by campaign. These are submitted leads, not advertising impressions or ad spend." actions={<button className="btn btn-outline btn-sm" disabled={!rows.length} onClick={() => downloadCsv(`campaigns-${from}-${to}.csv`, rows, columns)}><Download className="size-4" />Export CSV</button>} />
    <div className="mb-6 flex flex-wrap gap-4"><label className="text-sm">From<input className="adm-input mt-1" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} /></label><label className="text-sm">To<input className="adm-input mt-1" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></label></div>
    {report.loading ? <Loading rows={5} /> : report.error ? <ErrorState error={report.error} onRetry={report.reload} /> : <><div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="Total leads" value={total("leads")} /><StatCard label="Trial forms" value={total("trials")} /><StatCard label="Contact forms" value={total("contacts")} /><StatCard label="Enrolled" value={total("enrolled")} /></div><Card>{!rows.length ? <EmptyState title="No form submissions in this period" text="Add UTM tags to your campaign links. Submitted trials and contact forms will appear here." /> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{columns.map((c) => <th className="border-b border-line p-3" key={c.key}>{c.label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={JSON.stringify([row.source, row.medium, row.campaign])}>{columns.map((c) => <td className="border-b border-line p-3" key={c.key}>{row[c.key]}</td>)}</tr>)}</tbody></table></div>}</Card></>}
    <Card className="mt-6"><h2 className="text-lg">Connect an ad to this report</h2><p className="mt-2 text-sm text-ink-soft">Use a landing URL such as <code className="break-all">/locations/united-kingdom/london?utm_source=google&utm_medium=cpc&utm_campaign=london-quran</code>. Campaign tags are retained in this browser tab for up to 24 hours while visitors browse before submitting a form. Enrolled is the current status of trial leads in the selected period. Spam contact messages are excluded. A source of website means the lead is unclassified; it is not evidence of organic search traffic. Times use Asia/Karachi.</p></Card>
  </>;
}
