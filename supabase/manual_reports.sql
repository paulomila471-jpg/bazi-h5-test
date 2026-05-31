create table if not exists public.manual_reports (
  id uuid primary key,
  lead_id uuid references public.leads(id),
  title text not null,
  content text not null,
  status text not null default '已生成',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists manual_reports_lead_id_idx on public.manual_reports(lead_id);

