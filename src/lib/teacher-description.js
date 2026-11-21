// Meta description for a teacher profile. Search snippets want 120–159 characters (Bing audit,
// 21 Nov 2026). A bio that long is used as written; a shorter bio is replaced by one factual
// sentence built from the name and headline, so no unchecked praise or credential reaches search.
export function teacherDescription(t) {
  const bio = (t.bio || "").trim();
  if (bio.length >= 120) return bio;
  const role = (t.headline || "").trim();
  const text = `Live one-to-one online Quran lessons with ${t.display_name}${role ? ` (${role})` : ""} at Online Quran College. Request a 3-day free trial, no card needed.`;
  return text.length >= 120 ? text : `${text} Lessons are online, at times agreed with the coordinator.`;
}
