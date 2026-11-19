import { getCourses, getFaqs, getPublishedSlugs } from "@/lib/site-data";
import { shouldIncludeInSitemap } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";

export const dynamic = "force-static";
export const revalidate = 3600;

// Full-text companion to /llms.txt: the college's own published answers in one plain file, so an
// assistant can quote them without crawling every page. Only text already shown on public pages.
const clean = value => String(value ?? "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

export async function GET() {
  const [courses, faqs, published] = await Promise.all([getCourses(), getFaqs(), getPublishedSlugs()]);
  const live = new Set(published.courses.filter(row => shouldIncludeInSitemap(row, `/courses/${row.slug}`, SITE_URL)).map(row => row.slug));
  const lines = [
    "# Online Quran College: full text", "",
    "> Live one-to-one online Quran learning for children and adults. Index of pages: /llms.txt", "",
    "Everything below repeats what the public pages already state. The coordinator confirms teacher availability, the lesson time and the fee and payment currency before enrolment. Location pages describe online coverage, not physical offices.", "",
    "## Courses", "",
    ...courses.filter(row => live.has(row.slug)).flatMap(row => [
      `### [${clean(row.title)}](/courses/${encodeURIComponent(row.slug)})`,
      clean(row.summary),
      [row.age_group && `Learners: ${clean(row.age_group)}`, row.level && `Level: ${clean(row.level)}`, row.duration_text && `Duration: ${clean(row.duration_text)}`].filter(Boolean).join(". "),
      "",
    ]),
    "## Frequently asked questions", "",
    ...faqs.flatMap(row => [`### ${clean(row.question)}`, clean(row.answer), ""]),
    "## Where to act", "",
    "- [Request the free trial](/free-trial)",
    "- [Fees and packages](/pricing)",
    "- [Contact the college](/contact)", "",
  ].filter((line, i, all) => !(line === "" && all[i - 1] === ""));
  const body = lines.join("\n").replaceAll("](/", `](${SITE_URL}/`);
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" } });
}
