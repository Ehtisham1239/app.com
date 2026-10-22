"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { RESOURCES } from "@/lib/admin/resources";
import { useAccess } from "@/lib/admin/access";
import { db, likeTerm, useLoad } from "@/lib/admin/db";
import { CONTENT_STATUSES } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/format";
import { Badge, Card, EmptyState, ErrorState, Loading, PageHeader, Pagination, SearchInput, StatusBadge, Tabs, When } from "@/components/admin/ui";

const MENU_LABELS = { header: "Header", footer_courses: "Footer · Courses", footer_company: "Footer · College", footer_legal: "Footer · Policies" };
const PAGE = 25;

export function Cell({ col, row }) {
  const v = row[col.key];
  switch (col.type) {
    case "status":
      return <StatusBadge list={CONTENT_STATUSES} value={v} />;
    case "when":
      return <When value={v} />;
    case "date":
      return <span className="whitespace-nowrap">{formatDate(v)}</span>;
    case "yesno":
      return v ? <Badge tone="green">Yes</Badge> : <Badge tone="muted">No</Badge>;
    case "cap":
      return <span className="capitalize">{v || "—"}</span>;
    case "menu":
      return MENU_LABELS[v] || v;
    case "prices":
      return (row.pricing_plan_prices || []).map((p) => formatMoney(p.amount_minor, p.currency)).join(" · ") || "—";
    default:
      return v ?? "—";
  }
}

export function ResourceList({ rkey }) {
  const cfg = RESOURCES[rkey];
  const router = useRouter();
  const { can } = useAccess();
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  const list = useLoad(() => {
    let query = db().from(cfg.table).select(cfg.select, { count: "exact" });
    if (cfg.softDelete) query = query.is("deleted_at", null);
    if (cfg.statusField && status !== "all") query = query.eq(cfg.statusField, status);
    if (q) query = query.or(cfg.search.map((f) => `${f}.ilike.${likeTerm(q)}`).join(","));
    for (let i = 0; i < cfg.order.length; i += 2) query = query.order(cfg.order[i], { ascending: cfg.order[i + 1] });
    return query.range(page * PAGE, page * PAGE + PAGE - 1);
  }, [rkey, status, q, page]);

  const canCreate = can(`${cfg.module}:create`);
  const rows = list.data || [];
  const [primary, ...rest] = cfg.columns;

  return (
    <>
      <PageHeader
        title={cfg.label}
        subtitle={cfg.note}
        actions={
          canCreate && (
            <Link href={`/admin/${rkey}/new`} className="btn btn-primary btn-sm">
              <Plus className="size-4" /> New {cfg.singular}
            </Link>
          )
        }
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {cfg.statusField ? (
          <Tabs
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(0);
            }}
            tabs={[{ value: "all", label: "All" }, ...CONTENT_STATUSES.map((s) => ({ value: s.value, label: s.label }))]}
          />
        ) : (
          <span />
        )}
        <SearchInput
          value={q}
          onChange={(v) => {
            setQ(v);
            setPage(0);
          }}
          placeholder={`Search ${cfg.label.toLowerCase()}…`}
          className="w-full sm:w-72"
        />
      </div>
      <Card bodyClass="">
        {list.loading ? (
          <Loading />
        ) : list.error ? (
          <ErrorState error={list.error} onRetry={list.reload} />
        ) : rows.length === 0 ? (
          <EmptyState
            title={q || status !== "all" ? "Nothing matches" : `No ${cfg.label.toLowerCase()} yet`}
            text={q || status !== "all" ? "Try another search or filter." : undefined}
            action={
              canCreate && !q && (
                <Link href={`/admin/${rkey}/new`} className="btn btn-primary btn-sm">
                  <Plus className="size-4" /> New {cfg.singular}
                </Link>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table">
              <thead>
                <tr>
                  {cfg.columns.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="row-link" onClick={() => router.push(`/admin/${rkey}/${r.id}`)}>
                    <td className="max-w-[26rem]">
                      <Link href={`/admin/${rkey}/${r.id}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-mushaf-900 hover:text-leaf-700">
                        {r[primary.key] || "Untitled"}
                      </Link>
                      {primary.sub && r[primary.sub] && (
                        <p className="truncate text-[0.8rem] text-ink-faint">
                          {primary.subPrefix}
                          {r[primary.sub]}
                        </p>
                      )}
                    </td>
                    {rest.map((c) => (
                      <td key={c.key} className="text-ink-soft">
                        <Cell col={c} row={r} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pageSize={PAGE} count={list.count} onPage={setPage} />
      </Card>
    </>
  );
}
