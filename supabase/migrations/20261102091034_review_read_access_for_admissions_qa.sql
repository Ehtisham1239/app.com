-- Route new and low-rated customer feedback notifications to Admissions and QA.
-- CEO visibility is provided by the existing super_admin permission.
insert into public.app_role_permissions(role,permission)
values ('admissions','testimonials:read'),('qa','testimonials:read')
on conflict (role,permission) do nothing;
