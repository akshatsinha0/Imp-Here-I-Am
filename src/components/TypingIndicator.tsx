import React from "react";
export default function TypingIndicator() {
  return (
    <div className="flex justify-start px-5 animate-pulse">
      <div
        className="my-1 py-2 px-6 rounded-full text-xs bg-accent/90 text-accent-foreground shadow ring-1 ring-accent-foreground/5 flex items-center gap-2"
        style={{
          minWidth: 84,
          maxWidth: 150,
          fontStyle: "italic",
          fontWeight: 500,
          background: "linear-gradient(94deg, #e0e7ff 60%, #c7d2fe 100%)",
          color: "#555"
        }}
      >
        <span>typing</span>
        <span className="animate-pulse flex gap-1">
          <span className="inline-block w-1.5 h-1.5 bg-accent-foreground rounded-full opacity-80" />
          <span className="inline-block w-1.5 h-1.5 bg-accent-foreground rounded-full opacity-60" />
          <span className="inline-block w-1.5 h-1.5 bg-accent-foreground rounded-full opacity-40" />
        </span>
      </div>
    </div>
  );
}