const ART = {
  firstTrial: { src: "/images/learning/blog-first-trial-r2-1200.webp", alt: "A parent and child greeting an online teacher on a laptop before a lesson" },
  pricing: { src: "/images/learning/blog-enrolment-questions-r2-1200.webp", alt: "A parent planning lessons with a notebook, calendar and laptop" },
  practice: { src: "/images/learning/blog-feedback-practice-r2-1200.webp", alt: "A teenage learner taking notes beside a laptop while listening to lesson feedback" },
  contact: { src: "/images/learning/oqc-contact-editorial-v1-1200.webp", alt: "Illustrative scene of a woman using a headset and laptop at a sunlit admissions desk" },
  blog: { src: "/images/learning/oqc-blog-editorial-v1-1200.webp", alt: "A woman taking Quran study notes beside a book on a wooden stand" },
  maleLesson: { src: "/images/learning/online-lesson-male-v4-1200.webp", alt: "Illustrative scene of a boy reading at home with a male Quran teacher guiding him over a laptop video call" },
  femaleLesson: { src: "/images/learning/online-lesson-female-v4-1200.webp", alt: "Illustrative scene of a girl following her lesson at home with a female Quran teacher on a laptop video call" },
  study: { src: "/images/islamic/online-lesson-adult-v1-1200.webp", alt: "A woman studies the Quran at home while a female teacher guides her over a live video lesson" },
  courtyard: { src: "/images/islamic/mosque-courtyard-v1-1200.webp", alt: "An illustrated mosque courtyard with arches and a reflecting pool" },
  library: { src: "/images/islamic/islamic-library-v1-1200.webp", alt: "Islamic study books and a writing desk in an arched library" },
  geometry: { src: "/images/islamic/islamic-geometry-v1-1200.webp", alt: "An illustrated Islamic geometric arch overlooking a peaceful courtyard" },
};

// Wide scene for full-bleed heroes. Sizes live outside the card manifest
// because they run past 1200px.
export const IMMERSIVE_ART = {
  alt: ART.maleLesson.alt,
  width: 2000,
  height: 1333,
  src: "/images/learning/online-lesson-male-v4-1600.webp",
  webp: [800, 1200, 1600, 2000].map((w) => ({ url: `/images/learning/online-lesson-male-v4-${w}.webp`, width: w })),
  avif: [800, 1200, 1600, 2000].map((w) => ({ url: `/images/learning/online-lesson-male-v4-${w}.avif`, width: w })),
};

// Editorial illustrations, not photographs of a local college branch, a real
// mosque, or documented students and teachers.
export function heroArt(key = "") {
  if (/contact/.test(key)) return ART.contact;
  if (/^\/blog(?:\?|$)/.test(key)) return ART.blog;
  if (/trial/.test(key)) return ART.firstTrial;
  if (/pricing/.test(key)) return ART.pricing;
  if (/faq/.test(key)) return ART.practice;
  if (/teacher|career/.test(key)) return ART.femaleLesson;
  if (/learn|blog|course|quran|tajweed|hifz|arabic|faq|locations/.test(key)) return { ...ART.maleLesson, immersive: IMMERSIVE_ART };
  if (/privacy|terms|refund|policy|certificate|faq/.test(key)) return ART.geometry;
  return ART.study;
}
