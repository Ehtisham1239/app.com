// Page heading (H1) for a course page: says what the page offers in the words families
// search for. The CMS course title stays the short name used on cards and menus.
const HEADINGS = {
  "noorani-qaida": "Noorani Qaida online classes for kids and adults",
  "quran-nazara": "Online Quran reading classes with Tajweed (Nazara)",
  "hifz-quran": "Online Hifz ul Quran classes",
  "arabic-language": "Learn Quranic Arabic online",
  "quran-translation": "Online Quran translation and Tafseer classes",
  "hadith-translation": "Online Hadith and Islamic studies classes",
};

export function courseHeading(course) {
  const title = String(course?.title || "").trim();
  if (HEADINGS[course?.slug]) return HEADINGS[course.slug];
  if (!title) return "";
  return /online/i.test(title) ? title : `${title} online classes`;
}
