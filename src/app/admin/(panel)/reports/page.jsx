"use client";

import { useState } from "react";
import { DateTime } from "luxon";
import { STAFF_TIMEZONE } from "@/lib/config";
import { Download } from "lucide-react";
import { db, downloadCsv, useLoad } from "@/lib/admin/db";
import { TRIAL_STATUSES } from "@/lib/constants";
import { Card, EmptyState, ErrorState, Loading, PageHeader, StatCard, Tabs } from "@/components/admin/ui";

const PRESETS = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "365", label: "12 months" },
  { value: "custom", label: "Custom" },
];

function Bars({ rows, total }) {
  if (!rows?.length) return <p className="text-sm text-ink-faint">No data in this period.</p>;
  const max = Math.max(...rows.map((r) => r.count));
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label} className="group">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-ink">{r.label}</span>
            <span className="shrink-0 tabular text-ink-soft">
              {r.count}
              {total ? <span className="text-ink-faint"> · {Math.round((100 * r.count) / total)}%</span> : null}
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-leaf-50">
            <div className="h-2 rounded-full bg-leaf-600 transition-all group-hover:bg-leaf-800" style={{ width: `${Math.max(3, (100 * r.count) / max)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function ReportsPage() {
  const [preset, setPreset] = useState("30");
  const [today] = useState(() => DateTime.now().setZone(STAFF_TIMEZONE).startOf("day"));
  const [from, setFrom] = useState(() => today.minus({ days: 29 }).toISODate());
  const [to, setTo] = useState(() => today.toISODate());
  const range = preset === "custom" ? { from, to } : { from: today.minus({ days: Number(preset) - 1 }).toISODate(), to: today.toISODate() };
  const report = useLoad(() => db().rpc("report_summary", { p_from: range.from, p_to: range.to }), [range.from, range.to]);
  const r = report.data || {};
  const byStatus = r.trials_by_status || {};
  const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
  const enrolled = byStatus.enrolled || 0;
  const statusRows = TRIAL_STATUSES.map((s) => ({ label: s.label, count: byStatus[s.value] || 0 })).filter((x) => x.count);

  const exportCsv = () => {
    const rows = [
      ...statusRows.map((x) => ({ section: "Status", ...x })),
      ...(r.trials_by_course || []).map((x) => ({ section: "Course", ...x })),
      ...(r.trials_by_country || []).map((x) => ({ section: "Country", ...x })),
      ...(r.trials_by_source || []).map((x) => ({ section: "Source", ...x })),
    ];
    downloadCsv(`trial-report-${range.from}-to-${range.to}.csv`, rows, [
      { label: "Section", key: "section" },
      { label: "Item", key: "label" },
      { label: "Requests", key: "count" },
    ]);
  };

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Free-trial requests from the website, by status, course, country and source."
        actions={
          <button type="button" className="btn btn-outline btn-sm" onClick={exportCsv} disabled={!total}>
            <Download className="size-4" /> Export CSV
          </button>
        }
      />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Tabs value={preset} onChange={setPreset} tabs={PRESETS} />
        {preset === "custom" && (
          <div className="flex items-center gap-2 text-sm">
            <input type="date" className="adm-input w-40" value={from} max={to} onChange={(e) => setFrom(e.target.value)} aria-label="From" />
            <span className="text-ink-faint">to</span>
            <input type="date" className="adm-input w-40" value={to} min={from} onChange={(e) => setTo(e.target.value)} aria-label="To" />
          </div>
        )}
      </div>
      {report.loading ? (
        <Loading rows={6} />
      ) : report.error ? (
        <ErrorState error={report.error} onRetry={report.reload} />
      ) : total === 0 ? (
        <Card>
          <EmptyState title="No free-trial requests in this period" text="Choose a longer period, or check back after new bookings arrive." />
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Requests" value={total} />
            <StatCard label="Enrolled" value={enrolled} tone="amber" hint={`${total ? Math.round((100 * enrolled) / total) : 0}% of requests`} />
            <StatCard label="Trial done" value={(byStatus.completed || 0) + enrolled} tone="blue" />
            <StatCard label="No-show / cancelled" value={(byStatus.no_show || 0) + (byStatus.cancelled || 0)} tone="red" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="By status"><Bars rows={statusRows} total={total} /></Card>
            <Card title="By course"><Bars rows={r.trials_by_course} total={total} /></Card>
            <Card title="By country"><Bars rows={r.trials_by_country} total={total} /></Card>
            <Card title="By source"><Bars rows={(r.trials_by_source || []).map((x) => ({ ...x, label: x.label || "website" }))} total={total} /></Card>
          </div>
          <p className="text-xs text-ink-faint">Period {range.from} to {range.to} (Pakistan time). Status is each request’s current status.</p>
        </div>
      )}
    </>
  );
}
