"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { useAccess } from "@/lib/admin/access";
import { db, downloadCsv, useLoad } from "@/lib/admin/db";
import { parseCsv } from "@/lib/results/import";
import { monthInput, monthToPeriod, periodLabel } from "@/lib/progress/constants";
import { PROGRESS_BULK_COLUMNS, normalizeProgressBulkHeader, progressBulkTemplateRows, progressBulkPayload, validateProgressBulkRows } from "@/lib/progress/bulk";
import { ResultsNav } from "@/components/admin/results-nav";
import { Card, EmptyState, ErrorState, Field, Loading, PageHeader } from "@/components/admin/ui";

const MAX_BYTES = 2 * 1024 * 1024;
export default function ProgressBulkPage() {
  const { can } = useAccess();
  const [month, setMonth] = useState(monthInput());
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const period = monthToPeriod(month);
  const roster = useLoad(() => period ? db().rpc("progress_my_students", { p_period: period }) : { data: [] }, [period]);
  const students = useMemo(() => roster.data || [], [roster.data]);

  const read = async (file) => {
    setParsed(null); setError("");
    if (!file) return;
    if (file.size > MAX_BYTES) return setError("File is larger than 2 MB. Split it into smaller CSV files.");
    try {
      const raw = parseCsv(await file.text());
      if (raw.length < 2) throw new Error("Add at least one student row below the header.");
      if (raw.length > 2001) throw new Error("A file can contain up to 2,000 student rows.");
      const headers = raw[0].map(normalizeProgressBulkHeader);
      const expected = PROGRESS_BULK_COLUMNS.map((c) => c.key);
      const missing = expected.filter((key) => !headers.includes(key));
      if (missing.length) throw new Error(`Template columns missing: ${missing.slice(0, 8).join(", ")}${missing.length > 8 ? "…" : ""}. Download the current template.`);
      if (new Set(headers).size !== headers.length) throw new Error("The file has duplicate column headings.");
      const rows = raw.slice(1).filter((cells) => cells.some((cell) => String(cell || "").trim())).map((cells) => Object.fromEntries(headers.map((header, index) => [header, String(cells[index] || "").trim()])));
      if (!rows.length) throw new Error("No student rows found.");
      setParsed({ name: file.name, rows });
    } catch (e) { setError(e.message || "Could not read this CSV file."); }
  };

  const checks = useMemo(() => parsed ? validateProgressBulkRows(parsed.rows, students) : [], [parsed, students]);
  const invalid = checks.filter((c) => c.issues.length);
  const allowed = checks.length > 0 && invalid.length === 0 && !roster.loading && !roster.error;

  const upload = async () => {
    if (!allowed || busy || !can("progress:submit")) return;
    setBusy(true);
    const results = [];
    for (let index = 0; index < parsed.rows.length; index++) {
      const checked = checks[index], row = parsed.rows[index];
      const payload = progressBulkPayload(row);
      try {
        const { error: saveError } = await db().rpc("progress_save", {
          p_student_id: checked.student.student_id,
          p_period: period,
          p_ratings: payload.ratings,
          p_remarks: payload.remarks,
          p_submit: false,
          p_plan: payload.plan,
          p_details: payload.details,
        });
        if (saveError) results.push({ code: checked.code, message: saveError.message || "Save failed" });
      } catch (saveError) {
        results.push({ code: checked.code, message: saveError?.message || "Network error" });
      }
    }
    setBusy(false);
    const saved = parsed.rows.length - results.length;
    if (results.length) {
      toast.error(`${saved} drafts saved; ${results.length} rows failed. Review the error list below.`);
      setError(results.map((r) => `${r.code}: ${r.message}`).join("\n"));
    } else {
      toast.success(`${saved} monthly draft reports saved. Nothing was submitted or published.`);
      setParsed(null);
      roster.reload();
    }
  };

  if (!can("progress:submit")) return <><PageHeader title="Bulk monthly reports" back={{ href: "/admin/progress", label: "Monthly reports" }} /><EmptyState title="Teacher permission required" text="This bulk draft uploader is available to teachers with monthly-report submission permission." /></>;

  return (
    <>
      <PageHeader title="Bulk monthly report drafts" subtitle="Upload one teacher's assigned students from a CSV spreadsheet. Every row is validated before saving; uploads create drafts only." back={{ href: "/admin/progress", label: "Monthly reports" }}
        actions={<button type="button" className="btn btn-outline btn-sm" onClick={() => downloadCsv(`oqc-monthly-assessment-template-${month}.csv`, progressBulkTemplateRows(), PROGRESS_BULK_COLUMNS)}><Download className="size-4" /> Download Excel/CSV template</button>} />
      <ResultsNav />
      <div className="grid gap-5 lg:grid-cols-[20rem_1fr]">
        <Card title="1 · Choose month and template">
          <Field label="Reporting month"><input type="month" className="adm-input" value={month} max={monthInput()} onChange={(e) => { setMonth(e.target.value); setParsed(null); setError(""); }} /></Field>
          <p className="mt-3 text-sm text-ink-soft">{periodLabel(period)} · {students.length} assigned students in your roster.</p>
          <button type="button" className="btn btn-outline mt-4 w-full" onClick={() => downloadCsv(`oqc-monthly-assessment-template-${month}.csv`, progressBulkTemplateRows(), PROGRESS_BULK_COLUMNS)}><FileSpreadsheet className="size-4" /> Download blank template</button>
          <div className="mt-4 rounded-xl bg-paper p-3 text-xs text-ink-soft">
            <p className="font-semibold text-ink">Important</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Use the exact student_code from your assigned roster.</li>
              <li>Complete all 11 effort and course-standard selectors.</li>
              <li>One row per student; do not include parent passwords or access codes.</li>
              <li>Upload saves drafts only. Submit each report after checking it individually.</li>
              <li>Rows already submitted or published must be returned by an admin first.</li>
            </ul>
          </div>
        </Card>
        <Card title="2 · Upload and validate">
          {roster.loading ? <Loading rows={2} /> : roster.error ? <ErrorState error={roster.error} onRetry={roster.reload} /> : (
            <>
              <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-paper/50 p-5 text-center hover:border-leaf-600">
                <Upload className="size-7 text-leaf-700" />
                <span className="mt-2 font-semibold text-ink">Choose CSV file</span>
                <span className="mt-1 text-xs text-ink-faint">Excel: Save As → CSV UTF-8 · Maximum 2 MB / 2,000 rows</span>
                <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => read(e.target.files?.[0])} />
              </label>
              {parsed && <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><span className="font-semibold">{parsed.name}</span><span>{parsed.rows.length} rows · {invalid.length} with issues</span></div>
                <div className="max-h-80 overflow-auto rounded-xl border border-line">
                  <table className="w-full text-left text-xs"><thead className="sticky top-0 bg-paper"><tr><th className="p-2">Row</th><th className="p-2">Student</th><th className="p-2">Status</th><th className="p-2">Validation</th></tr></thead><tbody>
                    {checks.map((check) => <tr key={check.rowNumber} className="border-t border-line"><td className="p-2">{check.rowNumber}</td><td className="p-2">{check.student?.full_name || check.code || "—"}<span className="block text-ink-faint">{check.code}</span></td><td className="p-2">{check.student?.status || "New"}</td><td className="p-2">{check.issues.length ? <span className="text-rose-700">{check.issues.join(" ")}</span> : <span className="text-leaf-700">Ready as draft</span>}</td></tr>)}
                  </tbody></table>
                </div>
                <button type="button" className="btn btn-primary" disabled={!allowed || busy} onClick={upload}>{busy && <Loader2 className="size-4 animate-spin" />} Save {parsed.rows.length} draft reports</button>
              </div>}
              {error && <pre role="alert" className="mt-4 max-h-52 overflow-auto whitespace-pre-wrap rounded-xl bg-rose-50 p-3 text-xs text-rose-800">{error}</pre>}
            </>
          )}
        </Card>
      </div>
    </>
  );
}
