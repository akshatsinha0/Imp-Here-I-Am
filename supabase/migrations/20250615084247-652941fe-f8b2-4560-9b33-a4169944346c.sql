
-- 1. Create a Supabase storage bucket for attachments (voice, docs, etc)
insert into storage.buckets (id, name, public) values ('attachments', 'attachments', true);

-- 2. Add message_type and file_url columns for advanced messaging
alter table public.messages
  add column if not exists message_type text default 'text',
  add column if not exists file_url text,
  add column if not exists file_name text,
  add column if not exists file_mime text;

-- 3. Add a read status array to track which users have read a message
alter table public.messages
  add column if not exists readers uuid[] default array[]::uuid[];

-- 4. Enable row level security for messages if not already
alter table public.messages enable row level security;

-- 5. Allow sender or recipient in a conversation to update the readers (read receipts)
create policy "Allow read receipt on own conversations" 
on public.messages for update 
using (
  exists (
    select 1 from conversations c 
    where c.id = messages.conversation_id 
      and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
  )
)
with check (
  exists (
    select 1 from conversations c 
    where c.id = messages.conversation_id 
      and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
  )
);

-- 6. Allow all users to insert (send) messages to their conversations
create policy "Allow send message to own conversations" 
on public.messages for insert 
with check (
  exists (
    select 1 from conversations c 
    where c.id = messages.conversation_id 
      and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
  )
);

-- 7. Allow select (read) messages in your conversations
create policy "Allow select message in own conversations"
on public.messages for select 
using (
  exists (
    select 1 from conversations c 
    where c.id = messages.conversation_id 
      and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
  )
);

