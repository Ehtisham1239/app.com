"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Loader2, SearchCheck, Upload } from "lucide-react";
import { useAccess } from "@/lib/admin/access";
import { db, downloadCsv, errorMessage } from "@/lib/admin/db";
import { readSheet, MAX_ROWS } from "@/lib/results/import";
import { CLIENT_COLUMNS, clientRowIssues, clientTemplateRows, mapClientRows, toClientPayload } from "@/lib/results/clients-import";
import { ResultsNav } from "@/components/admin/results-nav";
import { BulkCodes } from "@/components/admin/parent-codes";
import { Card, EmptyState, Field, Loading, PageHeader, Pagination } from "@/components/admin/ui";

const PREVIEW_PAGE = 100;

export default function BulkParentsPage() {
  const { can } = useAccess();
  const [rows, setRows] = useState(null);
  const [fileError, setFileError] = useState("");
  const [reading, setReading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [check, setCheck] = useState(null);
  const [saved, setSaved] = useState(null);
  const [page, setPage] = useState(0);
  const readId = useRef(0);

  const choose = async (file) => {
    const id = ++readId.current;
    setRows(null); setCheck(null); setSaved(null); setFileError(""); setPage(0);
    if (!file) { setReading(false); return; }
    setReading(true);
    try { const mapped = mapClientRows((await readSheet(file)).table); if (id === readId.current) setRows(mapped); }
    catch (e) { if (id === readId.current) setFileError(e.message || "The file could not be read."); }
    finally { if (id === readId.current) setReading(false); }
  };
  const run = async (commit) => {
    if (busy || reading || !rows?.length) return;
    setBusy(true);
    const { data, error } = await db().rpc("guardians_bulk_import", { p_rows: toClientPayload(rows), p_commit: commit });
    setBusy(false);
    if (error) return toast.error(errorMessage(error));
    setCheck(data);
    if (commit && data.committed) { setSaved(data); toast.success("Parents saved"); }
    else if (!data.ok) toast.error("Some rows need fixing. Nothing was saved.");
    else if (!commit) toast.success("All rows are ready to save.");
  };

  if (!can("guardians:create")) return <><PageHeader title="Bulk upload parents" back={{ href: "/admin/results/parents", label: "Parent access" }} /><EmptyState title="You cannot add parents" text="Ask an administrator for the parents permission." /></>;

  const server = Object.fromEntries((check?.rows || []).map((r) => [r.row, r]));
  const local = (rows || []).map((r) => ({ ...r, issues: clientRowIssues(r) }));
  const localProblems = local.filter((r) => r.issues.length).length;
  const s = check?.summary;

  return (
    <>
      <PageHeader title="Bulk upload parents" subtitle="Add or update many parents (clients) from a CSV or Excel sheet and link their children in one go."
        back={{ href: "/admin/results/parents", label: "Parent access" }}
        actions={<button type="button" className="btn btn-outline btn-sm" onClick={() => downloadCsv("parents-template.csv", clientTemplateRows(), CLIENT_COLUMNS.map((c) => ({ key: c.key, label: c.label })))}><Download className="size-4" /> Download template</button>} />
      <ResultsNav />

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <Card title="1 · Choose the file">
          <Field label="Parents file" required hint={`.csv or .xlsx, up to 2 MB and ${MAX_ROWS.toLocaleString()} rows.`}>
            <input type="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="adm-input file:mr-3 file:rounded-full file:border-0 file:bg-leaf-50 file:px-3 file:py-1 file:font-semibold file:text-leaf-800" onChange={(e) => choose(e.target.files?.[0] ?? null)} />
          </Field>
          <ul className="mt-4 space-y-1.5 text-xs text-ink-faint">
            <li><b>One row per child.</b> A parent with two children has two rows with the same Client ID.</li>
            <li>Required: <b>client_id</b>, <b>parent_name</b>. Optional: relationship, email, phone.</li>
            <li>Child: put an existing <b>student_code</b>, or a <b>student_name</b> to add a new student.</li>
            <li>An existing Client ID updates that parent; nothing is deleted.</li>
            <li>Never put access codes in the sheet — the system issues them.</li>
          </ul>
        </Card>

        <Card title="2 · Check and save" actions={rows && <span className="text-sm text-ink-soft">{rows.length} rows{localProblems ? ` · ${localProblems} flagged` : ""}</span>} bodyClass="">
          {reading ? <Loading rows={4} /> : fileError ? (
            <div className="flex items-start gap-3 p-5 text-sm text-rose-700"><AlertTriangle className="mt-0.5 size-5 shrink-0" /><p>{fileError}</p></div>
          ) : !rows ? (
            <EmptyState icon={FileSpreadsheet} title="No file chosen" text="Download the template, fill it in, then choose the file here." />
          ) : (
            <>
              {s && (
                <div className={`grid grid-cols-2 gap-3 border-b border-line p-4 sm:grid-cols-4 ${saved ? "bg-leaf-50" : ""}`}>
                  {[["New parents", s.parents_new], ["Updated parents", s.parents_updated], ["New students", s.students_new], ["Children linked", s.links_new]].map(([l, v]) => (
                    <div key={l}><p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{l}</p><p className="font-display text-2xl text-mushaf-900">{v}</p></div>
                  ))}
                </div>
              )}
              <div className="max-h-[28rem] overflow-auto">
                <table className="adm-table">
                  <thead className="sticky top-0 bg-white"><tr><th>Row</th><th>Client ID</th><th>Parent</th><th>Child</th><th>Check</th></tr></thead>
                  <tbody>
                    {local.slice(page * PREVIEW_PAGE, (page + 1) * PREVIEW_PAGE).map((r) => {
                      const sv = server[r.row_number];
                      const problems = sv ? sv.errors : r.issues;
                      return (
                        <tr key={r.row_number} className={problems.length ? "bg-rose-50/60" : undefined}>
                          <td className="text-ink-faint">{r.row_number}</td>
                          <td className="font-mono text-xs">{r.client_id || "—"}</td>
                          <td><p className="font-semibold text-mushaf-900">{r.parent_name || "—"}</p><p className="text-xs text-ink-faint">{[r.relationship, r.email, r.phone].filter(Boolean).join(" · ")}</p></td>
                          <td>{r.student_code ? <span className="font-mono text-xs">{r.student_code}</span> : r.student_name || <span className="text-ink-faint">—</span>}{sv?.student_code && !r.student_code && <span className="block font-mono text-xs text-leaf-700">{sv.student_code}</span>}</td>
                          <td className="text-xs">{problems.length ? <span className="text-rose-700">{problems.join("; ")}</span> : sv ? <span className="inline-flex items-center gap-1 text-leaf-700"><CheckCircle2 className="size-4" />{sv.action || "OK"}</span> : <span className="text-ink-faint">Not checked yet</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} pageSize={PREVIEW_PAGE} count={rows.length} onPage={setPage} />
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
                {saved ? (
                  <>
                    <p className="text-sm text-leaf-800"><b>Saved.</b> {saved.guardian_ids.length} parents are ready. Issue their access codes now or later from Parent access.</p>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/admin/results/parents" className="btn btn-ghost btn-sm">Go to Parent access</Link>
                      {can("guardians:update") && <BulkCodes guardianIds={saved.guardian_ids} label={`Issue codes for these ${saved.guardian_ids.length} parents`} className="btn btn-primary btn-sm" />}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="max-w-xl text-sm text-ink-soft">{check && !check.ok ? "Fix the red rows in your file and choose it again. Nothing has been saved." : "Check first: the system matches Client IDs and student codes. Rows are saved only when every row is valid."}</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="btn btn-outline btn-sm" disabled={busy || localProblems > 0} onClick={() => run(false)}>{busy ? <Loader2 className="size-4 animate-spin" /> : <SearchCheck className="size-4" />} Check file</button>
                      <button type="button" className="btn btn-primary btn-sm" disabled={busy || !check?.ok} onClick={() => run(true)}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Save {rows.length} rows</button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
