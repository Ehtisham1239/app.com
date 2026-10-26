const ART = {
  study: { src: "/images/islamic/online-lesson-adult-v1-1200.webp", alt: "A woman studies the Quran at home while a female teacher guides her over a live video lesson" },
  courtyard: { src: "/images/islamic/mosque-courtyard-v1-1200.webp", alt: "An illustrated mosque courtyard with arches and a reflecting pool" },
  library: { src: "/images/islamic/islamic-library-v1-1200.webp", alt: "Islamic study books and a writing desk in an arched library" },
  geometry: { src: "/images/islamic/islamic-geometry-v1-1200.webp", alt: "An illustrated Islamic geometric arch overlooking a peaceful courtyard" },
};

// Wide scene for full-bleed heroes. Sizes live outside the card manifest
// because they run past 1200px.
export const IMMERSIVE_ART = {
  alt: "A boy reads the Quran at his desk while his teacher leads a live online lesson on a laptop",
  width: 2000,
  height: 736,
  src: "/images/hero/online-lesson-child-v1-1600.webp",
  webp: [800, 1200, 1600, 2000].map((w) => ({ url: `/images/hero/online-lesson-child-v1-${w}.webp`, width: w })),
  avif: [800, 1200, 1600, 2000].map((w) => ({ url: `/images/hero/online-lesson-child-v1-${w}.avif`, width: w })),
};

// Editorial illustrations, not photographs of a local college branch, a real
// mosque, or documented students and teachers.
export function heroArt(key = "") {
  if (/contact|trial|teacher|career/.test(key)) return ART.courtyard;
  if (/learn|blog|course|quran|tajweed|hifz|arabic/.test(key)) return ART.library;
  if (/privacy|terms|refund|policy|certificate|faq/.test(key)) return ART.geometry;
  return ART.study;
}
