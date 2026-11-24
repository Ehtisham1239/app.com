// Academic tuition is a separate CMS category shown on /academic-subjects. These tests pin that it
// never leaks into the Quran course lists, never claims unconfirmed facts, and each subject's
// Book Now opens the trial request with that subject selected.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ACADEMIC_CATEGORY, isAcademicCourse } from "../src/lib/academic.js";
import { courseSchema } from "../src/lib/course-schema.js";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("only category 'academic' counts as academic tuition", () => {
  assert.equal(ACADEMIC_CATEGORY, "academic");
  assert.equal(isAcademicCourse({ category: "academic" }), true);
  for (const category of ["quran", "arabic", "studies", "", undefined]) assert.equal(isAcademicCourse({ category }), false);
  assert.equal(isAcademicCourse(null), false);
});

test("course schema keeps the Quran package facts but claims nothing unconfirmed for academic subjects", () => {
  const base = { slug: "x", title: "X", summary: "A summary." };
  const quran = courseSchema({ ...base, category: "quran" }, "https://example.test");
  assert.equal(quran.hasCourseInstance.courseSchedule.duration, "PT30M");
  assert.equal(quran.offers.category, "Subscription");
  const academic = courseSchema({ ...base, category: "academic" }, "https://example.test");
  assert.equal(academic.hasCourseInstance.courseMode, "Online");
  assert.equal("courseSchedule" in academic.hasCourseInstance, false);
  assert.equal("offers" in academic, false);
  assert.equal(academic["@type"], "Course");
});

test("Quran-facing pages read only Quran courses", () => {
  for (const file of ["src/app/(site)/layout.jsx", "src/app/(site)/page.jsx", "src/app/(site)/learn/page.jsx", "src/app/(site)/courses/page.jsx",
    "src/components/site/location-page.jsx", "src/components/site/cms-page.jsx", "src/app/llms.txt/route.js"]) {
    const source = read(file);
    assert.match(source, /getQuranCourses\(\)/, file);
    assert.doesNotMatch(source, /getCourses\(\)/, `${file} must not list academic subjects`);
  }
  const site = read("src/lib/site-data.js");
  assert.match(site, /getQuranCourses = cache\(async \(\) => \(await getCourses\(\)\)\.filter\(\(course\) => !isAcademicCourse\(course\)\)\)/);
  assert.match(site, /getAcademicCourses = cache\(async \(\) => \(await getCourses\(\)\)\.filter\(isAcademicCourse\)\)/);
});

test("the free-trial form still offers every published course, and detail pages relate like with like", () => {
  assert.match(read("src/app/(site)/free-trial/page.jsx"), /getCourses\(\)/);
  assert.match(read("src/app/(site)/courses/[slug]/page.jsx"), /isAcademicCourse\(c\) === isAcademicCourse\(course\)/);
});

test("academic page: one Book Now per subject opens the form with that subject, and nothing unconfirmed is promised", () => {
  const page = read("src/app/(site)/academic-subjects/page.jsx");
  assert.match(page, /subjects\.map\(\(course\) =>/);
  assert.match(page, /href=\{`\/free-trial\?course=\$\{course\.id\}`\}[^>]*>Book Now</);
  assert.match(page, /if \(!subjects\.length\) notFound\(\)/);
  assert.match(page, /Nothing is booked until admissions confirms it/);
  assert.match(page, /imageOverride=\{ACADEMIC_HERO\}/);
  assert.doesNotMatch(read("src/lib/academic.js").match(/ACADEMIC_HERO = \{[^}]*\}/)[0], /Quran|Islamic/i);
  assert.doesNotMatch(page, /free trial|3[- ]day|7[- ]day|[$£€]\s?\d|USD|per month|\/month/i);
});

test("academic page metadata fits the Bing audit limits", () => {
  const page = read("src/app/(site)/academic-subjects/page.jsx");
  const title = page.match(/title: "([^"]+)", seo_noindex: false/)[1];
  const description = page.match(/description: "([^"]+)"/)[1];
  assert.ok(title.length <= 65, `title is ${title.length}`);
  assert.ok(description.length >= 120 && description.length <= 159, `description is ${description.length}`);
});

test("sitemap lists the hub only once academic subjects are published; the CMS can set the category", () => {
  assert.match(read("src/app/sitemap.js"), /courses\.some\(\(c\) => c\.category === "academic"\) \? \["\/academic-subjects"\] : \[\]/);
  const resources = read("src/lib/admin/resources.js");
  assert.match(resources, /name: "category", label: "Category", type: "select"[\s\S]{0,400}value: "academic", label: "Academic subject"/);
});

test("chatbot facts list academic subjects without promising a trial", () => {
  assert.match(read("src/lib/org-facts.js"), /academic: academic\.map/);
  const full = read("src/app/llms-full.txt/route.js");
  assert.match(full, /Academic tuition \(school and college subjects\)/);
  assert.match(full, /never promise it for an academic subject/);
  assert.match(read("src/app/llms.txt/route.js"), /\/academic-subjects/);
});

test("hub share image is the neutral academic hero, not the default Quran lesson art", () => {
  const page = read("src/app/(site)/academic-subjects/page.jsx");
  assert.match(page, /cover_url: ACADEMIC_HERO\.src, cover_alt: ACADEMIC_HERO\.alt/);
});

test("academic detail pages carry no generic Quran FAQs, trial wording or package links", () => {
  const page = read("src/app/(site)/courses/[slug]/page.jsx");
  assert.match(page, /const generalFaqs = academic \? \[\] : faqs\.filter/);
  assert.match(page, /\{academic \? "Send a request" : "Register for free"\}/);
  assert.match(page, /\{!academic && <section className="surface mt-10 space-y-3 p-6"><h2 className="text-2xl">Plan lessons around your family/);
  assert.match(page, /\{!academic && \(\s*<Link href="\/pricing"/);
});

test("free-trial page does not promise a trial for an academic subject", () => {
  const page = read("src/app/(site)/free-trial/page.jsx");
  assert.match(page, /courses\.filter\(isAcademicCourse\)/);
  assert.match(page, /<TrialHeading plans=\{planList\} academic=\{academic\} \/>/);
  assert.match(page, /<TrialPromises plans=\{planList\} academic=\{academic\}/);
  assert.match(page, /<QuickTrialForm academic=\{academic\}/);
  const intro = read("src/components/site/trial-intro.jsx");
  assert.match(intro, /eligible=\{eligible && !subject\}/);
  assert.match(intro, /Subject request/);
  const form = read("src/components/site/quick-trial-form.jsx");
  assert.match(form, /const eligible = isTrialEligible\(selectedPlan\) && !subject;/);
  assert.match(form, /subject \? "Send my request"/);
});
