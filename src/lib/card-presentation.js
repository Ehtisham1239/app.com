const covers = {
  "noorani-qaida": {
    "src": "/images/learning/noorani-qaida-child-r2-1200.webp",
    "alt": "Child practising beginner Arabic letters in a Qaida workbook with a parent"
  },
  "quran-nazara": {
    "src": "/images/learning/quran-recitation-hifz-r2-1200.webp",
    "alt": "Student reviewing recitation from an open book on a wooden book stand"
  },
  "hifz-quran": {
    "src": "/images/learning/course-hifz-memory-r2-1200.webp",
    "alt": "Teenage learner listening on headphones while reviewing an open book on a wooden stand"
  },
  "arabic-language": {
    "src": "/images/learning/adult-arabic-learning-r2-1200.webp",
    "alt": "Adult learner attending an online language lesson with a laptop and notebook"
  },
  "quran-translation": {
    "src": "/images/learning/translation-study-r2-1200.webp",
    "alt": "Adult learner comparing open books and taking translation study notes"
  },
  "hadith-translation": {
    "src": "/images/learning/course-islamic-studies-r2-1200.webp",
    "alt": "Mother and daughter discussing an Islamic studies activity beside a tablet and a green book"
  }
};
export function cardTone(key = "") { return String(key).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % 6; }
export function courseVisual(course) { const fallback = covers[course.slug] || { src: "/images/islamic/islamic-library-v1-1200.webp", alt: "Islamic study books and a writing desk in an arched library" }; return { src: course.cover_url?.trim() || fallback.src, alt: course.cover_alt?.trim() || fallback.alt }; }
