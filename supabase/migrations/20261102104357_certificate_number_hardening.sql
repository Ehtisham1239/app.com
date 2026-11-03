-- Certificate verification hardening (2 Nov 2026)
--
-- 1. New certificate numbers end in 4 random characters
--    (OQC-CERT-2026-0002-K7QM), so a number cannot be guessed by counting
--    up from a known one. Existing numbers are unchanged and stay valid.
-- 2. Public verification no longer confirms certificates of deleted students.

create or replace function private.tg_assign_reference()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_year text := to_char(now() at time zone 'Asia/Karachi', 'YYYY');
  v_alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_bytes bytea;
  v_suffix text := '';
  i int;
begin
  case tg_table_name
    when 'trial_applications' then
      if new.reference is null or new.reference = '' then
        new.reference := 'TR-' || v_year || '-' || lpad(private.next_counter('trial-' || v_year)::text, 5, '0');
      end if;
    when 'contact_messages' then
      if new.reference is null or new.reference = '' then
        new.reference := 'MSG-' || v_year || '-' || lpad(private.next_counter('contact-' || v_year)::text, 5, '0');
      end if;
    when 'students' then
      if new.student_code is null or new.student_code = '' then
        new.student_code := 'OQC-' || lpad(private.next_counter('student')::text, 5, '0');
      end if;
    when 'complaints' then
      if new.reference is null or new.reference = '' then
        new.reference := 'CMP-' || v_year || '-' || lpad(private.next_counter('complaint-' || v_year)::text, 4, '0');
      end if;
    when 'invoices' then
      if new.number is null or new.number = '' then
        new.number := 'INV-' || v_year || '-' || lpad(private.next_counter('invoice-' || v_year)::text, 5, '0');
      end if;
    when 'certificates' then
      if new.number is null or new.number = '' then
        v_bytes := extensions.gen_random_bytes(4);
        for i in 0..3 loop
          v_suffix := v_suffix || substr(v_alphabet, (get_byte(v_bytes, i) % length(v_alphabet)) + 1, 1);
        end loop;
        new.number := 'OQC-CERT-' || v_year || '-'
          || lpad(private.next_counter('certificate-' || v_year)::text, 4, '0') || '-' || v_suffix;
      end if;
    else null;
  end case;
  return new;
end $function$;

create or replace function public.verify_certificate(p_number text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_number text := upper(trim(coalesce(p_number, '')));
begin
  if v_number = '' or char_length(v_number) > 64 then
    return 'null'::jsonb;
  end if;

  if not private.hit_rate_limit(
    'verify-certificate:' || private.request_ip_hash(),
    20,
    interval '15 minutes'
  ) then
    return 'null'::jsonb;
  end if;

  return coalesce((
    select jsonb_build_object(
      'number', c.number,
      'student', s.full_name,
      'title', c.title,
      'course', co.title,
      'issued_on', c.issued_on,
      'signed_by', c.signed_by
    )
    from public.certificates c
    join public.students s on s.id = c.student_id and s.deleted_at is null
    left join public.courses co on co.id = c.course_id
    where c.number = v_number
      and c.status = 'issued'
  ), 'null'::jsonb);
end
$function$;
