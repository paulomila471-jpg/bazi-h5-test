create table if not exists public.bazi_reports (
  id uuid primary key,
  user_id uuid,
  profile_id uuid references public.bazi_profiles(id),
  report_type text,
  question text,
  focus text,
  pillars_json jsonb,
  annual_highlights_json jsonb,
  relationship_profile_json jsonb,
  luck_cycles_json jsonb,
  report_content text,
  created_at timestamptz not null default now()
);

create index if not exists bazi_reports_user_id_idx on public.bazi_reports(user_id);
create index if not exists bazi_reports_profile_id_idx on public.bazi_reports(profile_id);
create unique index if not exists bazi_reports_user_profile_type_idx
  on public.bazi_reports(user_id, profile_id, report_type);
