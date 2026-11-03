import { SUPABASE_KEY, SUPABASE_URL, SUPABASE_CONFIGURED } from "@/lib/config";

// Public connection details for static pages that save enquiries through the same
// database function as the site's own forms (the USA landing page in
// public/usa-quran-classes). Only NEXT_PUBLIC_* values are returned: the project
// URL and the publishable key that every page's JavaScript already carries.
// The browser calls Supabase directly so the per-visitor rate limit keeps working.
export const dynamic = "force-static";

export function GET() {
  if (!SUPABASE_CONFIGURED) {
    return Response.json({ ok: false, error: "not_configured" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  return Response.json({ ok: true, supabaseUrl: SUPABASE_URL, supabaseKey: SUPABASE_KEY });
}
