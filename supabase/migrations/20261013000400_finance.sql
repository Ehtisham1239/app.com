-- Finance: invoices (with line items), payments. Amounts are integers in minor units (cents/pence).

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  student_id uuid not null references public.students(id) on delete restrict,
  enrollment_id uuid references public.enrollments(id) on delete set null,
  guardian_id uuid references public.guardians(id) on delete set null,
  bill_to_name text,
  bill_to_email text,
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  subtotal_minor int not null default 0 check (subtotal_minor >= 0),
  discount_minor int not null default 0 check (discount_minor >= 0),
  total_minor int not null default 0 check (total_minor >= 0),
  paid_minor int not null default 0 check (paid_minor >= 0),
  status text not null default 'draft' check (status in ('draft', 'issued', 'paid', 'void')),
  issue_date date,
  due_date date,
  period_start date,
  period_end date,
  notes text,
  void_reason text,
  voided_at timestamptz,
  created_by uuid default auth.uid() references public.profiles(id) on delete set null,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (discount_minor <= subtotal_minor)
);
create index invoices_student_idx on public.invoices(student_id);
create index invoices_enrollment_idx on public.invoices(enrollment_id, period_start);
create index invoices_status_idx on public.invoices(status, due_date) where deleted_at is null;
create unique index invoices_enrollment_period_unique on public.invoices(enrollment_id, period_start)
  where enrollment_id is not null and period_start is not null and status <> 'void' and deleted_at is null;

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null check (char_length(description) between 1 and 300),
  quantity numeric(10, 2) not null default 1 check (quantity > 0),
  unit_amount_minor int not null check (unit_amount_minor >= 0),
  amount_minor int generated always as (round(quantity * unit_amount_minor)::int) stored,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index invoice_items_invoice_idx on public.invoice_items(invoice_id, sort_order);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete restrict,
  amount_minor int not null check (amount_minor > 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  method text not null default 'bank_transfer' check (method in ('bank_transfer', 'card', 'paypal', 'cash', 'other')),
  reference text,
  received_at timestamptz not null default now(),
  notes text,
  recorded_by uuid default auth.uid() references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index payments_invoice_idx on public.payments(invoice_id);
create index payments_received_idx on public.payments(received_at desc);
