import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/config";

// Server-only privileged client. Never import this module into client components
// and never expose this key through a NEXT_PUBLIC_ environment variable.
export function getServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !key) return null;
  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init = {}) => fetch(input, { ...init, signal: init.signal ?? AbortSignal.timeout(8000) }) },
  });
}
