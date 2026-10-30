"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, FileUp, KeyRound, Loader2, Lock, Plus, ShieldOff, UserPlus, Users, X } from "lucide-react";
import { useAccess } from "@/lib/admin/access";
import { db, likeTerm, notifyError, useLoad } from "@/lib/admin/db";
import { formatDateTime } from "@/lib/format";
import { ResultsNav } from "@/components/admin/results-nav";
import { BulkCodes } from "@/components/admin/parent-codes";
import { Badge, Card, ConfirmButton, EmptyState, ErrorState, Field, Loading, Modal, PageHeader, Pagination, SearchInput } from "@/components/admin/ui";

const PAGE = 20;
const CLIENT_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{2,63}$/;

function GuardianForm({ open, initial, onClose, onSaved }) {
  const [form, setForm] = useState({ full_name: initial?.full_name ?? "", relationship: initial?.relationship ?? "Parent", email: initial?.email ?? "", phone: initial?.phone ?? "", client_id: initial?.client_id ?? "" });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const save = async () => {
    if (form.full_name.trim().length < 2) return toast.error("Enter the parent’s name.");
    if (form.client_id && !CLIENT_ID.test(form.client_id.trim())) return toast.error("Client ID: 3–64 letters, numbers, dots, dashes or underscores.");
    setBusy(true);
    const row = { full_name: form.full_name.trim(), relationship: form.relationship.trim() || "Parent", email: form.email.trim().toLowerCase() || null, phone: form.phone.trim() || null, client_id: form.client_id.trim() || null };
    const { error } = initial?.id ? await db().from("guardians").update(row).eq("id", initial.id) : await db().from("guardians").insert(row);
    setBusy(false);
    if (error) return notifyError(error.code === "23505" ? { message: "That Client ID is already used by another parent." } : error);
    toast.success("Saved");
    onSaved();
  };
  return (
    <Modal open={open} onClose={onClose} title={initial?.id ? "Edit parent" : "Add parent"}
      footer={<><button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={busy}>Cancel</button><button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={busy}>{busy && <Loader2 className="size-4 animate-spin" />} Save</button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required className="sm:col-span-2"><input className="adm-input" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} /></Field>
        <Field label="Client ID" hint="The ERP Client ID the parent uses to sign in"><input className="adm-input font-mono" value={form.client_id} onChange={(e) => set("client_id", e.target.value)} placeholder="e.g. C-10245" /></Field>
        <Field label="Relationship"><input className="adm-input" value={form.relationship} onChange={(e) => set("relationship", e.target.value)} /></Field>
        <Field label="Email"><input type="email" className="adm-input" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
        <Field label="Phone / WhatsApp"><input className="adm-input" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
      </div>
    </Modal>
  );
}

function LinkStudent({ guardian, onDone }) {
  const { can } = useAccess();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const matches = useLoad(() => (open && q.trim().length >= 2 ? db().from("students").select("id, full_name, student_code").is("deleted_at", null).or(`full_name.ilike.${likeTerm(q)},student_code.ilike.${likeTerm(q)}`).limit(8) : { data: [] }), [open, q]);
  const link = async (studentId) => {
    setBusy(true);
    const { error } = await db().from("student_guardians").insert({ student_id: studentId, guardian_id: guardian.id });
    setBusy(false);
    if (error) return notifyError(error.code === "23505" ? { message: "This student is already linked." } : error);
    toast.success("Student linked"); setOpen(false); setQ(""); onDone();
  };
  const createAndLink = async () => {
    setBusy(true);
    const { data, error } = await db().from("students").insert({ full_name: q.trim() }).select("id").single();
    setBusy(false);
    if (error) return notifyError(error);
    link(data.id);
  };
  return (
    <>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}><Plus className="size-4" /> Link child</button>
      <Modal open={open} onClose={() => !busy && setOpen(false)} title={`Link a child to ${guardian.full_name}`}>
        <Field label="Student name or code"><input className="adm-input" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type at least 2 letters" /></Field>
        <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
          {(matches.data || []).map((s) => (
            <li key={s.id}><button type="button" disabled={busy} onClick={() => link(s.id)} className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-paper"><span className="font-semibold">{s.full_name}</span><span className="font-mono text-xs text-ink-faint">{s.student_code}</span></button></li>
          ))}
          {q.trim().length >= 2 && !matches.loading && !(matches.data || []).length && <li className="px-4 py-3 text-sm text-ink-soft">No student found.</li>}
        </ul>
        {can("students:create") && q.trim().length >= 2 && <button type="button" className="btn btn-outline btn-sm mt-3" disabled={busy} onClick={createAndLink}><UserPlus className="size-4" /> Add “{q.trim()}” as a new student</button>}
      </Modal>
    </>
  );
}

function CodeReveal({ code, guardian, onClose }) {
  return (
    <Modal open onClose={onClose} title="Parent access code" size="sm" footer={<button type="button" className="btn btn-primary btn-sm" onClick={onClose}>I have noted it</button>}>
      <p className="text-sm text-ink-soft">Give this to <b>{guardian.full_name}</b> through your usual channel. It is shown <b>only once</b>; OQC stores only a scrambled version and sends nothing automatically.</p>
      <div className="mt-4 rounded-2xl border-2 border-dashed border-gold-400 bg-gold-50 p-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-700">Client ID</p>
        <p className="font-mono text-lg font-bold text-mushaf-900">{guardian.client_id}</p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gold-700">Access code</p>
        <p className="select-all font-mono text-2xl font-bold tracking-[0.15em] text-mushaf-900">{code}</p>
      </div>
      <button type="button" className="btn btn-outline btn-sm mt-3" onClick={() => navigator.clipboard?.writeText(code).then(() => toast.success("Copied"), () => {})}><Copy className="size-4" /> Copy code</button>
      <p className="mt-3 text-xs text-ink-faint">Issuing a new code later replaces this one and signs the parent out.</p>
    </Modal>
  );
}

export default function ParentAccessPage() {
  const { can } = useAccess();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null);
  const [reveal, setReveal] = useState(null);
  const list = useLoad(async () => {
    let query = db().from("guardians").select("id, full_name, relationship, email, phone, client_id, student_guardians(students(id, full_name, student_code))", { count: "exact" }).is("deleted_at", null);
    if (q) query = query.or(`full_name.ilike.${likeTerm(q)},client_id.ilike.${likeTerm(q)},email.ilike.${likeTerm(q)}`);
    const res = await query.order("created_at", { ascending: false }).range(page * PAGE, page * PAGE + PAGE - 1);
    if (res.error || !res.data?.length) return res;
    const status = await db().rpc("guardian_access_status", { p_guardian_ids: res.data.map((g) => g.id) });
    const byId = Object.fromEntries((status.data || []).map((s) => [s.guardian_id, s]));
    return { ...res, data: res.data.map((g) => ({ ...g, access: byId[g.id] ?? null })) };
  }, [q, page]);

  const issue = async (g) => {
    const { data, error } = await db().rpc("guardian_issue_code", { p_guardian_id: g.id });
    if (error) return notifyError(error);
    setReveal({ code: data, guardian: g });
    list.reload();
  };
  const revoke = async (g) => {
    const { error } = await db().rpc("guardian_revoke_code", { p_guardian_id: g.id });
    if (error) return notifyError(error);
    toast.success("Access removed"); list.reload();
  };
  const unlink = async (g, s) => {
    const { error } = await db().from("student_guardians").delete().eq("guardian_id", g.id).eq("student_id", s.id);
    if (error) return notifyError(error);
    list.reload();
  };

  return (
    <>
      <PageHeader title="Parent access" subtitle="Each parent signs in to the parent portal with their Client ID and a one-time issued access code, and sees only their own children’s published results."
        back={{ href: "/admin/results", label: "Results" }}
        actions={<>
          {can("guardians:update") && <BulkCodes label="Codes for all without one" onDone={list.reload} />}
          {can("guardians:create") && <Link href="/admin/results/parents/import" className="btn btn-outline btn-sm"><FileUp className="size-4" /> Bulk upload</Link>}
          {can("guardians:create") && <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing({})}><UserPlus className="size-4" /> Add parent</button>}
        </>} />
      <ResultsNav />
      <div className="mb-4 flex justify-end"><SearchInput value={q} onChange={(v) => { setQ(v); setPage(0); }} placeholder="Name, Client ID or email…" className="w-full sm:w-80" /></div>
      <Card bodyClass="">
        {list.loading ? <Loading /> : list.error ? <ErrorState error={list.error} onRetry={list.reload} /> : !list.data?.length ? (
          <EmptyState icon={Users} title="No parents yet" text="Add parents one by one, or use Bulk upload to add many from a CSV or Excel sheet." />
        ) : (
          <ul className="divide-y divide-line">
            {list.data.map((g) => {
              const kids = (g.student_guardians || []).map((x) => x.students).filter(Boolean);
              return (
                <li key={g.id} className="grid gap-3 px-5 py-4 lg:grid-cols-[1.2fr_1.4fr_auto] lg:items-center">
                  <div className="min-w-0">
                    <button type="button" className="text-left font-semibold text-mushaf-900 hover:text-leaf-700" onClick={() => can("guardians:update") && setEditing(g)}>{g.full_name}</button>
                    <p className="text-xs text-ink-faint">{g.relationship}{g.email ? ` · ${g.email}` : ""}{g.phone ? ` · ${g.phone}` : ""}</p>
                    <p className="mt-1 text-sm">Client ID: {g.client_id ? <span className="font-mono font-semibold">{g.client_id}</span> : <span className="text-rose-700">not set</span>}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {kids.map((s) => (
                      <span key={s.id} className="inline-flex items-center gap-1 rounded-full bg-leaf-50 py-1 pl-3 pr-1 text-sm text-leaf-800">
                        {s.full_name} <span className="font-mono text-[0.7rem] text-ink-faint">{s.student_code}</span>
                        {can("guardians:update") && <button type="button" className="rounded-full p-0.5 hover:bg-white" onClick={() => unlink(g, s)} aria-label={`Unlink ${s.full_name}`}><X className="size-3.5" /></button>}
                      </span>
                    ))}
                    {can("guardians:update") && <LinkStudent guardian={g} onDone={list.reload} />}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    {g.access ? <Badge tone={g.access.locked ? "red" : "green"}>{g.access.locked ? <><Lock className="mr-1 inline size-3" />Locked 15 min</> : `Code issued ${formatDateTime(g.access.issued_at)}`}</Badge> : <Badge tone="muted">No code</Badge>}
                    {can("guardians:update") && g.client_id && (
                      <ConfirmButton danger={false} className="btn btn-outline btn-sm" confirmLabel={g.access ? "Issue new code" : "Issue code"} title={g.access ? "Replace the access code?" : "Issue an access code?"}
                        message={g.access ? "The old code stops working and the parent is signed out." : "The code is shown once. You give it to the parent yourself."} onConfirm={() => issue(g)}>
                        <KeyRound className="size-4" /> {g.access ? "New code" : "Issue code"}
                      </ConfirmButton>
                    )}
                    {can("guardians:update") && g.access && (
                      <ConfirmButton title="Remove portal access?" message="The code stops working and the parent is signed out." confirmLabel="Remove access" className="btn btn-ghost btn-sm text-rose-700" onConfirm={() => revoke(g)}><ShieldOff className="size-4" /></ConfirmButton>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <Pagination page={page} pageSize={PAGE} count={list.count} onPage={setPage} />
      </Card>
      {editing && <GuardianForm open initial={editing.id ? editing : null} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); list.reload(); }} />}
      {reveal && <CodeReveal {...reveal} onClose={() => setReveal(null)} />}
    </>
  );
}
