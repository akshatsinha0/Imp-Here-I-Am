import { Check, CheckCheck } from "lucide-react";
interface MessageStatusLabelProps {
  isRead?: boolean;
}
export default function MessageStatusLabel({ isRead }: MessageStatusLabelProps) {
  const highlightColor = "#39A7FF";
  return (
    <span className="flex items-center gap-1 text-xs mt-1 font-semibold transition-all select-none">
      {isRead ? (
        <span className="flex items-center gap-1" style={{ color: highlightColor }}>
          <CheckCheck className="w-4 h-4" style={{ color: highlightColor }} />
          Message Read
        </span>
      ) : (
        <span className="text-yellow-700 flex items-center gap-1">
          <Check className="w-4 h-4 text-yellow-600" />
          Delivered
        </span>
      )}
    </span>
  );
}