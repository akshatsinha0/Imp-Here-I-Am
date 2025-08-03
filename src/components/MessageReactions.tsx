import React from "react";
import { cn } from "@/lib/utils";

interface Reaction {
  emoji: string;
  users: Array<{
    id: string;
    display_name: string;
  }>;
}

interface MessageReactionsProps {
  reactions: Reaction[];
  currentUserId: string;
  onReactionClick: (emoji: string) => void;
}

const MessageReactions: React.FC<MessageReactionsProps> = ({
  reactions,
  currentUserId,
  onReactionClick,
}) => {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {reactions.map((reaction) => {
        const hasReacted = reaction.users.some((user) => user.id === currentUserId);
        const count = reaction.users.length;

        return (
          <button
            key={reaction.emoji}
            onClick={() => onReactionClick(reaction.emoji)}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all",
              "border hover:scale-105",
              hasReacted
                ? "bg-primary/20 border-primary/40 text-primary"
                : "bg-muted/50 border-muted-foreground/20 hover:bg-muted"
            )}
          >
            <span className="text-sm">{reaction.emoji}</span>
            {count > 1 && <span className="font-medium">{count}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default MessageReactions;
