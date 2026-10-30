-- Small JSON responses avoid PostgREST's row cap and keep bcrypt work below a
-- long bulk statement. Each successful chunk's codes can be retained by the UI.
create or replace function public.guardian_issue_codes_chunk(p_guardian_ids uuid[] default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_ids uuid[]; v_codes jsonb;
begin
  perform private.require_permission('guardians:update');
  if p_guardian_ids is not null and cardinality(p_guardian_ids) > 20 then
    raise exception 'Issue at most 20 access codes in one request.';
  end if;
  if p_guardian_ids is null then
    select array_agg(id) into v_ids from (
      select g.id from public.guardians g where g.deleted_at is null and g.client_id is not null
      and not exists (select 1 from private.guardian_codes c where c.guardian_id=g.id)
      order by g.id limit 20 for update of g skip locked
    ) next_parents;
  else v_ids := p_guardian_ids;
  end if;
  if coalesce(cardinality(v_ids),0)=0 then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(to_jsonb(c)), '[]'::jsonb) into v_codes
  from public.guardian_issue_codes_bulk(v_ids) c;
  return v_codes;
end $$;
revoke execute on function public.guardian_issue_codes_chunk(uuid[]) from public, anon, authenticated;
grant execute on function public.guardian_issue_codes_chunk(uuid[]) to authenticated;
