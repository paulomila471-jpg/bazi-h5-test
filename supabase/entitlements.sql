create table if not exists public.entitlements (
  id uuid primary key,
  user_id uuid not null,
  profile_id uuid references public.bazi_profiles(id),
  report_id uuid references public.bazi_reports(id),
  order_id uuid references public.purchases(id),
  product_type text not null,
  access_scope text not null default 'full_report',
  status text not null default 'active',
  created_at timestamp with time zone default now()
);

create index if not exists entitlements_user_id_idx on public.entitlements(user_id);
create index if not exists entitlements_report_id_idx on public.entitlements(report_id);
create unique index if not exists entitlements_active_report_idx
  on public.entitlements(user_id, report_id, access_scope)
  where status = 'active' and report_id is not null;

