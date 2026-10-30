-- Owner-requested demo records. Run manually; do not include in schema migrations.
-- Re-running does not duplicate rows, change staff edits, issue codes or publish results.
begin;
select pg_advisory_xact_lock(hashtextextended('OQC_DEMO_PARENT_STUDENT_20261030',0));
do $$
declare i integer; student_key text; client_key text; student_uuid uuid; guardian_uuid uuid;
 seed_tag constant text := 'OQC_DEMO_PARENT_STUDENT_20261030';
begin
 for i in 1..5 loop
   student_key := 'DEMO-OQC-S'||lpad(i::text,3,'0');
   client_key := 'DEMO-OQC-P'||lpad(i::text,3,'0');
   insert into public.students(student_code,full_name,status,timezone,notes)
   values(student_key,'DEMO Student '||lpad(i::text,2,'0'),'paused','Asia/Karachi',seed_tag||' — Synthetic demonstration only; not a real enrolment.')
   on conflict(student_code) do nothing;
   select id into student_uuid from public.students where student_code=student_key and notes like seed_tag||'%' and deleted_at is null;
   if student_uuid is null then raise exception 'Demo student key conflicts with an existing or archived record: %',student_key; end if;
   insert into public.guardians(client_id,full_name,relationship,email,notes)
   values(client_key,'DEMO Parent '||lpad(i::text,2,'0'),'Parent','parent'||lpad(i::text,2,'0')||'@oqc.example.test',seed_tag||' — Synthetic demonstration only; no real recipient or delivery.')
   on conflict(client_id) do nothing;
   select id into guardian_uuid from public.guardians where client_id=client_key and notes like seed_tag||'%' and deleted_at is null;
   if guardian_uuid is null then raise exception 'Demo client key conflicts with an existing or archived record: %',client_key; end if;
   insert into public.student_guardians(student_id,guardian_id,is_primary)
   values(student_uuid,guardian_uuid,true) on conflict(student_id,guardian_id) do nothing;
 end loop;
end $$;
commit;
