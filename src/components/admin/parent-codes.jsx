"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, KeyRound, Loader2 } from "lucide-react";
import { db, downloadCsv, notifyError } from "@/lib/admin/db";
import { Modal } from "@/components/admin/ui";

// Issues access codes for many parents and shows them once, with a CSV download
// for the coordinator to send through OQC's usual channel. Nothing is sent automatically.
export function BulkCodes({ guardianIds = null, label, onDone, className = "btn btn-outline btn-sm" }) {
  const [busy, setBusy] = useState(false);
  const [codes, setCodes] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const issue = async () => {
    setBusy(true);
    const { data, error } = await db().rpc("guardian_issue_codes_bulk", { p_guardian_ids: guardianIds });
    setBusy(false);
    setConfirm(false);
    if (error) return notifyError(error);
    if (!data?.length) return toast.info("Every parent already has an access code.");
    setCodes(data);
    onDone?.();
  };
  const save = () => downloadCsv(`parent-access-codes-${new Date().toISOString().slice(0, 10)}.csv`, codes, [
    { key: "client_id", label: "Client ID" }, { key: "parent_name", label: "Parent" }, { key: "code", label: "Access code" },
  ]);
  return (
    <>
      <button type="button" className={className} onClick={() => setConfirm(true)} disabled={busy}><KeyRound className="size-4" /> {label}</button>
      <Modal open={confirm} onClose={() => !busy && setConfirm(false)} title="Issue access codes?" size="sm"
        footer={<>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirm(false)} disabled={busy}>Cancel</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={issue} disabled={busy}>{busy && <Loader2 className="size-4 animate-spin" />} Issue codes</button>
        </>}>
        <p className="text-sm text-ink-soft">{guardianIds ? "A new code is made for each of these parents; any earlier code stops working." : "A code is made for every parent who has a Client ID but no code yet."} Codes are shown only once.</p>
      </Modal>
      {codes && (
        <Modal open onClose={() => setCodes(null)} title={`${codes.length} access codes`} size="lg"
          footer={<>
            <button type="button" className="btn btn-outline btn-sm" onClick={save}><Download className="size-4" /> Download CSV</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setCodes(null)}>I have saved them</button>
          </>}>
          <p className="mb-3 rounded-xl bg-gold-50 px-4 py-3 text-sm text-gold-700">These codes are shown <b>only now</b>. Download the CSV, send each parent their own code through your usual channel, then delete the file. Never put codes in a results sheet.</p>
          <div className="max-h-[24rem] overflow-auto rounded-xl border border-line">
            <table className="adm-table">
              <thead className="sticky top-0 bg-white"><tr><th>Client ID</th><th>Parent</th><th>Access code</th></tr></thead>
              <tbody>{codes.map((c) => <tr key={c.guardian_id}><td className="font-mono">{c.client_id}</td><td>{c.parent_name}</td><td className="select-all font-mono font-bold tracking-wider">{c.code}</td></tr>)}</tbody>
            </table>
          </div>
        </Modal>
      )}
    </>
  );
}
