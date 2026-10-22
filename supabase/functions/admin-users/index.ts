// Supabase Edge Function: staff account management (see handler.js for the actions).
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected by Supabase. The function checks the caller's
// session itself (verify_jwt is off so the one-time bootstrap call can run without a session).
import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import { handleRequest } from "./handler.js";

Deno.serve((req: Request) => handleRequest(req, { createClient, env: Deno.env.toObject() }));
