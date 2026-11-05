-- Defense in depth for internal rate-limit storage.
-- These tables have no anon/authenticated grants and are used by postgres-owned SECURITY DEFINER helpers.
-- No client-facing policies are intended.
ALTER TABLE private.counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.rate_limits ENABLE ROW LEVEL SECURITY;
