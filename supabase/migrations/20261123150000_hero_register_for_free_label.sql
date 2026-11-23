-- Owner request 23 Nov 2026: the trial-request button reads "Register for free".
update public.settings
set value = jsonb_set(value, '{primary_label}', '"Register for free"')
where key = 'site.hero' and value->>'primary_label' in ('Book a 3-day free trial', 'Request a 3-day free trial', 'Book a free trial');
