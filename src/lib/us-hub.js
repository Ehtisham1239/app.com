// USA landing content for /locations/united-states (3 Nov 2026). Search Console (28 days to
// 3 Nov) shows US searches for "quran classes" (~35), "quran classes near me" (~31),
// "tajweed classes near me" (~25), "quran reading classes" (~33), "adult quran classes" (~19)
// and Tafseer courses (70-100) landing on the site. The copy answers those searches in plain
// words. It names no office, branch, licence, guarantee or response time; the fee figure is
// built from the live plans (feeAnswer) so it always matches /pricing.
export const US_HUB = {
  feeQuestion: "How much do online Quran classes cost in the USA?",
  stepsHeading: "How online Quran classes work in the USA",
  steps: [
    { title: "Tell us the learner and the time", text: "Request a free trial with the learner's age, current reading level and the US time zone and days that suit you: Eastern, Central, Mountain or Pacific." },
    { title: "Meet the teacher online", text: "A coordinator agrees the class time, records any teacher preference and confirms who is available for your course. Lessons are live and one-to-one, so the teacher hears every letter." },
    { title: "Choose a monthly package", text: "After the 3-day trial on an eligible plan (the Weekend plan is excluded), pick the number of classes a week that fits school and work." },
  ],
  pathsHeading: "Learn Quran online in the USA: kids, adults and new Muslims",
  paths: [
    { title: "Quran classes for kids", text: "Children start with Noorani Qaida or Quran reading at their level. A parent sets up the lesson and can sit nearby.", href: "/learn/quran-for-kids", link: "Parent learning guide" },
    { title: "Online Quran classes for adults", text: "Begin from the Arabic letters or return after a break, at a pace that fits work and family.", href: "/learn/quran-for-adults", link: "Adult beginner guide" },
    { title: "Quran classes for new Muslims", text: "Start from the first letters, study meaning in English and ask questions freely in one-to-one lessons.", href: "/learn/quran-for-reverts", link: "Guide for reverts" },
    { title: "Learning with a female teacher", text: "Sisters, girls and young children can ask for a female teacher when booking.", href: "/learn/female-quran-teacher", link: "Female teacher guide" },
  ],
  reading: [
    { label: "Choosing an online Quran teacher in the USA", href: "/blog/choose-online-quran-teacher-usa" },
    { label: "Tajweed rules for beginners, with examples", href: "/blog/tajweed-rules-for-beginners" },
    { label: "Online Tafseer classes: what you learn", href: "/blog/online-tafseer-classes-what-you-learn" },
    { label: "How long does it take to learn Noorani Qaida?", href: "/blog/how-long-to-learn-noorani-qaida" },
  ],
};

export function usHubFaqs() {
  return [
    { question: "Do you offer online Quran classes for adults in the USA?", answer: "Yes. Adults start at their current level, from the Arabic letters with Noorani Qaida to Quran reading with Tajweed feedback. Lessons are live and one-to-one, arranged in your US time zone around work and family." },
    { question: "Are lessons taught in English?", answer: "Yes. Teachers explain in English, and some also teach in Arabic or Urdu. Tell the coordinator which language helps the learner understand, and the teacher's language is confirmed before lessons begin." },
    { question: "Can new Muslims in the USA start from the beginning?", answer: "Yes. Reverts usually start with Noorani Qaida to learn the Arabic letters and sounds, and can add Quran translation lessons to study meaning in English. Questions are welcome in every one-to-one lesson." },
    { question: "Do you offer online Tafseer classes in the USA?", answer: "Yes. The Quran translation and Tafseer course explains the meaning and context of the verses in English. Ask the coordinator which surahs you would start with and which Tafseer works the teacher uses." },
  ];
}
