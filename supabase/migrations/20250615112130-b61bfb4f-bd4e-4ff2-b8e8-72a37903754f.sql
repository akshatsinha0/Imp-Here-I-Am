
-- 1. Drop existing foreign key between messages and conversations
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;

-- 2. Re-add the foreign key with ON DELETE CASCADE, so deleting a conversation deletes all messages tied to it
ALTER TABLE public.messages
ADD CONSTRAINT messages_conversation_id_fkey
FOREIGN KEY (conversation_id)
REFERENCES public.conversations(id)
ON DELETE CASCADE;
