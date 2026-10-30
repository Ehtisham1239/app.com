"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, ClipboardList, Loader2, Save, Send, Eye, EyeOff } from "lucide-react";
import { useAccess } from "@/lib/admin/access";
import { db, errorMessage, useLoad } from "@/lib/admin/db";
import { CATEGORIES, REPORT_STATUSES, SCORE_MAX, detailsForm, emptyRatings, missingForSubmit, monthInput, monthToPeriod, periodLabel } from "@/lib/progress/constants";
import { Card, EmptyState, ErrorState, Field, Loading, Modal, StatusBadge } from "@/components/admin/ui";
import { ClientIdentity } from "@/components/results/client-identity";
import { ProgressCertificate } from "@/components/results/progress-certificate";
import { ProgressDmc } from "@/components/results/progress-dmc";
import { SyllabusCard } from "@/components/results/syllabus-card";
import { ProgressWorkflow } from "@/components/results/progress-workflow";
import { RatingPicker } from "@/components/admin/rating-picker";

function TeacherForm() {
  const params = useSearchParams();
  const { can } = useAccess();
  const [month, setMonth] = useState(params.get("month") || monthInput());
  const [studentId, setStudentId] = useState(params.get("student") || "");
  const [busy, setBusy] = useState("");
  const [dirty, setDirty] = useState(false);
  const [pendingSelection, setPendingSelection] = useState(null);
  const select = (selection) => {
    if (dirty) return setPendingSelection(selection);
    if (selection.student !== undefined) setStudentId(selection.student);
    if (selection.month !== undefined) setMonth(selection.month);
  };
  const period = monthToPeriod(month);
  const students = useLoad(() => (period ? db().rpc("progress_my_students", { p_period: period }) : { data: [] }), [period]);
  const current = (students.data || []).find((s) => s.student_id === studentId) || null;
  const report = useLoad(() => (current?.report_id ? db().from("monthly_reports").select("*").eq("id", current.report_id).maybeSingle() : { data: null }), [current?.report_id]);


  return (
    <>
      <header className="relative mb-6 overflow-hidden rounded-2xl bg-linear-to-br from-mushaf-900 via-mushaf-800 to-mushaf-700 px-5 py-5 text-white sm:px-7">
        <div className="pattern-girih absolute inset-0 opacity-[0.12]" aria-hidden="true" />
        <div className="relative flex flex-wrap items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-white p-1.5"><img src="/brand/logo.webp" alt="" width={48} height={48} className="size-11" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-gold-300">Online Quran College · Monthly student progress</p>
            <h1 className="mt-0.5 font-display text-2xl leading-tight sm:text-[1.7rem]">Teacher progress form</h1>
            <p className="mt-0.5 text-sm text-white/80">Choose a student and month, give six ratings, optional marks, attendance and syllabus, and a short remark. Save a draft any time; submit when complete.</p>
          </div>
        </div>
      </header>
      <ProgressWorkflow status={current?.status || "draft"} />
      <div className="grid gap-6 xl:grid-cols-[20rem_1fr]">
        <Card title="Your students" bodyClass="">
          <div className="border-b border-line p-4">
            <Field label="Reporting month"><input type="month" disabled={!!busy} className="adm-input" value={month} max={monthInput()} onChange={(e) => select({ month: e.target.value })} /></Field>
          </div>
          {students.loading ? <Loading rows={4} /> : students.error ? <ErrorState error={students.error} onRetry={students.reload} /> : !students.data?.length ? (
            <EmptyState icon={ClipboardList} title="No students assigned" text="Ask the admin to assign your students under Monthly progress → Assignments." />
          ) : (
            <ul className="max-h-[32rem] divide-y divide-line overflow-auto">
              {students.data.map((s) => (
                <li key={s.student_id}>
                  <button type="button" disabled={!!busy} onClick={() => { if (s.student_id !== studentId) select({ student: s.student_id }); }} aria-pressed={s.student_id === studentId}
                    className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-paper ${s.student_id === studentId ? "bg-leaf-50" : ""}`}>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-mushaf-900">{s.full_name}</span>
                      <span className="block text-xs text-ink-faint">{[s.student_code, s.group_label].filter(Boolean).join(" · ")}</span>
                    </span>
                    {s.status ? <StatusBadge list={REPORT_STATUSES} value={s.status} /> : <span className="text-xs text-ink-faint">Not started</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={current ? `${current.full_name} · ${periodLabel(period)}` : "Monthly ratings"}>
          {!current ? <EmptyState icon={ClipboardList} title="Choose a student" text="Pick a student on the left to fill in this month’s ratings." /> : report.error ? <ErrorState error={report.error} onRetry={report.reload} /> : report.loading && current.report_id ? <Loading rows={6} /> : current.report_id && !report.data ? <EmptyState title="Report unavailable" text="Reload the student list before editing this report." /> : (
            <TeacherRatingsForm key={`${studentId}:${period}:${report.data?.version || "new"}`} current={current} report={report.data} period={period} can={can} onBusyChange={setBusy} onDirtyChange={setDirty} onSaved={() => { setDirty(false); students.reload(); report.reload(); }} />
          )}
        </Card>
      </div>
      <Modal open={!!pendingSelection} title="Leave unsaved changes?" size="sm" onClose={() => setPendingSelection(null)}
        footer={<><button type="button" className="btn btn-outline btn-sm" onClick={() => setPendingSelection(null)}>Keep editing</button><button type="button" className="btn btn-danger btn-sm" onClick={() => { const next = pendingSelection; setPendingSelection(null); setDirty(false); if (next?.student !== undefined) setStudentId(next.student); if (next?.month !== undefined) setMonth(next.month); }}>Discard changes</button></>}>
        <p className="text-sm text-ink-soft">This report has changes that have not been saved. Keep editing and save a draft, or discard them before changing the student or month.</p>
      </Modal>
    </>
  );
}

function TeacherRatingsForm({ current, report, period, can, onSaved, onBusyChange, onDirtyChange }) {
  const [ratings, setRatings] = useState(() => report ? Object.fromEntries(CATEGORIES.map((c) => [c.key, report[c.key] || ""])) : emptyRatings());
  const [remarks, setRemarks] = useState(report?.remarks || "");
  const [plan, setPlan] = useState(report?.learning_plan || "");
  const [details, setDetails] = useState(() => detailsForm(report?.details));
  const setDetail = (group, key, value) => setDetails((d) => ({ ...d, [group]: { ...d[group], [key]: value } }));
  const [busy, setBusy] = useState("");
  const [preview, setPreview] = useState(false);
  const dirty = JSON.stringify(details) !== JSON.stringify(detailsForm(report?.details)) || plan !== (report?.learning_plan || "") || remarks !== (report?.remarks || "") || CATEGORIES.some((c) => ratings[c.key] !== (report?.[c.key] || ""));
  useEffect(() => { onDirtyChange(dirty); }, [dirty, onDirtyChange]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const locked = report?.status === "submitted" && !can("progress:review");
  const client = current.clients?.[0];
  const missing = missingForSubmit(ratings, remarks);
  if (!client?.client_id) missing.push("Linked Client ID/name");
  // Quick checks; the database repeats them (progress_details).
  const detailProblem = (() => {
    for (const c of CATEGORIES) {
      const v = details.scores[c.key];
      if (v !== "" && !(/^\d{1,2}(\.5)?$/.test(v) && Number(v) <= SCORE_MAX)) return `Marks for ${c.label} must be 0–${SCORE_MAX}.`;
    }
    const { held, attended } = details.attendance;
    if (held !== "" && !(/^\d{1,2}$/.test(held) && Number(held) <= 62)) return "Classes held must be a whole number from 0 to 62.";
    if (attended !== "" && (held === "" || !/^\d{1,2}$/.test(attended) || Number(attended) > Number(held))) return "Classes attended must be a whole number no more than classes held.";
    return "";
  })();
  const save = async (submit) => {
    if (!current) return toast.error("Choose a student.");
    if (submit && missing.length) return toast.error(`Still needed: ${missing.join(", ")}.`);
    if (detailProblem) return toast.error(detailProblem);
    onBusyChange(true);
    setBusy(submit ? "submit" : "draft");
    try {
      const { error } = await db().rpc("progress_save", { p_student_id: current.student_id, p_period: period, p_ratings: ratings, p_remarks: remarks, p_submit: submit, p_plan: plan, p_details: details });
      if (error) throw error;
      toast.success(submit ? "Submitted to Results → Monthly reports for admin review." : "Draft saved");
      onSaved();
    } catch (error) {
      // Retain the teacher's work for a retry, including network failures.
      toast.error(errorMessage(error));
    } finally {
      setBusy("");
      onBusyChange(false);
    }
  };

  return (
            <form aria-label="Teacher monthly progress" onSubmit={(e) => { e.preventDefault(); save(true); }}>
              {report?.status === "changes_requested" && report.change_note && (
                <p className="mb-4 rounded-xl bg-gold-50 px-4 py-3 text-sm text-gold-700"><b>Changes requested by the admin:</b> {report.change_note}</p>
              )}
              {locked && <p className="mb-4 flex items-center gap-2 rounded-xl bg-leaf-50 px-4 py-3 text-sm text-leaf-800"><CheckCircle2 className="size-4" /> Submitted and waiting for the admin’s review. It can be edited again if changes are requested.</p>}
              {report?.published && <p className="mb-4 rounded-xl bg-paper px-4 py-3 text-sm text-ink-soft">Parents keep seeing the last published certificate until the admin approves and publishes a revision.</p>}
              <div className="mb-4"><ClientIdentity clientId={client?.client_id} clientName={client?.client_name} /></div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-paper px-4 py-3">
                <p className="text-sm font-semibold text-ink-soft" role="status">{dirty ? "Unsaved changes" : report ? "Saved report loaded" : "New report — not saved"}</p>
                <button type="button" aria-expanded={preview} aria-controls="teacher-certificate-preview" className="btn btn-outline btn-sm" onClick={() => setPreview((v) => !v)}>{preview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}{preview ? "Hide preview" : "Preview e-DMC, certificate & syllabus"}</button>
              </div>
              <fieldset disabled={locked || !!busy} className="space-y-3">
                <legend className="sr-only">Monthly ratings</legend>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-mushaf-900">Monthly ratings</p>
                  <p className="text-xs font-semibold text-ink-faint" aria-live="polite">{7 - missingForSubmit(ratings, remarks).length} of 7 done</p>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true"><div className="h-full rounded-full bg-leaf-600 transition-all" style={{ width: `${((7 - missingForSubmit(ratings, remarks).length) / 7) * 100}%` }} /></div>
                {CATEGORIES.map((c) => (
                  <RatingPicker key={c.key} name={`rating-${c.key}`} label={c.label} hint={c.hint} value={ratings[c.key]} onChange={(v) => setRatings((r) => ({ ...r, [c.key]: v }))} disabled={locked || !!busy} />
                ))}
                <Field label="Teacher remarks" required hint={`${remarks.length}/1000 · plain text that parents will read`}>
                  <textarea className="adm-input" rows={4} maxLength={1000} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="For example: Improving in recitation. Practise duas daily at home." />
                </Field>
                <section className="rounded-2xl border border-line bg-paper/60 p-4" aria-labelledby="marks-heading">
                  <h3 id="marks-heading" className="text-sm font-bold text-mushaf-900">Marks for the e-DMC <span className="font-normal text-ink-faint">(optional, out of {SCORE_MAX})</span></h3>
                  <p className="text-xs text-ink-faint">Give marks for every area to show a grand total and percentage on the e-DMC. Half marks (e.g. 8.5) are allowed.</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {CATEGORIES.map((c) => (
                      <Field key={c.key} label={c.label}><input inputMode="decimal" className="adm-input" placeholder={`0–${SCORE_MAX}`} value={details.scores[c.key]} onChange={(e) => setDetail("scores", c.key, e.target.value.trim())} /></Field>
                    ))}
                  </div>
                </section>
                <section className="rounded-2xl border border-line bg-paper/60 p-4" aria-labelledby="attendance-heading">
                  <h3 id="attendance-heading" className="text-sm font-bold text-mushaf-900">Attendance this month</h3>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Field label="Classes held"><input inputMode="numeric" className="adm-input" placeholder="e.g. 12" value={details.attendance.held} onChange={(e) => setDetail("attendance", "held", e.target.value.trim())} /></Field>
                    <Field label="Classes attended"><input inputMode="numeric" className="adm-input" placeholder="e.g. 11" value={details.attendance.attended} onChange={(e) => setDetail("attendance", "attended", e.target.value.trim())} /></Field>
                  </div>
                </section>
                <section className="rounded-2xl border border-line bg-paper/60 p-4" aria-labelledby="syllabus-heading">
                  <h3 id="syllabus-heading" className="text-sm font-bold text-mushaf-900">Syllabus</h3>
                  <div className="mt-3 grid gap-3">
                    <Field label="Current level" hint={`${details.syllabus.level.length}/120`}><input className="adm-input" maxLength={120} value={details.syllabus.level} onChange={(e) => setDetail("syllabus", "level", e.target.value)} placeholder="e.g. Noorani Qaida lesson 12 / Juz 2, page 30" /></Field>
                    <Field label="Covered this month" hint={`${details.syllabus.covered.length}/1000`}><textarea className="adm-input" rows={3} maxLength={1000} value={details.syllabus.covered} onChange={(e) => setDetail("syllabus", "covered", e.target.value)} placeholder="Lessons, surahs, tajweed rules and duas covered" /></Field>
                    <Field label="Memorised" hint={`${details.syllabus.memorised.length}/600`}><textarea className="adm-input" rows={2} maxLength={600} value={details.syllabus.memorised} onChange={(e) => setDetail("syllabus", "memorised", e.target.value)} placeholder="Surahs or duas learnt by heart this month" /></Field>
                  </div>
                </section>
                <Field label="Next month target & home practice" hint={`${plan.length}/2000 · shown to parents only after admin publication`}><textarea className="adm-input" rows={4} maxLength={2000} value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="Teacher-assigned next steps, lesson focus and manageable home practice" /></Field>
                {detailProblem && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-800">{detailProblem}</p>}
              </fieldset>
              {!locked && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <button type="button" className="btn btn-outline" disabled={!!busy} onClick={() => save(false)}>{busy === "draft" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save draft</button>
                  <button type="submit" className="btn btn-primary" disabled={!!busy}>{busy === "submit" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Submit for review</button>
                </div>
              )}
              {preview && <section id="teacher-certificate-preview" className="mt-6" aria-label="Draft certificate preview">
                <p className="mb-3 rounded-xl bg-gold-50 px-4 py-3 text-sm text-gold-700">Preview only. These changes reach parents after the report is submitted, reviewed and published by the admin.</p>
                {(() => {
                  const draft = { ...report, ...ratings, remarks, learning_plan: plan, period, published_at: null, details: previewDetails(details) };
                  return <div className="space-y-6">
                    <ProgressDmc report={draft} studentName={current.full_name} clientId={client?.client_id} clientName={client?.client_name} stamp="Draft preview" />
                    <ProgressCertificate report={draft} studentName={current.full_name} studentCode={current.student_code} clientId={client?.client_id} clientName={client?.client_name} stamp="Draft preview" />
                    <SyllabusCard report={draft} studentName={current.full_name} />
                  </div>;
                })()}
              </section>}
              {can("progress:read") && current.report_id && <p className="mt-4 text-sm"><Link className="font-semibold text-leaf-700 underline" href={`/admin/progress/${current.report_id}`} onClick={(e) => { if (dirty) { e.preventDefault(); toast.error("Save a draft before opening the review page."); } }}>Open the review page</Link></p>}
            </form>
  );
}

// Form strings → the shape the published report uses, for the on-screen preview only.
function previewDetails(d) {
  const scores = Object.fromEntries(Object.entries(d.scores).filter(([, v]) => v !== "" && Number.isFinite(Number(v))).map(([k, v]) => [k, Number(v)]));
  const attendance = d.attendance.held !== "" ? { held: Number(d.attendance.held), attended: d.attendance.attended === "" ? undefined : Number(d.attendance.attended) } : undefined;
  const syllabus = Object.fromEntries(Object.entries(d.syllabus).filter(([, v]) => v.trim()).map(([k, v]) => [k, v.trim()]));
  return { scores, attendance, syllabus };
}

export default function TeacherFormPage() {
  return <Suspense fallback={<Loading />}><TeacherForm /></Suspense>;
}
