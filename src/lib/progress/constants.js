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

export function missingForSubmit(ratings, remarks) {
  const missing = CATEGORIES.filter((c) => !ratings?.[c.key]).map((c) => c.label);
  if (!String(remarks || "").trim()) missing.push("Teacher remarks");
  return missing;
}

// Report details (migration 20261030110000): optional marks out of SCORE_MAX per
// area, attendance and syllabus. Form state keeps strings so inputs stay controlled.
export const SCORE_MAX = 10;

export function detailsForm(details) {
  const d = details || {};
  return {
    scores: Object.fromEntries(CATEGORIES.map((c) => [c.key, String(d.scores?.[c.key] ?? "")])),
    attendance: { held: String(d.attendance?.held ?? ""), attended: String(d.attendance?.attended ?? "") },
    syllabus: { level: d.syllabus?.level || "", covered: d.syllabus?.covered || "", memorised: d.syllabus?.memorised || "" },
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
