import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Reply,
  Edit,
  Trash2,
  Forward,
  Copy,
  Smile,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface MessageActionsProps {
  messageId: string;
  isMine: boolean;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onForward?: () => void;
  onCopy?: () => void;
  onReact?: (emoji: string) => void;
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const MessageActions: React.FC<MessageActionsProps> = ({
  messageId,
  isMine,
  onReply,
  onEdit,
  onDelete,
  onForward,
  onCopy,
  onReact,
}) => {
  const [showReactions, setShowReactions] = useState(false);

  const handleReaction = (emoji: string) => {
    if (onReact) {
      onReact(emoji);
    }
    setShowReactions(false);
  };

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {/* Quick Reactions */}
      <div className="relative">
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => setShowReactions(!showReactions)}
        >
          <Smile className="h-4 w-4" />
        </Button>
        
        {showReactions && (
          <div className="absolute bottom-full right-0 mb-1 flex gap-1 bg-background border rounded-lg p-1 shadow-lg z-50">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="hover:bg-accent rounded p-1 text-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reply Button */}
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6"
        onClick={onReply}
      >
        <Reply className="h-4 w-4" />
      </Button>

      {/* More Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="h-6 w-6">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isMine && (
            <>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem onClick={onForward}>
            <Forward className="mr-2 h-4 w-4" />
            Forward
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MessageActions;
