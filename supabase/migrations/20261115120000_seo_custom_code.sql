-- CMS-managed SEO code: Website settings → "SEO code & schema".
--
-- site.custom_schema  {schema, page_schemas}  JSON-LD only. It is escaped on output and cannot run,
--                     so the existing settings:update permission (Admin, Marketing) may edit it.
-- site.head_code      {head_code}  <meta>/<link>/<script> for the public <head>. Scripts run on every
--                     public page, so writes additionally need seo_code:update (Super Admin via '*',
--                     Administrator by the grant below). The public site re-validates both values
--                     and emits only allowlisted elements (src/lib/custom-code.js).
--
-- Rollback: drop the two policies, delete the ('admin','seo_code:update') grant and the two
-- settings rows. No existing row, policy or permission is changed.

insert into public.settings (key, is_public, label, description, value) values
  ('site.custom_schema', true, 'Schema markup', 'Site-wide and page-level JSON-LD managed in Website settings', '{"schema": "", "page_schemas": []}'::jsonb),
  ('site.head_code', true, 'Header custom code', 'Verification meta tags and approved scripts for the public <head>', '{"head_code": ""}'::jsonb)
on conflict (key) do nothing;

insert into public.app_role_permissions (role, permission)
values ('admin', 'seo_code:update')
on conflict do nothing;

-- Restrictive policies are AND-ed with the existing permissive "staff create/update/delete"
-- policies, so every other settings row behaves exactly as before.
drop policy if exists "head code writers" on public.settings;
create policy "head code writers" on public.settings as restrictive for update to authenticated
  using (key <> 'site.head_code' or (select public.has_permission('seo_code:update')))
  with check (key <> 'site.head_code' or (select public.has_permission('seo_code:update')));

drop policy if exists "head code creators" on public.settings;
create policy "head code creators" on public.settings as restrictive for insert to authenticated
  with check (key <> 'site.head_code' or (select public.has_permission('seo_code:update')));

drop policy if exists "head code deleters" on public.settings;
create policy "head code deleters" on public.settings as restrictive for delete to authenticated
  using (key <> 'site.head_code' or (select public.has_permission('seo_code:update')));
