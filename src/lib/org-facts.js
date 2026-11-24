import { getAcademicCourses, getQuranCourses, getFaqs, getPlans, getPublishedSlugs, getSettings, getTeachers } from "@/lib/site-data";
import { shouldIncludeInSitemap } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";
import { INDEXED_MARKETS, getLocation, locationPath } from "@/lib/locations";

// One source of truth for the college's complete public facts. /llms-full.txt (for assistants) and
// /at-a-glance (for people) both read it, so they never disagree. Only data the public pages already show.
const clean = value => String(value ?? "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const text = value => clean(value);

export async function organizationFacts() {
  const [settings, courses, academic, plans, faqs, teachers, published] = await Promise.all([getSettings(), getQuranCourses(), getAcademicCourses(), getPlans(), getFaqs(), getTeachers(), getPublishedSlugs()]);
  const liveCourses = new Set(published.courses.filter(row => shouldIncludeInSitemap(row, `/courses/${row.slug}`, SITE_URL)).map(row => row.slug));
  const identity = settings["site.identity"] || {}, contact = settings["site.contact"] || {}, hero = settings["site.hero"] || {};
  const family = settings["site.family_discount"];
  return {
    name: text(identity.name) || "Online Quran College",
    legalName: text(identity.legal_name),
    tagline: text(identity.tagline),
    description: text(identity.description),
    headline: text(hero.title),
    contact: { email: text(contact.email), phone: text(contact.phone), whatsapp: /^\d{8,15}$/.test(String(contact.whatsapp || "")) ? String(contact.whatsapp) : "", hours: text(contact.hours), base: text(contact.location) },
    steps: (settings["site.steps"] || []).map(s => ({ title: text(s.title), text: text(s.text) })).filter(s => s.title),
    benefits: (settings["site.benefits"] || []).map(b => ({ title: text(b.title), text: text(b.text) })).filter(b => b.title),
    familyDiscount: family?.enabled && Number(family?.percent) > 0 ? Number(family.percent) : 0,
    courses: courses.filter(row => liveCourses.has(row.slug)).map(row => ({ title: text(row.title), path: `/courses/${encodeURIComponent(row.slug)}`, summary: text(row.summary), age: text(row.age_group), level: text(row.level), duration: text(row.duration_text) })),
    // Academic tuition: published subjects only; fees, tutors and trial eligibility are confirmed by admissions.
    academic: academic.map(row => ({ title: text(row.title), summary: text(row.summary) })).filter(row => row.title),
    plans: plans.map(p => ({ name: text(p.name), tagline: text(p.tagline), type: text(p.course_type), period: text(p.billing_period), perWeek: p.classes_per_week, minutes: p.duration_min, trialDays: p.trial_days, features: (p.features || []).map(text).filter(Boolean), prices: (p.prices || []).filter(x => /^[A-Z]{3}$/.test(x.currency || "") && Number(x.amount_minor) > 0).map(x => ({ currency: x.currency, minor: Number(x.amount_minor) })) })),
    teachers: teachers.map(t => ({ name: text(t.display_name), path: `/teachers/${encodeURIComponent(t.slug)}`, headline: text(t.headline), gender: text(t.gender), languages: (t.languages || []).map(text).filter(Boolean), specialties: (t.specialties || []).map(text).filter(Boolean), years: t.years_experience })),
    faqs: faqs.map(f => ({ question: text(f.question), answer: text(f.answer) })).filter(f => f.question && f.answer),
    markets: INDEXED_MARKETS.map(getLocation).filter(Boolean).map(c => ({ name: text(c.name), path: locationPath(c) })),
  };
}
