export const LEARNING_GUIDES = [
  { slug: "learning-tajweed", topic: "tajweed", path: "/courses/tajweed", title: "Learning Quran with Tajweed", course: "quran-nazara", audience: "Recitation" },
  { slug: "learning-quran-for-kids", topic: "quran-for-kids", path: "/learn/quran-for-kids", title: "Online Quran Learning for Kids", course: "noorani-qaida", audience: "Parents" },
  { slug: "learning-quran-for-adults", topic: "quran-for-adults", path: "/learn/quran-for-adults", title: "Quran Learning for Adult Beginners", course: "noorani-qaida", audience: "Adults" },
  { slug: "learning-islamic-studies-for-kids", topic: "islamic-studies-for-kids", path: "/learn/islamic-studies-for-kids", title: "Islamic Learning for Children", course: "hadith-translation", audience: "Parents" },
];
export const guideForSlug = (slug) => LEARNING_GUIDES.find((guide) => guide.slug === slug);
