"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { db, likeTerm, useLoad } from "@/lib/admin/db";
import { CONTACT_STATUSES } from "@/lib/constants";
import { truncate } from "@/lib/format";
import { Card, EmptyState, ErrorState, Loading, PageHeader, Pagination, SearchInput, StatusBadge, Tabs, When } from "@/components/admin/ui";

const PAGE = 25;

export default function ContactsPage() {
  const router = useRouter();
  const [status, setStatus] = useState("new");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const list = useLoad(() => {
    let query = db().from("contact_messages").select("id, reference, name, email, subject, message, status, created_at", { count: "exact" }).is("deleted_at", null);
    if (status !== "all") query = query.eq("status", status);
    if (q) query = query.or(["name", "email", "subject", "reference", "message"].map((f) => `${f}.ilike.${likeTerm(q)}`).join(","));
    return query.order("created_at", { ascending: false }).range(page * PAGE, page * PAGE + PAGE - 1);
  }, [status, q, page]);
  const counts = useLoad(async () => {
    const res = await Promise.all(CONTACT_STATUSES.map((s) => db().from("contact_messages").select("id", { count: "exact", head: true }).is("deleted_at", null).eq("status", s.value)));
    return { data: Object.fromEntries(CONTACT_STATUSES.map((s, i) => [s.value, res[i].count ?? 0])) };
  }, []);
  return (
    <>
      <PageHeader title="Messages" subtitle="Questions sent through the website’s contact form." />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={status} onChange={(v) => { setStatus(v); setPage(0); }} tabs={[...CONTACT_STATUSES.map((s) => ({ value: s.value, label: s.label, count: counts.data?.[s.value] })), { value: "all", label: "All" }]} />
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(0); }} placeholder="Name, email or subject…" className="w-full sm:w-72" />
      </div>
      <Card bodyClass="">
        {list.loading ? (
          <Loading />
        ) : list.error ? (
          <ErrorState error={list.error} onRetry={list.reload} />
        ) : !list.data?.length ? (
          <EmptyState title={status === "new" ? "No new messages" : "No messages here"} text="Messages from the contact page arrive here automatically." />
        ) : (
          <ul className="divide-y divide-line">
            {list.data.map((m) => (
              <li key={m.id}>
                <Link href={`/admin/contacts/${m.id}`} onClick={(e) => { e.preventDefault(); router.push(`/admin/contacts/${m.id}`); }} className="flex items-start gap-4 px-5 py-4 hover:bg-paper">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-x-2 text-sm">
                      <span className={m.status === "new" ? "font-bold text-ink" : "font-semibold text-ink"}>{m.name}</span>
                      <span className="text-ink-faint">{m.email}</span>
                    </p>
                    <p className={m.status === "new" ? "mt-0.5 font-semibold text-mushaf-900" : "mt-0.5 text-ink"}>{m.subject}</p>
                    <p className="mt-0.5 text-sm text-ink-soft">{truncate(m.message, 140)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5 text-xs text-ink-faint">
                    <When value={m.created_at} />
                    <StatusBadge list={CONTACT_STATUSES} value={m.status} />
                  </div>
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
