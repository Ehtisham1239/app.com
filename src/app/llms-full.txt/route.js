import { organizationFacts } from "@/lib/org-facts";
import { SITE_URL } from "@/lib/config";

export const dynamic = "force-static";
export const revalidate = 3600;

// Full-text companion to /llms.txt: the college's complete public facts in one plain file, so an
// assistant can answer without crawling every page. Only text the public pages already show.
const rule = "----------------------------------------------------------------";
export async function GET() {
  const f = await organizationFacts();
  const c = f.contact;
  const lines = [
    `# ${f.name}: complete information`, "",
    `> ${f.description || "Live one-to-one online Quran learning for children and adults."}`, "",
    `Page index: /llms.txt · The same facts for people: /at-a-glance`, "",
    rule, "## 1. Who we are", rule, "",
    `- Name: ${f.name}${f.legalName ? ` (${f.legalName})` : ""}`,
    f.headline && `- What we do: ${f.headline}`,
    f.tagline && `- Tagline: ${f.tagline}`,
    c.base && `- Based in: ${c.base}. Classes are online; no local office or branch is claimed for any country page.`,
    "- Website: /", "",
    rule, "## 2. Contact", rule, "",
    c.email && `- Email: ${c.email}`, c.phone && `- Phone: ${c.phone}`, c.whatsapp && `- WhatsApp: https://wa.me/${c.whatsapp}`, c.hours && `- Class slots: ${c.hours}`,
    "- Contact form: /contact", "- Free trial request: /free-trial", "",
    rule, "## 3. How it works", rule, "",
    ...f.steps.map((s, i) => `${i + 1}. ${s.title}: ${s.text}`), "",
    rule, "## 4. Why families choose us", rule, "",
    ...f.benefits.map(b => `- ${b.title}: ${b.text}`),
    f.familyDiscount ? `- Each additional child from the same family receives ${f.familyDiscount}% off the monthly fee.` : "", "",
    rule, "## 5. Courses", rule, "",
    ...f.courses.flatMap(row => [`### [${row.title}](${row.path})`, row.summary, [row.age && `Learners: ${row.age}`, row.level && `Level: ${row.level}`, row.duration && `Duration: ${row.duration}`].filter(Boolean).join(". "), ""]),
    rule, "## 6. Packages and free trial", rule, "",
    "- A 3-day free trial is available; the Weekend plan is excluded. No card is needed to request it.",
    "- Fees are shown on /pricing and can be converted into the visitor's currency for guidance. The coordinator confirms the fee and payment currency before enrolment.", "",
    ...f.plans.flatMap(p => [`### ${p.name}${p.tagline ? `: ${p.tagline}` : ""}`, [p.type, p.perWeek && `${p.perWeek} classes a week`, p.minutes && `${p.minutes}-minute one-to-one classes`, p.period && `billed ${p.period}`].filter(Boolean).join(", "), ...p.features.map(x => `- ${x}`), ""]),
    rule, "## 7. Teachers", rule, "",
    "Families can share a teacher preference (for example a female teacher); Admissions confirms availability for the course, language and time.", "",
    ...f.teachers.map(t => `- [${t.name}](${t.path})${t.headline ? `: ${t.headline}` : ""}${t.languages.length ? `. Languages: ${t.languages.join(", ")}` : ""}${t.years ? `. ${t.years} years' experience` : ""}`), "",
    rule, "## 8. Countries served online", rule, "",
    ...f.markets.map(m => `- [Online Quran classes in ${m.name}](${m.path})`), "- All countries and cities: /locations", "",
    rule, "## 9. Frequently asked questions", rule, "",
    ...f.faqs.flatMap(q => [`### ${q.question}`, q.answer, ""]),
    rule, "## 10. Policies and trust", rule, "",
    "- [Editorial standards](/editorial-standards)", "- [Refund policy](/refund-policy)", "- [Terms and conditions](/terms-and-conditions)", "- [Privacy policy](/privacy-policy)", "- [Independent reviews on Trustpilot](https://www.trustpilot.com/review/onlinequrancollege.com)", "",
  ].filter(line => line !== false && line !== undefined && line !== null && line !== 0).filter((line, i, all) => !(line === "" && all[i - 1] === ""));
  const body = lines.join("\n").replaceAll("](/", `](${SITE_URL}/`).replace("Page index: /llms.txt · The same facts for people: /at-a-glance", `Page index: ${SITE_URL}/llms.txt · The same facts for people: ${SITE_URL}/at-a-glance`).replace("- Website: /", `- Website: ${SITE_URL}/`);
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" } });
}
