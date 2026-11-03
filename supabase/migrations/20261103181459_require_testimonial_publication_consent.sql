drop policy if exists "public read" on public.testimonials;
create policy "public read" on public.testimonials
for select to anon, authenticated
using (status = 'published' and consent_recorded_at is not null);
