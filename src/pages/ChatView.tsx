import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useChatMessages } from "@/hooks/useChatMessages";
import MessageList from "@/components/MessageList";
import MessageComposer from "@/components/MessageComposer";
import ForwardMessageDialog from "@/components/ForwardMessageDialog";
import SoundToggle from "@/components/SoundToggle";
import HamburgerMenu from "@/components/HamburgerMenu";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowLeft, Users, MessageCircle, Video as VideoIcon, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { useSoundManager } from "@/utils/SoundManager";
import { useState, useEffect } from "react";
import VideoCallDialog from "@/components/video/VideoCallDialog";
import ViewUserProfileModal from "@/components/ViewUserProfileModal";

interface OutletContext {
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
}

const ChatView = () => {
  const { id: conversationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const context = useOutletContext<OutletContext | undefined>();
  const chat = useChatMessages(conversationId);
  const { playSuccessSound, playErrorSound } = useSoundManager();
  const [forwardDialog, setForwardDialog] = useState<{
    open: boolean;
    messageContent: string;
    messageId: string;
  }>({
    open: false,
    messageContent: "",
    messageId: "",
  });
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [callOpen, setCallOpen] = useState(false);
  const [searchOpen,setSearchOpen]=useState(false);
  const [searchTerm,setSearchTerm]=useState("");
  const [matchCount,setMatchCount]=useState(0);
  const [activeMatch,setActiveMatch]=useState(0);
  const [profileModal,setProfileModal]=useState<{open:boolean,profile:any|null}>({open:false,profile:null});

  // Helper function to check if message can be edited (within 2 minutes)
  const canEditMessage = (messageCreatedAt: string, senderId: string) => {
    if (senderId !== chat.user?.id) return false;
    const messageTime = new Date(messageCreatedAt);
    const now = new Date();
    const diffInMinutes = (now.getTime() - messageTime.getTime()) / (1000 * 60);
    return diffInMinutes <= 2;
  };

  const handleReply = (messageId: string) => {
    const message = chat.messages.find((msg) => msg.id === messageId);
    if (message) {
      // Set reply context in the hook (you'll need to expose this from useChatMessages)
      console.log("Replying to message:", message.content);
      // Focus the input
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }
  };

  const handleEdit = async (messageId: string) => {
    const message = chat.messages.find((msg) => msg.id === messageId);
    if (message && message.sender_id === chat.user?.id) {
      if (!canEditMessage(message.created_at, message.sender_id)) {
        toast({
          title: "Cannot edit",
          description: "Messages can only be edited within 2 minutes of sending",
          variant: "destructive",
        });
        return;
      }

      // Set editing mode
      setEditingMessageId(messageId);
      chat.setInput(message.content);
      
      // Focus the input
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }
  };

  const handleEditSubmit = async () => {
    if (!editingMessageId || !chat.input.trim()) return;

    try {
      const { error } = await supabase
        .from("messages")
        .update({ 
          content: chat.input.trim()
        })
        .eq("id", editingMessageId);

      if (error) {
        toast({
          title: "Edit failed",
          description: error.message,
          variant: "destructive",
        });
        playErrorSound();
        return;
      }

      // Update local state
      chat.setMessages(prev => 
        prev.map(msg => 
          msg.id === editingMessageId 
            ? { ...msg, content: chat.input.trim() }
            : msg
        )
      );

      // Clear editing state
      setEditingMessageId(null);
      chat.setInput("");

      toast({
        title: "Message edited",
        description: "Message has been updated",
      });

      // Play success sound
      playSuccessSound();
    } catch (error) {
      console.error("Error editing message:", error);
      toast({
        title: "Edit failed",
        description: "Failed to edit message",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (messageId: string) => {
    const message = chat.messages.find((msg) => msg.id === messageId);
    if (message && message.sender_id === chat.user?.id) {
      if (confirm("Are you sure you want to delete this message?")) {
        try {
          const { error } = await supabase
            .from("messages")
            .update({ 
              content: "This message was deleted" 
            })
            .eq("id", messageId);

          if (error) {
            toast({
              title: "Delete failed",
              description: error.message,
              variant: "destructive",
            });
            playErrorSound();
            return;
          }

          // Update local state
          chat.setMessages(prev => 
            prev.map(msg => 
              msg.id === messageId 
                ? { ...msg, content: "This message was deleted" }
                : msg
            )
          );

          toast({
            title: "Message deleted",
            description: "Message has been deleted",
          });
          playSuccessSound();
        } catch (error) {
          console.error("Error deleting message:", error);
          toast({
            title: "Delete failed",
            description: "Failed to delete message",
            variant: "destructive",
          });
        }
      }
    }
  };

  const handleForward = (messageId: string) => {
    const message = chat.messages.find((msg) => msg.id === messageId);
    if (message) {
      setForwardDialog({
        open: true,
        messageContent: message.content,
        messageId: messageId,
      });
    }
  };

  const handleCopy = async (messageId: string) => {
    const message = chat.messages.find((msg) => msg.id === messageId);
    if (message) {
      try {
        await navigator.clipboard.writeText(message.content);
        toast({
          title: "Message copied",
          description: "Message content copied to clipboard",
        });
        playSuccessSound();
      } catch (error) {
        console.error("Failed to copy message:", error);
        toast({
          title: "Copy failed",
          description: "Failed to copy message to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try { await chat.toggleReaction(messageId, emoji) } catch (e) {}
  };
  useEffect(()=>{
    if(!conversationId) return;
    const saved = localStorage.getItem(`draft:conv:${conversationId}`) || "";
    chat.setInput(saved);
    const s = localStorage.getItem(`search:conv:${conversationId}`) || "";
    setSearchTerm(s);
    setActiveMatch(0);
  },[conversationId]);
  useEffect(()=>{
    if(!conversationId) return;
    localStorage.setItem(`search:conv:${conversationId}`, searchTerm);
  },[conversationId,searchTerm]);
  useEffect(()=>{ if(searchTerm.trim()&&matchCount===0){ toast({ title: "entered result not found!!" }) } },[searchTerm,matchCount]);
  if (!conversationId) {
    return (
      <div className="flex flex-col h-full flex-1 items-center justify-center p-mobile">
        <h2 className="text-responsive-xl font-semibold mb-2 text-center">Conversation</h2>
        <div className="text-muted-foreground text-responsive-base text-center">No conversation selected.</div>
      </div>
    );
  }

  // Show loading state while chat is initializing
  if (!chat.user && chat.loading) {
    return (
      <div className="flex flex-col h-full flex-1 items-center justify-center p-mobile">
        <div className="text-muted-foreground text-responsive-base text-center">Loading chat...</div>
      </div>
    );
  }
  const partnerName = chat.partnerProfile?.display_name || "Conversation";
  return (
    <div className="flex flex-col h-full flex-1 w-full max-w-2xl mx-auto rounded-none sm:rounded-lg bg-gradient-to-br from-background to-accent shadow-none sm:shadow-2xl border-0 sm:border border-border relative mobile-chat-container">
      {/* Mobile Header with Back Button */}
      <div className="mobile-header py-3 sm:py-4 px-3 sm:px-4 text-lg sm:text-2xl font-semibold border-b bg-gradient-to-r from-primary to-secondary/50 text-primary-foreground rounded-none sm:rounded-t-lg shadow-sm flex items-center justify-between">
        {/* Mobile Back Button */}
        <div className="flex items-center gap-2">
          <HamburgerMenu 
            isActive={context?.leftSidebarOpen || false} 
            onClick={context?.toggleLeftSidebar || (() => {})} 
            className="md:hidden text-primary-foreground"
          />
          <button
            onClick={() => navigate('/')}
            className="hidden md:block mobile-touch-target p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Go back to chat list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-center md:justify-start">
          <button onClick={async()=>{ const { data }=await supabase.from('conversations').select('*').eq('id',conversationId).maybeSingle(); const pid=data?.participant_1===chat.user?.id?data?.participant_2:data?.participant_1; if(!pid) return; const { data: prof }=await supabase.from('user_profiles').select('*').eq('id',pid).maybeSingle(); setProfileModal({ open:true, profile: prof||null }) }} className="truncate text-left">
            <span className="text-base sm:text-lg md:text-xl font-medium truncate">{partnerName}</span>
          </button>
          {chat.isOtherTyping && (
            <span className="text-xs sm:text-sm italic shrink-0 text-orange-300 animate-pulse">
              typing...
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={()=>setSearchOpen(o=>!o)}
            className="mobile-touch-target p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Search in chat"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={context?.toggleRightSidebar || (() => {})}
            className="md:hidden mobile-touch-target p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Toggle users sidebar"
          >
            <Users className="w-5 h-5" />
          </button>
          <SoundToggle />
          <Button
            size="icon"
            variant="ghost"
            title="Start video call"
            onClick={() => setCallOpen(true)}
            className="mobile-touch-target shrink-0 hover:bg-white/10"
          >
            <VideoIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            title="Clear chat"
            onClick={chat.clearChat}
            className="mobile-touch-target shrink-0 hover:bg-white/10"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-300" />
          </Button>
        </div>
      </div>
      
      {searchOpen && (
        <div className="px-2 sm:px-4 py-2 bg-muted/40 border-b">
          <div className="flex items-center gap-2">
            <input value={searchTerm} onChange={e=>{ setSearchTerm(e.target.value); setActiveMatch(0) }} onKeyDown={(e)=>{ if(matchCount>0 && (e.key==='ArrowDown'||(e.key==='Enter'&&!e.shiftKey))){ e.preventDefault(); setActiveMatch(p=> (p+1)%Math.max(matchCount,1)) } else if (matchCount>0 && (e.key==='ArrowUp'||(e.key==='Enter'&&e.shiftKey))){ e.preventDefault(); setActiveMatch(p=> (p-1+matchCount)%Math.max(matchCount,1)) } }} placeholder="Search messages" className="flex-1 px-3 py-2 rounded border" />
            <div className="text-sm text-muted-foreground whitespace-nowrap">{matchCount>0?`${activeMatch+1}/${matchCount}`:"0/0"}</div>
            <button disabled={matchCount<=1} onClick={()=>setActiveMatch(p=> (p-1+matchCount)%Math.max(matchCount,1))} className="px-2 py-1 rounded border disabled:opacity-50">↑</button>
            <button disabled={matchCount<=1} onClick={()=>setActiveMatch(p=> (p+1)%Math.max(matchCount,1))} className="px-2 py-1 rounded border disabled:opacity-50">↓</button>
            <button onClick={()=>{ setSearchTerm(""); setActiveMatch(0); setMatchCount(0) }} className="px-2 py-1 rounded border">Clear</button>
          </div>
        </div>
      )}
      <div className="mobile-message-list flex-1 overflow-y-auto px-2 sm:px-4 py-2 bg-background/90 dark:bg-background/80 transition-colors -webkit-overflow-scrolling-touch">
        {chat.loading && (
          <div className="text-center text-muted-foreground py-8 text-responsive-base">Loading messages...</div>
        )}
        {!chat.loading && chat.messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8 text-responsive-base">No messages yet.</div>
        )}
        <MessageList 
          messages={chat.messages.map(msg => ({
            ...msg,
            canEdit: canEditMessage(msg.created_at, msg.sender_id)
          }))} 
          currentUserId={chat.user?.id || ""} 
          onReaction={handleReaction}
          searchTerm={searchTerm}
          activeMatchIndex={activeMatch}
          onMatchesChange={setMatchCount}
          onReply={handleReply}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onForward={handleForward}
          onCopy={handleCopy}
          onViewOnceOpen={async (messageId) => {
            const m = chat.messages.find(x=>x.id===messageId);
            if(!m) return;
            if(m.sender_id!==chat.user?.id && m.message_type==='view_once'){
              await supabase.from('messages').update({ deleted_at:new Date().toISOString(), content:'This message was deleted' }).eq('id',messageId);
            }
          }}
        />
        <div ref={chat.messagesEndRef} />
      </div>
      <MessageComposer
        input={chat.input}
        setInput={chat.setInput}
        file={chat.file}
        setFile={chat.setFile}
        uploadingFile={chat.uploadingFile}
        sendMessage={async (opts?:any)=>{ if(editingMessageId){ await handleEditSubmit() } else { await chat.sendMessage(opts) } if(conversationId){ localStorage.removeItem(`draft:conv:${conversationId}`) } }}
        loading={chat.loading}
        handleTyping={(e)=>{ chat.handleTyping(e); if(conversationId){ localStorage.setItem(`draft:conv:${conversationId}`, e.target.value) } }}
        handleKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (editingMessageId) {
              handleEditSubmit();
            } else {
              chat.sendMessage();
            }
          }
        }}
        theme={chat.theme}
        isEditing={!!editingMessageId}
        onCancelEdit={() => {
          setEditingMessageId(null);
          chat.setInput("");
        }}
      />

      {/* Forward Dialog */}
      <ForwardMessageDialog
        open={forwardDialog.open}
        onOpenChange={(open) => setForwardDialog(prev => ({ ...prev, open }))}
        messageContent={forwardDialog.messageContent}
        messageId={forwardDialog.messageId}
      />

      <VideoCallDialog
        open={callOpen}
        onOpenChange={setCallOpen}
        roomId={`conv-${conversationId}`}
        currentUserId={chat.user?.id}
        title={partnerName}
      />

      <ViewUserProfileModal profile={profileModal.profile} open={profileModal.open} onOpenChange={(o)=>setProfileModal(prev=>({ ...prev, open:o }))} />
    </div>
  );
};
export default ChatView;
