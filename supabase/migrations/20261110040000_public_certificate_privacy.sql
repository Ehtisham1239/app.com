-- Public certificate verification should confirm issuance without exposing learner names.
-- The authenticated parent portal retains its own guardian-token-bound certificate details.
create or replace function public.verify_certificate(p_number text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
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
