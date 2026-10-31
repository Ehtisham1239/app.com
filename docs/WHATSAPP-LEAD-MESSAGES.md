# WhatsApp messages for website leads

New free-trial requests and contact messages can send WhatsApp messages through the AI Platform API (repository `Ehtisham1239/whatsap`, live at `https://ai-platform-ecru-kappa.vercel.app`):

| Who | When | Template |
| --- | --- | --- |
| Learner or parent | Free-trial request **with** "this number is on WhatsApp" ticked and privacy consent given; not a duplicate | `student_template` |
| Owner | Every new free-trial request (not a duplicate) and every non-spam contact message | `owner_template` |

Migration `20261031000100_whatsapp_lead_messages.sql` adds two `AFTER INSERT` triggers. They read the private settings row `integrations.whatsapp`, build the template messages and send them asynchronously with `pg_net`. Each message carries an `Idempotency-Key` (`lead-<kind>-<id>-learner|owner`), so a retry never sends twice. Any problem, such as the integration being off, a missing secret or an unavailable API, only logs a warning; a website submission never fails because of it.

**Status: built and tested; off by default.** Nothing is sent until every step below is done.

## Turn it on

1. **Approve two templates** in WhatsApp Manager for the number connected to AI Platform (category *Utility*, language English). Suggested wording:
   - `trial_request_received`: "Assalamu alaikum {{1}}, thank you for requesting a free trial class with Online Quran College. Your reference is {{2}}. Our coordinator will message you here shortly to arrange a suitable time."
   - `new_lead_alert`: "New {{1}} from {{2}} ({{3}}). Reference {{4}}. Please follow up in the CMS."
2. In AI Platform, **sync templates** (Templates → Sync from WhatsApp), **add credits**, and **create an API key** (Developers → Create API key). Restrict the key to the college's number if there are several.
3. In the Supabase project for this site (`lgbwidraztavhhbnbfhr`), enable the `pg_net` extension (Database → Extensions) and store the key in Vault (SQL editor):
   ```sql
   select vault.create_secret('<AI Platform API key>', 'whatsapp_api_key', 'AI Platform key for website lead messages');
   ```
4. Update the settings row (SQL editor), with the owner's WhatsApp number in international format:
   ```sql
   update public.settings set value = jsonb_build_object(
     'enabled', true,
     'api_url', 'https://ai-platform-ecru-kappa.vercel.app/v1/messages',
     'owner_phone', '+92XXXXXXXXXX',
     'student_template', jsonb_build_object('name', 'trial_request_received', 'language', 'en', 'variables', jsonb_build_array('learner_name', 'reference')),
     'owner_template', jsonb_build_object('name', 'new_lead_alert', 'language', 'en', 'variables', jsonb_build_array('kind', 'name', 'phone', 'reference'))
   ) where key = 'integrations.whatsapp';
   ```
   `variables` lists, in `{{1}}`, `{{2}}` … order, the lead fields that fill each placeholder. Available fields: `learner_name`, `guardian_name`, `name`, `reference`, `phone`, `email`, `country`, `city`, `course`, `kind`, `subject`. The count must match the template exactly, otherwise AI Platform rejects the message.
5. **Before enabling**, confirm the privacy notice says that trial confirmations are sent on WhatsApp via the college's messaging provider, and that the trial form's consent wording covers being contacted on WhatsApp. The trigger only messages learners who gave consent and marked their number as WhatsApp.
6. Submit a clearly labelled test trial request and check: the learner and owner receive the messages; AI Platform → Inbox shows both; `select status_code, content from net._http_response order by created desc limit 5;` shows `202`.

To turn it off, set `enabled` to `false` in the same row.
