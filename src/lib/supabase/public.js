import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL, SUPABASE_CONFIGURED, requireSupabase } from "@/lib/config";

// Anonymous client for website content (no cookies, so pages can be cached).
// Requests time out after 8s so a slow network never hangs a page render or a build.
const timedFetch = (input, init = {}) => fetch(input, { ...init, signal: init.signal ?? AbortSignal.timeout(8000) });

export const publicDb = SUPABASE_CONFIGURED ? createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: { fetch: timedFetch },
}) : null;

// Browser-side anonymous client for public forms (trial / contact / certificate check).
let browserPublic;
export function getPublicBrowserClient() {
  requireSupabase();
  if (!browserPublic) {
    browserPublic = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: "oqc-public" },
      // A stalled network must not leave enquiries/certificate checks spinning
      // indefinitely. Respect an explicit caller cancellation signal.
      global: { fetch: (input, init = {}) => fetch(input, { ...init, signal: init.signal ?? AbortSignal.timeout(20000) }) },
    });
  }
  return browserPublic;
}
