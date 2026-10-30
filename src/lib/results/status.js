// Labels and badge tones for the results workflow (see the migration's check constraints).
export const ASSESSMENT_STATUSES = [
  { value: "draft", label: "Draft", tone: "neutral" },
  { value: "active", label: "Open for results", tone: "green" },
  { value: "closed", label: "Closed", tone: "muted" },
];

export const BATCH_STATUSES = [
  { value: "needs_review", label: "Needs review", tone: "amber" },
  { value: "ready_for_approval", label: "Awaiting approval", tone: "blue" },
  { value: "approved", label: "Approved", tone: "teal" },
  { value: "published", label: "Published", tone: "green" },
  { value: "rejected", label: "Rejected", tone: "red" },
  { value: "cancelled", label: "Cancelled", tone: "muted" },
];

export const ROW_STATUSES = [
  { value: "pending", label: "Not checked", tone: "neutral" },
  { value: "valid", label: "Valid", tone: "green" },
  { value: "invalid", label: "Needs fixing", tone: "red" },
  { value: "duplicate", label: "Duplicate", tone: "amber" },
  { value: "excluded", label: "Excluded", tone: "muted" },
];

export const RESULT_STATUSES = [
  { value: "published", label: "Published", tone: "green" },
  { value: "withdrawn", label: "Withdrawn", tone: "red" },
];
