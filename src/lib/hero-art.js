const ART = {
  contact: { src: "/images/learning/contact-learning-desk-v4-1200.webp", alt: "Illustration of an online learning desk with a laptop, headset and closed book on a wooden reading stand" },
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
  if (/trial|pricing|teacher|career/.test(key)) return ART.femaleLesson;
  if (/learn|blog|course|quran|tajweed|hifz|arabic|faq|locations/.test(key)) return { ...ART.maleLesson, immersive: IMMERSIVE_ART };
  if (/privacy|terms|refund|policy|certificate|faq/.test(key)) return ART.geometry;
  return ART.study;
}
