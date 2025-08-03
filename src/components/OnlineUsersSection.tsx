import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Tables } from "@/lib/types";
import UserBrief from "@/components/UserBrief";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
type UserProfile = Tables<"user_profiles">;
interface OnlineUsersSectionProps {
  onConversationStarted?: (conversation: {
    id: string;
    participant_1: string;
    participant_2: string;
  }) => void;
}
export default function OnlineUsersSection({ onConversationStarted }: OnlineUsersSectionProps = {}) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const { user } = useAuthUser();
  const navigate = useNavigate();
  useEffect(() => {
    supabase
      .from("user_profiles")
      .select("*")
      .then(({ data }) => {
        setUsers(data?.filter((u) => !!u) || []);
      });
  }, []);
  async function getOrCreateConversation(currentUserId: string, targetUserId: string) {
    if (!currentUserId || !targetUserId) return null;
    const { data: existing, error: existingErr } = await supabase
      .from("conversations")
      .select("*")
      .or(
        `and(participant_1.eq.${currentUserId},participant_2.eq.${targetUserId}),and(participant_1.eq.${targetUserId},participant_2.eq.${currentUserId})`
      )
      .maybeSingle();
    if (existingErr) {
      toast({
        title: "Error",
        description: "Failed to fetch conversation.",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: "Could not create conversation.",
        variant: "destructive",
      });
      return null;
    }
    return created;
  }
  const handleStartChat = async (targetUserId: string) => {
    if (!user?.id) return;
    if (user.id === targetUserId) {
      toast({
        title: "Cannot chat yourself",
        description: "Try the 'Personal Space' feature instead!",
      });
      return;
    }
    const convo = await getOrCreateConversation(user.id, targetUserId);
    if (convo?.id) {
      if (onConversationStarted) {
        onConversationStarted(convo);
      }
      navigate(`/chat/${convo.id}`);
    }
  };
  return (
    <div className="mb-4">
      <div className="font-semibold text-xs uppercase text-muted-foreground mb-1 px-2 tracking-widest">
        Online Users
      </div>
      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
        {users.length === 0 && (
          <div className="text-xs px-2 text-muted-foreground">No users online.</div>
        )}
        {users
          .filter((profile) => profile.id !== user?.id)
          .map((profile) => (
            <button
              key={profile.id}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-accent/70 transition"
              onClick={() => handleStartChat(profile.id)}
            >
              <UserBrief profile={profile} size={7} />
              <span
                className={`ml-auto h-2 w-2 rounded-full ${profile.is_online ? "bg-green-500" : "bg-gray-400"} `}
                title={profile.is_online ? "Online" : "Offline"}
              />
            </button>
          ))}
      </div>
    </div>
  );
}