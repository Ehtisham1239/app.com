-- Admissions staff see in Admin whether each website lead reached HighLevel.
-- The status lives in its own table so recording it never touches the lead
-- rows (and their workflow, version and audit triggers). Only staff with
-- trials:read or contacts:read can read it; nobody writes it directly.
create table public.lead_crm_sync (
  reference text primary key check (reference ~ '^(TR|MSG)-[0-9]{4}-[0-9]{5,7}$'),
  status text not null check (status in ('synced', 'failed')),
  detail text check (detail is null or detail ~ '^[a-z_]{1,60}$'),
  updated_at timestamptz not null default now()
);
alter table public.lead_crm_sync enable row level security;
revoke all on table public.lead_crm_sync from public, anon, authenticated;
grant select on table public.lead_crm_sync to authenticated;
create policy "staff read" on public.lead_crm_sync for select to authenticated using (
  (reference like 'TR-%' and (select public.has_permission('trials:read')))
  or (reference like 'MSG-%' and (select public.has_permission('contacts:read')))
);

-- The notification routes call this right after the CRM attempt. It accepts
-- the same proof as the lead lookups (reference, email and the one-time token
-- returned only to the submitter, within 30 minutes), so it can only label the
-- lead that was just submitted. The detail is a short machine reason such as
-- "missing_custom_fields", never provider text.
create function public.record_lead_crm_sync(p_reference text, p_email text, p_token text, p_ok boolean, p_detail text default null)
returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_hash text;
  v_valid boolean := false;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' or p_ok is null then return false; end if;
  v_hash := encode(extensions.digest(p_token, 'sha256'), 'hex');
  if p_reference ~ '^TR-[0-9]{4}-[0-9]{5,7}$' then
    select true into v_valid
    from public.trial_applications t
    join private.usa_lead_notification_tokens proof on proof.lead_id = t.id
    where t.reference = p_reference and t.email = v_email and t.deleted_at is null
      and t.created_at > now() - interval '30 minutes'
      and proof.expires_at > now() and proof.token_hash = v_hash
    limit 1;
  elsif p_reference ~ '^MSG-[0-9]{4}-[0-9]{5,7}$' then
    select true into v_valid
    from public.contact_messages m
    join private.website_lead_notification_tokens proof on proof.reference = m.reference
    where m.reference = p_reference and m.email = v_email and m.deleted_at is null
      and m.created_at > now() - interval '30 minutes'
      and proof.expires_at > now() and proof.token_hash = v_hash
    limit 1;
  end if;
  if not coalesce(v_valid, false) then return false; end if;
  insert into public.lead_crm_sync (reference, status, detail, updated_at)
  values (p_reference, case when p_ok then 'synced' else 'failed' end,
          case when p_ok then null else nullif(left(regexp_replace(lower(coalesce(p_detail, '')), '[^a-z_]', '', 'g'), 60), '') end,
          now())
  on conflict (reference) do update set status = excluded.status, detail = excluded.detail, updated_at = excluded.updated_at;
  return true;
end
$$;
revoke all on function public.record_lead_crm_sync(text, text, text, boolean, text) from public, anon, authenticated;
grant execute on function public.record_lead_crm_sync(text, text, text, boolean, text) to anon, service_role;
