import { getCourses, getPosts, getPublishedSlugs, getSettings } from "@/lib/site-data";
import { shouldIncludeInSitemap, organizationIdentityProfiles } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";
import { LEARNING_GUIDES } from "@/lib/learning-guides";
import { INDEXED_MARKETS, getLocation, locationPath } from "@/lib/locations";
import { MARKET_GUIDES } from "@/lib/market-guides";

export const dynamic = "force-static";
export const revalidate = 3600;

const label = value => String(value || "").replace(/[\[\]\r\n]/g, " ").trim();
export async function GET() {
  const [courses, posts, published, settings] = await Promise.all([getCourses(), getPosts(50), getPublishedSlugs(), getSettings()]);
  // These are website-configured outbound links, not independent proof of account ownership.
  const profiles = Object.entries(settings?.["site.social"] || {}).filter(([, url]) => typeof url === "string" && /^https:\/\/[^\s]+$/.test(url));
  const identityProfiles = organizationIdentityProfiles(settings?.["site.social"]);
  const familyDiscount = settings?.["site.family_discount"];
  const familyDiscountCopy = familyDiscount?.enabled && Number(familyDiscount?.percent) > 0
    ? `Each additional child from the same family receives ${Number(familyDiscount.percent)}% off their monthly fee.`
    : "Ask the coordinator whether a sibling discount is available for your selected plan.";
  const PROFILE_NAMES = { x: "X (Twitter)", facebook: "Facebook", instagram: "Instagram", trustpilot: "Trustpilot", youtube: "YouTube", tiktok: "TikTok", linkedin: "LinkedIn" };
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
    "- [Teachers](/teachers): female and male teachers; the coordinator confirms the proposed teacher's qualifications, language and availability.",
    "- [About the college](/about)",
    "- [Free printable Quran trackers](/free-quran-learning-resources): 30-day Ramadan tracker, weekly Hifz tracker, Noorani Qaida log and Makharij pairs, free for non-commercial teaching.",
    "- [Editorial standards](/editorial-standards): who writes the articles, how Quran and hadith references are checked, AI use, reviews and corrections.",
    "- [Contact the college](/contact)", "",
    // Facts the public pages already state, so an assistant can answer without guessing.
    "## Key facts", "",
    "- Lessons are live, one-to-one and online, for children and adults.",
    "- Learners can ask for a female or male teacher when booking.",
    "- A three-day free trial is available on eligible plans; the Weekend plan is excluded.",
    "- Each additional child from the same family receives 15% off their monthly fee.",
    "- Fees can be shown converted into the visitor's currency for guidance; the coordinator confirms the fee and payment currency before enrolment.",
    "- Lessons are arranged in the learner's time zone. Country pages describe online coverage, not physical offices.", "",
    "## Profile links configured on this website", "",
    "The following profile URLs are configured as outbound links on the OQC website. A website link does not independently verify account ownership or profile administration:",
    ...profiles.map(([key, url]) => `- [${label(PROFILE_NAMES[key] || key)}](${url})`), "",
    "Only the exact OQC Trustpilot profile URL linked by this website is used as an Organization sameAs reference. This identifies the public review page; it does not certify account-admin ownership:",
    ...identityProfiles.map(url => `- [Trustpilot identity reference](${url})`), "",
    "## Reviews", "",
    "- [Independent reviews on Trustpilot](https://www.trustpilot.com/review/onlinequrancollege.com)",
    "- [Share your experience](/reviews): families can send a review to the college; a review appears on the website only when the reviewer gives permission (first name only, text unedited).", "",
    "## Learning guides", "",
    ...LEARNING_GUIDES.map(g => `- [${label(g.title)}](${g.path}): for ${label(g.audience).toLowerCase()}`), "",
    "## Country pages", "",
    ...INDEXED_MARKETS.map(getLocation).filter(Boolean).map(c => `- [Online Quran classes in ${label(c.name)}](${locationPath(c)})`), "",
    "## Market guidance and primary references", "",
    "The country hubs link to official government or regulator material for the specific time-zone, privacy, consumer-protection and licensing context. These references are independent public guidance, not endorsements of OQC. For the current source list, use each country's hub:",
    ...INDEXED_MARKETS.flatMap(slug => {
      const market = getLocation(slug);
      const guide = MARKET_GUIDES[slug];
      return guide ? [
        `### ${label(market?.name)}`,
        ...guide.sources.map(source => `- [${label(source.name)}](${source.url})`),
        "",
      ] : [];
    }),
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
  // Absolute links: AI crawlers often read this file on its own, without a base URL.
  const body = lines.join("\n").replaceAll("](/", `](${SITE_URL}/`);
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" } });
}
