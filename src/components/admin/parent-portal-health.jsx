"use client";
import Link from "next/link";
import { useAccess } from "@/lib/admin/access";
import { db, useLoad } from "@/lib/admin/db";
import { formatDateTime } from "@/lib/format";
import { Card, ErrorState, Loading } from "@/components/admin/ui";
import { portalHealth } from "@/lib/parent-portal-health";

// Portal overview (3 Nov 2026): at-a-glance access status, so staff see who still needs a code,
// who has never signed in and which students have no linked parent account.
export function ParentPortalHealth() {
  const { can } = useAccess();
  const readGuardians = can("guardians:read"), readStudents = can("students:read");
  const data = useLoad(async () => {
    if (!readGuardians) return { data: null };
    const guardians = await db().from("guardians").select("id, full_name, client_id, student_guardians(student_id)").is("deleted_at", null).order("created_at", { ascending: false }).limit(1000);
    if (guardians.error) return guardians;
    const ids = (guardians.data || []).map((g) => g.id);
    const [status, requests, students] = await Promise.all([
      ids.length ? db().rpc("guardian_access_status", { p_guardian_ids: ids }) : { data: [] },
      db().from("parent_access_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
      readStudents ? db().from("students").select("id, full_name, student_code, student_guardians(guardian_id)").is("deleted_at", null).order("full_name").limit(1000) : { data: null },
    ]);
    const error = status.error || requests.error || students.error;
    if (error) return { error };
    return { data: portalHealth({ guardians: guardians.data || [], status: status.data || [], students: students.data, pendingRequests: requests.count || 0 }) };
  }, [readGuardians, readStudents]);

  if (!readGuardians) return null;
  if (data.loading) return <Card title="Portal health" className="mb-6"><Loading /></Card>;
  if (data.error) return <Card title="Portal health" className="mb-6"><ErrorState error={data.error} onRetry={data.reload} /></Card>;
  const h = data.data;
  const tiles = [
    { label: "Parent accounts", value: h.total },
    { label: "Access code issued", value: h.withCode, tone: "good" },
    { label: "No access code yet", value: h.withoutCode.length, tone: h.withoutCode.length ? "warn" : "good" },
    { label: "Signed in at least once", value: h.signedIn },
    { label: "Locked right now", value: h.locked, tone: h.locked ? "warn" : "good" },
    { label: "Pending access requests", value: h.pendingRequests, tone: h.pendingRequests ? "warn" : "good" },
    ...(h.studentsWithoutParent ? [{ label: "Students with no parent account", value: h.studentsWithoutParent.length, tone: h.studentsWithoutParent.length ? "warn" : "good" }] : []),
  ];
  const toneClass = { warn: "border-gold-300 bg-gold-50", good: "border-leaf-100 bg-leaf-50/60" };
  return <Card title="Portal health" className="mb-6" actions={<Link href="/admin/results/parents" className="btn btn-outline btn-sm">Manage parent accounts</Link>}>
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{tiles.map((t) => <div key={t.label} className={`rounded-xl border p-4 ${toneClass[t.tone] || "border-line bg-white"}`}><dt className="text-xs font-semibold text-ink-soft">{t.label}</dt><dd className="mt-1 font-display text-2xl text-mushaf-900">{t.value}</dd></div>)}</dl>
    {(h.withoutCode.length > 0 || h.neverSignedIn.length > 0 || h.studentsWithoutParent?.length > 0) && <div className="mt-5 grid gap-4 lg:grid-cols-3">
      {h.withoutCode.length > 0 && <AttentionList title="Need an access code" hint="Issue a code from Parent accounts, then send it to the parent." items={h.withoutCode.map((g) => ({ id: g.id, text: g.full_name, meta: g.client_id }))} />}
      {h.neverSignedIn.length > 0 && <AttentionList title="Code issued, never signed in" hint="Check the parent received the code; issue a new one if it was lost." items={h.neverSignedIn.map((g) => ({ id: g.id, text: g.full_name, meta: `Code ${formatDateTime(g.issued_at)}` }))} />}
      {h.studentsWithoutParent?.length > 0 && <AttentionList title="Students without a parent account" hint="Use Create parent account and choose the student to link." items={h.studentsWithoutParent.map((s) => ({ id: s.id, text: s.full_name, meta: s.student_code }))} />}
    </div>}
  </Card>;
}

function AttentionList({ title, hint, items }) {
  const shown = items.slice(0, 8);
  return <section className="rounded-xl border border-line p-4">
    <h3 className="text-sm font-semibold text-mushaf-900">{title} <span className="text-ink-faint">({items.length})</span></h3>
    <p className="mt-1 text-xs text-ink-soft">{hint}</p>
    <ul className="mt-3 space-y-1.5 text-sm">{shown.map((i) => <li key={i.id} className="flex justify-between gap-3"><span className="truncate">{i.text}</span>{i.meta && <span className="shrink-0 font-mono text-xs text-ink-faint">{i.meta}</span>}</li>)}</ul>
    {items.length > shown.length && <p className="mt-2 text-xs text-ink-faint">+ {items.length - shown.length} more</p>}
  </section>;
}
