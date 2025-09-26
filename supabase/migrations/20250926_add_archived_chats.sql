create table if not exists public.archived_chats (
  user_id uuid not null,
  conversation_id uuid not null,
  archived_at timestamp with time zone default now(),
  primary key(user_id,conversation_id)
);
create index if not exists idx_archived_chats_user on public.archived_chats(user_id);
create index if not exists idx_archived_chats_conversation on public.archived_chats(conversation_id);
