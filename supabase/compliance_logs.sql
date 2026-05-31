create table if not exists public.sensitive_word_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  report_id uuid,
  category text not null,
  keyword text not null,
  original_excerpt text,
  created_at timestamp with time zone default now()
);

create table if not exists public.ai_generation_failure_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  report_id uuid,
  provider text,
  error_message text not null,
  created_at timestamp with time zone default now()
);

create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  contact text,
  reason text,
  status text not null default 'pending',
  created_at timestamp with time zone default now()
);

