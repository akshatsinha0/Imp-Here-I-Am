
-- Table for tracking per-user chat clears
CREATE TABLE public.cleared_chats (
  user_id uuid NOT NULL,
  conversation_id uuid NOT NULL,
  cleared_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, conversation_id)
);

-- Enable row level security
ALTER TABLE public.cleared_chats ENABLE ROW LEVEL SECURITY;

-- Users can manage their own clears
CREATE POLICY "User can see their own cleared chats" ON public.cleared_chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "User can clear their own chats" ON public.cleared_chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can update cleared_at for their own chats" ON public.cleared_chats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "User can remove their own cleared chat record" ON public.cleared_chats
  FOR DELETE USING (auth.uid() = user_id);
