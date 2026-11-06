import { CATEGORIES, ASSESSMENT_AREAS, EFFORT_OPTIONS, COURSE_STANDARD_OPTIONS } from "./constants.js";

export const PROGRESS_BULK_COLUMNS = [
  { key: "student_code", label: "student_code" },
  ...CATEGORIES.map((c) => ({ key: c.key, label: c.key })),
  { key: "remarks", label: "remarks" },
  { key: "learning_plan", label: "learning_plan" },
  { key: "attendance_held", label: "attendance_held" },
  { key: "attendance_attended", label: "attendance_attended" },
  { key: "curriculum_stage", label: "curriculum_stage" },
  { key: "current_level", label: "current_level" },
  { key: "covered", label: "covered" },
  { key: "memorised", label: "memorised" },
  { key: "lessons_completed", label: "lessons_completed" },
  { key: "performance_overall", label: "performance_overall" },
  { key: "performance_improvement_targets", label: "performance_improvement_targets" },
  { key: "performance_personal_development", label: "performance_personal_development" },
  ...ASSESSMENT_AREAS.flatMap((a) => [
    { key: `${a.key}_summary`, label: `${a.key}_summary` },
    { key: `${a.key}_effort`, label: `${a.key}_effort` },
    { key: `${a.key}_standard`, label: `${a.key}_standard` },
  ]),
];

const LIMITS = { remarks: 1000, learning_plan: 2000, current_level: 120, covered: 1000, memorised: 600, lessons_completed: 100, performance_overall: 300, performance_improvement_targets: 1000, performance_personal_development: 500 };
const normal = (s) => String(s ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");

export function progressBulkTemplateRows() {
  const example = Object.fromEntries(PROGRESS_BULK_COLUMNS.map((c) => [c.key, ""]));
  example.student_code = "REPLACE_WITH_ASSIGNED_STUDENT_CODE";
  return [example];
}

export function validateProgressBulkRows(rows, assignedStudents) {
  const byCode = new Map((assignedStudents || []).map((s) => [String(s.student_code || "").toUpperCase(), s]));
  const seen = new Set();
  return (rows || []).map((row, index) => {
    const issues = [];
    const code = String(row.student_code || "").trim().toUpperCase();
    const student = byCode.get(code);
    if (!code) issues.push("Student code is required.");
    else if (!student) issues.push("Student code is not in your assigned roster for this month.");
    else if (["submitted", "published"].includes(student.status)) issues.push("This month’s report is already submitted or published; ask an admin to return it before replacing it.");
    if (seen.has(code)) issues.push("Duplicate student code in this file.");
    if (code) seen.add(code);
    if (!String(row.remarks || "").trim()) issues.push("Teacher remarks are required.");
    for (const c of CATEGORIES) {
      const value = normal(row[c.key]);
      if (value && !["excellent", "good", "satisfactory", "needs_improvement"].includes(value)) issues.push(`${c.label}: invalid rating.`);
    }
    for (const a of ASSESSMENT_AREAS) {
      const effort = normal(row[`${a.key}_effort`]);
      const standard = normal(row[`${a.key}_standard`]);
      if (!EFFORT_OPTIONS.some((o) => o.value === effort)) issues.push(`${a.label}: effort must be selected.`);
      if (!COURSE_STANDARD_OPTIONS.some((o) => o.value === standard)) issues.push(`${a.label}: course standard must be selected.`);
      if (String(row[`${a.key}_summary`] || "").length > 500) issues.push(`${a.label}: summary exceeds 500 characters.`);
    }
    for (const [key, limit] of Object.entries(LIMITS)) if (String(row[key] || "").length > limit) issues.push(`${key} exceeds ${limit} characters.`);
    const held = String(row.attendance_held || "").trim(), attended = String(row.attendance_attended || "").trim();
    if (held && (!/^\d{1,2}$/.test(held) || Number(held) > 62)) issues.push("Attendance held must be 0–62.");
    if (attended && (!held || !/^\d{1,2}$/.test(attended) || Number(attended) > Number(held))) issues.push("Attendance attended must not exceed classes held.");
    return { rowNumber: index + 2, student, code, issues };
  });
}

export function progressBulkPayload(row) {
  const ratings = Object.fromEntries(CATEGORIES.map((c) => [c.key, normal(row[c.key]) || null]));
  const assessment_areas = Object.fromEntries(ASSESSMENT_AREAS.map((a) => [a.key, {
    summary: String(row[`${a.key}_summary`] || "").trim(),
    effort: normal(row[`${a.key}_effort`]),
    standard: normal(row[`${a.key}_standard`]),
  }]));
  const syllabus = Object.fromEntries([
    ["stage", "curriculum_stage"], ["level", "current_level"], ["covered", "covered"],
    ["memorised", "memorised"], ["lessons_completed", "lessons_completed"],
  ].map(([key, source]) => [key, String(row[source] || "").trim()]).filter(([, value]) => value));
  const attendance = String(row.attendance_held || "").trim() ? {
    held: Number(row.attendance_held),
    ...(String(row.attendance_attended || "").trim() ? { attended: Number(row.attendance_attended) } : {}),
  } : undefined;
  const performance = Object.fromEntries([
    ["overall", "performance_overall"], ["improvement_targets", "performance_improvement_targets"],
    ["personal_development", "performance_personal_development"],
  ].map(([key, source]) => [key, String(row[source] || "").trim()]).filter(([, value]) => value));
  return {
    ratings,
    remarks: String(row.remarks || "").trim(),
    plan: String(row.learning_plan || "").trim(),
    details: { assessment_version: 1, assessment_areas, syllabus, ...(attendance ? { attendance } : {}), performance },
  };
}


export const normalizeProgressBulkHeader = (value) => String(value || "").replace(/^\uFEFF/, "").trim().toLowerCase().replace(/[\s-]+/g, "_");
