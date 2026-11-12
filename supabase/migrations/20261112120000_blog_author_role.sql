insert into public.app_roles (key, name, description, sort_order)
values ('blog_author', 'Blog Author', 'Read, create and edit blog posts', 85)
on conflict (key) do nothing;

insert into public.app_role_permissions (role, permission)
values ('blog_author', 'blog:read'),
       ('blog_author', 'blog:create'),
       ('blog_author', 'blog:update')
on conflict (role, permission) do nothing;
