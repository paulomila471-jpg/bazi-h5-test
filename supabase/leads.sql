create table if not exists public.leads (
  id uuid primary key,
  nickname text,
  birth_date text not null,
  birth_time text not null,
  birth_place text,
  gender text,
  question text,
  wechat text,
  status text not null default '未联系',
  created_at timestamp with time zone default now()
);

create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_created_at_idx on public.leads(created_at desc);
