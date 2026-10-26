import { getCourses, getPosts, getPublishedSlugs } from "@/lib/site-data";
import { shouldIncludeInSitemap } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";

export const dynamic = "force-static";
export const revalidate = 3600;

const label = value => String(value || "").replace(/[\[\]\r\n]/g, " ").trim();
export async function GET() {
  const [courses, posts, published] = await Promise.all([getCourses(), getPosts(50), getPublishedSlugs()]);
  const eligible = (collection, prefix) => new Set(collection.filter(row => shouldIncludeInSitemap(row, `${prefix}/${row.slug}`, SITE_URL)).map(row => row.slug));
  const courseSlugs = eligible(published.courses, "/courses"), postSlugs = eligible(published.posts, "/blog");
  const lines = [
    "# Online Quran College", "",
    "> Live one-to-one online Quran learning for children and adults.", "",
    "The public website describes courses, class fees, trial eligibility and remote lesson scheduling. Location pages describe online service coverage, not physical offices. The coordinator confirms teacher availability and package details.", "",
    "## When to use this website", "",
    "Use these public pages to compare a learner’s starting point with the available Quran courses, understand published package and trial terms, prepare questions for a first lesson, or plan a proposed class time in the learner’s country. Follow the course, article and country links below with ordinary HTTP GET requests. Confirm booking and teacher availability with the coordinator; obtain the learner’s or guardian’s consent before submitting a request.", "",
    "## Start here", "",
    "- [Course comparison](/courses)",
    "- [Fees and packages](/pricing): A three-day free trial is available on eligible plans. The Weekend plan is excluded.",
    "- [Trial request](/free-trial)",
    "- [Countries, cities and time-zone planning](/locations)",
    "- [Learning guides](/learn)",
    "- [About the college](/about)",
    "- [Contact the college](/contact)", "",
    "## Courses", "",
    ...courses.filter(row => courseSlugs.has(row.slug)).map(row => `- [${label(row.title)}](/courses/${encodeURIComponent(row.slug)})`), "",
    "## Learning articles", "",
    ...posts.filter(row => postSlugs.has(row.slug)).map(row => `- [${label(row.title)}](/blog/${encodeURIComponent(row.slug)})`), "",
    "## Further information", "",
    "- [Article RSS feed](/blog/feed.xml)",
    "- [Public sitemap](/sitemap.xml)",
    "- [Privacy and optional analytics](/privacy-policy)",
    "- [Terms and conditions](/terms-and-conditions)",
    "- [Refund policy](/refund-policy)", "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" } });
}
