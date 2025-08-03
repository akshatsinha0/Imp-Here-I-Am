import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";
import EmojiPicker from "@/components/EmojiPicker";
import VoiceRecorder from "@/components/VoiceRecorder";
import { toast } from "@/components/ui/use-toast";
interface MessageComposerProps {
  input: string;
  setInput: (val: string) => void;
  file: File | null;
  setFile: (f: File | null) => void;
  uploadingFile: boolean;
  sendMessage: (opts?: { sendVoiceBlob?: Blob }) => Promise<void>;
  loading: boolean;
  handleTyping: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  theme: "light" | "dark" | "auto";
  isEditing?: boolean;
  onCancelEdit?: () => void;
}
const MessageComposer: React.FC<MessageComposerProps> = ({
  input, setInput, file, setFile, uploadingFile, sendMessage, loading, handleTyping, handleKeyDown, theme, isEditing, onCancelEdit
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  useEffect(() => {
    if (!input && !file && !uploadingFile) {
      setVoiceBlob(null);
    }
  }, [input, file, uploadingFile]);
  const handleEmojiSelect = (emoji: string) => {
    setInput(input + emoji);
  };
  const handleVoiceComplete = (blob: Blob) => {
    setVoiceBlob(blob);
  };
  const handleVoiceReset = () => {
    setVoiceBlob(null);
  };
  const handleSend = () => {
    if (voiceBlob) {
      sendMessage({ sendVoiceBlob: voiceBlob });
      setVoiceBlob(null);
    } else {
      sendMessage();
    }
  };
  return (
    <div className="p-4 border-t flex gap-2 bg-gradient-to-b from-secondary/70 to-background/60 items-end z-10 relative rounded-b-lg shadow-inner">
      {/* Editing indicator */}
      {isEditing && (
        <div className="absolute -top-8 left-4 bg-primary/10 text-primary px-3 py-1 rounded-t-lg text-sm">
          Editing message
        </div>
      )}
      
      {!isEditing && (
        <>
          <div className="relative">
            <Button
              ref={emojiBtnRef}
              size="icon"
              variant="ghost"
              type="button"
              aria-label="Open emoji picker"
              onClick={e => {
                e.stopPropagation();
                setShowEmojiPicker(open => !open);
              }}
              className="hover:bg-accent transition"
            >
              <Smile className="w-6 h-6 text-yellow-500 dark:text-yellow-300" />
            </Button>
            <EmojiPicker
              open={showEmojiPicker}
              onSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
              anchorEl={emojiBtnRef.current}
              theme={theme}
            />
          </div>
          <label className="cursor-pointer bg-accent p-2 rounded hover:bg-primary/10 transition" title="Attach file">
            <input
              type="file"
              className="hidden"
              onChange={e => {
                if (e.target.files?.length) setFile(e.target.files[0]);
              }}
              accept="*"
            />
            <span role="img" aria-label="Attach file">📎</span>
          </label>
          {file && (
            <div className="flex items-center gap-2 bg-muted px-2 py-1 rounded text-xs">
              <span>{file.name}</span>
              <button onClick={() => setFile(null)} className="ml-1 text-red-400 hover:text-red-700">✕</button>
            </div>
          )}
          {voiceBlob && (
            <div className="flex items-center gap-2 bg-muted/80 px-2 py-1 rounded text-xs max-w-[160px]">
              <span role="img" aria-label="Voice Note">🎤</span>
              <span>Voice Note</span>
              <button onClick={() => setVoiceBlob(null)} className="ml-1 text-red-400 hover:text-red-700 text-sm">✕</button>
            </div>
          )}
          <VoiceRecorder
            onRecordingComplete={handleVoiceComplete}
            onReset={handleVoiceReset}
          />
        </>
      )}
      
      <input
        type="text"
        className={`flex-1 px-4 py-2 rounded border focus:outline-none focus:ring text-base shadow-sm transition disabled:opacity-60 ${
          isEditing 
            ? "bg-primary/5 border-primary focus:ring-primary/20" 
            : "bg-background/70 dark:bg-background/80 focus:ring"
        }`}
        style={{ minHeight: 48, fontSize: "1rem" }}
        placeholder={isEditing ? "Edit your message…" : "Type a message…"}
        value={input}
        onChange={handleTyping}
        onKeyDown={handleKeyDown}
        disabled={uploadingFile}
      />
      
      {isEditing ? (
        <div className="flex gap-2">
          <Button
            onClick={onCancelEdit}
            variant="outline"
            className="px-4 py-2 text-base"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-primary to-accent text-white rounded-lg shadow-md transition hover:from-primary/80 hover:to-accent/80 px-5 py-2 text-base"
          >
            Update
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleSend}
          disabled={loading || ((!input.trim() && !file && !voiceBlob))}
          className="bg-gradient-to-r from-primary to-accent text-white rounded-lg shadow-md transition hover:from-primary/80 hover:to-accent/80 px-5 py-2 text-base"
        >
          Send
        </Button>
      )}
    </div>
  );
};
export default MessageComposer;