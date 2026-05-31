create table if not exists public.purchases (
  id uuid primary key,
  user_id uuid,
  profile_id uuid references public.bazi_profiles(id),
  report_id uuid references public.bazi_reports(id),
  product_type text,
  amount integer,
  currency text default 'CNY',
  payment_status text,
  created_at timestamptz not null default now()
);

create index if not exists purchases_user_id_idx on public.purchases(user_id);
create index if not exists purchases_report_id_idx on public.purchases(report_id);
create unique index if not exists purchases_paid_report_idx
  on public.purchases(user_id, report_id)
  where payment_status = 'paid';
create unique index if not exists purchases_paid_profile_product_idx
  on public.purchases(user_id, profile_id, product_type)
  where payment_status = 'paid';
