import { useParams } from "react-router-dom";
import { useChatMessages } from "@/hooks/useChatMessages";
import MessageList from "@/components/MessageList";
import MessageComposer from "@/components/MessageComposer";
import ForwardMessageDialog from "@/components/ForwardMessageDialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const ChatView = () => {
  const { id: conversationId } = useParams<{ id: string }>();
  const chat = useChatMessages(conversationId);
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
    // For now, just show a simple toast - we'll implement reactions later when the database is properly set up
    toast({
      title: "Reactions coming soon",
      description: `${emoji} reaction will be added in the next update`,
    });
  };
  if (!conversationId) {
    return (
      <div className="flex flex-col h-full flex-1 items-center justify-center p-mobile">
        <h2 className="text-responsive-xl font-semibold mb-2 text-center">Conversation</h2>
        <div className="text-muted-foreground text-responsive-base text-center">No conversation selected.</div>
      </div>
    );
  }
  const partnerName = chat.partnerProfile?.display_name || "Conversation";
  return (
    <div className="flex flex-col h-full flex-1 w-full max-w-2xl mx-auto rounded-none sm:rounded-lg bg-gradient-to-br from-background to-accent shadow-none sm:shadow-2xl border-0 sm:border border-border relative">
      <div className="py-3 sm:py-4 px-4 text-lg sm:text-2xl font-semibold text-center border-b bg-gradient-to-r from-primary to-secondary/50 text-primary-foreground rounded-none sm:rounded-t-lg shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="truncate text-responsive-lg">{partnerName}</span>
          {chat.isOtherTyping && (
            <span className="text-xs sm:text-sm italic ml-2 shrink-0 text-orange-400 mobile-only sm:block">
              (typing...)
            </span>
          )}
        </div>
        <Button
          size="icon"
          variant="ghost"
          title="Clear chat"
          onClick={chat.clearChat}
          className="touch-target shrink-0"
        >
          <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-2 bg-background/90 dark:bg-background/80 transition-colors">
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
          onReply={handleReply}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onForward={handleForward}
          onCopy={handleCopy}
        />
        <div ref={chat.messagesEndRef} />
      </div>
      <MessageComposer
        input={chat.input}
        setInput={chat.setInput}
        file={chat.file}
        setFile={chat.setFile}
        uploadingFile={chat.uploadingFile}
        sendMessage={editingMessageId ? handleEditSubmit : chat.sendMessage}
        loading={chat.loading}
        handleTyping={chat.handleTyping}
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
    </div>
  );
};
export default ChatView;