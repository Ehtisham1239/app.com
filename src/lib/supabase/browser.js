"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL, requireSupabase } from "@/lib/config";

let client;

// Signed-in client for the admin panel (session kept in cookies, shared with the server).
export function getBrowserClient() {
  requireSupabase();
  if (!client) client = createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
  return client;
}
