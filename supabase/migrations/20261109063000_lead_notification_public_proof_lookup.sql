-- The website lead notification route (/api/lead-notification) now reads the
-- just-submitted lead with the public key, the same way the USA route already
-- uses public.usa_lead_for_notification. Access stays proof-bound: the caller
-- must present the lead reference, its email and the 256-bit one-time token that
-- was returned only to the submitter, within 30 minutes, and the token is stored
-- only as a SHA-256 hash. This removes the route's dependency on a server
-- secret key; the HighLevel token stays server-only.
revoke all on function public.lead_for_notification(text, text, text) from public, anon, authenticated;
grant execute on function public.lead_for_notification(text, text, text) to anon, service_role;
