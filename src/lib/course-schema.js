import { textContent } from "./seo.js";

// Lessons are arranged individually, so the instance states only what is true
// for every course: live online, 30-minute classes, repeated weekly, sold as
// monthly packages. No start dates, prices or ratings are invented here.
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
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      courseSchedule: { "@type": "Schedule", duration: "PT30M", repeatFrequency: "Weekly" },
    },
    offers: { "@type": "Offer", category: "Subscription", url: new URL("/pricing", siteUrl).href },
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
