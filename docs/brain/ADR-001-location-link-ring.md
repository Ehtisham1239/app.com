---
id: ADR-001
type: decision
status: accepted
---
# ADR-001 Related-links ring for location pages

Context: 52 pages were restored on 18 Nov ([[REQ-001-full-seo-2026-11-18]]); each had one inbound link. Option A: footer mega-list (noisy, 57 links on every page). Option B: parent + sibling cities + next three pages in the sorted restored list. **Chosen B.**
Consequence: every restored page gets at least 3 inbound links and at most 8 outbound related links; deterministic (no random), tested in `tests/seo-full-pass-2026-11-18.test.mjs`. Risk: ring neighbours are alphabetical, not geographic; revisit when real local content exists. Hubs link only to their live cities.
