-- Groups schema for HereIAm Chat
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null,
  created_at timestamp with time zone default now()
);
create index if not exists idx_groups_created_by on public.groups(created_by);

create table if not exists public.group_members (
  group_id uuid not null,
  user_id uuid not null,
  role text not null default 'member',
  joined_at timestamp with time zone default now(),
  primary key(group_id,user_id)
);
create index if not exists idx_group_members_user on public.group_members(user_id);
create index if not exists idx_group_members_group on public.group_members(group_id);

create table if not exists public.group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null,
  sender_id uuid not null,
  content text not null,
  created_at timestamp with time zone default now(),
  file_url text null,
  file_name text null,
  file_mime text null,
  message_type text null,
  readers uuid[] null,
  reply_to_id uuid null,
  edited_at timestamp with time zone null,
  deleted_at timestamp with time zone null,
  scheduled_at timestamp with time zone null,
  forwarded_from_id uuid null
);
create index if not exists idx_group_messages_group on public.group_messages(group_id);
create index if not exists idx_group_messages_created_at on public.group_messages(created_at);

