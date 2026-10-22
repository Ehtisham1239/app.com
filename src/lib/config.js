export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lgbwidraztavhhbnbfhr.supabase.co").replace(/\/$/, "");
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const SUPABASE_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_KEY);
export function requireSupabase() {
  if (!SUPABASE_CONFIGURED) throw new Error("CMS connection is pending. Configure the app.com Supabase publishable key before signing in or submitting forms.");
}

// Absolute site URL for SEO (sitemap, canonical links). Falls back to the Vercel production URL.
const vercelHost = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || (vercelHost ? `https://${vercelHost}` : "") || "http://localhost:3000").replace(/\/$/, "");

export const STAFF_TIMEZONE = "Asia/Karachi";
export const MEDIA_BUCKET = "media";
