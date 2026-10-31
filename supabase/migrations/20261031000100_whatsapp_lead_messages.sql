-- WhatsApp messages for new website leads, sent through the AI Platform API
-- (github.com/Ehtisham1239/whatsap):
--   * the learner gets a confirmation template when they gave a WhatsApp
--     number and consented to be contacted (free-trial form only);
--   * the owner gets an alert template for every new trial request and
--     every non-spam contact message.
--
-- Off until configured. Configuration (non-secret) is the private settings
-- row 'integrations.whatsapp'; the API key lives in Supabase Vault as
-- 'whatsapp_api_key'. Delivery uses pg_net asynchronously; any failure only
-- raises a warning, so a website submission can never fail because of it.

insert into public.settings (key, value, is_public, label, description)
values (
  'integrations.whatsapp',
  jsonb_build_object(
    'enabled', false,
    'api_url', '',
    'owner_phone', '',
    'student_template', jsonb_build_object('name', '', 'language', 'en', 'variables', jsonb_build_array('learner_name', 'reference')),
    'owner_template', jsonb_build_object('name', '', 'language', 'en', 'variables', jsonb_build_array('kind', 'name', 'phone', 'reference'))
  ),
  false,
  'WhatsApp lead messages',
  'Sends approved WhatsApp templates for new trial requests and contact messages through the AI Platform API. The API key is stored in Supabase Vault as whatsapp_api_key.'
)
on conflict (key) do nothing;

-- Template variables, in order, from the lead's fields. Whitespace is
-- collapsed (WhatsApp rejects tabs, newlines and long runs of spaces) and each
-- value is capped at 200 characters; an empty field becomes '-'.
create or replace function private.whatsapp_template_variables(p_fields jsonb, p_lead jsonb) returns jsonb
language sql immutable set search_path = '' as $$
  select coalesce(jsonb_object_agg(f.ord::text,
           left(coalesce(nullif(btrim(regexp_replace(coalesce(p_lead ->> f.field, ''), '\s+', ' ', 'g')), ''), '-'), 200)), '{}'::jsonb)
  from jsonb_array_elements_text(case when jsonb_typeof(p_fields) = 'array' then p_fields else '[]'::jsonb end)
       with ordinality as f(field, ord)
$$;

-- The API requests to make for one lead: [{ idempotency_key, body }].
create or replace function private.whatsapp_lead_messages(p_kind text, p_lead jsonb, p_config jsonb) returns jsonb
language plpgsql immutable set search_path = '' as $$
declare
  v_out jsonb := '[]'::jsonb;
  v_student jsonb := p_config -> 'student_template';
  v_owner jsonb := p_config -> 'owner_template';
begin
  if coalesce((p_config ->> 'enabled')::boolean, false) is not true then
    return v_out;
  end if;
  if p_kind = 'trial'
     and coalesce((p_lead ->> 'phone_is_whatsapp')::boolean, false)
     and coalesce((p_lead ->> 'consent_given')::boolean, false)
     and coalesce(p_lead ->> 'phone', '') <> ''
     and coalesce(v_student ->> 'name', '') <> '' then
    v_out := v_out || jsonb_build_array(jsonb_build_object(
      'idempotency_key', 'lead-' || p_kind || '-' || (p_lead ->> 'id') || '-learner',
      'body', jsonb_build_object(
        'to', p_lead ->> 'phone',
        'type', 'template',
        'client_reference', p_lead ->> 'reference',
        'template', jsonb_build_object(
          'name', v_student ->> 'name',
          'language', coalesce(nullif(v_student ->> 'language', ''), 'en'),
          'variables', private.whatsapp_template_variables(v_student -> 'variables', p_lead)))));
  end if;
  if coalesce(p_config ->> 'owner_phone', '') <> '' and coalesce(v_owner ->> 'name', '') <> '' then
    v_out := v_out || jsonb_build_array(jsonb_build_object(
      'idempotency_key', 'lead-' || p_kind || '-' || (p_lead ->> 'id') || '-owner',
      'body', jsonb_build_object(
        'to', p_config ->> 'owner_phone',
        'type', 'template',
        'client_reference', p_lead ->> 'reference',
        'template', jsonb_build_object(
          'name', v_owner ->> 'name',
          'language', coalesce(nullif(v_owner ->> 'language', ''), 'en'),
          'variables', private.whatsapp_template_variables(v_owner -> 'variables', p_lead)))));
  end if;
  return v_out;
end $$;

create or replace function private.tg_whatsapp_lead() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_config jsonb;
  v_lead jsonb;
  v_messages jsonb;
  v_message jsonb;
  v_api_key text;
begin
  begin
    select s.value into v_config from public.settings s where s.key = 'integrations.whatsapp';
    if v_config is null or coalesce((v_config ->> 'enabled')::boolean, false) is not true then
      return new;
    end if;
    if tg_table_name = 'trial_applications' then
      if new.duplicate_of_id is not null then
        return new;
      end if;
      v_lead := to_jsonb(new) || jsonb_build_object(
        'kind', 'Free trial',
        'name', new.learner_name,
        'course', (select c.title from public.courses c where c.id = new.course_id));
      v_messages := private.whatsapp_lead_messages('trial', v_lead, v_config);
    else
      if new.status = 'spam' then
        return new;
      end if;
      v_lead := to_jsonb(new) || jsonb_build_object('kind', 'Contact message', 'learner_name', new.name);
      v_messages := private.whatsapp_lead_messages('contact', v_lead, v_config);
    end if;
    if jsonb_array_length(v_messages) = 0 then
      return new;
    end if;
    if not exists (select 1 from pg_catalog.pg_extension where extname = 'pg_net')
       or to_regclass('vault.decrypted_secrets') is null then
      raise warning 'WhatsApp lead messages: pg_net or Vault is not available';
      return new;
    end if;
    execute 'select decrypted_secret from vault.decrypted_secrets where name = $1' into v_api_key using 'whatsapp_api_key';
    if coalesce(v_api_key, '') = '' or coalesce(v_config ->> 'api_url', '') !~ '^https://[^/]+/v1/messages$' then
      raise warning 'WhatsApp lead messages: api_url or the whatsapp_api_key secret is not set';
      return new;
    end if;
    for v_message in select * from jsonb_array_elements(v_messages) loop
      execute 'select net.http_post(url := $1, body := $2, headers := $3, timeout_milliseconds := 10000)'
        using v_config ->> 'api_url', v_message -> 'body',
              jsonb_build_object('Authorization', 'Bearer ' || v_api_key, 'Content-Type', 'application/json',
                                 'Idempotency-Key', v_message ->> 'idempotency_key');
    end loop;
  exception when others then
    raise warning 'WhatsApp lead messages skipped: %', sqlerrm;
  end;
  return new;
end $$;

revoke all on function private.whatsapp_template_variables(jsonb, jsonb) from public;
revoke all on function private.whatsapp_lead_messages(text, jsonb, jsonb) from public;
revoke all on function private.tg_whatsapp_lead() from public;

create trigger trial_applications_whatsapp after insert on public.trial_applications
  for each row execute function private.tg_whatsapp_lead();
create trigger contact_messages_whatsapp after insert on public.contact_messages
  for each row execute function private.tg_whatsapp_lead();
