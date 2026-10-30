"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { useAccess } from "@/lib/admin/access";
import { db, downloadCsv, errorMessage, useLoad } from "@/lib/admin/db";
import { previewIssues, readResultsFile, templateRows, TEMPLATE_COLUMNS, toImportRows, MAX_ROWS } from "@/lib/results/import";
import { ResultsNav } from "@/components/admin/results-nav";
import { Card, EmptyState, Field, Loading, PageHeader } from "@/components/admin/ui";

const CHUNK = 500;

export default function ImportResultsPage() {
  const router = useRouter();
  const { can } = useAccess();
  const assessments = useLoad(() => db().from("assessments").select("id, code, title, total_marks, grade_bands, period_label").eq("status", "active").order("assessment_date", { ascending: false }), []);
  const [assessmentId, setAssessmentId] = useState("");
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [fileError, setFileError] = useState("");
  const [reading, setReading] = useState(false);
  const [busy, setBusy] = useState(false);
  const assessment = (assessments.data || []).find((a) => a.id === assessmentId) ?? null;

  const choose = async (picked) => {
    setFile(picked); setParsed(null); setFileError("");
    if (!picked) return;
    setReading(true);
    try { setParsed(await readResultsFile(picked)); } catch (e) { setFileError(e.message || "The file could not be read."); }
    setReading(false);
  };

  const rows = parsed?.rows ?? [];
  const withIssues = rows.map((r) => ({ ...r, issues: previewIssues(r, assessment) }));
  const flagged = withIssues.filter((r) => r.issues.length).length;
  const wrongAssessment = assessment && rows.some((r) => r.assessment_code && r.assessment_code.toUpperCase() !== assessment.code);

  const upload = async () => {
    if (!assessment || !parsed) return;
    setBusy(true);
    let batchId = null;
    try {
      const { data: batch, error } = await db().from("result_import_batches").insert({ assessment_id: assessment.id, original_filename: parsed.name, file_sha256: parsed.sha256 }).select("id").single();
      if (error) throw error.code === "23505" ? new Error("This exact file was already uploaded for this assessment. Open it from Recent uploads.") : error;
      batchId = batch.id;
      const payload = toImportRows(parsed.rows, batchId);
      for (let i = 0; i < payload.length; i += CHUNK) {
        const { error: rowError } = await db().from("result_import_rows").insert(payload.slice(i, i + CHUNK));
        if (rowError) throw rowError;
      }
      const { error: checkError } = await db().rpc("results_validate_batch", { p_batch_id: batchId });
      if (checkError) throw checkError;
      toast.success("Uploaded. Review the checked rows next.");
      router.push(`/admin/results/batches/${batchId}`);
    } catch (e) {
      // A half-written upload must not stay open for approval.
      if (batchId) await db().rpc("results_cancel_batch", { p_batch_id: batchId });
      toast.error(errorMessage(e));
      setBusy(false);
    }
  };

  if (!can("results:create") && !can("certificates:create")) return <><PageHeader title="Upload results" back={{ href: "/admin/results", label: "Results" }} /><EmptyState title="You cannot upload results" text="Ask an administrator for the results upload permission." /></>;

  return (
    <>
      <PageHeader title="Upload results" subtitle="CSV or Excel (.xlsx). Nothing is shown to parents until the upload is reviewed, approved and published." back={{ href: "/admin/results", label: "Results" }}
        actions={<button type="button" className="btn btn-outline btn-sm" onClick={() => downloadCsv(`results-template${assessment ? `-${assessment.code}` : ""}.csv`, templateRows(assessment), TEMPLATE_COLUMNS.map((c) => ({ key: c.key, label: c.label })))}><Download className="size-4" /> Download template</button>} />
      <ResultsNav />

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <Card title="1 · Choose the assessment and file">
          {assessments.loading ? <Loading rows={2} /> : !assessments.data?.length ? (
            <p className="text-sm text-ink-soft">No assessment is open for results. <Link href="/admin/results" className="font-semibold text-leaf-700 underline">Create one and set it to “Open for results”</Link>.</p>
          ) : (
            <div className="space-y-4">
              <Field label="Assessment" required>
                <select className="adm-input" value={assessmentId} onChange={(e) => setAssessmentId(e.target.value)}>
                  <option value="">— Choose —</option>
                  {assessments.data.map((a) => <option key={a.id} value={a.id}>{a.title} ({a.code})</option>)}
                </select>
              </Field>
              {assessment && <p className="rounded-xl bg-paper px-3 py-2 text-sm text-ink-soft">Maximum marks <b className="text-ink">{Number(assessment.total_marks)}</b> · {assessment.grade_bands?.length ? `Grades ${assessment.grade_bands.map((b) => `${b.grade} ≥ ${b.min_percent}%`).join(", ")}` : "Marks only (no grade bands)"}</p>}
              <Field label="Results file" required hint={`.csv or .xlsx, up to 2 MB and ${MAX_ROWS.toLocaleString()} rows. First row = column names.`}>
                <input type="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="adm-input file:mr-3 file:rounded-full file:border-0 file:bg-leaf-50 file:px-3 file:py-1 file:font-semibold file:text-leaf-800" onChange={(e) => choose(e.target.files?.[0] ?? null)} />
              </Field>
              <ul className="space-y-1 text-xs text-ink-faint">
                <li>Required columns: <b>student_code</b>, <b>marks_obtained</b>.</li>
                <li>Optional: assessment_code, student_name, total_marks, grade, teacher_remarks.</li>
                <li>Never put parent Client Codes in a results sheet.</li>
              </ul>
            </div>
          )}
        </Card>

        <Card title="2 · Preview" actions={parsed && <span className="text-sm text-ink-soft">{rows.length} rows · {flagged} flagged</span>} bodyClass="">
          {reading ? <Loading rows={4} /> : fileError ? (
            <div className="flex items-start gap-3 p-5 text-sm text-rose-700"><AlertTriangle className="mt-0.5 size-5 shrink-0" /> <p>{fileError}</p></div>
          ) : !parsed ? (
            <EmptyState icon={FileSpreadsheet} title="No file chosen" text="Choose an assessment and a file to preview the rows before anything is saved." />
          ) : (
            <>
              <div className="max-h-[28rem] overflow-auto">
                <table className="adm-table">
                  <thead className="sticky top-0 bg-white"><tr><th>Row</th><th>Student code</th><th>Name</th><th>Marks</th><th>Grade</th><th>Remarks</th><th>Check</th></tr></thead>
                  <tbody>
                    {withIssues.slice(0, 500).map((r) => (
                      <tr key={r.row_number} className={r.issues.length ? "bg-rose-50/60" : undefined}>
                        <td className="text-ink-faint">{r.row_number}</td>
                        <td className="font-mono text-xs">{r.student_code || "—"}</td>
                        <td>{r.student_name || <span className="text-ink-faint">—</span>}</td>
                        <td>{r.marks_obtained || "—"}</td>
                        <td>{r.grade || <span className="text-ink-faint">auto</span>}</td>
                        <td className="max-w-[16rem] truncate text-ink-soft" title={r.teacher_remarks}>{r.teacher_remarks}</td>
                        <td className="text-xs">{r.issues.length ? <span className="text-rose-700">{r.issues.join("; ")}</span> : <CheckCircle2 className="size-4 text-leaf-700" aria-label="No problem found" />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 500 && <p className="px-5 py-3 text-sm text-ink-soft">Showing the first 500 rows. All {rows.length} rows are uploaded and checked.</p>}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
                <p className="max-w-xl text-sm text-ink-soft">
                  {wrongAssessment ? <span className="font-semibold text-rose-700">Some rows name a different assessment code. Choose the right assessment or fix the file.</span>
                    : !assessment ? "Choose the assessment first."
                    : "Uploading saves these rows for review only. The system then checks student codes, names, duplicates and existing results. Flagged rows can be fixed in the file or excluded."}
                </p>
                <button type="button" className="btn btn-primary btn-sm" disabled={!assessment || busy || wrongAssessment} onClick={upload}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload for review
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
      {file && <p className="sr-only" aria-live="polite">{parsed ? `${rows.length} rows read from ${file.name}` : ""}</p>}
    </>
  );
}
