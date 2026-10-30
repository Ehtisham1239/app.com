"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Award, GraduationCap, Loader2, Plus } from "lucide-react";
import { useAccess } from "@/lib/admin/access";
import { db, likeTerm, notifyError, useLoad } from "@/lib/admin/db";
import { CERTIFICATE_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { Card, EmptyState, ErrorState, Field, Loading, Modal, PageHeader, Pagination, SearchInput, StatusBadge } from "@/components/admin/ui";

const PAGE = 25;

function NewCertificate({ open, onClose }) {
  const router = useRouter();
  const courses = useLoad(() => (open ? db().from("courses").select("id, title").is("deleted_at", null).order("sort_order") : { data: [] }), [open]);
  const [studentQ, setStudentQ] = useState("");
  const [student, setStudent] = useState(null);
  const matches = useLoad(() => (studentQ.length >= 2 && !student ? db().from("students").select("id, full_name, student_code, country").is("deleted_at", null).or(`full_name.ilike.${likeTerm(studentQ)},student_code.ilike.${likeTerm(studentQ)}`).limit(6) : { data: [] }), [studentQ, student]);
  const [form, setForm] = useState({ course_id: "", title: "Certificate of Completion", achievement: "", issued_on: new Date().toISOString().slice(0, 10), signed_by: "" });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const create = async (issue) => {
    const name = student ? student.full_name : studentQ.trim();
    if (name.length < 2) return toast.error("Enter the student’s full name.");
    if (!form.title.trim()) return toast.error("Enter the certificate title.");
    setBusy(true);
    try {
      let studentId = student?.id;
      if (!studentId) {
        const { data, error } = await db().from("students").insert({ full_name: name }).select("id").single();
        if (error) throw error;
        studentId = data.id;
      }
      const { data, error } = await db()
        .from("certificates")
        .insert({ student_id: studentId, course_id: form.course_id || null, title: form.title.trim(), achievement: form.achievement.trim(), issued_on: form.issued_on, signed_by: form.signed_by.trim(), status: issue ? "issued" : "draft" })
        .select("id")
        .single();
      if (error) throw error;
      toast.success(issue ? "Certificate issued" : "Draft saved");
      router.push(`/admin/certificates/${data.id}`);
    } catch (e) {
      notifyError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New certificate"
      footer={
        <>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => create(false)} disabled={busy}>
            Save as draft
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => create(true)} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Award className="size-4" />} Issue certificate
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Student" required className="relative sm:col-span-2" hint={student ? `${student.student_code} — existing student` : "Type a name. Pick an existing student or a new record is created."}>
          <input className="adm-input" value={student ? student.full_name : studentQ} onChange={(e) => { setStudent(null); setStudentQ(e.target.value); }} placeholder="Student’s full name" aria-label="Student" />
          {!student && (matches.data || []).length > 0 && (
            <ul className="absolute inset-x-0 top-[4.4rem] z-10 overflow-hidden rounded-xl border border-line bg-white shadow-[var(--shadow-lift)]">
              {matches.data.map((s) => (
                <li key={s.id}>
                  <button type="button" onClick={() => setStudent(s)} className="block w-full px-4 py-2 text-left text-sm hover:bg-paper">
                    {s.full_name} <span className="text-ink-faint">· {s.student_code}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Field>
        <Field label="Course">
          <select className="adm-input" value={form.course_id} onChange={(e) => set("course_id", e.target.value)}>
            <option value="">— Choose —</option>
            {(courses.data || []).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </Field>
        <Field label="Date of issue">
          <input type="date" className="adm-input" value={form.issued_on} onChange={(e) => set("issued_on", e.target.value)} />
        </Field>
        <Field label="Title" required className="sm:col-span-2">
          <input className="adm-input" value={form.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Achievement" className="sm:col-span-2" hint="For example: for successfully completing Noorani Qaida with excellent Tajweed">
          <textarea className="adm-input" rows={2} value={form.achievement} onChange={(e) => set("achievement", e.target.value)} />
        </Field>
        <Field label="Signed by" className="sm:col-span-2" hint="Name and title printed under the signature">
          <input className="adm-input" value={form.signed_by} onChange={(e) => set("signed_by", e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

export default function CertificatesPage() {
  const router = useRouter();
  const { can } = useAccess();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const list = useLoad(() => {
    let query = db().from("certificates").select("id, number, title, status, issued_on, students!inner(full_name, student_code), courses(title)", { count: "exact" });
    if (q) query = query.or(`number.ilike.${likeTerm(q)},title.ilike.${likeTerm(q)}`);
    return query.order("created_at", { ascending: false }).range(page * PAGE, page * PAGE + PAGE - 1);
  }, [q, page]);
  return (
    <>
      <PageHeader
        title="Certificates"
        subtitle="Issue printable certificates. Every issued certificate can be checked on the website’s Verify page."
        actions={<>
          <Link href="/admin/results" className="btn btn-outline btn-sm"><GraduationCap className="size-4" /> Results</Link>
          {can("certificates:create") && (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
              <Plus className="size-4" /> New certificate
            </button>
          )}
        </>}
      />
      <div className="mb-4 flex justify-end">
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(0); }} placeholder="Certificate number or title…" className="w-full sm:w-72" />
      </div>
      <Card bodyClass="">
        {list.loading ? <Loading /> : list.error ? <ErrorState error={list.error} onRetry={list.reload} /> : !list.data?.length ? (
          <EmptyState icon={Award} title="No certificates yet" text="Create one when a student completes a course." />
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table">
              <thead><tr><th>Number</th><th>Student</th><th>Course</th><th>Issued</th><th>Status</th></tr></thead>
              <tbody>
                {list.data.map((c) => (
                  <tr key={c.id} className="row-link" onClick={() => router.push(`/admin/certificates/${c.id}`)}>
                    <td><Link href={`/admin/certificates/${c.id}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-mushaf-900 hover:text-leaf-700">{c.number}</Link></td>
                    <td className="text-ink-soft">{c.students?.full_name}</td>
                    <td className="text-ink-soft">{c.courses?.title || c.title}</td>
                    <td className="whitespace-nowrap text-ink-soft">{formatDate(c.issued_on)}</td>
                    <td><StatusBadge list={CERTIFICATE_STATUSES} value={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pageSize={PAGE} count={list.count} onPage={setPage} />
      </Card>
      <NewCertificate open={open} onClose={() => setOpen(false)} />
    </>
  );
}
