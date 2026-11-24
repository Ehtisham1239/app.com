// Academic tuition (school and college subjects) is a separate CMS course category. It stays out of the
// Quran course lists (menu, home, location pages) and is shown on /academic-subjects instead.
export const ACADEMIC_CATEGORY = "academic";
// Neutral online-learning scene (laptop, headphones, book on a stand). The other hero images show
// Quran lessons, so academic pages must not use them.
export const ACADEMIC_HERO = { src: "/images/learning/contact-admissions-desk-v5-1200.webp", alt: "Laptop, headphones and a closed green book on a wooden reading stand in an online learning setup" };
export const isAcademicCourse = (course) => course?.category === ACADEMIC_CATEGORY;
