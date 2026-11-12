"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { db, notifyError } from "@/lib/admin/db";
import { useAccess } from "@/lib/admin/access";
import { Card, EmptyState, ErrorState, Loading, PageHeader, Badge } from "@/components/admin/ui";

const RUBRIC = {
  subject_expertise: { weight: 30, label: "Subject expertise" },
  teaching_effectiveness: { weight: 25, label: "Teaching effectiveness" },
  student_progress: { weight: 15, label: "Student learning progress" },
  lesson_planning: { weight: 10, label: "Lesson planning" },
  islamic_adab: { weight: 10, label: "Islamic adab and professional ethics" },
  communication: { weight: 5, label: "Communication and class management" },
  punctuality: { weight: 5, label: "Punctuality and responsibility" },
};
const TABS = ["Overview", "Teacher mapping", "Assessments", "Issues", "Training", "Weekly plans"];
const inputClass = "adm-input w-full";
const labelClass = "mb-1 block text-sm font-semibold text-ink-soft";
const buttonClass = "btn btn-primary btn-sm";
const panelClass = "rounded-2xl border border-line bg-white p-4 shadow-sm";

function Field({ label, children }) {
  return <label className="block min-w-0"><span className={labelClass}>{label}</span>{children}</label>;
}
function Metric({ label, value, detail }) {
  return <div className="rounded-2xl border border-line bg-white p-4"><p className="text-sm text-ink-faint">{label}</p><p className="mt-1 text-2xl font-bold text-mushaf-900">{value}</p>{detail && <p className="mt-1 text-xs text-ink-faint">{detail}</p>}</div>;
}
function SectionTitle({ title, note }) {
  return <div className="mb-3"><h2 className="font-display text-lg font-bold text-mushaf-950">{title}</h2>{note && <p className="mt-1 text-sm text-ink-faint">{note}</p>}</div>;
}

export function TeacherExcellence() {
  const { access, can } = useAccess();
  const [tab, setTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ teachers: [], roles: [], subjects: [], assessments: [], issues: [], modules: [], records: [], plans: [] });
  const [busy, setBusy] = useState(false);
  const [roleForm, setRoleForm] = useState({ teacher_id: "", role_title: "", responsibilities: "" });
  const [subjectForm, setSubjectForm] = useState({ teacher_id: "", subject_name: "", teaching_level: "All levels" });
  const [assessmentForm, setAssessmentForm] = useState({ subject_assignment_id: "", evidence_notes: "", strengths: "", improvement_actions: "", critical_quran_accuracy_issue: false, scores: Object.fromEntries(Object.keys(RUBRIC).map(k => [k, "3"])) });
  const [issueForm, setIssueForm] = useState({ teacher_id: "", subject_assignment_id: "", category: "teaching_method", priority: "P3", title: "", description: "", evidence: "", root_cause: "", action_plan: "", due_date: "" });
  const [moduleForm, setModuleForm] = useState({ title: "", category: "islamic_tarbiyah", description: "", practical_task: "" });
  const [trainingForm, setTrainingForm] = useState({ teacher_id: "", module_id: "" });
  const [planForm, setPlanForm] = useState({ teacher_id: "", week_start: "", focus: "", actions: "" });

  const canRead = can("teacher_excellence:read") || can("teacher_excellence:self");
  const canWrite = can("teacher_excellence:create") || can("teacher_excellence:update");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queries = [
        db().from("teachers").select("id,display_name,gender,is_active").is("deleted_at", null).order("display_name"),
        db().from("teacher_role_assignments").select("id,teacher_id,role_title,responsibilities,is_active,teachers(display_name)").order("created_at", { ascending: false }).limit(100),
        db().from("teacher_subject_assignments").select("id,teacher_id,subject_name,teaching_level,rubric,is_active,teachers(display_name)").order("created_at", { ascending: false }).limit(200),
        db().from("teacher_assessments").select("id,teacher_id,subject_assignment_id,assessment_date,overall_score,critical_quran_accuracy_issue,status,evidence_notes,teachers(display_name),teacher_subject_assignments(subject_name)").order("assessment_date", { ascending: false }).limit(100),
        db().from("teacher_issues").select("id,teacher_id,subject_assignment_id,category,priority,title,status,due_date,teachers(display_name)").order("created_at", { ascending: false }).limit(100),
        db().from("teacher_training_modules").select("id,title,category,description,practical_task,is_active").eq("is_active", true).order("sequence_no"),
        db().from("teacher_training_records").select("id,teacher_id,module_id,status,score,teachers(display_name),teacher_training_modules(title)").order("assigned_at", { ascending: false }).limit(150),
        db().from("teacher_weekly_plans").select("id,teacher_id,week_start,focus,status,teachers(display_name)").order("week_start", { ascending: false }).limit(100),
      ];
      const results = await Promise.all(queries);
      const failed = results.find(x => x.error);
      if (failed) throw failed.error;
      const keys = ["teachers", "roles", "subjects", "assessments", "issues", "modules", "records", "plans"];
      setData(Object.fromEntries(keys.map((k, i) => [k, results[i].data || []])));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (canRead) void load(); }, [canRead, load]);

  const subjectMap = useMemo(() => Object.fromEntries(data.subjects.map(s => [s.id, s])), [data.subjects]);
  const activeTeachers = data.teachers.filter(t => t.is_active);
  const openIssues = data.issues.filter(i => !["resolved"].includes(i.status));
  const criticalIssues = data.issues.filter(i => i.priority === "P1" && !["resolved"].includes(i.status));
  const latestScores = data.assessments.filter(a => a.overall_score !== null);
  const averageScore = latestScores.length ? (latestScores.reduce((n, a) => n + Number(a.overall_score), 0) / latestScores.length).toFixed(1) : "—";

  async function save(table, payload, success) {
    setBusy(true);
    try {
      const { error: writeError } = await db().from(table).insert(payload);
      if (writeError) throw writeError;
      await load();
      success();
    } catch (e) { notifyError(e); }
    finally { setBusy(false); }
  }

  function addRole(e) {
    e.preventDefault();
    if (!roleForm.teacher_id || !roleForm.role_title.trim()) return;
    void save("teacher_role_assignments", { ...roleForm, assigned_by: access?.id || null }, () => setRoleForm({ teacher_id: "", role_title: "", responsibilities: "" }));
  }
  function addSubject(e) {
    e.preventDefault();
    if (!subjectForm.teacher_id || !subjectForm.subject_name.trim()) return;
    void save("teacher_subject_assignments", { ...subjectForm, rubric: RUBRIC, assigned_by: access?.id || null }, () => setSubjectForm({ teacher_id: "", subject_name: "", teaching_level: "All levels" }));
  }
  function addAssessment(e) {
    e.preventDefault();
    const assignment = subjectMap[assessmentForm.subject_assignment_id];
    if (!assignment) return;
    const rubric = assignment.rubric || RUBRIC;
    const weights = Object.entries(rubric);
    const weightTotal = weights.reduce((n, [, v]) => n + Number(v.weight || 0), 0);
    if (!weightTotal) return;
    const weighted = weights.reduce((n, [key, v]) => n + Number(assessmentForm.scores[key] || 0) * Number(v.weight || 0), 0);
    const overall = Math.round((weighted / weightTotal / 5) * 10000) / 100;
    void save("teacher_assessments", {
      teacher_id: assignment.teacher_id,
      subject_assignment_id: assignment.id,
      assessed_by: access?.id || null,
      dimension_scores: assessmentForm.scores,
      rubric_snapshot: rubric,
      overall_score: overall,
      critical_quran_accuracy_issue: assessmentForm.critical_quran_accuracy_issue,
      evidence_notes: assessmentForm.evidence_notes,
      strengths: assessmentForm.strengths,
      improvement_actions: assessmentForm.improvement_actions,
      status: assessmentForm.critical_quran_accuracy_issue ? "action_required" : "reviewed",
    }, () => setAssessmentForm({ subject_assignment_id: "", evidence_notes: "", strengths: "", improvement_actions: "", critical_quran_accuracy_issue: false, scores: Object.fromEntries(Object.keys(RUBRIC).map(k => [k, "3"])) }));
  }
  function addIssue(e) {
    e.preventDefault();
    if (!issueForm.teacher_id || !issueForm.title.trim()) return;
    const { due_date, ...rest } = issueForm;
    void save("teacher_issues", { ...rest, due_date: due_date || null, created_by: access?.id || null, owner_id: access?.id || null }, () => setIssueForm({ teacher_id: "", subject_assignment_id: "", category: "teaching_method", priority: "P3", title: "", description: "", evidence: "", root_cause: "", action_plan: "", due_date: "" }));
  }
  function addModule(e) {
    e.preventDefault();
    if (!moduleForm.title.trim()) return;
    void save("teacher_training_modules", { ...moduleForm, created_by: access?.id || null }, () => setModuleForm({ title: "", category: "islamic_tarbiyah", description: "", practical_task: "" }));
  }
  function assignTraining(e) {
    e.preventDefault();
    if (!trainingForm.teacher_id || !trainingForm.module_id) return;
    void save("teacher_training_records", { ...trainingForm, assigned_by: access?.id || null }, () => setTrainingForm({ teacher_id: "", module_id: "" }));
  }
  function addPlan(e) {
    e.preventDefault();
    if (!planForm.teacher_id || !planForm.week_start) return;
    const actions = planForm.actions.split("\n").map(x => x.trim()).filter(Boolean).map(title => ({ title, status: "planned" }));
    void save("teacher_weekly_plans", { teacher_id: planForm.teacher_id, week_start: planForm.week_start, focus: planForm.focus, actions, owner_id: access?.id || null }, () => setPlanForm({ teacher_id: "", week_start: "", focus: "", actions: "" }));
  }

  if (!canRead) return <div className={panelClass}><h1 className="text-lg font-bold">Access restricted</h1><p className="mt-2 text-sm text-ink-faint">Your account does not have permission to view teacher development records.</p></div>;

  return (
    <>
      <PageHeader title="Teacher Excellence Center" subtitle="Role-specific development · subject-specific assessment · mentoring and Islamic tarbiyah" />
      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Teacher excellence sections">
        {TABS.map(name => <button key={name} type="button" role="tab" aria-selected={tab === name} onClick={() => setTab(name)} className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${tab === name ? "border-mushaf-800 bg-mushaf-900 text-white" : "border-line bg-white text-ink-soft hover:bg-paper"}`}>{name}</button>)}
      </div>
      {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={load} /> : (
        <>
          {tab === "Overview" && <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label="Active teachers" value={activeTeachers.length} detail="From the existing OQC teacher register" />
              <Metric label="Role assignments" value={data.roles.filter(x => x.is_active).length} detail="A teacher may hold multiple responsibilities" />
              <Metric label="Subject assignments" value={data.subjects.filter(x => x.is_active).length} detail="Each subject is assessed separately" />
              <Metric label="Average assessment" value={averageScore === "—" ? "—" : averageScore + "/100"} detail="Based on recorded assessments only" />
              <Metric label="Open issues" value={openIssues.length} detail="Requires owner and follow-up" />
              <Metric label="P1 critical alerts" value={criticalIssues.length} detail="Quran accuracy / urgent concerns" />
              <Metric label="Training modules" value={data.modules.length} detail="Active learning modules" />
              <Metric label="Training records" value={data.records.length} detail="Assigned and completed learning" />
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <Card><SectionTitle title="Critical issues requiring escalation" note="P1 alerts are never hidden by an average rating." />{criticalIssues.length ? <ul className="space-y-2">{criticalIssues.map(x => <li key={x.id} className="rounded-xl border border-red-200 bg-red-50 p-3"><p className="font-semibold text-red-900">{x.title}</p><p className="text-sm text-red-800">{x.teachers?.display_name || "Teacher"} · {x.status}</p></li>)}</ul> : <EmptyState title="No open P1 alerts" text="This reflects recorded issues only." />}</Card>
              <Card><SectionTitle title="Latest subject assessments" note="Scores are shown by assigned subject, not as a universal teacher role score." />{data.assessments.slice(0, 6).map(x => <div key={x.id} className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-0"><div><p className="font-semibold">{x.teachers?.display_name || "Teacher"}</p><p className="text-xs text-ink-faint">{x.teacher_subject_assignments?.subject_name || "Subject"} · {x.assessment_date}</p></div><strong>{x.critical_quran_accuracy_issue ? "Critical review" : x.overall_score == null ? "Not scored" : `${x.overall_score}/100`}</strong></div>)}</Card>
            </div>
          </>}
          {tab === "Teacher mapping" && <div className="grid gap-4 xl:grid-cols-2">
            {canWrite && <div className={panelClass}><SectionTitle title="Assign an actual role" note="Do not assume one fixed job title for every teacher." /><form onSubmit={addRole} className="space-y-3"><Field label="Teacher"><select className={inputClass} value={roleForm.teacher_id} onChange={e => setRoleForm({ ...roleForm, teacher_id: e.target.value })} required><option value="">Select teacher</option>{activeTeachers.map(t => <option key={t.id} value={t.id}>{t.display_name}</option>)}</select></Field><Field label="Actual role / responsibility title"><input className={inputClass} value={roleForm.role_title} onChange={e => setRoleForm({ ...roleForm, role_title: e.target.value })} placeholder="e.g. Senior Hifz Teacher / Mentor" required /></Field><Field label="Responsibilities"><textarea className={inputClass} rows="3" value={roleForm.responsibilities} onChange={e => setRoleForm({ ...roleForm, responsibilities: e.target.value })} placeholder="Define the actual duties and expected outcomes." /></Field><button className={buttonClass} disabled={busy}>Save role assignment</button></form></div>}
            {canWrite && <div className={panelClass}><SectionTitle title="Assign a subject" note="One teacher can have multiple subjects. Each assignment gets its own rubric." /><form onSubmit={addSubject} className="space-y-3"><Field label="Teacher"><select className={inputClass} value={subjectForm.teacher_id} onChange={e => setSubjectForm({ ...subjectForm, teacher_id: e.target.value })} required><option value="">Select teacher</option>{activeTeachers.map(t => <option key={t.id} value={t.id}>{t.display_name}</option>)}</select></Field><Field label="Subject"><input className={inputClass} value={subjectForm.subject_name} onChange={e => setSubjectForm({ ...subjectForm, subject_name: e.target.value })} placeholder="e.g. Tajweed, Hifz, Qaida, Arabic" required /></Field><Field label="Teaching level"><input className={inputClass} value={subjectForm.teaching_level} onChange={e => setSubjectForm({ ...subjectForm, teaching_level: e.target.value })} /></Field><button className={buttonClass} disabled={busy}>Save subject assignment</button></form></div>}
            <Card><SectionTitle title="Current role assignments" />{data.roles.length ? data.roles.map(x => <div key={x.id} className="border-b border-line py-2 last:border-0"><strong>{x.teachers?.display_name || "Teacher"}</strong><p className="text-sm">{x.role_title}</p><p className="text-xs text-ink-faint">{x.responsibilities}</p></div>) : <EmptyState title="No role assignments yet" />}</Card>
            <Card><SectionTitle title="Subject assignments and rubric" />{data.subjects.length ? data.subjects.map(x => <div key={x.id} className="border-b border-line py-2 last:border-0"><strong>{x.teachers?.display_name || "Teacher"} · {x.subject_name}</strong><p className="text-xs text-ink-faint">{x.teaching_level} · {Object.entries(x.rubric || {}).map(([k,v]) => `${v.label}: ${v.weight}%`).join(" · ")}</p></div>) : <EmptyState title="No subject assignments yet" />}</Card>
          </div>}
          {tab === "Assessments" && <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            {canWrite && <div className={panelClass}><SectionTitle title="Record subject-specific assessment" note="Rate each dimension from 1 (critical) to 5 (outstanding). Weighted score follows the subject assignment rubric." /><form onSubmit={addAssessment} className="space-y-3"><Field label="Teacher · subject"><select className={inputClass} value={assessmentForm.subject_assignment_id} onChange={e => setAssessmentForm({ ...assessmentForm, subject_assignment_id: e.target.value })} required><option value="">Select assigned subject</option>{data.subjects.filter(x => x.is_active).map(x => <option key={x.id} value={x.id}>{x.teachers?.display_name} · {x.subject_name}</option>)}</select></Field>{Object.entries(RUBRIC).map(([key, item]) => <Field key={key} label={`${item.label} (1–5)`}><select className={inputClass} value={assessmentForm.scores[key]} onChange={e => setAssessmentForm({ ...assessmentForm, scores: { ...assessmentForm.scores, [key]: e.target.value } })}>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}</select></Field>)}<Field label="Evidence / observation"><textarea className={inputClass} rows="3" value={assessmentForm.evidence_notes} onChange={e => setAssessmentForm({ ...assessmentForm, evidence_notes: e.target.value })} /></Field><Field label="Strengths"><textarea className={inputClass} rows="2" value={assessmentForm.strengths} onChange={e => setAssessmentForm({ ...assessmentForm, strengths: e.target.value })} /></Field><Field label="Improvement actions"><textarea className={inputClass} rows="2" value={assessmentForm.improvement_actions} onChange={e => setAssessmentForm({ ...assessmentForm, improvement_actions: e.target.value })} /></Field><label className="flex items-start gap-2 text-sm font-semibold text-red-800"><input type="checkbox" checked={assessmentForm.critical_quran_accuracy_issue} onChange={e => setAssessmentForm({ ...assessmentForm, critical_quran_accuracy_issue: e.target.checked })} /> Critical Quran accuracy issue — escalate separately from the average score</label><button className={buttonClass} disabled={busy || !data.subjects.length}>Save assessment</button></form></div>}
            <Card><SectionTitle title="Assessment history" />{data.assessments.length ? data.assessments.map(x => <div key={x.id} className="border-b border-line py-3 last:border-0"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{x.teachers?.display_name} · {x.teacher_subject_assignments?.subject_name}</strong><strong>{x.critical_quran_accuracy_issue ? "P1 · Critical accuracy" : x.overall_score == null ? "—" : `${x.overall_score}/100`}</strong></div><p className="text-xs text-ink-faint">{x.assessment_date} · {x.status}</p><p className="mt-1 text-sm">{x.evidence_notes}</p></div>) : <EmptyState title="No assessments recorded" />}</Card>
          </div>}
          {tab === "Issues" && <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            {canWrite && <div className={panelClass}><SectionTitle title="Open teacher issue" note="Record evidence, root cause, corrective action, owner and due date." /><form onSubmit={addIssue} className="space-y-3"><Field label="Teacher"><select className={inputClass} value={issueForm.teacher_id} onChange={e => setIssueForm({ ...issueForm, teacher_id: e.target.value })} required><option value="">Select teacher</option>{activeTeachers.map(t => <option key={t.id} value={t.id}>{t.display_name}</option>)}</select></Field><Field label="Category"><select className={inputClass} value={issueForm.category} onChange={e => setIssueForm({ ...issueForm, category: e.target.value })}>{["academic_accuracy","teaching_method","student_progress","communication","islamic_tarbiyah","technology","time_management","workload","professionalism","motivation","management_blocker","other"].map(v => <option key={v} value={v}>{v.replaceAll("_"," ")}</option>)}</select></Field><Field label="Priority"><select className={inputClass} value={issueForm.priority} onChange={e => setIssueForm({ ...issueForm, priority: e.target.value })}>{["P1","P2","P3","P4"].map(v => <option key={v}>{v}</option>)}</select></Field><Field label="Issue title"><input className={inputClass} value={issueForm.title} onChange={e => setIssueForm({ ...issueForm, title: e.target.value })} required /></Field><Field label="Description"><textarea className={inputClass} rows="2" value={issueForm.description} onChange={e => setIssueForm({ ...issueForm, description: e.target.value })} /></Field><Field label="Evidence"><textarea className={inputClass} rows="2" value={issueForm.evidence} onChange={e => setIssueForm({ ...issueForm, evidence: e.target.value })} /></Field><Field label="Root cause"><textarea className={inputClass} rows="2" value={issueForm.root_cause} onChange={e => setIssueForm({ ...issueForm, root_cause: e.target.value })} /></Field><Field label="Corrective action"><textarea className={inputClass} rows="2" value={issueForm.action_plan} onChange={e => setIssueForm({ ...issueForm, action_plan: e.target.value })} /></Field><Field label="Due date"><input className={inputClass} type="date" value={issueForm.due_date} onChange={e => setIssueForm({ ...issueForm, due_date: e.target.value })} /></Field><button className={buttonClass} disabled={busy}>Save issue</button></form></div>}
            <Card><SectionTitle title="Issue register" note="P1 urgent · P2 high · P3 medium · P4 routine" />{data.issues.length ? data.issues.map(x => <div key={x.id} className="border-b border-line py-3 last:border-0"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{x.title}</strong><Badge tone={x.priority === "P1" ? "red" : x.priority === "P2" ? "amber" : "muted"}>{x.priority}</Badge></div><p className="text-sm text-ink-faint">{x.teachers?.display_name} · {x.category.replaceAll("_"," ")} · {x.status}{x.due_date ? ` · Due ${x.due_date}` : ""}</p></div>) : <EmptyState title="No teacher issues recorded" />}</Card>
          </div>}
          {tab === "Training" && <div className="grid gap-4 xl:grid-cols-2">
            {canWrite && <div className={panelClass}><SectionTitle title="Create a training module" note="Islamic content and disputed references require qualified scholarly review before publication." /><form onSubmit={addModule} className="space-y-3"><Field label="Module title"><input className={inputClass} value={moduleForm.title} onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })} required /></Field><Field label="Category"><select className={inputClass} value={moduleForm.category} onChange={e => setModuleForm({ ...moduleForm, category: e.target.value })}>{["subject_expertise","teaching_method","islamic_tarbiyah","professional_ethics","mentoring","technology"].map(v => <option key={v}>{v}</option>)}</select></Field><Field label="Description"><textarea className={inputClass} rows="2" value={moduleForm.description} onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })} /></Field><Field label="Practical task / assessment"><textarea className={inputClass} rows="3" value={moduleForm.practical_task} onChange={e => setModuleForm({ ...moduleForm, practical_task: e.target.value })} /></Field><button className={buttonClass} disabled={busy}>Create module</button></form></div>}
            {canWrite && <div className={panelClass}><SectionTitle title="Assign training to a teacher" /><form onSubmit={assignTraining} className="space-y-3"><Field label="Teacher"><select className={inputClass} value={trainingForm.teacher_id} onChange={e => setTrainingForm({ ...trainingForm, teacher_id: e.target.value })} required><option value="">Select teacher</option>{activeTeachers.map(t => <option key={t.id} value={t.id}>{t.display_name}</option>)}</select></Field><Field label="Module"><select className={inputClass} value={trainingForm.module_id} onChange={e => setTrainingForm({ ...trainingForm, module_id: e.target.value })} required><option value="">Select module</option>{data.modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}</select></Field><button className={buttonClass} disabled={busy || !data.modules.length}>Assign module</button></form></div>}
            <Card><SectionTitle title="Training library" />{data.modules.length ? data.modules.map(m => <div key={m.id} className="border-b border-line py-2 last:border-0"><strong>{m.title}</strong><p className="text-xs text-ink-faint">{m.category.replaceAll("_"," ")} · {m.description}</p><p className="mt-1 text-sm">{m.practical_task}</p></div>) : <EmptyState title="No active training modules" />}</Card>
            <Card><SectionTitle title="Teacher training progress" />{data.records.length ? data.records.map(r => <div key={r.id} className="flex items-center justify-between gap-2 border-b border-line py-2 last:border-0"><div><strong>{r.teachers?.display_name}</strong><p className="text-xs text-ink-faint">{r.teacher_training_modules?.title}</p></div><Badge tone={r.status === "passed" ? "green" : "muted"}>{r.status}</Badge></div>) : <EmptyState title="No training assigned" />}</Card>
          </div>}
          {tab === "Weekly plans" && <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            {canWrite && <div className={panelClass}><SectionTitle title="Create an individual weekly plan" note="Plans are tailored to the teacher's assigned responsibilities and subjects." /><form onSubmit={addPlan} className="space-y-3"><Field label="Teacher"><select className={inputClass} value={planForm.teacher_id} onChange={e => setPlanForm({ ...planForm, teacher_id: e.target.value })} required><option value="">Select teacher</option>{activeTeachers.map(t => <option key={t.id} value={t.id}>{t.display_name}</option>)}</select></Field><Field label="Week starting"><input className={inputClass} type="date" value={planForm.week_start} onChange={e => setPlanForm({ ...planForm, week_start: e.target.value })} required /></Field><Field label="Development focus"><input className={inputClass} value={planForm.focus} onChange={e => setPlanForm({ ...planForm, focus: e.target.value })} /></Field><Field label="Actions (one per line)"><textarea className={inputClass} rows="5" value={planForm.actions} onChange={e => setPlanForm({ ...planForm, actions: e.target.value })} /></Field><button className={buttonClass} disabled={busy}>Save weekly plan</button></form></div>}
            <Card><SectionTitle title="Individual weekly plans" />{data.plans.length ? data.plans.map(p => <div key={p.id} className="border-b border-line py-3 last:border-0"><div className="flex justify-between gap-2"><strong>{p.teachers?.display_name}</strong><Badge>{p.status}</Badge></div><p className="text-xs text-ink-faint">Week of {p.week_start}</p><p className="mt-1 text-sm">{p.focus}</p></div>) : <EmptyState title="No weekly plans recorded" />}</Card>
          </div>}
        </>
      )}
    </>
  );
}
