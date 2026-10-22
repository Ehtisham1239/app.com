"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { clsx } from "clsx";
import { db, useLoad } from "@/lib/admin/db";
import { Card, EmptyState, ErrorState, Loading, PageHeader, Pagination, When } from "@/components/admin/ui";

const PAGE = 30;

export default function NotificationsPage() {
  const [page, setPage] = useState(0);
  const list = useLoad(() => db().from("notifications").select("id, title, body, link, read_at, created_at", { count: "exact" }).order("created_at", { ascending: false }).range(page * PAGE, page * PAGE + PAGE - 1), [page]);
  const markAll = async () => {
    await db().rpc("mark_all_notifications_read");
    list.reload();
  };
  return (
    <>
      <PageHeader title="Notifications" actions={<button type="button" className="btn btn-outline btn-sm" onClick={markAll}><CheckCheck className="size-4" /> Mark all read</button>} />
      <Card bodyClass="">
        {list.loading ? <Loading /> : list.error ? <ErrorState error={list.error} onRetry={list.reload} /> : !list.data?.length ? <EmptyState title="No notifications" text="New free-trial requests and messages will notify you here." /> : (
          <ul className="divide-y divide-line">
            {list.data.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.link || "#"}
                  onClick={() => { if (!n.read_at) db().from("notifications").update({ read_at: new Date().toISOString() }).eq("id", n.id).then(() => {}); }}
                  className={clsx("flex items-start justify-between gap-4 px-5 py-4 hover:bg-paper", !n.read_at && "bg-leaf-50/50")}
                >
                  <span>
                    <span className={clsx("block text-sm", !n.read_at ? "font-bold text-ink" : "font-semibold text-ink")}>{n.title}</span>
                    {n.body && <span className="mt-0.5 block text-sm text-ink-soft">{n.body}</span>}
                  </span>
                  <span className="shrink-0 text-xs text-ink-faint"><When value={n.created_at} /></span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Pagination page={page} pageSize={PAGE} count={list.count} onPage={setPage} />
      </Card>
    </>
  );
}
