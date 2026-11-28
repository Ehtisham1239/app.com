// Editorial connections, not keyword-volume or ranking claims. Each link leads
// to an existing course, guide or practical article with a different purpose.
const topics = {
  parents: { label: "Supporting a young learner", guide: ["A parent’s guide to Quran learning", "/learn/quran-for-kids"], course: ["Explore Noorani Qaida", "/courses/noorani-qaida"] },
  reading: { label: "Choosing a reading foundation", guide: ["Where to start with Quran learning", "/learn"], course: ["Compare Quran reading courses", "/courses"] },
  tajweed: { label: "Reading with useful feedback", guide: ["How Tajweed practice works", "/courses/tajweed"], course: ["Quran reading with a teacher", "/courses/quran-nazara"] },
  hifz: { label: "Balancing new work and revision", guide: ["Ask about a sustainable study routine", "/contact"], course: ["Explore the Hifz course", "/courses/hifz-quran"] },
  adults: { label: "Learning at your own starting point", guide: ["Quran learning for adult beginners", "/learn/quran-for-adults"], course: ["Compare the available courses", "/courses"] },
  understanding: { label: "Reading, language and understanding", guide: ["Explore Quran translation", "/courses/quran-translation"], course: ["Explore Arabic language study", "/courses/arabic-language"] },
  women: { label: "Choosing a teacher and class time", guide: ["How to request a female Quran teacher", "/learn/female-quran-teacher"], course: ["Meet the Quran teachers", "/teachers"] },
  converts: { label: "Taking the first steps", guide: ["Quran classes for new Muslims", "/learn/quran-for-reverts"], course: ["Start with Noorani Qaida", "/courses/noorani-qaida"] },
  international: { label: "Planning lessons around your local time", guide: ["Find your country and time zone", "/locations"], course: ["Compare class fees and packages", "/pricing"] },
};

const articleTopics = {
  "can-i-learn-quran-by-myself": "reading",
  "noorani-qaida-for-adults-online": "adults",
  "online-quran-classes-for-women-and-girls": "women",
  "online-quran-teacher-qualifications-child-safety-checks": "parents",
  "quran-study-for-new-muslims": "converts",
  "quranic-arabic-roadmap-first-year": "understanding",
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
  "quran-teacher-online-in-australia": "international",
  "online-quran-lessons-canada-time-zones": "international",
  "online-quran-class-fees-usa-comparison": "international",
  "online-quran-lessons-usa-time-zones": "international",
  "online-quran-lessons-uae-families": "international",
  "noorani-qaida-or-quran-reading": "reading",
  "adult-quran-beginner-first-month": "adults",
  "prepare-child-first-online-quran-trial": "parents",
  "tajweed-practice-with-feedback": "tajweed",
  "hifz-revision-with-school": "hifz",
  "questions-before-quran-course-enrolment": "reading",
  "how-long-to-learn-noorani-qaida": "parents",
  "how-long-does-hifz-take-online": "hifz",
  "tajweed-rules-for-beginners": "tajweed",
  "online-tafseer-classes-what-you-learn": "understanding",
  "sabaq-sabqi-manzil-explained": "hifz",
  "makharij-explained-for-beginners": "tajweed",
  "common-tajweed-mistakes": "tajweed",
  "ramadan-quran-plan-for-families": "parents",
  "what-age-start-online-quran-classes": "parents",
  // 19 Nov 2026: these posts had no topic, so four of them got no related-article links at all.
  "is-my-child-ready-for-hifz": "hifz",
  "online-hifz-classes-uae-routine": "hifz",
  "online-quran-classes-or-mosque-classes": "parents",
  "printable-weekly-quran-practice-planner": "parents",
  "online-quran-classes-kids-uae-school-routine": "international",
  "online-tajweed-classes-adults-uae": "tajweed",
  "online-quran-classes-europe-time-zones": "international",
  "online-quran-classes-new-zealand-time-zones": "international",
  "native-arabic-speaking-quran-teacher": "tajweed",
  "how-to-learn-quran-online-beginners-guide": "reading",
  "arabic-for-quran-readers": "understanding",
  "quran-translation-tafseer-beginners": "understanding",
};

export function articleResources(post) {
  const topic = topics[articleTopics[post.slug]] || topics.reading;
  return { label: topic.label, links: [topic.guide, topic.course].map(([label, href]) => ({ label, href })) };
}

function relatedScore(post, candidate) {
  return (articleTopics[post.slug] && articleTopics[candidate.slug] === articleTopics[post.slug] ? 5 : 0)
    + (candidate.category && candidate.category === post.category ? 3 : 0)
    + (candidate.tags || []).filter(tag => post.tags?.includes(tag)).length;
}

// Related links are planned for all posts together so every article receives some: posts are
// visited in slug order and each picks the most relevant candidates, minus 2 points for every
// link a candidate already has (19 Nov 2026: plain top-3 by relevance left 4 articles with none).
// Deterministic for the same post list, so a page's links do not change between renders.
export function relatedArticles(post, posts, limit = 3) {
  const all = posts.some(p => p.slug === post.slug) ? posts : [...posts, post];
  const inbound = new Map(all.map(p => [p.slug, 0]));
  let mine = [];
  for (const source of [...all].sort((a, b) => a.slug.localeCompare(b.slug))) {
    const picks = all.filter(c => c.slug !== source.slug)
      .map((c, i) => ({ c, i, key: relatedScore(source, c) - 2 * inbound.get(c.slug) }))
      .sort((a, b) => b.key - a.key || a.i - b.i)
      .slice(0, limit).map(x => x.c);
    picks.forEach(c => inbound.set(c.slug, inbound.get(c.slug) + 1));
    if (source.slug === post.slug) mine = picks;
  }
  return mine;
}
