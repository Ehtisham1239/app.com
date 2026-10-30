"use client";

import { use, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, EyeOff, History, Loader2, MessageSquareWarning, Pencil, Printer } from "lucide-react";
import { useAccess } from "@/lib/admin/access";
import { db, notifyError, useLoad } from "@/lib/admin/db";
import { formatDateTime } from "@/lib/format";
import { CATEGORIES, REPORT_STATUSES, missingForSubmit, periodLabel, ratingLabel } from "@/lib/progress/constants";
import { ResultsNav } from "@/components/admin/results-nav";
import { RatingPicker } from "@/components/admin/rating-picker";
import { ProgressWorkflow } from "@/components/results/progress-workflow";
import { ProgressCertificate } from "@/components/results/progress-certificate";
import { Card, ConfirmButton, ErrorState, Field, Loading, Modal, PageHeader, StatusBadge } from "@/components/admin/ui";

const ACTIONS = { submitted: "Submitted by teacher", changes_requested: "Changes requested", edited_before: "Edited by admin (previous values)", published: "Published", unpublished: "Taken off the portal" };

function EditReport({ report, onDone }) {
  const [open, setOpen] = useState(false);
  const [ratings, setRatings] = useState(() => Object.fromEntries(CATEGORIES.map((c) => [c.key, report[c.key] || ""])));
  const [remarks, setRemarks] = useState(report.remarks || "");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    const { error } = await db().rpc("progress_admin_update", { p_report_id: report.id, p_ratings: ratings, p_remarks: remarks, p_reason: reason });
    setBusy(false);
    if (error) return notifyError(error);
    toast.success("Changes saved. Publish when you are happy with the certificate.");
    setOpen(false); onDone();
  };
  return (
    <>
      <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(true)}><Pencil className="size-4" /> Edit</button>
      <Modal open={open} onClose={() => !busy && setOpen(false)} title="Edit before publishing" size="lg"
        footer={<><button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)} disabled={busy}>Cancel</button><button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={busy || reason.trim().length < 3}>{busy && <Loader2 className="size-4 animate-spin" />} Save changes</button></>}>
        <div className="grid gap-3 sm:grid-cols-2">
          {CATEGORIES.map((c) => (
            <div key={c.key} className="sm:col-span-2"><RatingPicker name={`edit-${c.key}`} label={c.label} hint={c.hint} value={ratings[c.key]} onChange={(value) => setRatings((r) => ({ ...r, [c.key]: value }))} disabled={busy} /></div>
          ))}
          <Field label="Teacher remarks" className="sm:col-span-2" hint={`${remarks.length}/1000`}><textarea className="adm-input" rows={4} maxLength={1000} value={remarks} onChange={(e) => setRemarks(e.target.value)} /></Field>
          <Field label="Reason for the edit" required className="sm:col-span-2" hint="Kept in the report history"><input className="adm-input" maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Corrected the Tajweed rating after speaking to the teacher" /></Field>
        </div>
      </Modal>
    </>
  );
}

function RequestChanges({ report, onDone }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const send = async () => {
    setBusy(true);
    const { error } = await db().rpc("progress_request_changes", { p_report_id: report.id, p_reason: note });
    setBusy(false);
    if (error) return notifyError(error);
    toast.success("Sent back to the teacher");
    setOpen(false); onDone();
  };
  return (
    <>
      <button type="button" className="btn btn-ghost btn-sm text-gold-700" onClick={() => setOpen(true)}><MessageSquareWarning className="size-4" /> Request changes</button>
      <Modal open={open} onClose={() => !busy && setOpen(false)} title="Ask the teacher for changes" size="sm"
        footer={<><button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)} disabled={busy}>Cancel</button><button type="button" className="btn btn-primary btn-sm" onClick={send} disabled={busy || note.trim().length < 3}>Send back</button></>}>
        <Field label="What should change?" required hint="The teacher sees this note on their form."><textarea className="adm-input" rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      </Modal>
    </>
  );
}

export default function ProgressReportPage({ params }) {
  const { id } = use(params);
  const { can } = useAccess();
  const report = useLoad(() => db().from("monthly_reports").select("*, students(full_name, student_code), profiles!monthly_reports_teacher_profile_id_fkey(full_name)").eq("id", id).maybeSingle(), [id]);
  const history = useLoad(() => db().from("monthly_report_history").select("id, action, snapshot, reason, changed_at").eq("report_id", id).order("changed_at", { ascending: false }), [id]);
  const r = report.data;
  const award = useLoad(() => (r ? db().from("student_of_month").select("period").eq("student_id", r.student_id).eq("period", r.period).maybeSingle() : { data: null }), [r?.student_id, r?.period]);
  const identity = useLoad(() => r ? db().rpc("progress_my_students", { p_period: r.period }).eq("student_id", r.student_id).maybeSingle() : { data: null }, [r?.student_id, r?.period]);
  if (report.loading && !r) return <Loading rows={6} />;
  if (report.error) return <ErrorState error={report.error} onRetry={report.reload} />;
  if (!r) return <PageHeader title="Report not found" back={{ href: "/admin/progress", label: "Monthly progress" }} />;

  const refresh = () => { report.reload(); history.reload(); };
  const run = async (fn, args, ok) => {
    const { error } = await db().rpc(fn, args);
    if (error) return notifyError(error);
    toast.success(ok); refresh();
  };
  const working = { ...r, teacher: r.profiles?.full_name || "", published_at: r.published_at };
  const missing = missingForSubmit(r, r.remarks);
  const canPublish = can("progress:publish") && r.status === "submitted";

  return (
    <>
      <div className="no-print">
        <PageHeader title={`${r.students?.full_name} · ${periodLabel(r.period)}`} back={{ href: "/admin/progress", label: "Monthly progress" }}
          subtitle={`Teacher: ${r.profiles?.full_name || "—"} · last change ${formatDateTime(r.updated_at)}`}
          actions={<>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => window.print()}><Printer className="size-4" /> Print / save PDF</button>
            {can("progress:review") && <EditReport key={r.version} report={r} onDone={refresh} />}
            {can("progress:review") && ["submitted", "draft"].includes(r.status) && <RequestChanges report={r} onDone={refresh} />}
            {can("progress:publish") && r.published && (
              <ConfirmButton title="Take this report off the parent portal?" message="Parents will no longer see it. You can publish it again later." confirmLabel="Unpublish" className="btn btn-ghost btn-sm text-rose-700"
                onConfirm={() => run("progress_unpublish", { p_report_id: r.id, p_reason: "Unpublished by admin" }, "Taken off the parent portal")}><EyeOff className="size-4" /> Unpublish</ConfirmButton>
            )}
            {canPublish && (
              <ConfirmButton danger={false} className="btn btn-primary btn-sm" confirmLabel="Publish" title="Publish this report?" disabled={missing.length > 0}
                message={`Parents will see this certificate in the parent portal${r.published ? ", replacing the version they see now" : ""}.`}
                onConfirm={() => run("progress_publish", { p_report_id: r.id }, "Published to parents")}><CheckCircle2 className="size-4" /> Approve & publish</ConfirmButton>
            )}
          </>}>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <StatusBadge list={REPORT_STATUSES} value={r.status} />
            {r.published && <span className="text-ink-faint">Version {r.published_version} is live for parents{r.status !== "published" ? "; this revision is not yet published" : ""}.</span>}
          </div>
        </PageHeader>
        {r.change_note && r.status === "changes_requested" && <p className="mb-4 rounded-xl bg-gold-50 px-4 py-3 text-sm text-gold-700"><b>Waiting for the teacher:</b> {r.change_note}</p>}
        {missing.length > 0 && <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">Missing before publishing: {missing.join(", ")}.</p>}
        {r.status === "draft" && <p className="mb-4 rounded-xl bg-paper px-4 py-3 text-sm text-ink-soft">The teacher has not submitted this report yet.</p>}
      </div>

      <ResultsNav />
      <ProgressWorkflow status={r.status} />
      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <ProgressCertificate report={working} studentName={r.students?.full_name} studentCode={r.students?.student_code} clientId={identity.data?.clients?.[0]?.client_id} clientName={identity.data?.clients?.[0]?.client_name} studentOfMonth={!!award.data} stamp={r.status === "published" ? null : "Preview"} />
        <div className="no-print space-y-4">
          <Card title={<span className="inline-flex items-center gap-2"><History className="size-4 text-ink-faint" /> History</span>} bodyClass="">
            {!history.data?.length ? <p className="p-5 text-sm text-ink-soft">No history yet.</p> : (
              <ol className="divide-y divide-line text-sm">
                {history.data.map((h) => (
                  <li key={h.id} className="px-4 py-3">
                    <p className="font-semibold text-ink">{ACTIONS[h.action] || h.action}{h.snapshot?.version ? ` · v${h.snapshot.version}` : ""}</p>
                    <p className="text-xs text-ink-faint">{formatDateTime(h.changed_at)}</p>
                    {h.reason && <p className="mt-1 text-ink-soft">“{h.reason}”</p>}
                    {h.action === "edited_before" && <p className="mt-1 text-xs text-ink-faint">{CATEGORIES.map((c) => `${c.label}: ${ratingLabel(h.snapshot?.[c.key])}`).join(" · ")}</p>}
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>
      <style>{`@media print { @page { size: A4 portrait; margin: 8mm; } body * { visibility: hidden; } .progress-certificate, .progress-certificate * { visibility: visible; } .progress-certificate { position: absolute; left: 0; top: 0; width: 100%; max-width: none; } }`}</style>
    </>
  );
}
