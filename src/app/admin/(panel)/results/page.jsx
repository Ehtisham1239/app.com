"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ClipboardCheck, FileUp, GraduationCap, Hourglass, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useAccess } from "@/lib/admin/access";
import { db, notifyError, useLoad } from "@/lib/admin/db";
import { formatDate, timeAgo } from "@/lib/format";
import { normalizeGradeBands } from "@/lib/results/import";
import { ASSESSMENT_STATUSES, BATCH_STATUSES } from "@/lib/results/status";
import { ResultsNav } from "@/components/admin/results-nav";
import { Card, EmptyState, ErrorState, Field, Loading, Modal, PageHeader, StatCard, StatusBadge } from "@/components/admin/ui";

const EMPTY = { code: "", title: "", course_id: "", assessment_date: new Date().toISOString().slice(0, 10), period_label: "", total_marks: "100", status: "draft", grade_bands: [] };

function AssessmentForm({ open, initial, onClose, onSaved }) {
  const courses = useLoad(() => (open ? db().from("courses").select("id, title").is("deleted_at", null).order("sort_order") : { data: [] }), [open]);
  const [form, setForm] = useState(initial ?? EMPTY);
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setBand = (i, k, v) => setForm((f) => ({ ...f, grade_bands: f.grade_bands.map((b, j) => (j === i ? { ...b, [k]: v } : b)) }));
  const save = async () => {
    const code = form.code.trim().toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9-]{1,39}$/.test(code)) return toast.error("Use a short code with letters, numbers and dashes, such as TAJWEED-T1-2026.");
    if (form.title.trim().length < 2) return toast.error("Enter the assessment title.");
    const total = Number(form.total_marks);
    if (!(total > 0 && total <= 10000)) return toast.error("Maximum marks must be between 1 and 10,000.");
    let bands;
    try { bands = normalizeGradeBands(form.grade_bands); } catch (e) { return toast.error(e.message); }
    setBusy(true);
    const row = { code, title: form.title.trim(), course_id: form.course_id || null, assessment_date: form.assessment_date, period_label: form.period_label.trim(), total_marks: total, status: form.status, grade_bands: bands };
    const { error } = initial?.id ? await db().from("assessments").update(row).eq("id", initial.id) : await db().from("assessments").insert(row);
    setBusy(false);
    if (error) return notifyError(error);
    toast.success(initial?.id ? "Assessment updated" : "Assessment created");
    onSaved();
  };
  return (
    <Modal open={open} onClose={onClose} title={initial?.id ? "Edit assessment" : "New assessment"} size="lg"
      footer={<>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={busy}>Cancel</button>
        <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={busy}>{busy && <Loader2 className="size-4 animate-spin" />} Save</button>
      </>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" required className="sm:col-span-2"><input className="adm-input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Tajweed — Term 1 assessment" /></Field>
        <Field label="Code" required hint="Used in the spreadsheet's assessment_code column"><input className="adm-input uppercase" value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="TAJWEED-T1-2026" /></Field>
        <Field label="Course">
          <select className="adm-input" value={form.course_id ?? ""} onChange={(e) => set("course_id", e.target.value)}>
            <option value="">— Choose —</option>
            {(courses.data || []).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </Field>
        <Field label="Assessment date" required><input type="date" className="adm-input" value={form.assessment_date} onChange={(e) => set("assessment_date", e.target.value)} /></Field>
        <Field label="Period" hint="For example: Term 1, 2026"><input className="adm-input" value={form.period_label} onChange={(e) => set("period_label", e.target.value)} /></Field>
        <Field label="Maximum marks" required><input type="number" min="1" max="10000" step="0.5" className="adm-input" value={form.total_marks} onChange={(e) => set("total_marks", e.target.value)} /></Field>
        <Field label="Status" hint="Results can be uploaded only while the assessment is open">
          <select className="adm-input" value={form.status} onChange={(e) => set("status", e.target.value)}>
            {ASSESSMENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </Field>
      </div>
      <fieldset className="mt-6 rounded-xl border border-line p-4">
        <legend className="px-1 text-sm font-bold text-mushaf-900">Grade bands</legend>
        <p className="text-sm text-ink-soft">Optional. Add OQC’s approved grades and the minimum percentage for each. With no bands, parents see marks and percentage only. A grade typed in the spreadsheet must be one of these.</p>
        {form.grade_bands.length > 0 && (
          <div className="mt-3 space-y-2">
            {form.grade_bands.map((b, i) => (
              <div key={i} className="grid grid-cols-[5rem_7rem_1fr_auto] items-center gap-2">
                <input className="adm-input uppercase" aria-label={`Grade ${i + 1}`} value={b.grade} onChange={(e) => setBand(i, "grade", e.target.value)} placeholder="A" />
                <input type="number" min="0" max="100" className="adm-input" aria-label={`Minimum percentage for grade ${i + 1}`} value={b.min_percent} onChange={(e) => setBand(i, "min_percent", e.target.value)} placeholder="90" />
                <input className="adm-input" aria-label={`Description for grade ${i + 1}`} value={b.label ?? ""} onChange={(e) => setBand(i, "label", e.target.value)} placeholder="Description (optional)" />
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm((f) => ({ ...f, grade_bands: f.grade_bands.filter((_, j) => j !== i) }))} aria-label={`Remove grade ${i + 1}`}><Trash2 className="size-4" /></button>
              </div>
            ))}
            <p className="text-xs text-ink-faint">Columns: grade · minimum % · description shown to parents.</p>
          </div>
        )}
        <button type="button" className="btn btn-outline btn-sm mt-3" onClick={() => setForm((f) => ({ ...f, grade_bands: [...f.grade_bands, { grade: "", min_percent: "", label: "" }] }))}><Plus className="size-4" /> Add grade</button>
      </fieldset>
    </Modal>
  );
}

export default function ResultsPage() {
  const { can } = useAccess();
  const [editing, setEditing] = useState(null);
  const assessments = useLoad(() => db().from("assessments").select("*, courses(title)").order("assessment_date", { ascending: false }).limit(100), []);
  const batches = useLoad(() => db().from("result_import_batches").select("id, original_filename, status, total_rows, valid_rows, invalid_rows, duplicate_rows, created_at, assessments(title, code)").order("created_at", { ascending: false }).limit(20), []);
  const counts = useLoad(async () => {
    const [review, approval, published] = await Promise.all([
      db().from("result_import_batches").select("id", { count: "exact", head: true }).eq("status", "needs_review"),
      db().from("result_import_batches").select("id", { count: "exact", head: true }).in("status", ["ready_for_approval", "approved"]),
      db().from("student_results").select("id", { count: "exact", head: true }).eq("status", "published"),
    ]);
    const error = review.error || approval.error || published.error;
    return error ? { error } : { data: { review: review.count, approval: approval.count, published: published.count } };
  }, []);
  const active = (assessments.data || []).filter((a) => a.status === "active").length;
  const reload = () => { setEditing(null); assessments.reload(); };

  return (
    <>
      <PageHeader title="Results" subtitle="Upload marks from a CSV or Excel sheet, review and approve them, then publish to the parent portal."
        actions={<>
          {can("results:create") && <Link href="/admin/results/import" className="btn btn-outline btn-sm"><FileUp className="size-4" /> Upload results</Link>}
          {can("results:create") && <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing(EMPTY)}><Plus className="size-4" /> New assessment</button>}
        </>} />
      <ResultsNav />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open assessments" value={assessments.data ? active : null} icon={GraduationCap} />
        <StatCard label="Uploads to review" value={counts.data?.review} icon={ClipboardCheck} tone="amber" />
        <StatCard label="Awaiting approval / publishing" value={counts.data?.approval} icon={Hourglass} tone="blue" />
        <StatCard label="Published results" value={counts.data?.published} icon={GraduationCap} href="/admin/results/published" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card title="Assessments" bodyClass="">
          {assessments.loading ? <Loading /> : assessments.error ? <ErrorState error={assessments.error} onRetry={assessments.reload} /> : !assessments.data?.length ? (
            <EmptyState icon={GraduationCap} title="No assessments yet" text="Create an assessment, set it to “Open for results”, then upload the marks sheet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="adm-table">
                <thead><tr><th>Assessment</th><th>Date</th><th>Max</th><th>Grades</th><th>Status</th><th><span className="sr-only">Edit</span></th></tr></thead>
                <tbody>
                  {assessments.data.map((a) => (
                    <tr key={a.id}>
                      <td><p className="font-semibold text-mushaf-900">{a.title}</p><p className="text-xs text-ink-faint">{a.code}{a.courses?.title ? ` · ${a.courses.title}` : ""}{a.period_label ? ` · ${a.period_label}` : ""}</p></td>
                      <td className="whitespace-nowrap text-ink-soft">{formatDate(a.assessment_date)}</td>
                      <td className="text-ink-soft">{Number(a.total_marks)}</td>
                      <td className="text-ink-soft">{a.grade_bands?.length ? a.grade_bands.map((b) => b.grade).join(" · ") : "Marks only"}</td>
                      <td><StatusBadge list={ASSESSMENT_STATUSES} value={a.status} /></td>
                      <td>{can("results:update") && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing({ ...a, course_id: a.course_id ?? "", total_marks: String(Number(a.total_marks)), grade_bands: a.grade_bands || [] })} aria-label={`Edit ${a.title}`}><Pencil className="size-4" /></button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Recent uploads" bodyClass="">
          {batches.loading ? <Loading /> : batches.error ? <ErrorState error={batches.error} onRetry={batches.reload} /> : !batches.data?.length ? (
            <EmptyState icon={FileUp} title="No uploads yet" text="Uploaded sheets appear here for review and approval." />
          ) : (
            <ul className="divide-y divide-line">
              {batches.data.map((b) => (
                <li key={b.id}>
                  <Link href={`/admin/results/batches/${b.id}`} className="flex items-start justify-between gap-3 px-5 py-3 hover:bg-paper">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-mushaf-900">{b.assessments?.title}</span>
                      <span className="block truncate text-xs text-ink-faint">{b.original_filename} · {b.valid_rows}/{b.total_rows} valid · {timeAgo(b.created_at)}</span>
                    </span>
                    <StatusBadge list={BATCH_STATUSES} value={b.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      {editing && <AssessmentForm open initial={editing.id ? editing : null} onClose={() => setEditing(null)} onSaved={reload} key={editing.id ?? "new"} />}
    </>
  );
}
