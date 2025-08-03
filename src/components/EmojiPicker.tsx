import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
interface EmojiPickerProps {
  open: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
  theme?: "light" | "dark" | "auto";
}
function getPickerPosition(anchorEl?: HTMLElement | null) {
  if (!anchorEl) {
    return {
      top: "70vh",
      left: "60vw",
    };
  }
  const rect = anchorEl.getBoundingClientRect();
  const pickerWidth = 340, pickerHeight = 400;
  let top = rect.top - pickerHeight - 8;
  if (top < 10) top = rect.bottom + 8;
  let left = rect.left - pickerWidth / 2 + rect.width / 2;
  left = Math.min(left, window.innerWidth - pickerWidth - 10);
  left = Math.max(left, 10);
  return { top: `${top}px`, left: `${left}px` };
}
export default function EmojiPicker({
  open,
  onSelect,
  onClose,
  anchorEl,
  theme = "auto"
}: EmojiPickerProps) {
  const [mounted, setMounted] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const [pickerPos, setPickerPos] = useState<{ top: string, left: string }>({ top: "0px", left: "0px" });
  useEffect(() => {
    if (!open) return;
    setMounted(true);
    function updatePos() {
      setPickerPos(getPickerPosition(anchorEl));
    }
    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [open, anchorEl]);
  useEffect(() => {
    if (!open) return;
    function handleDown(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    window.addEventListener("mousedown", handleDown);
    return () => {
      window.removeEventListener("mousedown", handleDown);
    };
  }, [open, onClose]);
  if (!open || !mounted) return null;
  return (
    typeof window !== "undefined" ? (
      <>
        {createPortal(
          <div
            ref={pickerRef}
            style={{
              position: "fixed",
              top: pickerPos.top,
              left: pickerPos.left,
              zIndex: 9999,
              minWidth: 320,
              background: "var(--background)",
              borderRadius: "1rem",
              boxShadow: "0 6px 32px 0 rgba(0,0,0,0.30), 0 1.5px 8px 0 rgba(0,0,0,0.22)",
              border: "1px solid var(--border)",
              transition: "opacity 0.2s",
            }}
            className={`overflow-hidden border border-border bg-background`}
            onClick={e => e.stopPropagation()}
            tabIndex={-1}
          >
            <Picker
              data={data}
              theme={theme}
              onEmojiSelect={(emoji: any) => {
                onSelect(emoji.native);
                onClose();
              }}
              emojiSize={24}
              navPosition="top"
              previewPosition="bottom"
              maxFrequentRows={1}
              searchPosition="none"
              perLine={8}
              autoFocus={true}
              dynamicWidth={false}
              skinTonePosition="hide"
            />
          </div>,
          document.body
        )}
      </>
    ) : null
  );
}