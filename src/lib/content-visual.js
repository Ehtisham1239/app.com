const covers = {
  "choose-online-quran-classes-kids": {"src":"/images/blog-20261028/choose-online-quran-classes-kids-1200.webp","alt":"Mother and daughter reviewing a lesson checklist beside a laptop at a sunlit home desk"},
  "noorani-qaida-home-practice-checklist": {"src":"/images/blog-20261028/noorani-qaida-home-practice-checklist-1200.webp","alt":"Mother supporting a child with simple learning shapes beside a blank practice notebook"},
  "returning-to-quran-study-adults": {"src":"/images/blog-20261028/returning-to-quran-study-adults-1200.webp","alt":"Adult learner planning a return to study beside a laptop, notebook and wooden book stand"},
  "family-quran-learning-weekly-routine": {"src":"/images/blog-20261028/family-quran-learning-weekly-routine-1200.webp","alt":"Family arranging blank weekly planning cards on a table beside a laptop and study book"},
  "online-quran-class-fees-uk-comparison": {"src":"/images/blog-20261028/online-quran-class-fees-uk-comparison-1200.webp","alt":"Woman comparing lesson options with a blank checklist and calculator at a quiet home desk"},
  "help-your-kids-learn-quran-online": {
    "src": "/images/learning/blog-kids-learning-r2-1200.webp",
    "alt": "Father helping his daughter adjust her headset before an online lesson"
  },
  "importance-of-reciting-quran-with-tajweed": {
    "src": "/images/learning/blog-tajweed-recitation-r2-1200.webp",
    "alt": "Adult learner practising recitation beside a desktop microphone and an open book"
  },
  "memorization-techniques-for-beginners": {
    "src": "/images/learning/blog-memory-techniques-r2-1200.webp",
    "alt": "Revision notebook, flashcards, timer and closed book arranged for a memorisation routine"
  },
  "quran-translation-and-arabic-difference": {
    "src": "/images/learning/blog-translation-arabic-r2-1200.webp",
    "alt": "Adult learner reviewing an open reference book and taking notes beside a laptop"
  },
  "online-quran-lesson-setup-accessibility": {
    "src": "/images/learning/blog-accessible-setup-r2-1200.webp",
    "alt": "Learner wearing headphones at a bright organised desk with a raised laptop, notebook and reading lamp"
  },
  "parent-teacher-quran-progress-review": {
    "src": "/images/learning/blog-parent-progress-r2-1200.webp",
    "alt": "Mother discussing a lesson on a laptop while taking progress notes beside her child"
  },
  "family-quran-learning-multiple-children": {
    "src": "/images/learning/blog-family-siblings-r2-1200.webp",
    "alt": "Two siblings using separate study spaces with a parent helping the younger learner"
  },
  "choose-online-quran-teacher-usa": {
    "src": "/images/learning/blog-usa-teacher-r2-1200.webp",
    "alt": "Parent reviewing online lesson options with a laptop and a checklist at a home desk"
  },
  "quran-lessons-australia-time-zones": {
    "src": "/images/learning/blog-australia-schedule-r2-1200.webp",
    "alt": "Sunlit study desk with a clock, weekly planner and laptop for scheduling online lessons"
  },
  "noorani-qaida-or-quran-reading": {
    "src": "/images/learning/blog-qaida-reading-r2-1200.webp",
    "alt": "Child following beginner letters in a workbook beside a closed book on a wooden stand"
  },
  "adult-quran-beginner-first-month": {
    "src": "/images/learning/blog-adult-beginner-r2-1200.webp",
    "alt": "Adult beginner in a sage hijab studying a workbook during an online lesson at home"
  },
  "prepare-child-first-online-quran-trial": {
    "src": "/images/learning/blog-first-trial-r2-1200.webp",
    "alt": "Mother and child greeting an online teacher on a laptop at the start of a lesson"
  },
  "tajweed-practice-with-feedback": {
    "src": "/images/learning/blog-feedback-practice-r2-1200.webp",
    "alt": "Teenage learner listening to feedback on headphones and taking notes beside a laptop"
  },
  "hifz-revision-with-school": {
    "src": "/images/learning/blog-school-hifz-r2-1200.webp",
    "alt": "School backpack, revision planner and book stand arranged for balancing study and memorisation"
  },
  "questions-before-quran-course-enrolment": {
    "src": "/images/learning/blog-enrolment-questions-r2-1200.webp",
    "alt": "Parent preparing an enrolment checklist beside a laptop, calendar and notebook"
  },
  "learning-tajweed": {
    "src": "/images/learning/guide-tajweed-r2-1200.webp",
    "alt": "Adult learner listening carefully during a recitation lesson with a book stand and microphone"
  },
  "learning-quran-for-kids": {
    "src": "/images/learning/guide-kids-r2-1200.webp",
    "alt": "Young girl arranging beginner alphabet pieces beside a workbook with her mother nearby"
  },
  "learning-quran-for-adults": {
    "src": "/images/learning/guide-adults-r2-1200.webp",
    "alt": "Mature learner wearing reading glasses studying a beginner workbook beside a laptop"
  },
  "learning-islamic-studies-for-kids": {
    "src": "/images/learning/guide-islamic-values-r2-1200.webp",
    "alt": "Mother and young son watering a small indoor plant together as a lesson in kindness"
  }
};
export function contentVisual(record) { const fallback = covers[record.slug] || { src: "/images/islamic/islamic-library-v1-1200.webp", alt: "Islamic study books and a writing desk in an arched library" }; return { src: record.cover_url?.trim() || fallback.src, alt: record.cover_alt?.trim() || fallback.alt }; }
