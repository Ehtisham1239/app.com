"use client";

import Link from "next/link";
import { useState } from "react";
import { Paperclip, Star } from "lucide-react";
import { db, likeTerm, useLoad } from "@/lib/admin/db";
import { REVIEW_STATUSES } from "@/lib/constants";
import { truncate } from "@/lib/format";
import { Card, EmptyState, ErrorState, Loading, PageHeader, Pagination, SearchInput, StatusBadge, Tabs, When } from "@/components/admin/ui";

const PAGE = 25;

export default function ReviewsPage() {
  const [status, setStatus] = useState("new");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const list = useLoad(() => {
    let query = db().from("review_submissions").select("id, reference, name, email, relation, rating, comment, media_paths, status, created_at", { count: "exact" }).is("deleted_at", null);
    if (status !== "all") query = query.eq("status", status);
    if (q) query = query.or(["name", "email", "reference", "comment"].map((f) => `${f}.ilike.${likeTerm(q)}`).join(","));
    return query.order("created_at", { ascending: false }).range(page * PAGE, page * PAGE + PAGE - 1);
  }, [status, q, page]);
  const counts = useLoad(async () => {
    const res = await Promise.all(REVIEW_STATUSES.map((s) => db().from("review_submissions").select("id", { count: "exact", head: true }).is("deleted_at", null).eq("status", s.value)));
    return { data: Object.fromEntries(REVIEW_STATUSES.map((s, i) => [s.value, res[i].count ?? 0])) };
  }, []);
  return (
    <>
      <PageHeader title="Reviews" subtitle="Reviews sent by parents and students from the website’s reviews button. Nothing here is published until you create a testimonial from it." />
      <details className="mb-4 rounded-2xl border border-line bg-white px-5 py-4 text-sm text-ink-soft">
        <summary className="cursor-pointer font-semibold text-ink">How to handle reviews</summary>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 leading-relaxed">
          <li>Open each <strong>New</strong> review. Critical reviews deserve a reply: email the parent or student and note what you did under <em>Internal note</em>.</li>
          <li>Mark it <strong>Approve</strong>, <strong>Don’t use</strong>, <strong>Archive</strong> or <strong>Spam</strong>. Nothing here is visible on the website.</li>
          <li>To show a review on the website, use <em>Create testimonial draft</em>, ask the reviewer for permission to publish, record that date in the testimonial and then publish it.</li>
          <li>Photos and videos are private. Never publish them without written permission, and use <em>Delete files</em> once they are no longer needed.</li>
          <li>Invite every family to review on Google and Trustpilot, not only happy ones; selective inviting breaks both platforms’ rules.</li>
        </ol>
      </details>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={status} onChange={(v) => { setStatus(v); setPage(0); }} tabs={[...REVIEW_STATUSES.map((s) => ({ value: s.value, label: s.label, count: counts.data?.[s.value] })), { value: "all", label: "All" }]} />
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(0); }} placeholder="Name, email or words…" className="w-full sm:w-72" />
      </div>
      <Card bodyClass="">
        {list.loading ? (
          <Loading />
        ) : list.error ? (
          <ErrorState error={list.error} onRetry={list.reload} />
        ) : !list.data?.length ? (
          <EmptyState title={status === "new" ? "No new reviews" : "No reviews here"} text="Reviews from the website arrive here automatically." />
        ) : (
          <ul className="divide-y divide-line">
            {list.data.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/reviews/${r.id}`} className="flex items-start gap-4 px-5 py-4 hover:bg-paper">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-x-2 text-sm">
                      <span className={r.status === "new" ? "font-bold text-ink" : "font-semibold text-ink"}>{r.name}</span>
                      <span className="text-ink-faint">{r.relation} · {r.email}</span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-0.5 text-gold-600" aria-label={`${r.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }, (_, i) => <Star key={i} className={`size-4 ${i < r.rating ? "fill-current" : "opacity-30"}`} aria-hidden="true" />)}
                      {r.media_paths?.length > 0 && <span className="ml-2 inline-flex items-center gap-1 text-xs text-ink-soft"><Paperclip className="size-3.5" aria-hidden="true" />{r.media_paths.length} file{r.media_paths.length > 1 ? "s" : ""}</span>}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-soft">{truncate(r.comment, 160)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5 text-xs text-ink-faint">
                    <When value={r.created_at} />
                    <StatusBadge list={REVIEW_STATUSES} value={r.status} />
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
