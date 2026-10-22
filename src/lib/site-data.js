import { seedFallback } from "@/lib/seed-fallback";
import { cache } from "react";
import { publicDb } from "@/lib/supabase/public";

// Website content loaders. Each returns safe fallbacks if Supabase is unreachable,
// so a page still renders (and is refreshed on the next revalidation).

let schemaUnavailableUntil = 0;
async function safe(query, fallback, label) {
  if (!publicDb || Date.now() < schemaUnavailableUntil) return seedFallback(label, fallback);
  try {
    const { data, error } = await query();
    if (error) {
      if (error.code === "PGRST205") schemaUnavailableUntil = Date.now() + 5000;
      console.error(`[site-data] ${label}:`, error.message);
      return error.code === "PGRST205" ? seedFallback(label, fallback) : fallback;
    }
    return data ?? fallback;
  } catch (err) {
    console.error(`[site-data] ${label}:`, err?.message || err);
    return fallback;
  }
}

export const DEFAULT_SETTINGS = {
  "site.identity": {
    name: "Online Quran College",
    legal_name: "Online Quran College LTD",
    tagline: "Unlock the wisdom of the Quran with our online Quran college. Explore, learn, and grow with us.",
    established: "2018",
    description:
      "Live one-to-one online Quran, Tajweed, Hifz, Arabic and Islamic studies classes for children and adults, with male and female teachers and flexible timings.",
  },
  "site.contact": {
    email: "info@onlinequrancollege.com",
    phone: "+44 7864 710821",
    whatsapp: "447864710821",
    location: "United Kingdom",
    hours: "Classes 24/7 across time zones",
  },
  "site.social": {
    facebook: "https://www.facebook.com/OnlineQuranCollegeLtdUK",
    x: "https://x.com/OnlineQuranClg",
    instagram: "https://www.instagram.com/online_quran_college",
    youtube: "",
    tiktok: "",
  },
  "site.hero": {
    eyebrow: "Live 1-on-1 online Quran classes",
    title: "Empowering minds with online Quranic education",
    subtitle:
      "Professional one-to-one classes for children and adults in Noorani Qaida, Tajweed, Hifz, Arabic and Islamic studies — taught live by male and female teachers at times that suit your family.",
    primary_label: "Book a 7-day free trial",
    secondary_label: "Explore courses",
    badges: ["7-day free trial — no card needed", "Female & male teachers", "Classes in any time zone"],
  },
  "site.stats": [
    { value: "2018", label: "Teaching since" },
    { value: "600+", label: "Students learning" },
    { value: "1-on-1", label: "Live classes" },
    { value: "24/7", label: "Flexible timings" },
  ],
  "site.benefits": [
    { icon: "badge-percent", title: "Affordable fees", text: "Simple monthly packages with a 15% discount for additional siblings." },
    { icon: "heart-handshake", title: "Female tutors available", text: "Female teachers for children and sisters, for comfort and privacy." },
    { icon: "languages", title: "Multilingual teachers", text: "Lessons in English, Urdu, Arabic and other languages." },
    { icon: "calendar-clock", title: "Your schedule, your pace", text: "Choose class length, days and focus — pacing adjusted to each student." },
    { icon: "award", title: "Certificates", text: "Formal certificates after final assessments." },
    { icon: "headset", title: "Always-on support", text: "Coordinators help with rescheduling and make-up classes." },
  ],
  "site.steps": [
    { title: "Book a free trial", text: "Fill in the short form, choose a course and tell us when you are free. We arrange your trial within 24 hours." },
    { title: "Choose your plan", text: "After the trial, a coordinator agrees timings, teacher preference and a monthly package with you." },
    { title: "Start regular classes", text: "Meet your teacher live online on your chosen days and track progress every month." },
  ],
  "site.announcement": { enabled: true, text: "7 days of free classes — no credit card required.", link_label: "Book now", link: "/free-trial" },
  "site.forms": {
    consent_version: "2026-10-13",
    consent_text:
      "I agree that Online Quran College may contact me by email, phone or WhatsApp about this request and store my details as described in the privacy policy.",
    trial_success: "JazakAllah khair! Your free-trial request is in. Our team will contact you within 24 hours to arrange your class.",
    contact_success: "Thank you — your message has reached our team. We usually reply within one working day.",
  },
  "site.seo": {
    title: "Online Quran College — Live 1-on-1 Online Quran Classes",
    description:
      "Learn Quran online with live one-to-one classes: Noorani Qaida, Tajweed, Hifz, Arabic and Islamic studies for kids and adults. Female & male teachers. 7-day free trial.",
  },
};

export const getSettings = cache(async () => {
  const rows = await safe(() => publicDb.from("settings").select("key, value").eq("is_public", true), [], "settings");
  const merged = { ...DEFAULT_SETTINGS };
  for (const row of rows) merged[row.key] = row.value;
  return merged;
});

const DEFAULT_MENUS = {
  header: [
    { label: "Home", href: "/" },
    { label: "Courses", href: "/courses" },
    { label: "Fees", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ],
  footer_courses: [],
  footer_company: [
    { label: "About us", href: "/about" },
    { label: "Fees & packages", href: "/pricing" },
    { label: "Blog", href: "/blog" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ],
  footer_legal: [
    { label: "Privacy policy", href: "/privacy-policy" },
    { label: "Terms & conditions", href: "/terms-and-conditions" },
    { label: "Refund policy", href: "/refund-policy" },
  ],
};

export const getMenus = cache(async () => {
  const rows = await safe(() =>
    publicDb.from("menu_items").select("id, menu, label, href, parent_id, sort_order, opens_new_tab").order("sort_order"),
    null,
    "menus",
  );
  if (!rows || rows.length === 0) return DEFAULT_MENUS;
  const menus = { header: [], footer_courses: [], footer_company: [], footer_legal: [] };
  for (const item of rows) if (!item.parent_id && menus[item.menu]) menus[item.menu].push(item);
  return menus;
});

const COURSE_FIELDS =
  "id, slug, title, arabic_title, summary, age_group, level, duration_text, category, icon, cover_url, is_featured, sort_order";

export const getCourses = cache(async () =>
  safe(() =>
    publicDb.from("courses").select(COURSE_FIELDS).eq("status", "published").is("deleted_at", null).order("sort_order"),
    [],
    "courses",
  ),
);

export const getCourse = cache(async (slug) => {
  const course = await safe(() =>
    publicDb
      .from("courses")
      .select(`${COURSE_FIELDS}, description_html, outcomes, seo_title, seo_description, seo_noindex, seo_focus_keyword, canonical_url, course_modules(id, title, objectives, topics, sort_order)`)
      .eq("slug", slug)
      .eq("status", "published")
      .is("deleted_at", null)
      .maybeSingle(),
    null,
    `course ${slug}`,
  );
  if (course?.course_modules) course.course_modules.sort((a, b) => a.sort_order - b.sort_order);
  return course;
});

export const getPlans = cache(async () => {
  const plans = await safe(() =>
    publicDb
      .from("pricing_plans")
      .select("id, name, tagline, course_type, billing_period, classes_per_week, duration_min, trial_days, features, is_featured, sort_order, course_id, pricing_plan_prices(currency, amount_minor)")
      .eq("status", "published")
      .eq("is_public", true)
      .is("deleted_at", null)
      .order("sort_order"),
    [],
    "plans",
  );
  return plans.map((p) => ({ ...p, prices: p.pricing_plan_prices ?? [] }));
});

export const getFaqs = cache(async () =>
  safe(() => publicDb.from("faqs").select("id, question, answer, category, course_id, sort_order").eq("status", "published").order("sort_order"), [], "faqs"),
);

export const getTestimonials = cache(async () =>
  safe(() =>
    publicDb.from("testimonials").select("id, name, relation, country, quote, rating, avatar_url, sort_order").eq("status", "published").order("sort_order"),
    [],
    "testimonials",
  ),
);

const TEACHER_FIELDS = "id, slug, display_name, headline, gender, bio, qualifications, languages, specialties, years_experience, photo_url, sort_order";

export const getTeachers = cache(async () =>
  safe(() =>
    publicDb.from("teachers").select(TEACHER_FIELDS).eq("is_public", true).eq("is_active", true).is("deleted_at", null).order("sort_order"),
    [],
    "teachers",
  ),
);

export const getTeacher = cache(async (slug) =>
  safe(() =>
    publicDb.from("teachers").select(TEACHER_FIELDS).eq("slug", slug).eq("is_public", true).eq("is_active", true).is("deleted_at", null).maybeSingle(),
    null,
    `teacher ${slug}`,
  ),
);

const POST_FIELDS = "id, slug, title, excerpt, cover_url, category, tags, author_name, reading_minutes, published_at, updated_at";

export const getPosts = cache(async (limit = 50) =>
  safe(() =>
    publicDb.from("blog_posts").select(POST_FIELDS).eq("status", "published").is("deleted_at", null).order("published_at", { ascending: false }).limit(limit),
    [],
    "posts",
  ),
);

export const getPost = cache(async (slug) =>
  safe(() =>
    publicDb
      .from("blog_posts")
      .select(`${POST_FIELDS}, body_html, seo_title, seo_description, seo_noindex, seo_focus_keyword, canonical_url`)
      .eq("slug", slug)
      .eq("status", "published")
      .is("deleted_at", null)
      .maybeSingle(),
    null,
    `post ${slug}`,
  ),
);

export const getPage = cache(async (slug) =>
  safe(() =>
    publicDb
      .from("pages")
      .select("id, slug, title, excerpt, template, body_html, cover_url, seo_title, seo_description, canonical_url, seo_noindex, seo_focus_keyword, updated_at, page_sections(id, type, data, sort_order)")
      .eq("slug", slug)
      .eq("locale", "en")
      .eq("status", "published")
      .is("deleted_at", null)
      .maybeSingle(),
    null,
    `page ${slug}`,
  ),
);

export const getPublishedSlugs = cache(async () => {
  const [courses, posts, pages, teachers] = await Promise.all([
    safe(() => publicDb.from("courses").select("slug, updated_at, seo_noindex, canonical_url").eq("status", "published").is("deleted_at", null), [], "slugs courses"),
    safe(() => publicDb.from("blog_posts").select("slug, updated_at, seo_noindex, canonical_url").eq("status", "published").is("deleted_at", null), [], "slugs posts"),
    safe(() => publicDb.from("pages").select("slug, updated_at, seo_noindex, canonical_url").eq("status", "published").is("deleted_at", null), [], "slugs pages"),
    safe(() => publicDb.from("teachers").select("slug, updated_at").eq("is_public", true).eq("is_active", true).is("deleted_at", null), [], "slugs teachers"),
  ]);
  return { courses, posts, pages, teachers };
});

export const getRedirect = cache(async (path) =>
  safe(() => publicDb.from("redirects").select("to_path, status_code").eq("from_path", path).maybeSingle(), null, "redirect"),
);
