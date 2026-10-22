import { LOCATIONS } from "./locations.js";
// Shared vocabularies — values match the database CHECK constraints.

export const AGE_BANDS = [
  { value: "child_4_7", label: "Child (4–7)" },
  { value: "child_8_12", label: "Child (8–12)" },
  { value: "teen_13_17", label: "Teen (13–17)" },
  { value: "adult", label: "Adult (18+)" },
];

export const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const TEACHER_PREFS = [
  { value: "female", label: "Female teacher" },
  { value: "male", label: "Male teacher" },
  { value: "any", label: "No preference" },
];

export const WEEKDAYS = [
  { value: 1, short: "Mon", label: "Monday" },
  { value: 2, short: "Tue", label: "Tuesday" },
  { value: 3, short: "Wed", label: "Wednesday" },
  { value: 4, short: "Thu", label: "Thursday" },
  { value: 5, short: "Fri", label: "Friday" },
  { value: 6, short: "Sat", label: "Saturday" },
  { value: 0, short: "Sun", label: "Sunday" },
];

export const TIME_SLOTS = [
  { value: "early_morning", label: "Early morning (5–8 am)" },
  { value: "morning", label: "Morning (8 am–12 pm)" },
  { value: "afternoon", label: "Afternoon (12–4 pm)" },
  { value: "evening", label: "Evening (4–8 pm)" },
  { value: "night", label: "Night (8–11 pm)" },
];

export const LANGUAGES = ["English", "Urdu", "Arabic", "Hindi", "Pashto", "Punjabi", "Bengali", "French", "Other"];

// Most common countries for OQC families first, then the rest alphabetically.
const BASE_COUNTRIES = [
  ["United Kingdom", "Europe/London"],
  ["United States", "America/New_York"],
  ["Canada", "America/Toronto"],
  ["Australia", "Australia/Sydney"],
  ["New Zealand", "Pacific/Auckland"],
  ["Hong Kong", "Asia/Hong_Kong"],
  ["United Arab Emirates", "Asia/Dubai"],
  ["Ireland", "Europe/Dublin"],
  ["Germany", "Europe/Berlin"],
  ["Norway", "Europe/Oslo"],
  ["Sweden", "Europe/Stockholm"],
  ["Denmark", "Europe/Copenhagen"],
  ["Finland", "Europe/Helsinki"],
  ["Netherlands", "Europe/Amsterdam"],
  ["Belgium", "Europe/Brussels"],
  ["France", "Europe/Paris"],
  ["Switzerland", "Europe/Zurich"],
  ["Italy", "Europe/Rome"],
  ["Spain", "Europe/Madrid"],
  ["Iceland", "Atlantic/Reykjavik"],
  ["Singapore", "Asia/Singapore"],
  ["Malaysia", "Asia/Kuala_Lumpur"],
  ["Saudi Arabia", "Asia/Riyadh"],
  ["Qatar", "Asia/Qatar"],
  ["Kuwait", "Asia/Kuwait"],
  ["Bahrain", "Asia/Bahrain"],
  ["Oman", "Asia/Muscat"],
  ["Pakistan", "Asia/Karachi"],
  ["India", "Asia/Kolkata"],
  ["Bangladesh", "Asia/Dhaka"],
  ["South Africa", "Africa/Johannesburg"],
  ["Nigeria", "Africa/Lagos"],
  ["Kenya", "Africa/Nairobi"],
  ["Egypt", "Africa/Cairo"],
  ["Turkey", "Europe/Istanbul"],
  ["Japan", "Asia/Tokyo"],
  ["China", "Asia/Shanghai"],
  ["Indonesia", "Asia/Jakarta"],
  ["Brazil", "America/Sao_Paulo"],
  ["Mexico", "America/Mexico_City"],
  ["Other", "UTC"],
];

// Existing choices retain their time zones; supported location markets are included once.
export const COUNTRIES = [
  ...BASE_COUNTRIES.filter(([name]) => name !== "Other"),
  ...LOCATIONS.filter((country) => !BASE_COUNTRIES.some(([name]) => name === country.name))
    .map((country) => [country.name, country.timezone]),
  BASE_COUNTRIES.find(([name]) => name === "Other") || ["Other", "UTC"],
];

export const CONTENT_STATUSES = [
  { value: "draft", label: "Draft", tone: "neutral" },
  { value: "review", label: "In review", tone: "amber" },
  { value: "scheduled", label: "Scheduled", tone: "blue" },
  { value: "published", label: "Published", tone: "green" },
  { value: "archived", label: "Archived", tone: "muted" },
];

export const TRIAL_STATUSES = [
  { value: "new", label: "New", tone: "blue" },
  { value: "reviewed", label: "Reviewed", tone: "amber" },
  { value: "scheduled", label: "Scheduled", tone: "violet" },
  { value: "completed", label: "Trial done", tone: "teal" },
  { value: "enrolled", label: "Enrolled", tone: "green" },
  { value: "cancelled", label: "Cancelled", tone: "muted" },
  { value: "no_show", label: "No-show", tone: "red" },
];

export const TRIAL_TRANSITIONS = {
  new: ["reviewed", "scheduled", "cancelled"],
  reviewed: ["scheduled", "cancelled"],
  scheduled: ["completed", "no_show", "cancelled"],
  completed: ["enrolled", "cancelled"],
  enrolled: ["cancelled"],
  no_show: ["scheduled", "cancelled"],
  cancelled: ["reviewed"],
};

export const CONTACT_STATUSES = [
  { value: "new", label: "New", tone: "blue" },
  { value: "read", label: "Read", tone: "amber" },
  { value: "replied", label: "Replied", tone: "green" },
  { value: "spam", label: "Spam", tone: "red" },
  { value: "archived", label: "Archived", tone: "muted" },
];

export const COMPLAINT_STATUSES = [
  { value: "open", label: "Open", tone: "red" },
  { value: "under_review", label: "Under review", tone: "amber" },
  { value: "action_taken", label: "Action taken", tone: "blue" },
  { value: "follow_up", label: "Follow-up", tone: "violet" },
  { value: "closed", label: "Closed", tone: "green" },
];

export const COMPLAINT_CLASSES = ["standard", "E1", "E2", "E3", "E4", "E5", "E6", "E7"].map((v) => ({
  value: v,
  label: v === "standard" ? "Standard (2 business days)" : `${v} (10 business days)`,
}));

export const STUDENT_STATUSES = [
  { value: "active", label: "Active", tone: "green" },
  { value: "paused", label: "Paused", tone: "amber" },
  { value: "left", label: "Left", tone: "red" },
  { value: "completed", label: "Completed", tone: "blue" },
];

export const ENROLLMENT_STATUSES = [
  { value: "active", label: "Active", tone: "green" },
  { value: "paused", label: "Paused", tone: "amber" },
  { value: "completed", label: "Completed", tone: "blue" },
  { value: "cancelled", label: "Cancelled", tone: "muted" },
];

export const SESSION_STATUSES = [
  { value: "planned", label: "Planned", tone: "blue" },
  { value: "held", label: "Held", tone: "green" },
  { value: "missed", label: "Missed", tone: "red" },
  { value: "cancelled", label: "Cancelled", tone: "muted" },
  { value: "rescheduled", label: "Rescheduled", tone: "amber" },
];

export const SESSION_KINDS = [
  { value: "regular", label: "Regular" },
  { value: "trial", label: "Trial" },
  { value: "makeup", label: "Make-up" },
  { value: "assessment", label: "Assessment" },
];

export const ATTENDANCE_STATUSES = [
  { value: "present", label: "Present", tone: "green" },
  { value: "late", label: "Late", tone: "amber" },
  { value: "absent", label: "Absent", tone: "red" },
  { value: "excused", label: "Excused", tone: "muted" },
];

export const INVOICE_STATUSES = [
  { value: "draft", label: "Draft", tone: "neutral" },
  { value: "issued", label: "Issued", tone: "blue" },
  { value: "paid", label: "Paid", tone: "green" },
  { value: "void", label: "Void", tone: "muted" },
];

export const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "card", label: "Card" },
  { value: "paypal", label: "PayPal" },
  { value: "cash", label: "Cash" },
  { value: "other", label: "Other" },
];

export const CERTIFICATE_STATUSES = [
  { value: "draft", label: "Draft", tone: "neutral" },
  { value: "issued", label: "Issued", tone: "green" },
  { value: "revoked", label: "Revoked", tone: "red" },
];

export const CURRENCIES = [...new Set(["USD", "GBP", "CAD", "AUD", "EUR", "NZD", "HKD", "AED", "PKR", ...LOCATIONS.map((country) => country.currency)])];

export function labelFor(list, value) {
  return list.find((o) => o.value === value)?.label ?? value ?? "—";
}

export function toneFor(list, value) {
  return list.find((o) => o.value === value)?.tone ?? "neutral";
}
