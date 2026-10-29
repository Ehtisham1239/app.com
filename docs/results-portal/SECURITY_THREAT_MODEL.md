# Security threat model — Student Results & Certificate Portal

Status: design-time model for the **proposed** architecture. Residual risks are stated honestly; nothing here is a guarantee.

| # | Threat | Impact | Preventive control | Detection | Test | Residual risk |
|---|---|---|---|---|---|---|
| T1 | Guessable Client IDs | Enumeration of parents | Client ID treated as public identifier; code is the secret; identical error for unknown ID and wrong code | Failed-attempt counter per ID | Unknown-ID vs wrong-code responses identical | IDs may still be guessed; harmless without code |
| T2 | Client Code brute force | Account takeover | bcrypt hash (pgcrypto `crypt`), ≥ 10-character random codes, per-ID lockout after N failures | `failed_attempts`, audit `parent_sign_in_failed` | 6th wrong attempt locked; correct code blocked during lockout | Lockout can be abused to annoy a parent (temporary) |
| T3 | Rate limit by IP ineffective when RPC is called from the Vercel server (DB sees server IP) | Distributed guessing | Per-Client-ID limit in DB (primary); optionally forward a hashed client IP from the route as an untrusted hint; Vercel firewall rate rule (decision) | Aggregate failures | Server-call path test with many IDs | Spread attacks across many IDs remain possible but each ID is limited |
| T4 | Code theft / sharing | Third party sees a child's results | Codes shown once to staff; reset in CMS; sessions revocable; optional OTP (D5) | Audit sign-ins | Reset invalidates sessions | Shared codes cannot be fully prevented |
| T5 | Parent A reads Parent B's child (IDOR) | Privacy breach | RPCs derive students only from the session's guardian links; no student_id accepted without the link check | Audit authorisation failures | Pass another student's id → empty/denied | Low |
| T6 | Unpublished results leak | Premature/incorrect data | Parent RPCs filter `status='published'`; staging tables never granted to anon/parent paths | — | Draft result invisible via RPC and REST | Low |
| T7 | Direct REST access to new tables with publishable key | Data exposure | `revoke all` from anon; RLS enabled; staff policies only | RLS test in PGlite | anon `select` → permission denied | Low |
| T8 | RLS / grant misconfiguration in a new migration | Broad exposure | Generated policies via existing helper; DB tests for every table and role | CI tests | `tests/database.test.mjs` additions | Depends on tests staying in CI |
| T9 | Service-role key exposure | Total bypass | Do not introduce a service-role key at all (current app uses none) | Build-time grep | `grep` for service role in bundle | None added |
| T10 | Unauthorised publish / certificate issue | False records | `SECURITY DEFINER` functions check `has_permission('results:publish')` / existing certificate RLS | Audit events | academic without publish → error | Insider misuse remains auditable, not prevented |
| T11 | Malicious spreadsheet cells (formula, HTML, script) | Stored XSS, CSV injection on export | Parse as text; render remarks as text (no `dangerouslySetInnerHTML`); export via existing `csvCell` | — | Rows with `=cmd`, `<script>` render inertly | Low |
| T12 | Parser vulnerabilities / zip bombs (XLSX) | DoS, code execution in parser | CSV first; XLSX only with a reviewed library, size and row caps, parse in browser + validate server-side | — | Oversized and malformed files rejected | Library CVEs (D9) |
| T13 | Oversized files / huge row counts | Resource exhaustion | 2 MB / 2,000 rows caps; batch inserts | — | 2,001 rows rejected | Low |
| T14 | Duplicate or replayed imports | Double results | Unique file hash per assessment; unique (assessment, student); idempotent publish | Batch status | Same file twice → rejected | Low |
| T15 | Concurrent publish races | Partial / double publication | Single transaction with `select … for update` on the batch | — | Two concurrent publishes → one succeeds | Low |
| T16 | Sensitive data in logs | Leakage | Never log codes, tokens, marks in server logs; audit metadata minimal | Review | Log assertions | Low |
| T17 | Cache leakage between parents | Wrong child shown | `private, no-store`; dynamic rendering; cookie path scoped | — | Response headers asserted | Shared devices: parent must sign out |
| T18 | Public verification over-sharing | Privacy | `verify_certificate` returns fixed fields only; no marks/remarks/Client IDs | — | Response keys asserted | Full name remains public (D10) |
| T19 | Session theft | Impersonation | httpOnly, Secure, SameSite=Strict cookie; hashed token at rest; short expiry; revoke on sign-out | Session table | Expired token denied | XSS elsewhere on the site could still act in-session (mitigated by CSP) |
| T20 | Incomplete audit trail | No accountability | Audit inserts inside the same transaction as the action | Audit view | Each transition writes one event | Low |
| T21 | Backup and recovery | Data loss | Supabase managed backups (UNVERIFIED for this plan); migration is additive only | — | Restore drill (owner) | Unverified until checked in Supabase |
| T22 | Screenshots / copying of results | Data shared onward | Removed print/download controls only | — | — | Cannot be prevented by a website |
