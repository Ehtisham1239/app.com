"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Users, X } from "lucide-react";
import { useAccess } from "@/lib/admin/access";
import { db, likeTerm, notifyError, useLoad } from "@/lib/admin/db";
import { Card, EmptyState, ErrorState, Field, Loading, PageHeader } from "@/components/admin/ui";

// Which teacher login reports on which students. Teachers are staff logins with the
// Teacher role (Admin users page). The group is used for Student of the Month.
export default function AssignmentsPage() {
  const { can } = useAccess();
  const teachers = useLoad(() => db().from("profiles").select("id, full_name, email, role").eq("role", "teacher").order("full_name"), []);
  const assignments = useLoad(() => db().from("progress_assignments").select("id, teacher_profile_id, group_label, students(id, full_name, student_code)").order("created_at"), []);
  const [teacherId, setTeacherId] = useState("");
  const [group, setGroup] = useState("");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const matches = useLoad(() => (q.trim().length >= 2 ? db().from("students").select("id, full_name, student_code").is("deleted_at", null).or(`full_name.ilike.${likeTerm(q)},student_code.ilike.${likeTerm(q)}`).limit(8) : { data: [] }), [q]);
  const editable = can("progress:update");

  const add = async (studentId) => {
    if (!teacherId) return toast.error("Choose the teacher first.");
    setBusy(true);
    const { error } = await db().from("progress_assignments").insert({ teacher_profile_id: teacherId, student_id: studentId, group_label: group.trim() });
    setBusy(false);
    if (error) return notifyError(error.code === "23505" ? { message: "This student is already assigned to that teacher." } : error);
    toast.success("Student assigned"); setQ(""); assignments.reload();
  };
  const remove = async (id) => {
    const { error } = await db().from("progress_assignments").delete().eq("id", id);
    if (error) return notifyError(error);
    assignments.reload();
  };
  const byTeacher = (id) => (assignments.data || []).filter((a) => a.teacher_profile_id === id);

  return (
    <>
      <PageHeader title="Teacher assignments" subtitle="Each teacher sees and reports on only the students assigned here." back={{ href: "/admin/progress", label: "Monthly progress" }} />
      {teachers.loading ? <Loading /> : teachers.error ? <ErrorState error={teachers.error} onRetry={teachers.reload} /> : !teachers.data?.length ? (
        <EmptyState icon={Users} title="No teacher logins yet" text="Create a login with the Teacher role on the Admin users page, then assign students here." action={can("users:create") && <Link href="/admin/users" className="btn btn-primary btn-sm">Open Admin users</Link>} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
          {editable && (
            <Card title="Assign a student">
              <div className="space-y-4">
                <Field label="Teacher" required>
                  <select className="adm-input" value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
                    <option value="">— Choose —</option>
                    {teachers.data.map((t) => <option key={t.id} value={t.id}>{t.full_name || t.email}</option>)}
                  </select>
                </Field>
                <Field label="Group" hint="Optional, e.g. Kids Morning A. Student of the Month is chosen per group."><input className="adm-input" value={group} maxLength={60} onChange={(e) => setGroup(e.target.value)} /></Field>
                <Field label="Student name or code"><input className="adm-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type at least 2 letters" /></Field>
                <ul className="divide-y divide-line rounded-xl border border-line">
                  {(matches.data || []).map((s) => (
                    <li key={s.id}><button type="button" disabled={busy} onClick={() => add(s.id)} className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-paper"><span className="font-semibold">{s.full_name}</span><span className="inline-flex items-center gap-1 text-xs text-leaf-700">{busy ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />} Assign</span></button></li>
                  ))}
                  {q.trim().length >= 2 && !matches.loading && !(matches.data || []).length && <li className="px-4 py-3 text-sm text-ink-soft">No student found. Add students from Results → Parent access.</li>}
                </ul>
              </div>
            </Card>
          )}
          <div className="space-y-4">
            {assignments.loading ? <Loading /> : teachers.data.map((t) => (
              <Card key={t.id} title={`${t.full_name || t.email} · ${byTeacher(t.id).length} students`} bodyClass="p-4">
                {!byTeacher(t.id).length ? <p className="text-sm text-ink-soft">No students assigned.</p> : (
                  <div className="flex flex-wrap gap-2">
                    {byTeacher(t.id).map((a) => (
                      <span key={a.id} className="inline-flex items-center gap-1.5 rounded-full bg-leaf-50 py-1 pl-3 pr-1 text-sm text-leaf-800">
                        {a.students?.full_name}{a.group_label && <span className="text-xs text-ink-faint">· {a.group_label}</span>}
                        {editable && <button type="button" onClick={() => remove(a.id)} className="rounded-full p-0.5 hover:bg-white" aria-label={`Remove ${a.students?.full_name}`}><X className="size-3.5" /></button>}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
