---
title: Assistant facts file (/llms-full.txt) and the Hatchium chatbot
type: subsystem
created: 2026-11-21
updated: 2026-11-21
sources:
  - code: src/lib/org-facts.js
  - code: src/app/llms-full.txt/route.js
  - code: src/app/(site)/at-a-glance/page.jsx
  - code: HATCHIUM-INTEGRATION.md
  - code: tests/llms-txt.test.mjs
verified_at: 0fad37a
---

# Assistant facts file

`organizationFacts` (`src/lib/org-facts.js`) reads settings, courses, packages (with their published
prices), FAQs and teachers from the CMS. Two pages render it: `/llms-full.txt` for AI assistants and
the Hatchium chatbot, and `/at-a-glance` for people. Both revalidate hourly, so a CMS edit reaches
them without a deploy.

The Hatchium widget is trained on `/llms-full.txt`. Training happens in the owner's Hatchium
dashboard; the steps, the bot instructions and a test-question set are in `HATCHIUM-INTEGRATION.md`.
Lead delivery is a separate system: [[lead-sync]].

> ⚠️ Hatchium keeps its own copy. After changing prices, packages, FAQs or contact details in the CMS,
> the owner must refresh the source in the Hatchium dashboard, or the bot keeps quoting the old facts.

> ⚠️ Only facts the public pages already show belong here. Section 10 (enrolled families) and section 11
> (answering rules) of `/llms-full.txt` are hand-written in the route. If the parent-portal sign-in
> rules (12-character code, 5 tries then a 15-minute lock in `src/app/parents/sign-in-form.jsx`) or
> the USA admissions number change, update the route too.

> ⚠️ `next build` reads the live CMS. In a cloud session it needs `lgbwidraztavhhbnbfhr.supabase.co`
> allowed and `NODE_USE_ENV_PROXY=1`, because Node's built-in fetch ignores the HTTPS proxy otherwise
> (the error shows as `getaddrinfo ENOTFOUND`).
