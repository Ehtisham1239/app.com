"use client";

import { Field } from "@/components/admin/ui";
import { ASSESSMENT_AREAS, CATEGORIES, COURSE_STANDARD_OPTIONS, CURRICULUM_STAGES, EFFORT_OPTIONS, SCORE_MAX } from "@/lib/progress/constants";

// Marks, attendance and syllabus inputs shared by the teacher form and the admin edit.
// `details` is the string form from detailsForm(); onChange(group, key, value).
export function ProgressDetailsFields({ details, onChange, idPrefix = "details" }) {
  return (
    <>
      <section className="rounded-2xl border border-line bg-paper/60 p-4" aria-labelledby={`${idPrefix}-marks`}>
        <h3 id={`${idPrefix}-marks`} className="text-sm font-bold text-mushaf-900">Marks for the e-DMC <span className="font-normal text-ink-faint">(optional, out of {SCORE_MAX})</span></h3>
        <p className="text-xs text-ink-faint">Give marks for every area to show a grand total and percentage on the e-DMC. Half marks (e.g. 8.5) are allowed.</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Field key={c.key} label={`${c.label} marks`}><input inputMode="decimal" className="adm-input" placeholder={`0–${SCORE_MAX}`} value={details.scores[c.key]} onChange={(e) => onChange("scores", c.key, e.target.value.trim())} /></Field>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-line bg-paper/60 p-4" aria-labelledby={`${idPrefix}-attendance`}>
        <h3 id={`${idPrefix}-attendance`} className="text-sm font-bold text-mushaf-900">Attendance this month</h3>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="Classes held"><input inputMode="numeric" className="adm-input" placeholder="e.g. 12" value={details.attendance.held} onChange={(e) => onChange("attendance", "held", e.target.value.trim())} /></Field>
          <Field label="Classes attended"><input inputMode="numeric" className="adm-input" placeholder="e.g. 11" value={details.attendance.attended} onChange={(e) => onChange("attendance", "attended", e.target.value.trim())} /></Field>
        </div>
      </section>
      <section className="rounded-2xl border border-line bg-paper/60 p-4" aria-labelledby={`${idPrefix}-curriculum`}>
        <h3 id={`${idPrefix}-curriculum`} className="text-sm font-bold text-mushaf-900">Curriculum pathway · Qaida to Tafseer</h3>
        <p className="mt-1 text-xs text-ink-faint">Choose the learner's current strand. These are flexible pathways, not a fixed sequence; follow the approved syllabus and learner's level.</p>
        <div className="mt-3 grid gap-3">
          <Field label="Current curriculum stage">
            <select className="adm-input" value={details.syllabus.stage || ""} onChange={(e) => onChange("syllabus", "stage", e.target.value)}>
              <option value="">Select current stage</option>
              {CURRICULUM_STAGES.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}
            </select>
          </Field>
          <Field label="Lessons completed" hint="Use lesson numbers/pages actually completed">
            <input className="adm-input" maxLength={100} value={details.lessons_completed || ""} onChange={(e) => onChange("lessons_completed", "", e.target.value)} placeholder="e.g. Qaida lessons 5–8" />
          </Field>
        </div>
        <div className="mt-4 grid gap-3">
          <Field label="Overall performance" hint={`${(details.performance?.overall || "").length}/300`}>
            <textarea className="adm-input" rows={2} maxLength={300} value={details.performance?.overall || ""} onChange={(e) => onChange("performance", "overall", e.target.value)} placeholder="Concise overall progress statement" />
          </Field>
          <Field label="Improvement targets" hint={`${(details.performance?.improvement_targets || "").length}/1000`}>
            <textarea className="adm-input" rows={3} maxLength={1000} value={details.performance?.improvement_targets || ""} onChange={(e) => onChange("performance", "improvement_targets", e.target.value)} placeholder="Specific skills to practise next" />
          </Field>
          <Field label="Personal development" hint={`${(details.performance?.personal_development || "").length}/500`}>
            <textarea className="adm-input" rows={2} maxLength={500} value={details.performance?.personal_development || ""} onChange={(e) => onChange("performance", "personal_development", e.target.value)} placeholder="Participation, confidence, consistency and conduct observed" />
          </Field>
        </div>
      </section>
      <section className="rounded-2xl border border-line bg-paper/60 p-4" aria-labelledby={`${idPrefix}-syllabus`}>
        <h3 id={`${idPrefix}-syllabus`} className="text-sm font-bold text-mushaf-900">Syllabus</h3>
        <div className="mt-3 grid gap-3">
          <Field label="Current level" hint={`${details.syllabus.level.length}/120`}><input className="adm-input" maxLength={120} value={details.syllabus.level} onChange={(e) => onChange("syllabus", "level", e.target.value)} placeholder="e.g. Noorani Qaida lesson 12 / Juz 2, page 30" /></Field>
          <Field label="Covered this month" hint={`${details.syllabus.covered.length}/1000`}><textarea className="adm-input" rows={3} maxLength={1000} value={details.syllabus.covered} onChange={(e) => onChange("syllabus", "covered", e.target.value)} placeholder="Lessons, surahs, tajweed rules and duas covered" /></Field>
          <Field label="Memorised" hint={`${details.syllabus.memorised.length}/600`}><textarea className="adm-input" rows={2} maxLength={600} value={details.syllabus.memorised} onChange={(e) => onChange("syllabus", "memorised", e.target.value)} placeholder="Surahs or duas learnt by heart this month" /></Field>
        </div>
      </section>
    </>
  );
}
