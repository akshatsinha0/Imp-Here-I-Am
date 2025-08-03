
-- Table to store user's pinned conversations
CREATE TABLE public.pinned_chats (
  user_id uuid NOT NULL,
  conversation_id uuid NOT NULL,
  pinned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, conversation_id)
);

ALTER TABLE public.pinned_chats ENABLE ROW LEVEL SECURITY;

-- Only the owner can see their pinned chats
CREATE POLICY "Users can view their own pinned chats"
  ON public.pinned_chats
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only the owner can pin a chat
CREATE POLICY "Users can insert their own pinned chats"
  ON public.pinned_chats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only the owner can unpin their chat
CREATE POLICY "Users can delete their own pinned chats"
  ON public.pinned_chats
  FOR DELETE
  USING (auth.uid() = user_id);
