"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Award, ClipboardList, Hourglass, Loader2, PenLine, Users } from "lucide-react";
import { useAccess } from "@/lib/admin/access";
import { db, notifyError, useLoad } from "@/lib/admin/db";
import { REPORT_STATUSES, monthInput, monthToPeriod, periodLabel } from "@/lib/progress/constants";
import { Card, EmptyState, ErrorState, Loading, PageHeader, StatCard, StatusBadge, Tabs } from "@/components/admin/ui";

function AwardPicker({ period, groups, reports, awards, onDone }) {
  const [busy, setBusy] = useState("");
  const set = async (group, studentId) => {
    setBusy(group);
    const { error } = await db().rpc("progress_set_award", { p_period: period, p_group: group, p_student_id: studentId || null });
    setBusy("");
    if (error) return notifyError(error);
    toast.success(studentId ? "Student of the Month saved" : "Award removed");
    onDone();
  };
  return (
    <Card title={<span className="inline-flex items-center gap-2"><Award className="size-4 text-gold-600" /> Student of the Month · {periodLabel(period)}</span>}>
      <p className="mb-3 text-sm text-ink-soft">An admin choice, one per group and month. It shows on the student’s certificate once their report is published.</p>
      <div className="space-y-3">
        {groups.map((g) => {
          const choices = reports.filter((r) => (r.group_label || "") === g);
          const chosen = awards.find((a) => a.group_label === g)?.student_id || "";
          return (
            <label key={g || "none"} className="grid items-center gap-2 sm:grid-cols-[10rem_1fr]">
              <span className="text-sm font-semibold text-ink">{g || "All students"}</span>
              <span className="flex items-center gap-2">
                <select className="adm-input" value={chosen} disabled={!!busy} onChange={(e) => set(g, e.target.value)}>
                  <option value="">— No award —</option>
                  {choices.map((r) => <option key={r.student_id} value={r.student_id}>{r.students?.full_name}</option>)}
                </select>
                {busy === g && <Loader2 className="size-4 animate-spin text-leaf-700" />}
              </span>
            </label>
          );
        })}
      </div>
    </Card>
  );
}

export default function ProgressReviewPage() {
  const router = useRouter();
  const { can } = useAccess();
  const [month, setMonth] = useState(monthInput());
  const [status, setStatus] = useState("submitted");
  const [teacher, setTeacher] = useState("");
  const period = monthToPeriod(month);
  const reports = useLoad(() => (period ? db().from("monthly_reports").select("id, student_id, status, published_at, published_version, updated_at, teacher_profile_id, students(full_name, student_code), profiles!monthly_reports_teacher_profile_id_fkey(full_name)").eq("period", period).order("updated_at", { ascending: false }) : { data: [] }), [period]);
  const assignments = useLoad(() => db().from("progress_assignments").select("student_id, group_label"), []);
  const awards = useLoad(() => (period ? db().from("student_of_month").select("group_label, student_id").eq("period", period) : { data: [] }), [period]);

  const all = reports.data || [];
  const groupOf = Object.fromEntries((assignments.data || []).map((a) => [a.student_id, a.group_label || ""]));
  const teachers = [...new Map(all.filter((r) => r.teacher_profile_id).map((r) => [r.teacher_profile_id, r.profiles?.full_name || "Teacher"])).entries()];
  const shown = all.filter((r) => (status === "all" || r.status === status) && (!teacher || r.teacher_profile_id === teacher));
  const count = (s) => all.filter((r) => r.status === s).length;
  const published = all.filter((r) => r.status === "published" || r.published_at);
  const groups = [...new Set(published.map((r) => groupOf[r.student_id] || ""))].sort();

  return (
    <>
      <PageHeader title="Monthly progress — review and publish" subtitle="Check reports before parents can see them. Edit, ask the teacher for changes, or publish."
        actions={<>
          {can("progress:update") && <Link href="/admin/progress/assignments" className="btn btn-outline btn-sm"><Users className="size-4" /> Assignments</Link>}
          {(can("progress:submit") || can("progress:review")) && <Link href="/admin/progress/form" className="btn btn-primary btn-sm"><PenLine className="size-4" /> Teacher form</Link>}
        </>} />

      <div className="mb-5 flex flex-wrap items-end gap-3">
        <label className="text-sm font-semibold text-ink">Month<input type="month" className="adm-input mt-1 w-44" value={month} max={monthInput()} onChange={(e) => setMonth(e.target.value)} /></label>
        <label className="text-sm font-semibold text-ink">Teacher
          <select className="adm-input mt-1 w-56" value={teacher} onChange={(e) => setTeacher(e.target.value)}>
            <option value="">All teachers</option>
            {teachers.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending review" value={reports.data ? count("submitted") : null} icon={Hourglass} tone="blue" />
        <StatCard label="Published" value={reports.data ? count("published") : null} icon={ClipboardList} />
        <StatCard label="Needs correction" value={reports.data ? count("changes_requested") : null} icon={PenLine} tone="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card title="Review monthly reports" bodyClass="">
          <div className="border-b border-line px-4 py-2">
            <Tabs value={status} onChange={setStatus} tabs={[...REPORT_STATUSES.map((s) => ({ value: s.value, label: s.label, count: count(s.value) })), { value: "all", label: "All", count: all.length }]} />
          </div>
          {reports.loading ? <Loading /> : reports.error ? <ErrorState error={reports.error} onRetry={reports.reload} /> : !shown.length ? (
            <EmptyState icon={ClipboardList} title="No reports here" text={status === "submitted" ? "Nothing is waiting for review this month." : "Try another status or month."} />
          ) : (
            <div className="overflow-x-auto">
              <table className="adm-table">
                <thead><tr><th>Student</th><th>Teacher</th><th>Status</th><th><span className="sr-only">Open</span></th></tr></thead>
                <tbody>
                  {shown.map((r) => (
                    <tr key={r.id} className="row-link" onClick={() => router.push(`/admin/progress/${r.id}`)}>
                      <td><p className="font-semibold text-mushaf-900">{r.students?.full_name}</p><p className="text-xs text-ink-faint">{[r.students?.student_code, groupOf[r.student_id]].filter(Boolean).join(" · ")}</p></td>
                      <td className="text-ink-soft">{r.profiles?.full_name || "—"}</td>
                      <td><StatusBadge list={REPORT_STATUSES} value={r.status} />{r.published_at && r.status !== "published" && <span className="ml-2 text-xs text-ink-faint">v{r.published_version} live</span>}</td>
                      <td><Link href={`/admin/progress/${r.id}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-leaf-700 hover:underline">Review</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {can("progress:publish") && period && (
          published.length ? (
            <AwardPicker period={period} groups={groups} reports={published.map((r) => ({ ...r, group_label: groupOf[r.student_id] || "" }))} awards={awards.data || []} onDone={awards.reload} />
          ) : <Card title="Student of the Month"><p className="text-sm text-ink-soft">Publish at least one report for {periodLabel(period)} to choose the Student of the Month.</p></Card>
        )}
      </div>
    </>
  );
}
