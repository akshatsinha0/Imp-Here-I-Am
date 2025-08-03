import { useParams } from "react-router-dom";
import { useChatMessages } from "@/hooks/useChatMessages";
import MessageList from "@/components/MessageList";
import MessageComposer from "@/components/MessageComposer";
import TypingIndicator from "@/components/TypingIndicator";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
const ChatView = () => {
  const { id: conversationId } = useParams<{ id: string }>();
  const chat = useChatMessages(conversationId);
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
        <MessageList messages={chat.messages} currentUserId={chat.user?.id || ""} />
        <div ref={chat.messagesEndRef} />
      </div>
      <MessageComposer
        input={chat.input}
        setInput={chat.setInput}
        file={chat.file}
        setFile={chat.setFile}
        uploadingFile={chat.uploadingFile}
        sendMessage={chat.sendMessage}
        loading={chat.loading}
        handleTyping={chat.handleTyping}
        handleKeyDown={chat.handleKeyDown}
        theme={chat.theme}
      />
    </div>
  );
};
export default ChatView;