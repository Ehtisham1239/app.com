-- Covering indexes for the reviewer/approver/publisher foreign keys (Supabase performance advisor).
create index if not exists result_import_batches_reviewed_by_idx on public.result_import_batches(reviewed_by);
create index if not exists result_import_batches_approved_by_idx on public.result_import_batches(approved_by);
create index if not exists result_import_batches_published_by_idx on public.result_import_batches(published_by);
