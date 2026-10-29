# Unknowns and owner decisions — Student Results & Certificate Portal

Each item is **REQUIRES APPROVAL** until the owner answers. Nothing below has been assumed in code.

| # | Decision | Why it matters | Options / recommendation |
|---|---|---|---|
| D1 | **Grading scheme** — grade bands (e.g. A ≥ 90%?), pass mark, wording (Excellent/Good…) | Grades shown to parents must be OQC's policy | Owner to supply bands per course, or "no grade, marks only" |
| D2 | **Assessment criteria** — single total, or category marks (Reading, Tajweed, Memorisation…)? | Changes the data model and template | Recommend start with a single total; add criteria only if required |
| D3 | **ERP Client ID** — which ERP, format, and is it already known per guardian? | Live DB has 0 guardians and no Client ID column | Owner to name the ERP and export format; IDs imported into `guardians.client_id` |
| D4 | **Client Code issuing** — who issues/resets codes, how parents receive them (no messaging is sent without approval) | Code is a credential | Staff generate in CMS; shown once; delivered by the owner's existing channel |
| D5 | **Parent authentication** — Client ID + Code only, or add OTP to email/WhatsApp? | Second factor reduces code-sharing risk | Recommend ID + Code + rate limit now; OTP later if a sender is approved |
| D6 | **Who may approve and publish** — separate people? which roles? | Separation of duties | Recommend: academic imports/reviews; admin approves and publishes |
| D7 | **Certificate eligibility** — automatic from a pass, or manual issue? | Avoids inventing policy | Recommend manual: result page offers "create draft certificate"; staff issue |
| D8 | **Multiple attempts / re-sits** | Default unique (assessment, student) | Confirm "one result per assessment; corrections versioned" |
| D9 | **Excel support** — CSV only, or also `.xlsx` (needs a parser dependency, e.g. `exceljs`) | New dependency = supply-chain and parser risk | Recommend CSV first ("Save as CSV" from Excel); add XLSX after review |
| D10 | **Public verification** — keep showing the student's full name? | Privacy vs verifiability | Recommend keep full name (current behaviour) but never marks/remarks |
| D11 | **Retention** — keep uploaded files? how long to keep staging rows? | Data minimisation | Recommend keep only filename + hash; purge staging rows 30 days after publication |
| D12 | **Session lifetime** for parents | Security vs convenience | Recommend 30 min idle, 8 h absolute |
| D13 | **Teacher remarks** — who writes/approves them; max length | Shown to parents | Recommend reviewer approves with the batch; 1,000 characters, plain text |
| D14 | **Data onboarding** — who creates guardian records and links them to students | Portal is empty without links | Staff via CMS, or a guardian CSV import (same validation rules) |
| D15 | **Production rollout** — approve migration, then a staged release | Prompt requires explicit approval | Separate approval for: migration on live DB, deploy, first real import |
