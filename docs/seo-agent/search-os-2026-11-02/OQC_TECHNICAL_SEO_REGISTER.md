# Technical SEO register (2 Nov 2026)

| ID | Item | Evidence | Fix | Status |
|---|---|---|---|---|
| T1 | `*.vercel.app` hosts (incl. production alias) serve indexable duplicates | Vercel domains list; headers had no host rule | `next.config.mjs`: `X-Robots-Tag: noindex, follow` when host matches `*.vercel.app`; test `tests/search-hygiene.test.mjs` | Implemented, locally verified (tests). Needs preview + production check |
| T2 | Trial form example phone in Ofcom drama range, UK-only | `quick-trial-form.jsx` | Country-code placeholder + hint linked via `aria-describedby` | Implemented, locally verified |
| T3 | Indexed subdomains `app./go./hiring./portal.` | Search Console pages | Each host should send `noindex` (or redirect to www); then Search Console Removals for the host | Blocked — not in this repo; owner/host action |
| T4 | Old Search Console property `project-umber-three-93.vercel.app` | Windsor accounts | Check that project; if retired, delete deployment or add noindex | Owner action |
| T5 | Canonical host | apex → www 308 | — | Verified (Vercel API) |
| T6 | robots / sitemap / noindex rules for cities and non-priority countries | source | — | Observed correct |
| T7 | Parameterised trial URLs indexed | Search Console | Canonical `/free-trial` already set | No action |
| T8 | Core Web Vitals | — | Read Search Console CWV report / PageSpeed from a machine that can reach the site | Not measured this session |
| T9 | Repo SEO crawl scripts | network blocked here | Run `npm run seo:agent` after deploy from a connected machine | Blocked here |

Test run (this branch, Node 22): 129 tests, 119 pass, 10 files not runnable here because npm packages (luxon, sharp, esbuild, pglite) could not be installed — same 10 as on `main`. New regression tests fail on `main` (2/2) and pass on this branch.
