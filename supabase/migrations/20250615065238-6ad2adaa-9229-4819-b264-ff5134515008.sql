
-- 1. DROP existing foreign key constraints on conversations  
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_participant_1_fkey;
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_participant_2_fkey;

-- 2. Re-add with ON DELETE CASCADE
ALTER TABLE public.conversations
ADD CONSTRAINT conversations_participant_1_fkey
FOREIGN KEY (participant_1)
REFERENCES auth.users(id)
ON DELETE CASCADE;

ALTER TABLE public.conversations
ADD CONSTRAINT conversations_participant_2_fkey
FOREIGN KEY (participant_2)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 3. Ensure messages table sender_id has ON DELETE CASCADE
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE public.messages
ADD CONSTRAINT messages_sender_id_fkey
FOREIGN KEY (sender_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 4. Ensure user_profiles.id is deleted with user (works if FK already ON DELETE CASCADE; just for safety)
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;
ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;
