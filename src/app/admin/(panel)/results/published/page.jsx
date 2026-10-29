"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Award, GraduationCap, History, Link2, Loader2, Pencil, RotateCcw, ShieldOff } from "lucide-react";
import { useAccess } from "@/lib/admin/access";
import { db, likeTerm, notifyError, useLoad } from "@/lib/admin/db";
import { CERTIFICATE_STATUSES } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/format";
import { gradeLabel } from "@/lib/results/import";
import { RESULT_STATUSES } from "@/lib/results/status";
import { ResultsNav } from "@/components/admin/results-nav";
import { ResultCard } from "@/components/results/result-card";
import { Card, EmptyState, ErrorState, Field, Loading, Modal, PageHeader, Pagination, SearchInput, StatusBadge } from "@/components/admin/ui";

const PAGE = 25;
const SELECT = "id, student_id, marks_obtained, total_marks, percentage, grade, teacher_remarks, status, published_at, certificate_id, version, students!inner(full_name, student_code), assessments(id, title, code, period_label, assessment_date, grade_bands, course_id, courses(title)), certificates(id, number, status)";

function cardData(r) {
  const a = r.assessments || {};
  return { assessment: a.title, course: a.courses?.title, period: a.period_label, date: a.assessment_date, marks: r.marks_obtained, total: r.total_marks, percentage: r.percentage, grade: r.grade, grade_label: gradeLabel(a.grade_bands, r.grade), remarks: r.teacher_remarks, published_at: r.published_at, certificate_id: r.certificates?.status === "issued" ? r.certificate_id : null };
}

function Correct({ result, onDone }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ marks: String(Number(result.marks_obtained)), grade: result.grade, remarks: result.teacher_remarks, reason: "" });
  const [busy, setBusy] = useState(false);
  const bands = result.assessments?.grade_bands || [];
  const save = async () => {
    setBusy(true);
    const { error } = await db().rpc("results_correct", { p_result_id: result.id, p_marks: Number(form.marks), p_grade: form.grade, p_remarks: form.remarks, p_reason: form.reason });
    setBusy(false);
    if (error) return notifyError(error);
    toast.success("Result corrected. The previous version is kept in the history.");
    setOpen(false); onDone();
  };
  return (
    <>
      <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(true)}><Pencil className="size-4" /> Correct</button>
      <Modal open={open} onClose={() => !busy && setOpen(false)} title="Correct a published result"
        footer={<><button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)} disabled={busy}>Cancel</button><button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={busy || form.reason.trim().length < 3}>{busy && <Loader2 className="size-4 animate-spin" />} Save correction</button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={`Marks (out of ${Number(result.total_marks)})`} required><input type="number" min="0" max={Number(result.total_marks)} step="0.01" className="adm-input" value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })} /></Field>
          <Field label="Grade" hint={bands.length ? "Leave blank to use the grade bands" : "This assessment has no grade bands"}>
            {bands.length ? (
              <select className="adm-input" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
                <option value="">Automatic</option>
                {bands.map((b) => <option key={b.grade} value={b.grade}>{b.grade}{b.label ? ` — ${b.label}` : ""}</option>)}
              </select>
            ) : <input className="adm-input" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} maxLength={20} />}
          </Field>
          <Field label="Teacher’s remarks" className="sm:col-span-2"><textarea className="adm-input" rows={3} maxLength={1000} value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></Field>
          <Field label="Reason for the correction" required className="sm:col-span-2" hint="Recorded in the result’s history"><input className="adm-input" maxLength={500} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></Field>
        </div>
      </Modal>
    </>
  );
}

function Withdraw({ result, onDone }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const withdrawing = result.status === "published";
  const save = async () => {
    setBusy(true);
    const { error } = await db().rpc("results_set_withdrawn", { p_result_id: result.id, p_withdrawn: withdrawing, p_reason: reason });
    setBusy(false);
    if (error) return notifyError(error);
    toast.success(withdrawing ? "Result withdrawn from the parent portal" : "Result restored to the parent portal");
    setOpen(false); onDone();
  };
  return (
    <>
      <button type="button" className={`btn btn-sm ${withdrawing ? "btn-ghost text-rose-700" : "btn-outline"}`} onClick={() => setOpen(true)}>{withdrawing ? <><ShieldOff className="size-4" /> Withdraw</> : <><RotateCcw className="size-4" /> Restore</>}</button>
      <Modal open={open} onClose={() => !busy && setOpen(false)} title={withdrawing ? "Withdraw this result?" : "Restore this result?"} size="sm"
        footer={<><button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)} disabled={busy}>Cancel</button><button type="button" className={`btn btn-sm ${withdrawing ? "btn-danger" : "btn-primary"}`} onClick={save} disabled={busy || reason.trim().length < 3}>{withdrawing ? "Withdraw" : "Restore"}</button></>}>
        <p className="mb-3 text-sm text-ink-soft">{withdrawing ? "Parents will no longer see this result." : "Parents will see this result again."}</p>
        <Field label="Reason" required><input className="adm-input" maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
      </Modal>
    </>
  );
}

function CertificatePanel({ result, onDone }) {
  const { can } = useAccess();
  const router = useRouter();
  const existing = useLoad(() => db().from("certificates").select("id, number, title, status, issued_on").eq("student_id", result.student_id).order("created_at", { ascending: false }), [result.student_id]);
  const [busy, setBusy] = useState(false);
  const allowed = can("results:update") && can("certificates:update");
  const link = async (certificateId) => {
    setBusy(true);
    const { error } = await db().rpc("results_link_certificate", { p_result_id: result.id, p_certificate_id: certificateId });
    setBusy(false);
    if (error) return notifyError(error);
    toast.success(certificateId ? "Certificate linked" : "Certificate unlinked");
    onDone();
  };
  const createDraft = async () => {
    const a = result.assessments || {};
    setBusy(true);
    const { data, error } = await db().from("certificates").insert({
      student_id: result.student_id, course_id: a.course_id || null, title: "Certificate of Achievement",
      achievement: `for successfully completing ${a.title}${a.period_label ? ` (${a.period_label})` : ""}${result.grade ? ` with grade ${result.grade}` : ""}.`,
      issued_on: new Date().toISOString().slice(0, 10), status: "draft",
    }).select("id").single();
    if (error) { setBusy(false); return notifyError(error); }
    const linked = await db().rpc("results_link_certificate", { p_result_id: result.id, p_certificate_id: data.id });
    setBusy(false);
    if (linked.error) return notifyError(linked.error);
    toast.success("Draft certificate created. Check it and issue it from the certificate page.");
    router.push(`/admin/certificates/${data.id}`);
  };
  const linked = result.certificates;
  return (
    <div className="rounded-xl border border-line p-4">
      <p className="flex items-center gap-2 font-bold text-mushaf-900"><Award className="size-4 text-gold-600" /> Certificate</p>
      {linked ? (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span><Link href={`/admin/certificates/${linked.id}`} className="font-semibold text-leaf-700 hover:underline">{linked.number}</Link> <StatusBadge list={CERTIFICATE_STATUSES} value={linked.status} /></span>
          {allowed && <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => link(null)}>Unlink</button>}
        </div>
      ) : (
        <div className="mt-2 space-y-2 text-sm">
          <p className="text-ink-soft">Parents see a certificate only after it is issued. Certificates are never issued automatically.</p>
          {allowed && can("certificates:create") && <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={createDraft}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Award className="size-4" />} Create draft certificate</button>}
          {allowed && (existing.data || []).filter((c) => c.status !== "revoked").length > 0 && (
            <label className="flex flex-wrap items-center gap-2"><Link2 className="size-4 text-ink-faint" /> Or link an existing one:
              <select className="adm-input w-auto" defaultValue="" onChange={(e) => e.target.value && link(e.target.value)} disabled={busy}>
                <option value="">— Choose —</option>
                {existing.data.filter((c) => c.status !== "revoked").map((c) => <option key={c.id} value={c.id}>{c.number} · {c.title} ({c.status})</option>)}
              </select>
            </label>
          )}
        </div>
      )}
    </div>
  );
}

function ResultDetail({ id, onClose, onChanged }) {
  const { can } = useAccess();
  const result = useLoad(() => db().from("student_results").select(SELECT).eq("id", id).maybeSingle(), [id]);
  const history = useLoad(() => db().from("student_result_history").select("id, version, snapshot, reason, changed_at").eq("result_id", id).order("version", { ascending: false }), [id]);
  const r = result.data;
  const refresh = () => { result.reload(); history.reload(); onChanged(); };
  return (
    <Modal open onClose={onClose} title={r ? `${r.students?.full_name} · ${r.assessments?.title}` : "Result"} size="xl">
      {result.loading && !r ? <Loading /> : result.error ? <ErrorState error={result.error} onRetry={result.reload} /> : !r ? <p>Result not found.</p> : (
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div>
            {r.status === "withdrawn" && <p className="mb-3 rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800">Withdrawn — parents cannot see this result.</p>}
            <ResultCard preview studentName={r.students?.full_name} result={cardData(r)} />
          </div>
          <div className="space-y-4">
            {can("results:update") && <div className="flex flex-wrap gap-2"><Correct result={r} onDone={refresh} /><Withdraw result={r} onDone={refresh} /></div>}
            <CertificatePanel result={r} onDone={refresh} />
            <div className="rounded-xl border border-line p-4">
              <p className="flex items-center gap-2 font-bold text-mushaf-900"><History className="size-4 text-ink-faint" /> History</p>
              {!history.data?.length ? <p className="mt-2 text-sm text-ink-soft">No changes since publication (version {r.version}).</p> : (
                <ol className="mt-2 space-y-2 text-sm">
                  {history.data.map((h) => (
                    <li key={h.id} className="rounded-lg bg-paper px-3 py-2">
                      <p className="font-semibold text-ink">Version {h.version}: {Number(h.snapshot?.marks_obtained)} marks{h.snapshot?.grade ? `, grade ${h.snapshot.grade}` : ""}{h.snapshot?.status === "withdrawn" ? ", withdrawn" : ""}</p>
                      <p className="text-ink-soft">Changed {formatDateTime(h.changed_at)} — {h.reason}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function PublishedResults() {
  const params = useSearchParams();
  const router = useRouter();
  const [assessment, setAssessment] = useState(params.get("assessment") || "");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const openId = params.get("result");
  const assessments = useLoad(() => db().from("assessments").select("id, title, code").order("assessment_date", { ascending: false }).limit(200), []);
  const list = useLoad(() => {
    let query = db().from("student_results").select(SELECT, { count: "exact" });
    if (assessment) query = query.eq("assessment_id", assessment);
    if (q) query = query.or(`full_name.ilike.${likeTerm(q)},student_code.ilike.${likeTerm(q)}`, { referencedTable: "students" });
    return query.order("published_at", { ascending: false }).range(page * PAGE, page * PAGE + PAGE - 1);
  }, [assessment, q, page]);
  const open = (id) => router.replace(id ? `/admin/results/published?result=${id}${assessment ? `&assessment=${assessment}` : ""}` : `/admin/results/published${assessment ? `?assessment=${assessment}` : ""}`, { scroll: false });

  return (
    <>
      <PageHeader title="Published results" subtitle="What parents can see. Correct or withdraw a result with a reason, and link it to a certificate." back={{ href: "/admin/results", label: "Results" }} />
      <ResultsNav />
      <div className="mb-4 flex flex-wrap justify-end gap-3">
        <select className="adm-input w-full sm:w-72" value={assessment} onChange={(e) => { setAssessment(e.target.value); setPage(0); }} aria-label="Assessment">
          <option value="">All assessments</option>
          {(assessments.data || []).map((a) => <option key={a.id} value={a.id}>{a.title} ({a.code})</option>)}
        </select>
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(0); }} placeholder="Student name or code…" className="w-full sm:w-72" />
      </div>
      <Card bodyClass="">
        {list.loading ? <Loading /> : list.error ? <ErrorState error={list.error} onRetry={list.reload} /> : !list.data?.length ? (
          <EmptyState icon={GraduationCap} title="No published results" text="Results appear here after an upload is approved and published." />
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table">
              <thead><tr><th>Student</th><th>Assessment</th><th>Marks</th><th>%</th><th>Grade</th><th>Certificate</th><th>Status</th></tr></thead>
              <tbody>
                {list.data.map((r) => (
                  <tr key={r.id} className="row-link" onClick={() => open(r.id)}>
                    <td><button type="button" className="text-left font-semibold text-mushaf-900 hover:text-leaf-700" onClick={(e) => { e.stopPropagation(); open(r.id); }}>{r.students?.full_name}</button><p className="font-mono text-xs text-ink-faint">{r.students?.student_code}</p></td>
                    <td className="text-ink-soft">{r.assessments?.title}<p className="text-xs text-ink-faint">{formatDate(r.assessments?.assessment_date)}</p></td>
                    <td>{Number(r.marks_obtained)} / {Number(r.total_marks)}</td>
                    <td>{Number(r.percentage)}%</td>
                    <td className="font-semibold">{r.grade || "—"}</td>
                    <td>{r.certificates ? <StatusBadge list={CERTIFICATE_STATUSES} value={r.certificates.status} /> : <span className="text-ink-faint">—</span>}</td>
                    <td><StatusBadge list={RESULT_STATUSES} value={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pageSize={PAGE} count={list.count} onPage={setPage} />
      </Card>
      {openId && <ResultDetail key={openId} id={openId} onClose={() => open(null)} onChanged={list.reload} />}
    </>
  );
}

export default function PublishedResultsPage() {
  return <Suspense fallback={<Loading />}><PublishedResults /></Suspense>;
}
