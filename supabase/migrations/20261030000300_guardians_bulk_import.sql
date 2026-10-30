-- Bulk upload of parents (clients) and their children, and bulk issue of access codes.
-- Additive only.

-- One row per child: {row_number, client_id, parent_name, relationship, email, phone,
-- student_code, student_name}. A parent is matched by Client ID (case-insensitive) and
-- updated, or created. A child is matched by student code, or by name among the
-- parent's linked children, or created from student_name (needs students:create).
-- Every row is checked; nothing is saved unless p_commit is true and all rows are valid.
create or replace function public.guardians_bulk_import(p_rows jsonb, p_commit boolean default false) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  r record;
  v_out jsonb := '[]'::jsonb;
  v_ok boolean := true;
  v_errors text[];
  v_client text; v_name text; v_rel text; v_email text; v_phone text; v_code text; v_child text;
  v_gid uuid; v_sid uuid; v_scode text; v_action text; v_links int;
  v_created uuid[] := '{}'; v_updated uuid[] := '{}'; v_touched uuid[] := '{}';
  v_students_new int := 0; v_links_new int := 0;
  v_can_create_students boolean := public.has_permission('students:create');
begin
  perform private.require_permission('guardians:create');
  perform private.require_permission('guardians:update');
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) = 0 then
    raise exception 'The file has no rows.';
  end if;
  if jsonb_array_length(p_rows) > 2000 then raise exception 'Upload at most 2,000 rows at a time.'; end if;

  begin
    for r in select * from jsonb_to_recordset(p_rows) as x(row_number int, client_id text, parent_name text, relationship text,
                                                            email text, phone text, student_code text, student_name text) loop
      v_errors := '{}'; v_gid := null; v_sid := null; v_scode := null; v_action := '';
      v_client := trim(coalesce(r.client_id, ''));
      v_name := regexp_replace(trim(coalesce(r.parent_name, '')), '\s+', ' ', 'g');
      v_rel := left(trim(coalesce(r.relationship, '')), 40);
      v_email := nullif(lower(trim(coalesce(r.email, ''))), '');
      v_phone := nullif(left(trim(coalesce(r.phone, '')), 40), '');
      v_code := upper(trim(coalesce(r.student_code, '')));
      v_child := regexp_replace(trim(coalesce(r.student_name, '')), '\s+', ' ', 'g');

      if v_client !~ '^[A-Za-z0-9][A-Za-z0-9._-]{2,63}$' then
        v_errors := array_append(v_errors, case when v_client = '' then 'Client ID is missing' else 'Client ID: 3–64 letters, numbers, dots, dashes or underscores' end);
      end if;
      if char_length(v_name) not between 2 and 120 then v_errors := array_append(v_errors, 'Parent name is missing or too long'); end if;
      if v_email is not null and v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then v_errors := array_append(v_errors, 'Email is not valid'); end if;
      if v_code = '' and v_child <> '' and char_length(v_child) not between 2 and 120 then
        v_errors := array_append(v_errors, 'Student name must be 2–120 characters');
      end if;

      if cardinality(v_errors) = 0 then
        begin
          select g.id into v_gid from public.guardians g where lower(g.client_id) = lower(v_client) and g.deleted_at is null;
          if v_gid is null then
            insert into public.guardians (full_name, relationship, email, phone, client_id)
            values (v_name, coalesce(nullif(v_rel, ''), 'Parent'), v_email, v_phone, v_client) returning id into v_gid;
            v_created := array_append(v_created, v_gid);
            v_action := 'New parent';
          else
            update public.guardians g set full_name = v_name,
              relationship = coalesce(nullif(v_rel, ''), g.relationship),
              email = coalesce(v_email, g.email), phone = coalesce(v_phone, g.phone)
            where g.id = v_gid;
            if not (v_gid = any(v_created)) and not (v_gid = any(v_updated)) then v_updated := array_append(v_updated, v_gid); end if;
            v_action := case when v_gid = any(v_created) then 'Same new parent' else 'Existing parent' end;
          end if;
          if not (v_gid = any(v_touched)) then v_touched := array_append(v_touched, v_gid); end if;

          if v_code <> '' then
            select s.id, s.student_code into v_sid, v_scode from public.students s where s.student_code = v_code and s.deleted_at is null;
            if v_sid is null then raise exception 'Unknown student code %', v_code; end if;
          elsif v_child <> '' then
            -- Re-uploading the same file must not duplicate children.
            select s.id, s.student_code into v_sid, v_scode from public.students s
            join public.student_guardians sg on sg.student_id = s.id and sg.guardian_id = v_gid
            where lower(s.full_name) = lower(v_child) and s.deleted_at is null limit 1;
            if v_sid is null then
              if not v_can_create_students then raise exception 'You do not have permission to add new students'; end if;
              insert into public.students (full_name) values (v_child) returning id, student_code into v_sid, v_scode;
              v_students_new := v_students_new + 1;
              v_action := v_action || ', new student';
            end if;
          end if;

          if v_sid is not null then
            insert into public.student_guardians (student_id, guardian_id) values (v_sid, v_gid) on conflict do nothing;
            get diagnostics v_links = row_count;
            v_links_new := v_links_new + v_links;
            if v_links > 0 then v_action := v_action || ', child linked'; end if;
          end if;
        exception when others then
          v_errors := array_append(v_errors, sqlerrm);
          v_gid := null; v_scode := null;
        end;
      end if;

      if cardinality(v_errors) > 0 then v_ok := false; end if;
      v_out := v_out || jsonb_build_object('row', r.row_number, 'ok', cardinality(v_errors) = 0, 'errors', to_jsonb(v_errors),
                                           'action', v_action, 'student_code', case when p_commit then v_scode end);
    end loop;

    if not (v_ok and p_commit) then raise exception using errcode = 'P0001', message = 'oqc_bulk_rollback'; end if;
  exception when sqlstate 'P0001' then
    if sqlerrm <> 'oqc_bulk_rollback' then raise; end if;
  end;

  if v_ok and p_commit then
    insert into public.audit_logs (actor_id, action, entity_type, entity_id, summary)
    values (auth.uid(), 'bulk_import', 'guardians', null,
            format('Parents bulk upload: %s new, %s updated, %s new students, %s links', cardinality(v_created), cardinality(v_updated), v_students_new, v_links_new));
  end if;

  return jsonb_build_object(
    'ok', v_ok, 'committed', v_ok and p_commit,
    'summary', jsonb_build_object('rows', jsonb_array_length(p_rows), 'parents_new', cardinality(v_created),
                                  'parents_updated', cardinality(v_updated), 'students_new', v_students_new, 'links_new', v_links_new),
    'guardian_ids', case when v_ok and p_commit then to_jsonb(v_touched) else '[]'::jsonb end,
    'rows', v_out);
end $$;

-- Issues access codes for many parents at once (default: every parent with a Client ID
-- and no code yet). The plain codes are returned once and never stored.
create or replace function public.guardian_issue_codes_bulk(p_guardian_ids uuid[] default null)
returns table (guardian_id uuid, client_id text, parent_name text, code text)
language plpgsql security definer set search_path = '' as $$
declare g record;
begin
  perform private.require_permission('guardians:update');
  for g in
    select x.id, x.client_id, x.full_name from public.guardians x
    where x.deleted_at is null and x.client_id is not null
      and (case when p_guardian_ids is null then not exists (select 1 from private.guardian_codes c where c.guardian_id = x.id)
                else x.id = any(p_guardian_ids) end)
    order by x.full_name limit 2000
  loop
    guardian_id := g.id; client_id := g.client_id; parent_name := g.full_name;
    code := public.guardian_issue_code(g.id);
    return next;
  end loop;
end $$;

revoke execute on function public.guardians_bulk_import(jsonb, boolean), public.guardian_issue_codes_bulk(uuid[]) from public, anon, authenticated;
grant execute on function public.guardians_bulk_import(jsonb, boolean), public.guardian_issue_codes_bulk(uuid[]) to authenticated;
