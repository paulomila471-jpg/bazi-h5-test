create table if not exists public.reports (
  id uuid primary key,
  user_id uuid null,
  module text not null default 'bazi',
  question text,
  birth_date date,
  birth_time time,
  gender text,
  birth_place text,
  focus text,
  pillars_json jsonb,
  report text,
  payment_status text not null default 'paid',
  created_at timestamptz not null default now()
);
