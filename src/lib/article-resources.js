// Editorial connections, not keyword-volume or ranking claims. Each link leads
// to an existing course, guide or practical article with a different purpose.
const topics = {
  parents: { label: "Supporting a young learner", guide: ["A parent’s guide to Quran learning", "/learn/quran-for-kids"], course: ["Explore Noorani Qaida", "/courses/noorani-qaida"] },
  reading: { label: "Choosing a reading foundation", guide: ["Where to start with Quran learning", "/learn"], course: ["Compare Quran reading courses", "/courses"] },
  tajweed: { label: "Reading with useful feedback", guide: ["How Tajweed practice works", "/courses/tajweed"], course: ["Quran reading with a teacher", "/courses/quran-nazara"] },
  hifz: { label: "Balancing new work and revision", guide: ["Ask about a sustainable study routine", "/contact"], course: ["Explore the Hifz course", "/courses/hifz-quran"] },
  adults: { label: "Learning at your own starting point", guide: ["Quran learning for adult beginners", "/learn/quran-for-adults"], course: ["Compare the available courses", "/courses"] },
  understanding: { label: "Reading, language and understanding", guide: ["Explore Quran translation", "/courses/quran-translation"], course: ["Explore Arabic language study", "/courses/arabic-language"] },
  international: { label: "Planning lessons around your local time", guide: ["Find your country and time zone", "/locations"], course: ["Compare class fees and packages", "/pricing"] },
};

const articleTopics = {
  "choose-online-quran-classes-kids": "parents",
  "noorani-qaida-home-practice-checklist": "parents",
  "returning-to-quran-study-adults": "adults",
  "family-quran-learning-weekly-routine": "parents",
  "online-quran-class-fees-uk-comparison": "international",
  "help-your-kids-learn-quran-online": "parents",
  "importance-of-reciting-quran-with-tajweed": "tajweed",
  "memorization-techniques-for-beginners": "hifz",
  "quran-translation-and-arabic-difference": "understanding",
  "online-quran-lesson-setup-accessibility": "parents",
  "parent-teacher-quran-progress-review": "parents",
  "family-quran-learning-multiple-children": "parents",
  "choose-online-quran-teacher-usa": "international",
  "quran-lessons-australia-time-zones": "international",
  "noorani-qaida-or-quran-reading": "reading",
  "adult-quran-beginner-first-month": "adults",
  "prepare-child-first-online-quran-trial": "parents",
  "tajweed-practice-with-feedback": "tajweed",
  "hifz-revision-with-school": "hifz",
  "questions-before-quran-course-enrolment": "reading",
};

export function articleResources(post) {
  const topic = topics[articleTopics[post.slug]] || topics.reading;
  return { label: topic.label, links: [topic.guide, topic.course].map(([label, href]) => ({ label, href })) };
}

export function relatedArticles(post, posts, limit = 3) {
  const score = candidate => (articleTopics[post.slug] && articleTopics[candidate.slug] === articleTopics[post.slug] ? 5 : 0)
    + (candidate.category && candidate.category === post.category ? 3 : 0)
    + (candidate.tags || []).filter(tag => post.tags?.includes(tag)).length;
  return posts.filter(candidate => candidate.slug !== post.slug).sort((a, b) => score(b) - score(a)).slice(0, limit);
}
