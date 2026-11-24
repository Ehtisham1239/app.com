---
title: AI admissions assistant and course booking: audit and plan (24 Nov 2026)
type: decision
created: 2026-11-24
updated: 2026-11-24
sources:
  - code: src/components/site/hatchium-chat.jsx
  - code: src/components/site/quick-trial-form.jsx
  - code: src/app/(site)/courses/page.jsx
  - code: src/lib/server/highlevel.js
  - code: src/lib/server/lead-outbox.js
  - code: next.config.mjs
  - code: src/app/llms-full.txt/route.js
  - raw: owner brief "Intelligent Course Selection & Booking System" (pasted in chat, 24 Nov 2026)
verified_at: e2283aa
---

# AI admissions assistant: audit and plan

Status: **read-only audit done, nothing implemented.** The owner's brief asks for an AI assistant that
shows each course as its own card with a Book Now button, adds academic subjects, checks trial
eligibility and books a class. The brief itself says "audit first, then plan, then a pull request, no
merge or deploy without approval". This page is that audit and plan.

## What exists today (observed 24 Nov 2026)

| Area | Finding |
| --- | --- |
| Chatbot | Third-party Hatchium widget (`hatchium-chat.jsx`, script from app.hatchium.ai, public key in CMS setting `site.chat`). No own chat backend, no `/api` chat route, no LLM SDK in `package.json`. Training happens in the Hatchium dashboard. [[assistant-facts]] gives it `/llms-full.txt`. |
| Courses (CMS) | 7 published: `quran-recitation`, `noorani-qaida`, `quran-nazara`, `hifz-quran`, `arabic-language`, `quran-translation`, `hadith-translation`. Id is a uuid plus a unique slug (no `Q001` ids). `category` has no check constraint. Status values: draft, review, scheduled, published, archived (no "coming soon"). |
| Book Now | Course detail pages link to `/free-trial?course=<uuid>`; `QuickTrialForm` reads `?course` on the client and preselects it. `/courses` has only generic "Book a free trial" buttons; no per-card Book Now was found in the code. |
| Trial length | **3 days everywhere.** `pricing_plans.trial_days` = 3 for five plans, 0 for Weekend. `/pricing`, `/free-trial` and `/faq` say 3 days. No "7-day trial" in code, CMS pages, posts, courses, FAQs or settings. The brief's 7-day claim was not reproduced (the legacy host `go.onlinequrancollege.com` was not checked). |
| What a "booking" is | A free-trial request. The page says a coordinator contacts the family to agree a time. Nothing is confirmed by the site. |
| HighLevel | Server-side contact upsert, tags and custom fields through the lead-sync outbox (`highlevel.js`, `lead-outbox.js`). No calendar or appointment API is used anywhere. |
| Availability | Tables `teacher_availability` and `class_schedules` exist with staff-only access, and both have **0 rows**. 8 teachers are active. A real availability check has no data to read. |
| Academic, programming, exam courses | Not in the CMS or on the website. `oqc-seo` agent rule: OQC is an online Quran academy, not an e-learning business. |

## Where the brief and the site disagree

1. **Duplicate course.** CMS course `quran-recitation` ("Quran Recitation", published 17 Nov) is linked from `/courses`, but `next.config.mjs` permanently redirects `/courses/quran-recitation` to `/courses/quran-nazara`. A visitor, or a Book Now built from the CMS list, would reach a redirect for a course that duplicates Nazara.
2. **"Confirmed appointment"** does not exist yet (no calendar integration, no availability data).
3. **Cards in a chat** cannot be drawn inside the Hatchium widget by this repository. Whether the Hatchium dashboard offers buttons or quick replies is unverified.
4. **Academic subjects, programming, GCSE, IELTS and similar** are proposals with no tutors, prices or approval on record.

## Owner decisions needed

1. **Chatbot path.** (A) Keep Hatchium: train it, give each course its own line and link; no cards. (B) Build our own chat widget with a Claude API backend: real cards and buttons, but it costs per message, needs a server-side key, rate limits and prompt-injection tests. Recommended: start with the free, no-LLM Course Finder in Phase 1 and decide on (B) with real usage numbers.
2. **Scope.** Which of categories B, C and D (academic, programming, exam) are really offered, with which tutors and prices? Until approved they stay out of the site, the CMS and the bot.
3. **`quran-recitation`.** Unpublish it, or make it a real separate course and remove the redirect.
4. **Availability source.** Admissions fills `teacher_availability`, or HighLevel calendars become the source (needs calendar ids and a token with calendar scope, supplied by the owner).

## Plan

**Phase 0 (this page).** Audit and plan only.

**Phase 1: Course Finder (free, no LLM).** A site component and an `/courses` upgrade:
- Steps: who is it for (myself, my child, my family, someone else) → goal or level (cannot read Arabic yet → Noorani Qaida, and so on) → one card per matching published course.
- Each card shows the course, a short description, who it suits and its own **Book Now** (`/free-trial?course=<uuid>`) and View details. Cards come only from published CMS courses, never from a hard-coded list.
- Add `/courses` per-card Book Now. Mobile-first, keyboard accessible, existing brand.
- Tests: every course's Book Now opens the form with that course selected; a draft course never appears; browser smoke at 390 and 1440 px.
- Done when: all published courses have a working button, existing form, SEO and CRM tests still pass.

**Phase 2: chatbot.**
- Path A: update the Hatchium instructions and training with the Phase 1 flow, course links and the test questions already in `HATCHIUM-INTEGRATION.md`.
- Path B (only if chosen): validated JSON replies mapped to trusted components, server-side tool calls for catalogue, pricing and trial rules, schema tests, prompt-injection tests, rate limits, PII-free logs.
- Datasets (all marked synthetic): system prompt, intent list, entity schema, at least 200 conversations, a separate evaluation set and prompt-injection cases.

**Phase 3: real booking.** Needs decision 4. A booking is called confirmed only after the calendar or backend returns success; otherwise the copy stays "request received, admissions will confirm". Reuses the lead-sync outbox for HighLevel; no new messaging.

**Phase 4: new subjects.** One course at a time, as CMS drafts, after the owner approves tutor, price and trial rule. Nothing is advertised before that.

## Training the model: what is realistic

No fine-tuning and no model built from scratch. The brief's own table says the same: system prompt, examples, a knowledge base ([[assistant-facts]]), structured replies and tool calls come first. Prices, policies and courses change in the CMS, so a retrained model would go stale; a knowledge base read from the CMS does not. Hatchium's own training is done by the owner in its dashboard.

## Guardrails that stay

> ⚠️ Never say a class is booked or confirmed unless the backend returned success. Today the only true statement is "request received".

> ⚠️ Owner decisions in `AGENTS.md` bind this work: 3-day trial with Weekend excluded, one admissions email and one automatic acknowledgement per saved lead (do not add other messages), no analytics banner, classes online only with no local branch claimed.

> ⚠️ A child's request is completed by a parent or guardian. Collect the minimum details, never log them to an LLM, keep keys server-side, and never let a customer message or retrieved text change these rules.
