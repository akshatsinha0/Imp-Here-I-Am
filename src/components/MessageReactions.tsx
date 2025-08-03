import React from "react";

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
    <div className="message-reactions">
      {reactions.map((reaction) => {
        const hasReacted = reaction.users.some(user => user.id === currentUserId);
        const count = reaction.users.length;
        
        return (
          <button
            key={reaction.emoji}
            onClick={() => onReactionClick(reaction.emoji)}
            className={`reaction-button ${hasReacted ? 'reacted' : ''}`}
            title={reaction.users.map(u => u.display_name).join(", ")}
          >
            <span className="reaction-emoji">{reaction.emoji}</span>
            {count > 1 && <span className="reaction-count">{count}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default MessageReactions;