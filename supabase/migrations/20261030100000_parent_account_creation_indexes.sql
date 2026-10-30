-- Covering indexes for private.parent_account_creations foreign keys (Supabase performance advisor).
create index if not exists parent_account_creations_guardian_idx on private.parent_account_creations(guardian_id);
create index if not exists parent_account_creations_created_by_idx on private.parent_account_creations(created_by);
