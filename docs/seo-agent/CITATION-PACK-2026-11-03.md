# OQC citation pack and speed baseline (3 Nov 2026)

The owner asked to make citations stronger and the site faster. This pack builds on `CITATION-AUTHORITY-IMPLEMENTATION-2026-11-02.md`, whose rules still apply: one truthful global identity, no fake address, no bulk directories.

## 1. What "strong citations" means for an online-only academy
Google counts citations as consistent, verifiable mentions of one entity. It does not count how many directories a brand appears in. For OQC, a strong citation:

- uses the exact name, website, email and description below;
- sits on a platform families or AI answer engines actually read (review sites, Bing/Copilot, Apple, LinkedIn, YouTube, real Islamic-education resources);
- links back to one canonical URL;
- is listed in CMS → Settings → Social links once it is live and verified. That one setting already feeds the site footer, the Organization `sameAs` JSON-LD and, from this PR, the "Official profiles" section of `llms.txt`.

What competitors do instead: a search on 3 Nov 2026 for online Quran academy listings returned mostly profile pages on unrelated forums and community sites (code forums, job boards, phone-maker communities) created only for a link. Google's link-spam policy covers exactly this, so OQC does not copy it.

## 2. Exact brand facts (NAP-W): copy these, do not retype
| Field | Value | Status |
|---|---|---|
| Name | Online Quran College | CMS `site.identity.name` |
| Website | https://www.onlinequrancollege.com | canonical host |
| Email | info@onlinequrancollege.com | CMS `site.contact` |
| Phone / WhatsApp | +44 7864 710821 | CMS `site.contact`. **Owner: confirm it may be published on third-party sites** |
| Founded | Omit / not approved | The 2 Nov audit removed the unverified `established` value from CMS identity settings; do not publish a founding year until documentary evidence and owner approval are recorded. |
| Address | none: online-only, no walk-in office | never add a street, mailbox or virtual office |
| Service area | Online: USA, UK, Canada, Australia, UAE (and other countries online) | |
| Categories | Online education · Quran school / Islamic education · Tutoring (online) | pick the nearest the platform offers |

**Consistency issue for the owner:** the Facebook URL is `facebook.com/OnlineQuranCollegeLtdUK`, but the legal name in the CMS is "Online Quran College" with no "Ltd". If a UK limited company exists, put its exact registered name in CMS `site.identity.legal_name`. If not, change the Facebook username to match the brand, for example `OnlineQuranCollege`. A "Ltd" that cannot be verified weakens trust.

## 3. Approved descriptions
These come from the CMS identity and the existing approved draft, with no new claims.

- **Short (≤ 80):** Live one-to-one online Quran classes for children and adults.
- **Medium (≤ 160):** Live one-to-one online Quran, Tajweed, Hifz, Arabic and Islamic studies classes for children and adults, with male and female teachers and flexible timings.
- **Long (≈ 450):** Online Quran College provides live, one-to-one online Quran and Islamic learning for children and adults. Courses include Noorani Qaida, Quran reading with Tajweed, Hifz, Arabic language, Quran translation and Islamic studies. Families can ask for a male or female teacher, and lessons are arranged in the learner's own time zone. A three-day free trial is available on eligible plans (the Weekend plan is excluded). Visit the website to compare courses and request a trial.

Do not add: accredited, certified, best, #1, student counts, country counts, response times or guarantees.

## 4. Tracked links (one per platform)
`https://www.onlinequrancollege.com/?utm_source=<platform>&utm_medium=referral&utm_campaign=brand_citations`. Use `trustpilot`, `bing`, `apple`, `linkedin`, `youtube`, `facebook`, `instagram` or `x`. Use UTMs only on the external profile, never in canonical tags, sitemaps or JSON-LD.

## 5. Owner actions, in order
Each one needs the owner's own sign-in. Claude cannot create or verify accounts.

| # | Platform | Why it matters | Steps | Done when |
|---|---|---|---|---|
| 1 | **Trustpilot** (exists) | The review profile families and AI answers cite most often | Sign in to Trustpilot Business, set the company description to the medium text, add the website and category, and send the neutral invitation link to every family (PR #78 adds the on-site flow) | Company details match §2; new reviews arriving |
| 2 | **Bing Webmaster Tools** | Bing's index feeds Copilot and other AI search; the tracker records no verified Bing Webmaster account yet | Sign in, choose "Import from Google Search Console", then submit `https://www.onlinequrancollege.com/sitemap.xml` | Sitemap status "Success" |
| 3 | **Facebook / Instagram / X** (exist) | Already in `sameAs`, so they must match | Same name, medium description and tracked link; fix the "Ltd" username (see §2) | All three match §2 and §3 |
| 4 | **Apple Business** | Apple Maps, Siri and Spotlight brand card; allowed without a storefront | Sign in at business.apple.com, add the brand (not a location), verify the organisation | Brand verified, no place pin |
| 5 | **LinkedIn company page** | Strong entity signal; also helps teacher hiring | Create one page with the long description, logo and tracked link; staff list it as their employer | Page live and added to CMS social links |
| 6 | **YouTube** | Only with real content (for example short Tajweed tips by consenting teachers) | Create the channel when at least 3 original videos exist | Channel live, link added to CMS |
| 7 | **Editorial resources** (RISE, ISRE, ISLA in the tracker) | Real Islamic-education mentions carry more weight than directories | Owner approves the outreach text; academic review of any resource OQC submits | Public mention with link |

Excluded (unchanged): Google Business Profile (online-only businesses are not eligible), Yelp, Yell, Hotfrog, Manta, Foursquare and similar local directories, paid links, and forum or profile-link schemes.

**After each one goes live:** add the URL in CMS → Settings → Social links. The footer, `sameAs` and `llms.txt` then update with no code change. Record the profile in `GLOBAL-CITATION-TRACKER-2026-11-02.csv`.

## 6. Speed: real-user baseline (GA4 web-vitals events, 28 days to 3 Nov 2026)
These are averages of event values, not the 75th-percentile field values used for Core Web Vitals assessment. The Core Web Vitals "good" thresholds are evaluated at the 75th percentile: LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1. FCP and TTFB are useful diagnostics but are not Core Web Vitals.

| Metric | Desktop | Mobile |
|---|---|---|
| LCP | 1.21 s (2,304 events) | 1.11 s (170) |
| FCP | 1.27 s | 0.95 s |
| INP | 182 ms (672) | 56 ms (54) |
| CLS | 0.003 | 0.002 |
| TTFB | 0.70 s | 0.64 s |

By page: `/locations` had the highest INP (≈ 346 ms over 16 events). This PR fixes it: the search input stays instant, the country grid renders from a deferred value, and the search text is built once. `/courses/hifz-quran` had the slowest LCP (≈ 1.74 s), still "good", and its cover image is already pre-encoded WebP. The public pages do not run through the proxy/CSP layer (that layer covers admin and parent pages only), so they stay statically cached.

These averages are encouraging, but they do not establish a Core Web Vitals pass/fail result or prove that speed is not limiting performance. Obtain page/device-level p75 field data from CrUX/Search Console or an authorized real-user source before making that claim. Authority, relevant editorial references, useful query coverage and conversion quality remain important workstreams, but their impact must be measured rather than assumed.
