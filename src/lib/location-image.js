export function locationImage(country, city) {
  const australia = country.slug === "australia";
  return { url: `/images/learning/${australia ? "australia-online-quran-learning" : "usa-online-quran-learning"}-1200.webp`,
    alt: australia ? "Young learner studying an Arabic workbook beside a laptop in a bright home study" : "Child and parent reviewing a beginner Arabic workbook beside a laptop at home" };
}
