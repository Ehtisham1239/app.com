# Online Quran College — website and CMS Portal

Next.js 16 + Supabase website imported from the supplied Online-Quran-College-v2 ZIP into
Ehtisham1239/app.com. The website uses the college's live logo, brand colours and fonts, with responsive Islamic editorial illustrations.

The existing CMS manages blogs, pages, courses, fees, media, contact messages and trial leads.
Added: a visible CMS Portal button, campaign-to-form attribution and reporting, local-currency
pricing selection, and 50 country / 115 city landing pages editable through CMS → Pages.

```sh
npm ci
cp .env.example .env.local  # enter this project's public publishable key
npm run dev
npm test
npm run lint
npm run build
```

Supabase target: `lgbwidraztavhhbnbfhr`. Use only this project's public key. There is no fallback
to the unrelated project in the uploaded ZIP. Public seed content is available before schema setup;
forms and admin sign-in require the actual database and staff account.

Home stays at `/` for all visitors; country and city pages are selected explicitly. See [routing verification](docs/HOMEPAGE-ROUTING-2026-10-25.md).

The current deployed changes and checks are documented in [the agent/action review](docs/ACTIONS-AND-AGENT-REVIEW-2026-10-25.md) and [the visual/SEO release record](docs/VISUAL-SEO-FOLLOWUP-2026-10-25.md).

See [DEPLOYMENT.md](DEPLOYMENT.md) for the precise live setup steps, admin creation, current blockers
and validation limits. The provided public key is configured locally in the ignored `.env.local`.
Never put service-role keys or passwords in public environment variables.
