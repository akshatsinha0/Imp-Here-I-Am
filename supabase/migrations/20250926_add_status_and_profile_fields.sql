create table if not exists public.statuses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  file_url text not null,
  file_mime text null,
  caption text null,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone not null
);
create index if not exists idx_statuses_user on public.statuses(user_id);
create index if not exists idx_statuses_expires on public.statuses(expires_at);

alter table public.user_profiles add column if not exists avatar_url text null;
alter table public.user_profiles add column if not exists phone text null;
alter table public.user_profiles add column if not exists location text null;
alter table public.user_profiles add column if not exists bio text null;
alter table public.user_profiles add column if not exists skills text null;
alter table public.user_profiles add column if not exists interests text null;
