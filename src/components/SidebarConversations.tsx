import { User, Pin } from "lucide-react";
import UserBrief from "@/components/UserBrief";
import { Tables } from "@/lib/types";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { EllipsisVertical, Trash } from "lucide-react";
import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import SidebarConversationRow from "./SidebarConversationRow";
import { useSidebarConversations } from "./useSidebarConversations";
type Conversation = {
  id: string;
  participant_1: string;
  participant_2: string;
};
type UserProfile = Tables<"user_profiles">;
export default function SidebarConversations({
  conversations,
  userProfiles,
  unreadCounts,
  userId,
  setActiveConversation,
  setUnreadCounts,
  onDeleteConversation,
  pinnedChats = {},
  onPinConversation,
}: {
  conversations: Conversation[];
  userProfiles: Record<string, UserProfile>;
  unreadCounts: Record<string, number>;
  userId: string;
  setActiveConversation: (id: string) => void;
  setUnreadCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  onDeleteConversation: (id: string) => void;
  pinnedChats?: Record<string, string>;
  onPinConversation?: (id: string, pin: boolean) => void;
}) {
  const location = useLocation();
  const params = useParams();
  const currentChatId = location.pathname.startsWith("/chat/") && params?.id
    ? params.id
    : null;
  const [search, setSearch] = React.useState("");
  const sortedConvos = useSidebarConversations({
    conversations,
    userId,
    userProfiles,
    pinnedChats,
    search,
  });
  React.useEffect(() => {
    console.log("[Sidebar] Rendering convos:", sortedConvos);
    console.log("[Sidebar] UserProfiles keys:", Object.keys(userProfiles));
  }, [sortedConvos, userProfiles]);
  return (
    <div className="flex-1 overflow-y-auto mt-2">
      <div className="text-[13px] text-muted-foreground mb-1 font-semibold uppercase tracking-wide">
        Conversations
      </div>
      <div className="mb-2">
        <Input
          placeholder="Search conversations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-9 text-sm"
        />
      </div>
      {sortedConvos.length > 0 ? (
        sortedConvos.map((c) => (
          <SidebarConversationRow
            key={c.id}
            conversation={c}
            userProfiles={userProfiles}
            unreadCounts={unreadCounts}
            userId={userId}
            isPinned={!!pinnedChats?.[c.id]}
            isActive={currentChatId === c.id}
            setActiveConversation={setActiveConversation}
            setUnreadCounts={setUnreadCounts}
            onDeleteConversation={onDeleteConversation}
            pinnedChats={pinnedChats}
            onPinConversation={onPinConversation}
            currentChatId={currentChatId}
          />
        ))
      ) : (
        <div className="mt-4 text-muted-foreground text-sm">
          {search
            ? "No conversations match your search."
            : "Your conversations will appear here."}
        </div>
      )}
    </div>
  );
}