-- One-time sign-in setup for the first Super Admin.
-- A single-use token (stored only as a SHA-256 hash, valid for one hour) lets the admin-users
-- edge function create the first Super Admin without keeping a long-lived secret anywhere.
create table if not exists private.bootstrap_tokens (
  token_hash text primary key,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '1 hour',
  used_at timestamptz
);
alter table private.bootstrap_tokens enable row level security;

create or replace function public.consume_bootstrap_token(p_token text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  v_ok boolean;
begin
  if coalesce(length(p_token), 0) < 24 then
    return false;
  end if;
  update private.bootstrap_tokens
     set used_at = now()
   where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
     and used_at is null
     and expires_at > now()
  returning true into v_ok;
  return coalesce(v_ok, false);
end $$;

revoke all on function public.consume_bootstrap_token(text) from public, anon, authenticated;
grant execute on function public.consume_bootstrap_token(text) to service_role;
