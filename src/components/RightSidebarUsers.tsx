import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Tables } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import { useAuthUser } from "@/hooks/useAuthUser";
import UserBrief from "@/components/UserBrief";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
type UserProfile = Tables<"user_profiles">;
interface RightSidebarUsersProps {
  onConversationStarted?: (conversation: {
    id: string;
    participant_1: string;
    participant_2: string;
  }) => void;
}
async function getOrCreateConversation(
  currentUserId: string,
  targetUserId: string
): Promise<{ id: string; participant_1: string; participant_2: string } | null> {
  if (!currentUserId || !targetUserId) return null;
  const { data: existing, error: existingErr } = await supabase
    .from("conversations")
    .select("*")
    .or(`and(participant_1.eq.${currentUserId},participant_2.eq.${targetUserId}),and(participant_1.eq.${targetUserId},participant_2.eq.${currentUserId})`)
    .maybeSingle();
  if (existingErr) {
    toast({ title: "Error", description: "Failed to fetch conversation.", variant: "destructive" });
    return null;
  }
  if (existing) return existing;
  const { data: created, error: createErr } = await supabase
    .from("conversations")
    .insert([
      {
        participant_1: currentUserId,
        participant_2: targetUserId,
      },
    ])
    .select()
    .single();
  if (createErr) {
    toast({ title: "Error", description: "Could not create conversation.", variant: "destructive" });
    return null;
  }
  return created;
}
export default function RightSidebarUsers({ onConversationStarted }: RightSidebarUsersProps = {}) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<UserProfile[]>([]);
  const { user } = useAuthUser();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("user_profiles").select("*");
      if (error) {
        console.error("Failed to fetch users", error);
        return;
      }
      setUsers(data || []);
    };
    fetchUsers();
  }, []);
  useEffect(() => {
    if (!search) {
      setFiltered(users);
      return;
    }
    const s = search.toLowerCase();
    setFiltered(
      users.filter((u) =>
        (u.display_name || u.email).toLowerCase().includes(s)
      )
    );
  }, [search, users]);
  const [conversations, setConversations] = useState<{ [key: string]: string }>({});
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`);
      if (error) return;
      const map: { [key: string]: string } = {};
      (data || []).forEach((conv) => {
        const otherId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;
        map[otherId] = conv.id;
      });
      setConversations(map);
    };
    fetchConversations();
  }, [user?.id, users.length]);
  const handleStartChatting = async (targetUserId: string) => {
    if (!user?.id) {
      toast({ title: "Error", description: "You must be logged in!", variant: "destructive" });
      return null;
    }
    if (user.id === targetUserId) {
      toast({ title: "Cannot chat yourself", description: "Try the 'Personal Space' feature in the left sidebar!" });
      return null;
    }
    const convo = await getOrCreateConversation(user.id, targetUserId);
    if (convo?.id) {
      if (onConversationStarted) onConversationStarted(convo);
      navigate(`/chat/${convo.id}`);
    }
    return convo;
  };
  const handleOpenChat = async (conversationId: string, profile: UserProfile) => {
    if (!conversationId) {
      const convo = await handleStartChatting(profile.id);
      if (convo && onConversationStarted) onConversationStarted(convo);
      return;
    }
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .maybeSingle();
    if (data && data.id) {
      if (onConversationStarted) onConversationStarted(data);
    }
    navigate(`/chat/${conversationId}`);
  };
  return (
    <aside
      className="w-[350px] max-w-[440px] border-l p-4 flex flex-col bg-gradient-to-b from-sidebar to-background/80 h-full"
    >
      <div className="font-bold text-lg mb-3 text-primary tracking-wider">
        Registered Users
      </div>
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <User className="w-4 h-4" />
        </span>
        <Input
          placeholder="Search registered users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-180px)]">
        {filtered.length === 0 && (
          <div className="text-muted-foreground text-xs px-2">
            No users found.
          </div>
        )}
        {filtered.map((profile) => {
          const isMe = user?.id === profile.id;
          const isOnline = profile.is_online;
          const hasConversation = conversations[profile.id];
          return (
            <div
              key={profile.id}
              className="flex items-center gap-2 px-2 py-1 rounded transition hover:bg-accent/80"
            >
              <UserBrief profile={profile} size={7} />
              <span className="italic text-xs text-muted-foreground ml-1">
                {isOnline ? "Online" : "Offline"}
              </span>
              <span
                className={`ml-auto h-2 w-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
                title={isOnline ? "Online" : "Offline"}
              />
              {!isMe && (
                <>
                  {hasConversation ? (
                    <Button
                      size="sm"
                      className="ml-2 px-2 py-1"
                      variant="secondary"
                      onClick={async () => {
                        await handleOpenChat(conversations[profile.id], profile);
                      }}
                    >
                      Open Chat
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="ml-2 px-2 py-1"
                      onClick={async () => {
                        const convo = await handleStartChatting(profile.id);
                        if (convo && convo.id && onConversationStarted) {
                          onConversationStarted(convo);
                        }
                      }}
                    >
                      Start Chatting
                    </Button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}