create extension if not exists "pgcrypto";

create table if not exists public.manual_orders (
  id uuid primary key default gen_random_uuid(),
  report_code text unique not null,
  status text not null default 'pending_manual_unlock',
  birth_date text not null,
  birth_time text not null,
  birth_type text not null default 'solar',
  gender text not null,
  birth_place text,
  focus text not null,
  question text,
  pillars_json jsonb not null,
  annual_highlights_json jsonb,
  relationship_profile_json jsonb,
  luck_cycles_json jsonb,
  professional_view text,
  full_report text,
  report_sections_json jsonb,
  contact_wechat text default 'guotingyuan258',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists manual_orders_report_code_idx on public.manual_orders (report_code);
create index if not exists manual_orders_status_idx on public.manual_orders (status);
create index if not exists manual_orders_created_at_idx on public.manual_orders (created_at desc);

alter table public.manual_orders
add column if not exists report_sections_json jsonb;

alter table public.manual_orders enable row level security;

drop policy if exists "manual_orders_anon_insert_pending" on public.manual_orders;
create policy "manual_orders_anon_insert_pending"
on public.manual_orders
for insert
to anon
with check (status = 'pending_manual_unlock');

drop policy if exists "manual_orders_anon_upsert_pending" on public.manual_orders;
create policy "manual_orders_anon_upsert_pending"
on public.manual_orders
for update
to anon
using (status = 'pending_manual_unlock')
with check (status = 'pending_manual_unlock');

-- H5 test shortcut: anon can read/update manual orders so the browser-only admin can work.
-- Before public production, replace this with a server API using a Supabase service role key
-- stored only in Vercel server environment variables.
drop policy if exists "manual_orders_test_admin_select" on public.manual_orders;
create policy "manual_orders_test_admin_select"
on public.manual_orders
for select
to anon
using (true);

drop policy if exists "manual_orders_test_admin_update_status" on public.manual_orders;
create policy "manual_orders_test_admin_update_status"
on public.manual_orders
for update
to anon
using (true)
with check (status in ('pending_manual_unlock', 'paid', 'sent', 'cancelled'));
