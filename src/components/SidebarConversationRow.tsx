import { Pin, EllipsisVertical, Trash } from "lucide-react";
import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import UserBrief from "@/components/UserBrief";
import { Tables } from "@/lib/types";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
type Conversation = {
  id: string;
  participant_1: string;
  participant_2: string;
};
type UserProfile = Tables<"user_profiles">;
interface SidebarConversationRowProps {
  conversation: Conversation;
  userProfiles: Record<string, UserProfile>;
  unreadCounts: Record<string, number>;
  userId: string;
  isPinned: boolean;
  isActive: boolean;
  onPinConversation?: (id: string, pin: boolean) => void;
  setActiveConversation: (id: string) => void;
  setUnreadCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  pinnedChats?: Record<string, string>;
  onDeleteConversation: (id: string) => void;
  currentChatId: string | null;
  onConversationClick?: (id: string) => void;
}
export default function SidebarConversationRow({
  conversation: c,
  userProfiles,
  unreadCounts,
  userId,
  isPinned,
  isActive,
  onPinConversation,
  setActiveConversation,
  setUnreadCounts,
  onDeleteConversation,
  currentChatId,
  onConversationClick,
}: SidebarConversationRowProps) {
  const navigate = useNavigate();
  const handleDeleteConversation = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete this conversation? This cannot be undone.");
    if (!confirm) return;
    const { error } = await supabase.from("conversations").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete", description: error.message });
      return;
    }
    toast({ title: "Conversation and chat history permanently deleted." });
    if (currentChatId === id) {
      navigate("/");
    }
    onDeleteConversation(id);
  };
  const otherParticipantId =
    c.participant_1 === userId ? c.participant_2 : c.participant_1;
  const otherProfile = userProfiles[otherParticipantId];
  const [draft,setDraft]=React.useState("");
  React.useEffect(()=>{
    const key=`draft:conv:${c.id}`; const load=()=>setDraft(localStorage.getItem(key)||""); load();
    const listener=(e:StorageEvent)=>{ if(e.key===key) load() };
    window.addEventListener('storage',listener);
    return ()=>window.removeEventListener('storage',listener);
  },[c.id]);
  return (
    <div className="relative w-full">
      <button
        onClick={() => {
          if (onConversationClick) {
            onConversationClick(c.id);
          } else {
            navigate(`/chat/${c.id}`);
          }
          setActiveConversation(c.id);
          setUnreadCounts((prev) => ({
            ...prev,
            [c.id]: 0,
          }));
        }}
        className={`flex items-center gap-2 w-full p-2 rounded mb-1 transition outline-none relative
            ${isActive
              ? "bg-primary/90 text-primary-foreground font-bold shadow ring-2 ring-primary"
              : "hover:bg-muted focus-visible:bg-accent"
            }
          `}
        style={{
          boxShadow: isActive
            ? "0 2px 10px 0 rgba(36,100,197,0.13)"
            : undefined,
        }}
        tabIndex={0}
        aria-current={isActive ? "page" : undefined}
      >
        {otherProfile ? (
          <UserBrief profile={otherProfile} size={8} />
        ) : (
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-muted-foreground border">
            {otherParticipantId ? otherParticipantId.slice(0, 4) : "??"}
          </div>
        )}
        {draft && (
          <span className="ml-2 text-xs text-red-600 truncate max-w-[140px]">{draft}</span>
        )}
        {isPinned && (
          <Pin className="w-4 h-4 text-primary ml-1" fill="currentColor" />
        )}
        {unreadCounts[c.id] > 0 && (
          <span className="ml-auto px-2 py-0.5 bg-primary text-white text-[10px] rounded-full font-bold shadow">
            {unreadCounts[c.id]}
          </span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className="ml-2 p-1 rounded hover:bg-accent text-muted-foreground cursor-pointer"
              tabIndex={-1}
              aria-label="Open conversation actions"
              onClick={(e) => e.stopPropagation()}
            >
              <EllipsisVertical className="w-4 h-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                if (onPinConversation) {
                  onPinConversation(c.id, !isPinned);
                }
                toast({
                  title: isPinned ? "Chat unpinned" : "Chat pinned",
                });
              }}
            >
              <Pin className="w-4 h-4 mr-1" />
              {isPinned ? "Unpin Chat" : "Pin Chat"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center text-red-600 focus:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteConversation(c.id);
              }}
            >
              <Trash className="w-4 h-4 mr-1" />
              Delete Conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </button>
    </div>
  );
}