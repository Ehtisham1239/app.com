"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Download } from "lucide-react";
import { db, downloadCsv, likeTerm, notifyError, useLoad } from "@/lib/admin/db";
import { AGE_BANDS, TRIAL_STATUSES, labelFor } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { Badge, Card, EmptyState, ErrorState, Loading, PageHeader, Pagination, SearchInput, StatusBadge, Tabs, When } from "@/components/admin/ui";

const PAGE = 25;
const FIELDS = "id, reference, learner_name, guardian_name, email, phone, country, timezone, age_band, status, created_at, trial_at, duplicate_of_id, source, preferred_days, preferred_times, courses(title), teachers(display_name)";

function TrialsList() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState(params.get("status") || "all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  const filtered = (query) => {
    query = query.is("deleted_at", null);
    if (status !== "all") query = query.eq("status", status);
    if (q) query = query.or(["learner_name", "guardian_name", "email", "phone", "reference"].map((f) => `${f}.ilike.${likeTerm(q)}`).join(","));
    return query;
  };
  const list = useLoad(() => filtered(db().from("trial_applications").select(FIELDS, { count: "exact" })).order("created_at", { ascending: false }).range(page * PAGE, page * PAGE + PAGE - 1), [status, q, page]);
  const counts = useLoad(async () => {
    const res = await Promise.all(TRIAL_STATUSES.map((s) => db().from("trial_applications").select("id", { count: "exact", head: true }).is("deleted_at", null).eq("status", s.value)));
    return { data: Object.fromEntries(TRIAL_STATUSES.map((s, i) => [s.value, res[i].count ?? 0])) };
  }, []);

  const exportCsv = async () => {
    const { data, error } = await filtered(db().from("trial_applications").select(`${FIELDS}, city, level, teacher_gender_pref, teaching_language, notes, marketing_opt_in, utm`)).order("created_at", { ascending: false }).limit(5000);
    if (error) return notifyError(error);
    downloadCsv(`free-trials-${new Date().toISOString().slice(0, 10)}.csv`, data, [
      { label: "Reference", key: "reference" },
      { label: "Requested", value: (r) => formatDateTime(r.created_at, "Asia/Karachi") },
      { label: "Status", value: (r) => labelFor(TRIAL_STATUSES, r.status) },
      { label: "Learner", key: "learner_name" },
      { label: "Parent / guardian", key: "guardian_name" },
      { label: "Email", key: "email" },
      { label: "Phone", key: "phone" },
      { label: "Country", key: "country" },
      { label: "City", key: "city" },
      { label: "Time zone", key: "timezone" },
      { label: "Age", value: (r) => labelFor(AGE_BANDS, r.age_band) },
      { label: "Course", value: (r) => r.courses?.title },
      { label: "Level", key: "level" },
      { label: "Teacher preference", key: "teacher_gender_pref" },
      { label: "Language", key: "teaching_language" },
      { label: "Preferred days", key: "preferred_days" },
      { label: "Preferred times", key: "preferred_times" },
      { label: "Trial class (PKT)", value: (r) => (r.trial_at ? formatDateTime(r.trial_at, "Asia/Karachi") : "") },
      { label: "Teacher", value: (r) => r.teachers?.display_name },
      { label: "Notes", key: "notes" },
      { label: "Source", key: "source" },
      { label: "Marketing consent", value: (r) => (r.marketing_opt_in ? "Yes" : "No") },
    ]);
  };

  const total = counts.data ? Object.values(counts.data).reduce((a, b) => a + b, 0) : undefined;
  return (
    <>
      <PageHeader
        title="Free-trial requests"
        subtitle="Every booking made on the website. Open one to contact the family, schedule the trial and record the outcome."
        actions={
          <button type="button" onClick={exportCsv} className="btn btn-outline btn-sm">
            <Download className="size-4" /> Export CSV
          </button>
        }
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(0);
          }}
          tabs={[{ value: "all", label: "All", count: total }, ...TRIAL_STATUSES.map((s) => ({ value: s.value, label: s.label, count: counts.data?.[s.value] }))]}
        />
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(0); }} placeholder="Name, email, phone or TR-…" className="w-full sm:w-72" />
      </div>
      <Card bodyClass="">
        {list.loading ? (
          <Loading />
        ) : list.error ? (
          <ErrorState error={list.error} onRetry={list.reload} />
        ) : !list.data?.length ? (
          <EmptyState title={q || status !== "all" ? "No requests match" : "No free-trial requests yet"} text="Bookings from the website’s free-trial form appear here automatically." />
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Learner</th>
                  <th>Age</th>
                  <th>Course</th>
                  <th>Country</th>
                  <th>Requested</th>
                  <th>Trial class</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {list.data.map((t) => (
                  <tr key={t.id} className="row-link" onClick={() => router.push(`/admin/trials/${t.id}`)}>
                    <td>
                      <Link href={`/admin/trials/${t.id}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-mushaf-900 hover:text-leaf-700">
                        {t.learner_name}
                      </Link>
                      <p className="text-[0.78rem] text-ink-faint">
                        {t.reference}
                        {t.guardian_name ? ` · ${t.guardian_name}` : ""} {t.duplicate_of_id && <Badge tone="amber">Possible repeat</Badge>}
                      </p>
                    </td>
                    <td className="whitespace-nowrap text-ink-soft">{labelFor(AGE_BANDS, t.age_band)}</td>
                    <td className="text-ink-soft">{t.courses?.title || "—"}</td>
                    <td className="text-ink-soft">
                      {t.country}
                      <p className="text-[0.75rem] text-ink-faint">{t.timezone}</p>
                    </td>
                    <td className="text-ink-soft">
                      <When value={t.created_at} />
                    </td>
                    <td className="whitespace-nowrap text-ink-soft">{t.trial_at ? formatDateTime(t.trial_at) : "—"}</td>
                    <td>
                      <StatusBadge list={TRIAL_STATUSES} value={t.status} />
                    </td>
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

export default function TrialsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <TrialsList />
    </Suspense>
  );
}
