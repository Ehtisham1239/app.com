// Course pages that match a teacher's listed specialties, so each public profile
// links to the lessons that teacher actually gives. Matching is by keyword only.
const RULES = [
  [/noorani|qaida/i, "/courses/noorani-qaida", "Noorani Qaida"],
  [/nazara|reading/i, "/courses/quran-nazara", "Quran Nazara (reading)"],
  [/tajweed/i, "/courses/tajweed", "Tajweed"],
  [/hifz|memori[sz]/i, "/courses/hifz-quran", "Hifz-ul-Quran"],
  [/arabic language|arabic/i, "/courses/arabic-language", "Arabic language"],
  [/tafseer|tafsir|translation/i, "/courses/quran-translation", "Quran translation and Tafseer"],
  [/hadith|islamic studies/i, "/courses/hadith-translation", "Hadith and Islamic studies"],
];

export function teacherCourses(teacher) {
  const text = [teacher?.headline, ...(teacher?.specialties || [])].filter(Boolean).join(" ");
  const seen = new Set();
  return RULES.filter(([re, href]) => re.test(text) && !seen.has(href) && seen.add(href)).map(([, href, label]) => ({ href, label }));
}
