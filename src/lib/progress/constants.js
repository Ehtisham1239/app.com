// Monthly progress report vocabulary (owner workflow document, 30 Oct 2026).
// The rating scale is the document's proposed scale; change it here and in the
// migration's check constraints together.
export const CATEGORIES = [
  { key: "adab", label: "Adab", hint: "Manners and respect in class" },
  { key: "qaida", label: "Qaida", hint: "Noorani Qaida reading" },
  { key: "dua", label: "Dua", hint: "Memorised duas" },
  { key: "tajweed", label: "Tajweed Accuracy", hint: "Correct rules while reciting" },
  { key: "engagement", label: "Student Engagement", hint: "Attention and participation" },
  { key: "outcome", label: "Parent Visible Outcome", hint: "Progress parents can notice at home" },
];

export const ASSESSMENT_AREAS = [
  { key: "qaida_reading", label: "Qaida / Quran Reading", hint: "Current Qaida lesson, reading skill and accuracy" },
  { key: "tajweed", label: "Tajweed", hint: "Rules practised and applied in recitation" },
  { key: "makharij", label: "Makharij", hint: "Letter articulation and difficult sounds" },
  { key: "fluency", label: "Fluency", hint: "Reading pace, continuity and confidence" },
  { key: "hifz_revision", label: "Hifz and Revision", hint: "Memorisation, retention and revision completed" },
  { key: "duas", label: "Duas", hint: "Assigned duas revised or memorised" },
  { key: "daily_sunnah", label: "Daily Sunnah", hint: "Practical Sunnah topics covered in class" },
  { key: "surahs", label: "Surahs", hint: "Surahs studied, revised or memorised" },
  { key: "hadith", label: "Hadith", hint: "Hadith topic studied and age-appropriate understanding" },
  { key: "namaz", label: "Namaz", hint: "Prayer knowledge and sequence practised" },
  { key: "islamic_knowledge", label: "Islamic Knowledge", hint: "Islamic studies topic covered" },
];

export const EFFORT_OPTIONS = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "satisfactory", label: "Satisfactory" },
  { value: "needs_improvement", label: "Needs improvement" },
  { value: "not_applicable", label: "Not applicable" },
];

// Provisional labels from the design prototype; Academic leadership must approve
// the final scale before these labels become an official OQC rubric.
export const COURSE_STANDARD_OPTIONS = [
  { value: "above_expected", label: "Above expected" },
  { value: "at_expected", label: "At expected standard" },
  { value: "working_towards", label: "Working towards expected" },
  { value: "not_applicable", label: "Not applicable" },
];

// Curriculum stages are navigation labels, not a compulsory one-size-fits-all sequence.
// Teachers select only the approved strand and content actually assigned to the learner.
export const CURRICULUM_STAGES = [
  { value: "foundations_qaida", label: "Foundations · Arabic letters & Qaida" },
  { value: "quran_reading", label: "Quran reading · fluency & revision" },
  { value: "tajweed", label: "Tajweed · articulation, rules & application" },
  { value: "hifz_revision", label: "Hifz · memorisation & revision" },
  { value: "translation", label: "Quran translation · vocabulary & meaning" },
  { value: "tafseer", label: "Tafseer · selected passages & source-guided study" },
  { value: "islamic_studies", label: "Islamic studies · duas, Sunnah, Seerah & foundations" },
];

export const MONTHLY_PLAN_TEMPLATE = `MONTHLY TEACHING PLAN
Reporting month:
Student / course / current level:
Teacher:

1. MONTHLY LEARNING TARGETS
- Target 1:
- Target 2:
- Target 3:

2. WEEK-BY-WEEK PLAN
Week 1 — lesson focus / pages or lesson numbers / practice:
Week 2 — lesson focus / pages or lesson numbers / practice:
Week 3 — lesson focus / pages or lesson numbers / practice:
Week 4 — lesson focus / pages or lesson numbers / practice:
(Use Week 5 only when required by the calendar and lesson schedule.)

3. LEARNING METHODS USED
- Teacher-selected method and why it suits this learner:
- Guided practice / repetition / listening / recitation / discussion:
- Revision and retrieval practice:

4. CHECK FOR UNDERSTANDING
- What the learner demonstrated:
- What needs more practice:
- How progress will be checked:

5. HOME PRACTICE & PARENT SUPPORT
- Short, realistic practice task:
- Suggested frequency:
- Parent support (if appropriate):

6. NEXT MONTH
- Next learning target:
- Any support or follow-up required:

Teacher note: enter only material actually taught or assigned. Adapt the plan to the learner's level and the college-approved syllabus; do not invent lesson completion or religious rulings.`;

export const RATINGS = [
  { value: "excellent", label: "Excellent", tone: "green", stars: 4 },
  { value: "good", label: "Good", tone: "teal", stars: 3 },
  { value: "satisfactory", label: "Satisfactory", tone: "amber", stars: 2 },
  { value: "needs_improvement", label: "Needs Improvement", tone: "red", stars: 1 },
];

export const REPORT_STATUSES = [
  { value: "draft", label: "Draft", tone: "neutral" },
  { value: "submitted", label: "Submitted", tone: "blue" },
  { value: "changes_requested", label: "Changes requested", tone: "amber" },
  { value: "published", label: "Published", tone: "green" },
];

export const ratingLabel = (value) => RATINGS.find((r) => r.value === value)?.label ?? "—";
export const ratingStars = (value) => RATINGS.find((r) => r.value === value)?.stars ?? 0;

// "2026-10-01" → "October 2026" (UTC so the month never shifts with the time zone).
export function periodLabel(period) {
  if (!period) return "";
  const d = new Date(`${String(period).slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

// Month value for <input type="month"> and the first day for the database.
export const monthInput = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
export const monthToPeriod = (value) => (/^\d{4}-\d{2}$/.test(value || "") ? `${value}-01` : null);

export function emptyRatings() {
  return Object.fromEntries(CATEGORIES.map((c) => [c.key, ""]));
}

export function missingForSubmit(ratings, remarks, details = null) {
  const missing = CATEGORIES.filter((c) => !ratings?.[c.key]).map((c) => c.label);
  if (!String(remarks || "").trim()) missing.push("Teacher remarks");
  for (const area of ASSESSMENT_AREAS) {
    const item = details.assessment_areas?.[area.key] || {};
    if (!item.effort) missing.push(`${area.label} · effort`);
    if (!item.standard) missing.push(`${area.label} · course standard`);
  }
  return missing;
}

// Report details (migration 20261030110000): optional marks out of SCORE_MAX per
// area, attendance and syllabus. Form state keeps strings so inputs stay controlled.
export const SCORE_MAX = 10;

export function detailsForm(details) {
  const d = details || {};
  return {
    assessment_version: 1,
    scores: Object.fromEntries(CATEGORIES.map((c) => [c.key, String(d.scores?.[c.key] ?? "")])),
    attendance: { held: String(d.attendance?.held ?? ""), attended: String(d.attendance?.attended ?? "") },
    syllabus: { stage: d.syllabus?.stage || "", level: d.syllabus?.level || "", covered: d.syllabus?.covered || "", memorised: d.syllabus?.memorised || "", lessons_completed: d.syllabus?.lessons_completed || "" },
    performance: { overall: String(d.performance?.overall || ""), improvement_targets: String(d.performance?.improvement_targets || ""), personal_development: String(d.performance?.personal_development || "") },
    assessment_areas: Object.fromEntries(ASSESSMENT_AREAS.map((a) => [a.key, {
      summary: String(d.assessment_areas?.[a.key]?.summary || ""),
      effort: String(d.assessment_areas?.[a.key]?.effort || ""),
      standard: String(d.assessment_areas?.[a.key]?.standard || ""),
    }])),
  };
}

// Marks summary for the e-DMC: totals only when every area has marks.
export function marksSummary(details) {
  const scores = details?.scores || {};
  const given = CATEGORIES.filter((c) => Number.isFinite(Number(scores[c.key])) && scores[c.key] !== "" && scores[c.key] !== null && scores[c.key] !== undefined);
  const obtained = given.reduce((sum, c) => sum + Number(scores[c.key]), 0);
  const complete = given.length === CATEGORIES.length;
  const total = CATEGORIES.length * SCORE_MAX;
  return { given: given.length, obtained, total, complete, percent: complete ? Math.round((obtained * 1000) / total) / 10 : null };
}

export function attendancePercent(details) {
  const a = details?.attendance;
  if (!a || !Number(a.held) || a.attended === undefined || a.attended === null || a.attended === "") return null;
  return Math.round((Number(a.attended) * 100) / Number(a.held));
}

// Quick form checks matching private.progress_details; the database repeats them.
export function detailsProblem(details) {
  for (const c of CATEGORIES) {
    const v = String(details?.scores?.[c.key] ?? "").trim();
    if (v !== "" && !(/^\d{1,2}(\.[05])?$/.test(v) && Number(v) <= SCORE_MAX)) return `Marks for ${c.label} must be 0–${SCORE_MAX}.`;
  }
  if (String(details?.syllabus?.lessons_completed ?? "").length > 100) return "Lessons completed must be 100 characters or fewer.";
  if (details?.syllabus?.stage && !CURRICULUM_STAGES.some((stage) => stage.value === details.syllabus.stage)) return "Choose a valid curriculum stage.";
  if (String(details?.syllabus?.level || "").length > 120) return "Current level must be 120 characters or fewer.";
  if (String(details?.syllabus?.covered || "").length > 1000) return "Covered syllabus must be 1,000 characters or fewer.";
  if (String(details?.syllabus?.memorised || "").length > 600) return "Memorised content must be 600 characters or fewer.";
  for (const [key, limit] of [["overall", 300], ["improvement_targets", 1000], ["personal_development", 500]]) {
    if (String(details?.performance?.[key] || "").length > limit) return `Performance field ${key} must be ${limit} characters or fewer.`;
  }
  for (const area of ASSESSMENT_AREAS) {
    const item = details?.assessment_areas?.[area.key] || {};
    if (String(item.summary || "").length > 500) return `${area.label} summary must be 500 characters or fewer.`;
    if (item.effort && !EFFORT_OPTIONS.some((o) => o.value === item.effort)) return `Choose a valid effort rating for ${area.label}.`;
    if (item.standard && !COURSE_STANDARD_OPTIONS.some((o) => o.value === item.standard)) return `Choose a valid course standard for ${area.label}.`;
  }
  const held = String(details?.attendance?.held ?? "").trim();
  const attended = String(details?.attendance?.attended ?? "").trim();
  if (held !== "" && !(/^\d{1,2}$/.test(held) && Number(held) <= 62)) return "Classes held must be a whole number from 0 to 62.";
  if (attended !== "" && (held === "" || !/^\d{1,2}$/.test(attended) || Number(attended) > Number(held))) return "Classes attended must be a whole number no more than classes held.";
  return "";
}

// Form strings → the shape a saved report uses, for on-screen previews only.
export function formToDetails(d) {
  const scores = Object.fromEntries(Object.entries(d.scores).filter(([, v]) => v !== "" && Number.isFinite(Number(v))).map(([k, v]) => [k, Number(v)]));
  const attendance = d.attendance.held !== "" ? { held: Number(d.attendance.held), ...(d.attendance.attended === "" ? {} : { attended: Number(d.attendance.attended) }) } : undefined;
  const syllabus = Object.fromEntries(Object.entries(d.syllabus).filter(([, v]) => String(v).trim()).map(([k, v]) => [k, String(v).trim()]));
  const performance = Object.fromEntries(Object.entries(d.performance || {}).filter(([, v]) => String(v).trim()).map(([k, v]) => [k, String(v).trim()]));
  const assessment_areas = Object.fromEntries(ASSESSMENT_AREAS.map((a) => {
    const item = d.assessment_areas[a.key] || {};
    return [a.key, Object.fromEntries(Object.entries(item).filter(([, v]) => String(v).trim()).map(([k, v]) => [k, String(v).trim()]))];
  }).filter(([, item]) => Object.keys(item).length));
  return { assessment_version: 1, scores, attendance, syllabus, assessment_areas, performance };
}
