import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthUser } from "@/hooks/useAuthUser";
import { toast } from "@/components/ui/use-toast";
import { Tables } from "@/lib/types";

export enum MessageActionType {
  REPLY = 'REPLY',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
}

export interface MessageAction {
  type: MessageActionType;
  payload?: any;
}
export interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  file_url: string | null;
  file_name: string | null;
  file_mime: string | null;
  message_type: string | null;
  readers: string[] | null;
  reply_to_id?: string | null;
  edited_at?: string | null;
  deleted_at?: string | null;
  reactions?: Array<{
    emoji: string;
    users: Array<{
      id: string;
      display_name: string;
    }>;
  }>;
  reply_to?: Message | null;
}
const TYPING_TIMEOUT_MS = 2000;
export function useChatMessages(conversationId?: string) {
  const { user } = useAuthUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [theme, setTheme] = useState<"light"|"dark"|"auto">("auto");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<{ display_name: string } | null>(null);
  const [clearedAt, setClearedAt] = useState<string | null>(null);
  const [isCleared, setIsCleared] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);
  useEffect(() => {
    if (!conversationId || !user?.id) return;
    supabase
      .from("cleared_chats")
      .select("cleared_at")
      .eq("user_id", user.id)
      .eq("conversation_id", conversationId)
      .maybeSingle()
      .then(({ data }) => {
        if (data && data.cleared_at) {
          setClearedAt(data.cleared_at);
        } else {
          setClearedAt(null);
        }
      });
  }, [conversationId, user?.id]);
  useEffect(() => {
    const fetchPartner = async () => {
      if (!conversationId || !user?.id) return;
      const { data: conversation } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .maybeSingle();
      if (!conversation) return;
      const partnerId = conversation.participant_1 === user.id ? conversation.participant_2 : conversation.participant_1;
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("display_name")
        .eq("id", partnerId)
        .maybeSingle();
      setPartnerProfile(profile ? { display_name: profile.display_name } : null);
    };
    fetchPartner();
  }, [conversationId, user?.id]);
  useEffect(() => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) setTheme("dark");
    else setTheme("light");
  }, []);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? "dark" : "light");
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  useEffect(() => {
    if (!conversationId || !user?.id) return;
    setLoading(true);
    const fetchClearedAndMessages = async () => {
      const { data: clearData } = await supabase
        .from("cleared_chats")
        .select("cleared_at")
        .eq("user_id", user.id)
        .eq("conversation_id", conversationId)
        .maybeSingle();
      let cutoff = clearData?.cleared_at ?? null;
      setClearedAt(cutoff);
      let query = supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (cutoff) query = query.gt("created_at", cutoff);
      const { data: msgs } = await query;
      setMessages((msgs as Message[]) || []);
      if (cutoff && (!msgs || msgs.length === 0)) {
        setIsCleared(true);
      } else {
        setIsCleared(false);
      }
      setLoading(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
    };
    fetchClearedAndMessages();
  }, [conversationId, user?.id]);
  const realtimeSubRef = useRef<any>(null);
  useEffect(() => {
    if (!conversationId) return;
    if (realtimeSubRef.current) {
      supabase.removeChannel(realtimeSubRef.current);
    }
    const channel = supabase
      .channel(`message-updates-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (clearedAt && new Date(newMessage.created_at) <= new Date(clearedAt)) return;
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
          setIsCleared(false);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
            )
          );
        }
      )
      .subscribe();
    realtimeSubRef.current = channel;
    return () => {
      if (realtimeSubRef.current) {
        supabase.removeChannel(realtimeSubRef.current);
        realtimeSubRef.current = null;
      }
    };
  }, [conversationId, clearedAt]);
  const channelRef = useRef<any>(null);
  useEffect(() => {
    if (!conversationId || !user?.id) return;
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    const presCh = supabase.channel(`chat-${conversationId}`, {
      config: { presence: { key: user.id } },
    });
    presCh
      .on("presence", { event: "sync" }, () => {
        updateTypingIndicator(presCh.presenceState());
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        if (key !== user.id && newPresences?.[0]?.isTyping) {
          setIsOtherTyping(true);
          resetTypingTimeout();
        }
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        if (key !== user.id) setIsOtherTyping(false);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presCh.track({ isTyping: false });
        }
      });
    channelRef.current = presCh;
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current); channelRef.current = null;
      }
      clearTimeout(typingTimeout.current!);
    };
  }, [conversationId, user?.id]);
  function updateTypingIndicator(state: any) {
    for (const uid in state) {
      if (uid !== user?.id && state[uid]?.[0]?.isTyping) {
        setIsOtherTyping(true); resetTypingTimeout(); return;
      }
    }
    setIsOtherTyping(false);
  }
  function resetTypingTimeout() {
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setIsOtherTyping(false), TYPING_TIMEOUT_MS + 500);
  }
  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (channelRef.current) {
      await channelRef.current.track({ isTyping: true });
      setTimeout(() => channelRef.current?.track({ isTyping: false }), TYPING_TIMEOUT_MS);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };
  async function uploadToSupabaseStorage(file: File): Promise<{ url?: string; fileName?: string; mime?: string }> {
    setUploadingFile(true);
    const filePath = `${conversationId}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from("attachments").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploadingFile(false);
      return {};
    }
    const { data: pub } = supabase.storage.from("attachments").getPublicUrl(filePath);
    setUploadingFile(false);
    return { url: pub?.publicUrl || "", fileName: file.name, mime: file.type };
  }
  const sendMessage = async (opts?: { sendVoiceBlob?: Blob }) => {
    if ((!input.trim() && !file && !opts?.sendVoiceBlob) || !user || !conversationId) return;
    let outType = "text";
    let file_url: string | undefined = undefined;
    let file_name: string | undefined = undefined;
    let file_mime: string | undefined = undefined;
    let outContent = input;
    if (file) {
      const info = await uploadToSupabaseStorage(file);
      if (!info.url) return;
      outType = info.mime?.startsWith("audio/") ? "voice_note" : "file";
      file_url = info.url; file_name = info.fileName; file_mime = info.mime;
      outContent = info.fileName || "Attachment";
    } else if (opts?.sendVoiceBlob) {
      const dummyName = `VoiceNote_${Date.now()}.webm`;
      const dummyFile = new File([opts.sendVoiceBlob], dummyName, { type: "audio/webm" });
      const info = await uploadToSupabaseStorage(dummyFile);
      if (!info.url) return;
      outType = "voice_note"; file_url = info.url; file_name = dummyName; file_mime = "audio/webm";
      outContent = "Voice Note";
    }
    const messageData: any = {
      content: outContent,
      conversation_id: conversationId,
      sender_id: user.id,
      message_type: outType,
      file_url,
      file_name,
      file_mime,
      readers: [user.id],
    };
    
    // Add reply_to_id if replying
    if (replyToMessage) {
      messageData.reply_to_id = replyToMessage.id;
    }
    
    // Add scheduled_at if scheduling
    if (scheduledTime) {
      messageData.scheduled_at = scheduledTime;
    }
    
    const { data, error } = await supabase
      .from("messages")
      .insert([messageData])
      .select()
      .single();
    if (!error && data) {
      if (!scheduledTime) {
        setMessages((prev) => [...prev, data]);
      }
      setInput(""); 
      setFile(null);
      setReplyToMessage(null);
      setScheduledTime(null);
      setIsCleared(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      if (channelRef.current) channelRef.current.track({ isTyping: false });
      
      if (scheduledTime) {
        toast({ title: "Message scheduled", description: `Your message will be sent at ${new Date(scheduledTime).toLocaleString()}` });
      }
    } else if (error) {
      toast({ title: "Failed to send message", description: error.message, variant: "destructive" });
    }
  };
  const clearChat = async () => {
    if (!conversationId || !user?.id) return;
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("cleared_chats")
      .upsert({
        user_id: user.id,
        conversation_id: conversationId,
        cleared_at: now,
      })
    if (error) {
      toast({ title: "Failed to clear chat", description: error.message, variant: "destructive" });
      return;
    }
    setMessages([]);
    setClearedAt(now);
    setIsCleared(true);
    toast({ title: "Chat history cleared for you" });
  };
  useEffect(() => {
    if (!messages.length || !user?.id) return;
    const unreadMsgs = messages.filter(
      (msg) => msg.sender_id !== user.id && (!msg.readers || !msg.readers.includes(user.id))
    );
    if (!unreadMsgs.length) return;
    unreadMsgs.forEach(async (msg) => {
      const currentReaders = (msg.readers ?? []).slice();
      if (!currentReaders.includes(user.id)) {
        const newReaders = [...currentReaders, user.id];
        await supabase
          .from("messages")
          .update({ readers: newReaders })
          .eq("id", msg.id);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msg.id ? { ...m, readers: newReaders } : m
          )
        );
      }
    });
  }, [messages, user?.id]);
  return {
    user,
    messages,
    setMessages,
    input,
    setInput,
    loading,
    uploadingFile,
    file,
    setFile,
    sendMessage,
    handleTyping,
    handleKeyDown,
    isOtherTyping,
    theme,
    messagesEndRef,
    partnerProfile,
    clearChat,
    isCleared,
  };
}