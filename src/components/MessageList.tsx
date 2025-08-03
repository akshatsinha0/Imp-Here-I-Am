import React from "react";
import MessageFilePreview from "@/components/MessageFilePreview";
import MessageStatusLabel from "@/components/MessageStatusLabel";
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
}
interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}
const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  let lastDate: Date | null = null;
  return (
    <div className="flex flex-col gap-4">
      {messages.map((msg, idx) => {
        const isMine = msg.sender_id === currentUserId;
        const isRead = !!msg.readers?.length && (msg.readers?.filter((r) => r !== msg.sender_id).length > 0);
        const msgDate = new Date(msg.created_at);
        let showDate = false;
        if (
          !lastDate ||
          !isSameDay(msgDate, lastDate)
        ) {
          showDate = true;
          lastDate = msgDate;
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
            <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`rounded-xl px-5 py-3 max-w-xs break-words shadow-lg text-base transition-colors
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
                    />
                  )}
                </span>
                <div className="text-[10px] text-muted-foreground mt-1 text-right opacity-80">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </div>
                {isMine && idx === messages.length - 1 && (
                  <MessageStatusLabel isRead={isRead} />
                )}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
export default MessageList;