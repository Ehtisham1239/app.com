---
id: ADR-002
type: decision
status: accepted
date: 2026-11-19
---
# ADR-002 Start Google tags after load at idle

Context: [[EVD-002-gsc-and-lighthouse-2026-11-18]] shows #326 (tags at hydration) cost ~1,300 ms mobile TBT on every sampled page. Options offered to the owner: (A) after load at idle, (B) back to first interaction / 4 s, (C) keep immediate. **Owner chose A (19 Nov 2026).**
Consequence: every visitor is still tracked with no interaction wait; the tags start once the page has loaded and the browser is idle (max 2 s); a visitor who leaves first triggers an immediate start. Pinned by `tests/analytics.test.mjs`. Revisit if GA4 sessions drop compared with 18 Nov.
