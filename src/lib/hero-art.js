const ART = {
  study: { src: "/images/islamic/quran-study-v1-1200.webp", alt: "A closed Quran on a wooden stand beside an arched window" },
  courtyard: { src: "/images/islamic/mosque-courtyard-v1-1200.webp", alt: "An illustrated mosque courtyard with arches and a reflecting pool" },
  library: { src: "/images/islamic/islamic-library-v1-1200.webp", alt: "Islamic study books and a writing desk in an arched library" },
  geometry: { src: "/images/islamic/islamic-geometry-v1-1200.webp", alt: "An illustrated Islamic geometric arch overlooking a peaceful courtyard" },
};

// Editorial illustrations, not photographs of a local college branch or a real mosque.
export function heroArt(key = "") {
  if (/contact|trial|teacher|career/.test(key)) return ART.courtyard;
  if (/learn|blog|course|quran|tajweed|hifz|arabic/.test(key)) return ART.library;
  if (/privacy|terms|refund|policy|certificate|faq/.test(key)) return ART.geometry;
  return ART.study;
}
