import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthUser } from "@/hooks/useAuthUser";
import { toast } from "@/components/ui/use-toast";
import { Tables } from "@/lib/types";
import { useSoundManager } from "@/utils/SoundManager";

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
interface ReactionRow { message_id:string; user_id:string; emoji:string }
const TYPING_TIMEOUT_MS = 2000;


export function useChatMessages(conversationId?: string) {
  const { user } = useAuthUser();
  const { playSendSound, playReceiveSound } = useSoundManager();
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
  const reactionSubRef = useRef<any>(null);
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
    if (!conversationId || !user?.id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    const fetchClearedAndMessages = async () => {
      try {
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
        const { data: msgs, error } = await query;
        if (error) {
          setMessages([]);
        } else {
          const base = (msgs||[]) as Message[];
          const ids = base.map(m=>m.id);
          let withReacts = base.map(m=>({ ...m, reactions: [] as any }));
          if (ids.length>0) {
            const { data: rx } = await supabase
              .from("message_reactions")
              .select("message_id,user_id,emoji")
              .in("message_id", ids);
            const map: Record<string,Record<string,Set<string>>> = {};
            (rx||[]).forEach((r:any)=>{ if(!map[r.message_id]) map[r.message_id]={}; if(!map[r.message_id][r.emoji]) map[r.message_id][r.emoji]=new Set(); map[r.message_id][r.emoji].add(r.user_id) });
            const userIds = Array.from(new Set((rx||[]).map((r:any)=>r.user_id)));
            let nameMap: Record<string,string> = {};
            if (userIds.length>0) {
              const { data: ups } = await supabase.from("user_profiles").select("id,display_name").in("id", userIds);
              (ups||[]).forEach((u:any)=>{ nameMap[u.id]=u.display_name });
            }
            withReacts = withReacts.map(m=>{
              const rm = map[m.id]||{}; const arr: any[] = [];
              Object.keys(rm).forEach(emoji=>{
                const users = Array.from(rm[emoji]).map(uid=>({ id:uid, display_name:nameMap[uid]||uid }));
                arr.push({ emoji, users });
              });
              return { ...m, reactions: arr };
            });
          }
          setMessages(withReacts);
        }
        if (cutoff && (!msgs || msgs.length === 0)) setIsCleared(true); else setIsCleared(false);
        setLoading(false);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
      } catch (error) {
        setLoading(false);
        setMessages([]);
      }
    };
    
    fetchClearedAndMessages();
  }, [conversationId, user?.id]);


  const realtimeSubRef = useRef<any>(null);
  useEffect(() => {
    if (!conversationId || !user?.id) return;
    
    // Clean up existing subscription
    const cleanup = async () => {
      if (realtimeSubRef.current) {
        await supabase.removeChannel(realtimeSubRef.current);
        realtimeSubRef.current = null;
      }
    };
    
    cleanup().then(() => {
      const channel = supabase
        .channel(`message-updates-${conversationId}-${user.id}-${Date.now()}`) // Add user ID and timestamp to ensure unique channel names
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            try {
              const newMessage = payload.new as Message;
              if (clearedAt && new Date(newMessage.created_at) <= new Date(clearedAt)) return;
              
              if (newMessage.sender_id !== user?.id) {
                playReceiveSound();
              }
              
              setMessages((prev) => {
                if (prev.some((msg) => msg.id === newMessage.id)) return prev;
                return [...prev, { ...newMessage, reactions: [] }];
              });
              setIsCleared(false);
              setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
            } catch (error) {
              console.error("Error handling new message:", error);
            }
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
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log(`[useChatMessages] Subscribed to message updates for conversation ${conversationId}`);
          } else if (status === "CHANNEL_ERROR") {
            console.error(`[useChatMessages] Channel error for conversation ${conversationId}`);
          } else if (status === "CLOSED") {
            console.log(`[useChatMessages] Channel closed for conversation ${conversationId}`);
          }
        });
      
      realtimeSubRef.current = channel;
    });
    
    return () => {
      cleanup();
    };
  }, [conversationId, user?.id, clearedAt, playReceiveSound]);
  useEffect(()=>{
    if(!conversationId||!user?.id) return;
    const mark=async()=>{
      setMessages(prev=>{
        const toRead=prev.filter(m=>m.sender_id!==user.id&&!(m.readers||[]).includes(user.id));
        toRead.forEach(async m=>{
          const next=[...(m.readers||[]),user.id];
          await supabase.from("messages").update({ readers: next }).eq("id",m.id);
        });
        return prev.map(m=> m.sender_id!==user.id&&!(m.readers||[]).includes(user.id)?{...m,readers:[...(m.readers||[]),user.id]}:m);
      });
    };
    mark();
  },[conversationId,user?.id]);
  const channelRef = useRef<any>(null);
  const reactChannelRef = useRef<any>(null);
  useEffect(() => {
    if (!conversationId || !user?.id) return;
    
    // Clean up existing presence channel
    const cleanup = async () => {
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
    
    cleanup().then(() => {
      const presCh = supabase.channel(`chat-presence-${conversationId}-${user.id}-${Date.now()}`, {
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
            console.log(`[useChatMessages] Subscribed to presence for conversation ${conversationId}`);
            try {
              await presCh.track({ isTyping: false });
            } catch (error) {
              console.warn("Error tracking initial presence:", error);
            }
          } else if (status === "CHANNEL_ERROR") {
            console.error(`[useChatMessages] Presence channel error for conversation ${conversationId}`);
          } else if (status === "CLOSED") {
            console.log(`[useChatMessages] Presence channel closed for conversation ${conversationId}`);
          }
        });
      
      channelRef.current = presCh;
    });
    
    return () => {
      cleanup();
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
        typingTimeout.current = null;
      }
    };
  }, [conversationId, user?.id]);
  function updateTypingIndicator(state: any) {
    try {
      for (const uid in state) {
        if (uid !== user?.id && state[uid]?.[0]?.isTyping) {
          setIsOtherTyping(true); 
          resetTypingTimeout(); 
          return;
        }
      }
      setIsOtherTyping(false);
    } catch (error) {
      console.warn("Error updating typing indicator:", error);
      setIsOtherTyping(false);
    }
  }
  function resetTypingTimeout() {
    try {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setIsOtherTyping(false), TYPING_TIMEOUT_MS + 500);
    } catch (error) {
      console.warn("Error resetting typing timeout:", error);
    }
  }
  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    try {
      if (channelRef.current) {
        await channelRef.current.track({ isTyping: true });
        setTimeout(() => channelRef.current?.track({ isTyping: false }), TYPING_TIMEOUT_MS);
      }
    } catch (error) {
      console.warn("Error tracking typing status:", error);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };
  const toggleReaction=async(messageId:string,emoji:string)=>{
    if(!user?.id) return;
    const msg=messages.find(m=>m.id===messageId);
    const has=msg?.reactions?.find(r=>r.emoji===emoji)?.users.some(u=>u.id===user.id);
    if(has){
      await supabase.from("message_reactions").delete().eq("message_id",messageId).eq("user_id",user.id).eq("emoji",emoji);
      setMessages(prev=> prev.map(m=>{
        if(m.id!==messageId) return m;
        const rx=(m.reactions||[]).map(r=> r.emoji===emoji?{...r,users:r.users.filter(u=>u.id!==user.id)}:r).filter(r=>r.users.length>0);
        return { ...m, reactions: rx };
      }));
    } else {
      await supabase.from("message_reactions").insert([{ message_id:messageId, user_id:user.id, emoji }]);
      setMessages(prev=> prev.map(m=>{
        if(m.id!==messageId) return m;
        const rx=(m.reactions||[]);
        const idx=rx.findIndex(r=>r.emoji===emoji);
        if(idx===-1) rx.push({ emoji, users:[{ id:user.id, display_name: user.email||user.id }] }); else rx[idx]={...rx[idx],users:[...rx[idx].users,{ id:user.id, display_name: user.email||user.id }]};
        return { ...m, reactions: rx };
      }));
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
    if (replyToMessage) {
      messageData.reply_to_id = replyToMessage.id;
    }
    if (scheduledTime) {
      messageData.scheduled_at = scheduledTime;
    }
    const { data, error } = await supabase
      .from("messages")
      .insert([messageData])
      .select()
      .single();
    if (!error && data) {
      // Play send sound
      playSendSound();
      
      if (!scheduledTime) {
        setMessages((prev) => [...prev, { ...data, reactions: [] }]);
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
  if (!conversationId) {
    return {
      user: null,
      messages: [],
      setMessages: () => {},
      input: "",
      setInput: () => {},
      loading: false,
      uploadingFile: false,
      file: null,
      setFile: () => {},
      sendMessage: async () => {},
      handleTyping: () => {},
      handleKeyDown: () => {},
      isOtherTyping: false,
      theme: "auto" as const,
      messagesEndRef: { current: null },
      partnerProfile: null,
      clearChat: async () => {},
      isCleared: false,
      toggleReaction: async()=>{},
    };
  }

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
    toggleReaction,
  };
}
