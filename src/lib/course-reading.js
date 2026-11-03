// Further reading on each course page: hand-picked existing articles and guides that
// answer the questions families ask about that course. Editorial links, not rankings.
const FEMALE = ["Learning with a female teacher", "/learn/female-quran-teacher"];
export const COURSE_READING = {
  "noorani-qaida": [["How long does it take to learn Noorani Qaida?", "/blog/how-long-to-learn-noorani-qaida"], ["Makharij explained: where each letter comes from", "/blog/makharij-explained-for-beginners"], ["Noorani Qaida home practice checklist", "/blog/noorani-qaida-home-practice-checklist"], ["Noorani Qaida or Quran reading: where to start?", "/blog/noorani-qaida-or-quran-reading"], ["Learning the Quran as a new Muslim", "/learn/quran-for-reverts"]],
  "quran-nazara": [["Tajweed rules for beginners, with examples", "/blog/tajweed-rules-for-beginners"], ["How Tajweed practice works", "/courses/tajweed"], ["Turning Tajweed feedback into useful practice", "/blog/tajweed-practice-with-feedback"], ["Why Tajweed matters in recitation", "/blog/importance-of-reciting-quran-with-tajweed"], ["Makharij explained: where each letter comes from", "/blog/makharij-explained-for-beginners"], ["Common Tajweed mistakes and how to fix them", "/blog/common-tajweed-mistakes"]],
  "hifz-quran": [["Sabaq, Sabqi and Manzil explained", "/blog/sabaq-sabqi-manzil-explained"], ["How long does Hifz take online?", "/blog/how-long-does-hifz-take-online"], ["Planning Hifz revision alongside school", "/blog/hifz-revision-with-school"], ["Quran memorisation techniques for beginners", "/blog/memorization-techniques-for-beginners"]],
  "arabic-language": [["Quran translation or Arabic: comparing goals", "/blog/quran-translation-and-arabic-difference"], ["Quran learning for adult beginners", "/learn/quran-for-adults"]],
  "quran-translation": [["Online Tafseer classes: what you learn", "/blog/online-tafseer-classes-what-you-learn"], ["Quran translation or Arabic: comparing goals", "/blog/quran-translation-and-arabic-difference"], ["Learning the Quran as a new Muslim", "/learn/quran-for-reverts"]],
  "hadith-translation": [["Islamic learning for children", "/learn/islamic-studies-for-kids"], ["Building a family Quran learning routine", "/blog/family-quran-learning-weekly-routine"]],
};

export function courseReading(slug) {
  const links = COURSE_READING[slug];
  return links ? [...links, FEMALE].map(([label, href]) => ({ label, href })) : [];
}
