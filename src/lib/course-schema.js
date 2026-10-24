import { textContent } from "./seo.js";

// These are individually arranged lessons, not scheduled public events. Do not
// emit a partial CourseInstance (an Event) or invent dates, offers or ratings.
export function courseSchema(course, siteUrl, providerName = "Online Quran College") {
  const url = new URL(`/courses/${course.slug}`, siteUrl).href;
  const description = textContent(course.summary || course.description_html || "");
  if (!course.title?.trim() || !description) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${url}#course`,
    url,
    name: course.title,
    description,
    ...(course.cover_url ? { image: new URL(course.cover_url, siteUrl).href } : {}),
    provider: {
      "@type": "EducationalOrganization",
      "@id": new URL("/#organization", siteUrl).href,
      name: providerName,
      url: new URL("/", siteUrl).href,
    },
  };
}

export function courseListSchema(courses, siteUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": new URL("/courses#course-list", siteUrl).href,
    itemListElement: courses.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: new URL(`/courses/${course.slug}`, siteUrl).href,
    })),
  };
}
