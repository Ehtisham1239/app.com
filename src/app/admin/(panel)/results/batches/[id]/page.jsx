"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, Ban, CheckCircle2, Loader2, RefreshCw, Send, ThumbsDown, Undo2, XCircle } from "lucide-react";
import { useAccess } from "@/lib/admin/access";
import { db, notifyError, useLoad } from "@/lib/admin/db";
import { formatDateTime } from "@/lib/format";
import { gradeFor, gradeLabel } from "@/lib/results/import";
import { BATCH_STATUSES, ROW_STATUSES } from "@/lib/results/status";
import { ResultsNav } from "@/components/admin/results-nav";
import { ResultCard } from "@/components/results/result-card";
import { Card, ConfirmButton, EmptyState, ErrorState, Field, Loading, Modal, PageHeader, Pagination, StatusBadge, Tabs } from "@/components/admin/ui";

const ROW_PAGE = 100;

const STEPS = [
  { key: "needs_review", label: "Checked & reviewed" },
  { key: "ready_for_approval", label: "Approved" },
  { key: "approved", label: "Published" },
];

function Progress({ status }) {
  const order = ["needs_review", "ready_for_approval", "approved", "published"];
  const at = order.indexOf(status);
  return (
    <ol className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
      <li className="rounded-full bg-leaf-700 px-3 py-1 text-white">Uploaded</li>
      {STEPS.map((s, i) => (
        <li key={s.key} className={`rounded-full px-3 py-1 ${at > i ? "bg-leaf-700 text-white" : at === i ? "bg-gold-100 text-gold-700" : "bg-white text-ink-faint ring-1 ring-line"}`}>{s.label}</li>
      ))}
    </ol>
  );
}

function RejectButton({ onReject }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <>
      <button type="button" className="btn btn-ghost btn-sm text-rose-700" onClick={() => setOpen(true)}><ThumbsDown className="size-4" /> Reject</button>
      <Modal open={open} onClose={() => !busy && setOpen(false)} title="Reject this upload?" size="sm"
        footer={<>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)} disabled={busy}>Cancel</button>
          <button type="button" className="btn btn-danger btn-sm" disabled={busy || note.trim().length < 3} onClick={async () => { setBusy(true); await onReject(note.trim()); setBusy(false); setOpen(false); }}>Reject</button>
        </>}>
        <Field label="Reason" required hint="The uploader sees this note."><textarea className="adm-input" rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      </Modal>
    </>
  );
}

export default function BatchPage({ params }) {
  const { id } = use(params);
  const { can } = useAccess();
  const [me, setMe] = useState(null);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [working, setWorking] = useState(false);
  useEffect(() => { db().auth.getUser().then(({ data }) => setMe(data?.user?.id ?? null)); }, []);
  const batch = useLoad(() => db().from("result_import_batches").select("*, assessments(id, code, title, total_marks, grade_bands, period_label, assessment_date, courses(title))").eq("id", id).maybeSingle(), [id]);
  const rows = useLoad(() => {
    let query = db().from("result_import_rows").select("id, row_number, student_code, student_name, marks_text, grade, teacher_remarks, marks_obtained, errors, status, students(full_name)", { count: "exact" }).eq("batch_id", id);
    if (filter !== "all") query = query.eq("status", filter);
    return query.order("row_number").range(page * ROW_PAGE, (page + 1) * ROW_PAGE - 1);
  }, [id, filter, page]);

  if (batch.loading && !batch.data) return <Loading rows={6} />;
  if (batch.error) return <ErrorState error={batch.error} onRetry={batch.reload} />;
  const b = batch.data;
  if (!b) return <PageHeader title="Upload not found" back={{ href: "/admin/results", label: "Results" }} />;
  const a = b.assessments;
  const editable = b.status === "needs_review";

  const run = async (fn, args, success) => {
    setWorking(true);
    const { data, error } = await db().rpc(fn, args);
    setWorking(false);
    if (error) { notifyError(error); return false; }
    toast.success(typeof success === "function" ? success(data) : success);
    batch.reload(); rows.reload();
    return true;
  };
  const toggleRow = async (row) => {
    const { error } = await db().rpc("results_set_row_excluded", { p_row_id: row.id, p_excluded: row.status !== "excluded" });
    if (error) return notifyError(error);
    if (can("results:create")) await db().rpc("results_validate_batch", { p_batch_id: b.id });
    batch.reload(); rows.reload();
  };

  const list = rows.data || [];
  const shown = list;
  const statusCounts = { valid: b.valid_rows, invalid: b.invalid_rows, duplicate: b.duplicate_rows, excluded: b.excluded_rows };
  const sample = list.find((r) => r.status === "valid");
  const samplePercent = sample ? (Number(sample.marks_obtained) * 100) / Number(a.total_marks) : 0;
  const sampleGrade = sample ? (sample.grade || gradeFor(a.grade_bands, samplePercent)) : "";
  const ownUpload = me && b.created_by === me;

  return (
    <>
      <PageHeader title={a?.title ?? "Upload"} back={{ href: "/admin/results", label: "Results" }}
        subtitle={`${b.original_filename} · uploaded ${formatDateTime(b.created_at)}`}
        actions={<>
          {editable && can("results:create") && <button type="button" className="btn btn-outline btn-sm" disabled={working} onClick={() => run("results_validate_batch", { p_batch_id: b.id }, "Rows checked again")}><RefreshCw className="size-4" /> Check again</button>}
          {editable && can("results:review") && <button type="button" className="btn btn-primary btn-sm" disabled={working || b.valid_rows === 0} onClick={() => run("results_submit_batch", { p_batch_id: b.id }, "Sent for approval")}><Send className="size-4" /> Submit for approval</button>}
          {b.status === "ready_for_approval" && can("results:approve") && <>
            <RejectButton onReject={(note) => run("results_decide_batch", { p_batch_id: b.id, p_approve: false, p_note: note }, "Upload rejected")} />
            <button type="button" className="btn btn-primary btn-sm" disabled={working} onClick={() => run("results_decide_batch", { p_batch_id: b.id, p_approve: true }, "Approved. It can now be published.")}><BadgeCheck className="size-4" /> Approve</button>
          </>}
          {b.status === "approved" && can("results:publish") && (
            <ConfirmButton danger={false} className="btn btn-primary btn-sm" confirmLabel="Publish" title={`Publish ${b.valid_rows} results?`}
              message="Parents linked to these students will see the results in the parent portal straight away. A published result can later be corrected or withdrawn, with the reason recorded."
              onConfirm={() => run("results_publish_batch", { p_batch_id: b.id }, (n) => `${n} results published`)}>
              <CheckCircle2 className="size-4" /> Publish to parents
            </ConfirmButton>
          )}
          {["needs_review", "ready_for_approval"].includes(b.status) && can("results:create") && (
            <ConfirmButton title="Cancel this upload?" message="Nothing from this file will be published. You can upload a corrected file afterwards." confirmLabel="Cancel upload" className="btn btn-ghost btn-sm text-rose-700"
              onConfirm={() => run("results_cancel_batch", { p_batch_id: b.id }, "Upload cancelled")}><Ban className="size-4" /> Cancel upload</ConfirmButton>
          )}
        </>}>
        <div className="mt-2 flex flex-wrap items-center gap-2"><StatusBadge list={BATCH_STATUSES} value={b.status} />{working && <Loader2 className="size-4 animate-spin text-leaf-700" />}</div>
        {!["rejected", "cancelled"].includes(b.status) && <Progress status={b.status} />}
      </PageHeader>
      <ResultsNav />

      {b.status === "ready_for_approval" && ownUpload && can("results:approve") && <p className="mb-4 rounded-xl bg-gold-50 px-4 py-3 text-sm text-gold-700">You uploaded this file, so a different staff member must approve it.</p>}
      {b.decision_note && <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800"><b>Reviewer’s note:</b> {b.decision_note}</p>}
      {b.status === "published" && <p className="mb-4 rounded-xl bg-leaf-50 px-4 py-3 text-sm text-leaf-800">Published {formatDateTime(b.published_at)}. <Link className="font-semibold underline" href={`/admin/results/published?assessment=${a.id}`}>See the published results</Link>.</p>}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[["Rows", b.total_rows, "text-mushaf-900"], ["Valid", b.valid_rows, "text-leaf-700"], ["Needs fixing", b.invalid_rows, "text-rose-700"], ["Duplicates", b.duplicate_rows, "text-gold-700"], ["Excluded", b.excluded_rows, "text-ink-faint"]].map(([label, value, color]) => (
          <div key={label} className="adm-card p-4"><p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</p><p className={`mt-1 font-display text-2xl ${color}`}>{value}</p></div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <Card title="Rows" bodyClass="">
          <div className="border-b border-line px-4 py-2">
            <Tabs value={filter} onChange={(value) => { setFilter(value); setPage(0); }} tabs={[{ value: "all", label: "All", count: b.total_rows }, ...ROW_STATUSES.filter((s) => s.value !== "pending").map((s) => ({ value: s.value, label: s.label, count: statusCounts[s.value] }))]} />
          </div>
          {rows.loading ? <Loading /> : rows.error ? <ErrorState error={rows.error} onRetry={rows.reload} /> : !shown.length ? <EmptyState title="No rows here" /> : (
            <div className="max-h-[36rem] overflow-auto">
              <table className="adm-table">
                <thead className="sticky top-0 bg-white"><tr><th>Row</th><th>Student</th><th>Marks</th><th>Grade</th><th>Status</th><th>Problem</th>{editable && can("results:review") && <th><span className="sr-only">Exclude</span></th>}</tr></thead>
                <tbody>
                  {shown.map((r) => (
                    <tr key={r.id}>
                      <td className="text-ink-faint">{r.row_number}</td>
                      <td><p className="font-semibold text-mushaf-900">{r.students?.full_name || r.student_name || "—"}</p><p className="font-mono text-xs text-ink-faint">{r.student_code || "no code"}</p></td>
                      <td>{r.marks_text || "—"}<span className="text-ink-faint"> / {Number(a.total_marks)}</span></td>
                      <td>{r.grade || <span className="text-ink-faint">auto</span>}</td>
                      <td><StatusBadge list={ROW_STATUSES} value={r.status} /></td>
                      <td className="max-w-[18rem] text-xs text-rose-700">{(r.errors || []).join("; ")}</td>
                      {editable && can("results:review") && (
                        <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => toggleRow(r)} aria-label={r.status === "excluded" ? `Include row ${r.row_number}` : `Exclude row ${r.row_number}`}>{r.status === "excluded" ? <><Undo2 className="size-4" /> Include</> : <><XCircle className="size-4" /> Exclude</>}</button></td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={page} pageSize={ROW_PAGE} count={rows.count} onPage={setPage} />
        </Card>

        <div className="space-y-3">
          <p className="text-sm font-bold text-mushaf-900">How parents will see a result</p>
          {sample ? (
            <ResultCard preview studentName={sample.students?.full_name || sample.student_name || sample.student_code}
              result={{ assessment: a.title, course: a.courses?.title, period: a.period_label, date: a.assessment_date, marks: sample.marks_obtained, total: a.total_marks, percentage: samplePercent, grade: sampleGrade, grade_label: gradeLabel(a.grade_bands, sampleGrade), remarks: sample.teacher_remarks, published_at: b.published_at }} />
          ) : <p className="adm-card p-5 text-sm text-ink-soft">A preview appears once at least one row is valid.</p>}
          <p className="text-xs text-ink-faint">Parents see only published results, through the parent portal sign-in. Print and download buttons are not offered there; this does not stop screenshots.</p>
        </div>
      </div>
    </>
  );
}
