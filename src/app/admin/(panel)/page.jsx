"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CalendarClock, ExternalLink, FileText, Inbox, Newspaper, Percent, Settings, UserRoundCheck, Wallet } from "lucide-react";
import { useAccess } from "@/lib/admin/access";
import { db, useLoad } from "@/lib/admin/db";
import { TRIAL_STATUSES } from "@/lib/constants";
import { Card, EmptyState, ErrorState, Loading, PageHeader, StatCard, StatusBadge, When } from "@/components/admin/ui";

function TrendChart({ days }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...days.map((d) => d.count));
  const W = 560, H = 170, pad = 24, gap = 6;
  const bw = (W - pad * 2) / days.length - gap;
  const fmt = (d) => new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H + 26}`} className="w-full" role="img" aria-label="Free-trial requests per day, last 14 days">
        {[0, 0.5, 1].map((t) => (
          <line key={t} x1={pad} x2={W - pad} y1={H - t * (H - 20)} y2={H - t * (H - 20)} stroke="var(--color-line)" strokeWidth="1" />
        ))}
        {days.map((d, i) => {
          const h = Math.max(d.count ? 4 : 0, (d.count / max) * (H - 20));
          const x = pad + i * (bw + gap) + gap / 2;
          return (
            <g key={d.day} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={x - gap / 2} y={0} width={bw + gap} height={H} fill="transparent" />
              {h > 0 && <path d={`M${x},${H} v${-(h - 4)} q0,-4 4,-4 h${bw - 8} q4,0 4,4 v${h - 4} z`} fill={hover === i ? "var(--color-leaf-800)" : "var(--color-leaf-600)"} />}
              {(i % 2 === 0 || days.length <= 7) && (
                <text x={x + bw / 2} y={H + 18} textAnchor="middle" fontSize="10.5" fill="var(--color-ink-faint)">
                  {fmt(d.day)}
                </text>
              )}
            </g>
          );
        })}
        <text x={pad} y={14} fontSize="10.5" fill="var(--color-ink-faint)">
          {max}
        </text>
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute top-0 rounded-lg bg-mushaf-950 px-2.5 py-1.5 text-xs text-white shadow-lg" style={{ left: `${((pad + hover * (bw + gap)) / W) * 100}%` }}>
          <span className="font-semibold">{days[hover].count}</span> on {fmt(days[hover].day)}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { access, can } = useAccess();
  const summary = useLoad(() => db().rpc("dashboard_summary"), []);
  const s = summary.data || {};
  const trials = s.trials;
  const conversion = trials?.total_90d ? Math.round((100 * trials.enrolled_90d) / trials.total_90d) : null;
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader
        title={`${greet}, ${(access?.full_name || "").split(" ")[0] || "admin"}`}
        subtitle="Here is what is happening on the website."
        actions={
          <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
            <ExternalLink className="size-4" /> View website
          </a>
        }
      />
      {summary.loading ? (
        <Loading rows={6} />
      ) : summary.error ? (
        <ErrorState error={summary.error} onRetry={summary.reload} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {trials && <StatCard label="New trial requests" value={trials.new} hint="Waiting for first contact" icon={UserRoundCheck} href="/admin/trials" />}
            {trials && <StatCard label="Trials this month" value={trials.this_month} icon={CalendarClock} tone="blue" href="/admin/trials?status=all" />}
            {trials && <StatCard label="Enrolled (90 days)" value={conversion === null ? "—" : `${conversion}%`} hint={`${trials.enrolled_90d} of ${trials.total_90d} requests`} icon={Percent} tone="amber" href="/admin/reports" />}
            {s.contacts && <StatCard label="New messages" value={s.contacts.new} hint="From the contact form" icon={Inbox} tone="violet" href="/admin/contacts" />}
          </div>

          {trials && (
            <div className="grid items-start gap-6 xl:grid-cols-[1.25fr_1fr]">
              <Card title="Free-trial requests — last 14 days" actions={<span className="text-xs text-ink-faint">{trials.upcoming} upcoming trial classes</span>}>
                <TrendChart days={trials.by_day || []} />
              </Card>
              <Card
                title="Latest requests"
                bodyClass=""
                actions={
                  <Link href="/admin/trials" className="inline-flex items-center gap-1 text-sm font-semibold text-leaf-700 hover:underline">
                    All <ArrowRight className="size-4" />
                  </Link>
                }
              >
                {(trials.recent || []).length === 0 ? (
                  <EmptyState title="No requests yet" text="New free-trial bookings from the website appear here." />
                ) : (
                  <ul className="divide-y divide-line">
                    {trials.recent.map((t) => (
                      <li key={t.id}>
                        <Link href={`/admin/trials/${t.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-paper">
                          <span className="min-w-0">
                            <span className="block truncate font-semibold text-ink">{t.learner_name}</span>
                            <span className="block truncate text-xs text-ink-faint">
                              {t.course || "Course not chosen"} · {t.country} · <When value={t.created_at} />
                            </span>
                          </span>
                          <StatusBadge list={TRIAL_STATUSES} value={t.status} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          )}

          <Card title="Quick actions">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                can("blog:create") && { href: "/admin/blog/new", label: "Write a blog article", icon: Newspaper },
                can("pricing:update") && { href: "/admin/fees", label: "Update fees", icon: Wallet },
                can("pages:update") && { href: "/admin/pages", label: "Edit website pages", icon: FileText },
                can("settings:update") && { href: "/admin/settings", label: "Contact details & hero", icon: Settings },
              ]
                .filter(Boolean)
                .map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-semibold text-ink hover:border-leaf-600 hover:text-leaf-700">
                    <Icon className="size-5 text-gold-600" aria-hidden="true" /> {label}
                  </Link>
                ))}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
