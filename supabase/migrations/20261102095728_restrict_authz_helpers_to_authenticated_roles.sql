-- These identity/authorization helpers only make sense for signed-in staff and teachers.
-- They are used by authenticated RLS policies and the admin client, not by anonymous visitors.
revoke all on function public.get_my_access() from public, anon;
grant execute on function public.get_my_access() to authenticated, service_role;

revoke all on function public.has_permission(text) from public, anon;
grant execute on function public.has_permission(text) to authenticated, service_role;

revoke all on function public.is_staff() from public, anon;
grant execute on function public.is_staff() to authenticated, service_role;

revoke all on function public.my_teacher_id() from public, anon;
grant execute on function public.my_teacher_id() to authenticated, service_role;
