import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Smile, Timer, EyeOff, MapPin } from "lucide-react";
import EmojiPicker from "@/components/EmojiPicker";
import VoiceRecorder from "@/components/VoiceRecorder";
import { toast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
interface MessageComposerProps {
  input: string;
  setInput: (val: string) => void;
  file: File | null;
  setFile: (f: File | null) => void;
  uploadingFile: boolean;
  sendMessage: (opts?: { sendVoiceBlob?: Blob; ephemeralTTLSec?: number; viewOnce?: boolean }) => Promise<void>;
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
  const [ephemeralTTLSec, setEphemeralTTLSec] = useState<number>(0);
  const [viewOnce, setViewOnce] = useState(false);
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
      sendMessage({ sendVoiceBlob: voiceBlob, ephemeralTTLSec, viewOnce });
      setVoiceBlob(null);
    } else {
      sendMessage({ ephemeralTTLSec, viewOnce });
    }
    setEphemeralTTLSec(0);
    setViewOnce(false);
  };
  const requestLocation=()=>{
    if(!navigator.geolocation){ toast({ title:"Location not supported" }); return }
    navigator.geolocation.getCurrentPosition(pos=>{
      const { latitude, longitude }=pos.coords;
      const url=`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
      setInput(url);
      sendMessage({ ephemeralTTLSec:0, viewOnce:false });
    },err=>{ toast({ title:"Location denied" }) },{ enableHighAccuracy:true, timeout:10000 });
  }
  return (
    <div className="mobile-message-composer mobile-keyboard-adjust p-3 sm:p-4 border-t flex gap-2 bg-gradient-to-b from-secondary/70 to-background/60 items-end z-10 relative rounded-b-lg shadow-inner safe-area-inset">
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
              <button 
                onClick={() => setFile(null)} 
                className="cancel-button ml-1"
                aria-label="Remove file"
              >
                ×
              </button>
            </div>
          )}
          {voiceBlob && (
            <div className="flex items-center gap-2 bg-muted/80 px-2 py-1 rounded text-xs max-w-[160px]">
              <span role="img" aria-label="Voice Note">🎤</span>
              <span>Voice Note</span>
              <button 
                onClick={() => setVoiceBlob(null)} 
                className="cancel-button ml-1"
                aria-label="Remove voice note"
              >
                ×
              </button>
            </div>
          )}
          <VoiceRecorder
            onRecordingComplete={handleVoiceComplete}
            onReset={handleVoiceReset}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" title="Disappearing timer">
                <Timer className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={()=>setEphemeralTTLSec(0)}>Off</DropdownMenuItem>
              <DropdownMenuItem onClick={()=>setEphemeralTTLSec(60)}>1 minute</DropdownMenuItem>
              <DropdownMenuItem onClick={()=>setEphemeralTTLSec(900)}>15 minutes</DropdownMenuItem>
              <DropdownMenuItem onClick={()=>setEphemeralTTLSec(3600)}>1 hour</DropdownMenuItem>
              <DropdownMenuItem onClick={()=>setEphemeralTTLSec(86400)}>1 day</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="icon" variant={viewOnce?"default":"ghost"} title="View once" onClick={()=>setViewOnce(v=>!v)}>
            <EyeOff className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost" title="Share location" onClick={requestLocation}>
            <MapPin className="w-5 h-5" />
          </Button>
        </>
      )}
      <input
        type="text"
        className={`mobile-input-field flex-1 px-3 sm:px-4 py-3 sm:py-2 rounded-full sm:rounded border focus:outline-none focus:ring text-base shadow-sm transition disabled:opacity-60 ${
          isEditing 
            ? "bg-primary/5 border-primary focus:ring-primary/20" 
            : "bg-background/70 dark:bg-background/80 focus:ring"
        }`}
        style={{ minHeight: 48, fontSize: "16px" }}
        placeholder={isEditing ? "Edit your message…" : "Type a message…"}
        value={input}
        onChange={handleTyping}
        onKeyDown={handleKeyDown}
        disabled={uploadingFile}
        autoComplete="off"
        autoCorrect="on"
        autoCapitalize="sentences"
        spellCheck="true"
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
