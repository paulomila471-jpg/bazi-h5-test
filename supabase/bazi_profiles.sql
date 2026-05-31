create table if not exists public.bazi_profiles (
  id uuid primary key,
  user_id uuid,
  name text,
  gender text,
  birth_date text,
  birth_time text,
  birth_type text,
  is_leap_month boolean default false,
  birth_place text,
  timezone text default 'Asia/Shanghai',
  use_true_solar_time boolean default false,
  created_at timestamptz not null default now()
);

create index if not exists bazi_profiles_user_id_idx on public.bazi_profiles(user_id);
