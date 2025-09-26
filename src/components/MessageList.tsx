import React from "react";
import MessageFilePreview from "@/components/MessageFilePreview";
import MessageStatusLabel from "@/components/MessageStatusLabel";
import MessageActions from "@/components/MessageActions";
import MessageReactions from "@/components/MessageReactions";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateSeparator(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface Reaction {
  emoji: string;
  users: Array<{
    id: string;
    display_name: string;
  }>;
}

interface Message {
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
  reactions?: Reaction[];
  reply_to?: Message | null;
  canEdit?: boolean;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onReaction?: (messageId: string, emoji: string) => void;
  onReply?: (messageId: string) => void;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onForward?: (messageId: string) => void;
  onCopy?: (messageId: string) => void;
  onViewOnceOpen?: (messageId: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  onReaction,
  onReply,
  onEdit,
  onDelete,
  onForward,
  onCopy,
}) => {
  let lastDate: Date | null = null;

  return (
    <div className="flex flex-col gap-4">
      {messages.map((msg, idx) => {
        const isMine = msg.sender_id === currentUserId;
        const isRead = !!msg.readers?.length && (msg.readers?.filter((r) => r !== msg.sender_id).length > 0);
        const msgDate = new Date(msg.created_at);
        let showDate = false;
        if (!lastDate || !isSameDay(msgDate, lastDate)) {
          showDate = true;
          lastDate = msgDate;
        }

        // Skip deleted messages
        if (msg.deleted_at) {
          return (
            <React.Fragment key={msg.id}>
              {showDate && (
                <div className="flex justify-center py-2">
                  <span className="px-4 py-1 bg-muted/70 rounded text-xs text-muted-foreground font-medium shadow">
                    {formatDateSeparator(msg.created_at)}
                  </span>
                </div>
              )}
              <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className="rounded-xl px-5 py-3 max-w-xs bg-muted/50 text-muted-foreground italic">
                  This message was deleted
                </div>
              </div>
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={msg.id}>
            {showDate && (
              <div className="flex justify-center py-2">
                <span className="px-4 py-1 bg-muted/70 rounded text-xs text-muted-foreground font-medium shadow">
                  {formatDateSeparator(msg.created_at)}
                </span>
              </div>
            )}
            <div className={`flex ${isMine ? "justify-end" : "justify-start"} px-2 sm:px-0`}>
              <div className="group relative mobile-message-bubble max-w-xs sm:max-w-sm md:max-w-md">
                {/* Reply Preview */}
                {msg.reply_to && (
                  <div className="mb-1 ml-3 px-3 py-1 bg-muted/30 rounded-t-lg border-l-4 border-primary/50">
                    <div className="text-xs text-muted-foreground">Replying to</div>
                    <div className="text-sm truncate">{msg.reply_to.content}</div>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`mobile-card rounded-xl px-3 sm:px-4 md:px-5 py-2 sm:py-3 break-words shadow-lg text-sm sm:text-base transition-colors
                  ${isMine ? "bg-gradient-to-br from-primary to-secondary text-primary-foreground"
                            : "bg-gradient-to-tr from-muted to-accent text-foreground"}
                  ${isMine ? "rounded-br-xl rounded-tr-sm"
                            : "rounded-bl-xl rounded-tl-sm"}`}
                >
                  <span className="whitespace-pre-line" style={{ wordBreak: "break-word" }}>
                    {msg.message_type === "text" && msg.content}
                    {["voice_note", "file"].includes(msg.message_type || "") && (
                      <MessageFilePreview
                        fileUrl={msg.file_url}
                        fileName={msg.file_name}
                        fileMime={msg.file_mime}
                        type={msg.message_type}
                        onViewOnceOpen={() => onViewOnceOpen?.(msg.id)}
                      />
                    )}
                  </span>
                  <div className="flex items-center justify-between mt-1 gap-2">
                    <div className="text-[10px] sm:text-xs text-muted-foreground opacity-80">
                      {new Date(msg.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: false 
                      })}
                      {msg.edited_at && <span className="ml-1 text-[9px] sm:text-[10px]">(edited)</span>}
                    </div>
                    {isMine && idx === messages.length - 1 && (
                      <MessageStatusLabel isRead={isRead} />
                    )}
                  </div>
      <MessageReactions 
        reactions={msg.reactions || []}
        currentUserId={currentUserId}
        onReactionClick={(emoji) => onReaction?.(msg.id, emoji)}
      />
    </div>

    {/* Message Actions */}
                {/* Message Actions */}
                <div className="absolute -top-8 right-0">
                  <MessageActions
                    messageId={msg.id}
                    isMine={isMine}
                    onReact={(emoji) => onReaction?.(msg.id, emoji)}
                    onReply={() => onReply?.(msg.id)}
                    onEdit={isMine && msg.canEdit ? () => onEdit?.(msg.id) : undefined}
                    onDelete={isMine ? () => onDelete?.(msg.id) : undefined}
                    onForward={() => onForward?.(msg.id)}
                    onCopy={() => onCopy?.(msg.id)}
                  />
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default MessageList;
