import { DEFAULT_SETTINGS } from "@/lib/default-settings";
import { seedFallback } from "@/lib/seed-fallback";
import { cache } from "react";
import { publicDb } from "@/lib/supabase/public";
import { readContentQuery } from "@/lib/content-query";

// Successful queries, including empty/unpublished results, are authoritative.
// During a backend outage ISR retains its last successful page; do not cache a
// timeout as an empty listing/404 or resurrect deleted content from old seeds.

let schemaUnavailableUntil = 0;
async function safe(query, fallback, label, limit) {
  const seeded = () => {
    const rows = seedFallback(label, fallback);
    return Array.isArray(rows) && limit ? rows.slice(0, limit) : rows;
  };
  if (!publicDb || Date.now() < schemaUnavailableUntil) return seeded();
  try {
    return await readContentQuery(query, {
      fallback, label,
      schemaFallback: seeded,
      onSchemaMissing: () => { schemaUnavailableUntil = Date.now() + 5000; },
    });
  } catch (err) {
    console.error(`[site-data] ${label}:`, err?.message || err);
    throw err;
  }
}

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
  "id, slug, title, arabic_title, summary, age_group, level, duration_text, category, icon, cover_url, cover_alt, is_featured, sort_order";

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

const POST_FIELDS = "id, slug, title, excerpt, cover_url, cover_alt, category, tags, author_name, reading_minutes, published_at, updated_at";

export const getPosts = cache(async (limit = 50) =>
  safe(() =>
    publicDb.from("blog_posts").select(POST_FIELDS).eq("status", "published").is("deleted_at", null).order("published_at", { ascending: false }).limit(limit),
    [],
    "posts",
    limit,
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
      .select("id, slug, title, excerpt, template, body_html, cover_url, cover_alt, seo_title, seo_description, canonical_url, seo_noindex, seo_focus_keyword, updated_at, page_sections(id, type, data, sort_order)")
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
    safe(() => publicDb.from("courses").select("slug, updated_at, seo_noindex, canonical_url, cover_url").eq("status", "published").is("deleted_at", null), [], "slugs courses"),
    safe(() => publicDb.from("blog_posts").select("slug, updated_at, seo_noindex, canonical_url, cover_url").eq("status", "published").is("deleted_at", null), [], "slugs posts"),
    safe(() => publicDb.from("pages").select("slug, updated_at, seo_noindex, canonical_url, cover_url").eq("status", "published").is("deleted_at", null), [], "slugs pages"),
    safe(() => publicDb.from("teachers").select("slug, updated_at").eq("is_public", true).eq("is_active", true).is("deleted_at", null), [], "slugs teachers"),
  ]);
  return { courses, posts, pages, teachers };
});

export const getRedirect = cache(async (path) =>
  safe(() => publicDb.from("redirects").select("to_path, status_code").eq("from_path", path).maybeSingle(), null, "redirect"),
);

// Bounded, crawlable blog pagination. A failed service never fabricates analytics or content counts.
export const getPostPage = cache(async (page = 1, category = "") => {
  const size = 9, offset = (page - 1) * size;
  const fallback = () => {
    const all = seedFallback("posts", []).filter((p) => !category || p.category === category).sort((a, b) => String(b.published_at).localeCompare(String(a.published_at)));
    return { posts: all.slice(offset, offset + size), hasNext: all.length > offset + size };
  };
  if (!publicDb) return fallback();
  try {
    let q = publicDb.from("blog_posts").select(POST_FIELDS).eq("status", "published").is("deleted_at", null).order("published_at", { ascending: false }).order("id").range(offset, offset + size);
    if (category) q = q.eq("category", category);
    const { data, error } = await q;
    if (error) { if (error.code === "PGRST205") return fallback(); throw error; }
    return { posts: (data || []).slice(0, size), hasNext: (data || []).length > size };
  } catch (error) { console.error("[site-data] blog page:", error.message); return { posts: [], hasNext: false }; }
});
