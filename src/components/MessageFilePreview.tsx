import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, File, Download } from "lucide-react";
import { Slider } from "@/components/ui/slider";
interface MessageFilePreviewProps {
  fileUrl?: string;
  fileName?: string;
  fileMime?: string | null;
  type?: string;
  onViewOnceOpen?: () => void;
}
export default function MessageFilePreview({
  fileUrl,
  fileName,
  fileMime,
  type,
  onViewOnceOpen
}: MessageFilePreviewProps) {
  if (!fileUrl) return null;
  if (type === "voice_note") {
    return (
      <VoiceNotePlayer fileUrl={fileUrl} fileName={fileName} />
    );
  }
  const isViewOnce=type==="view_once";
  return (
    <div className="flex items-center gap-2">
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 hover:underline"
        download={isViewOnce?undefined:fileName}
        onClick={(e)=>{ if(isViewOnce&&onViewOnceOpen){ setTimeout(()=>onViewOnceOpen(),300) } }}
      >
        <File className="w-4 h-4" />
        <span className="truncate max-w-[120px] text-xs">{fileName || "Attachment"}</span>
        <Download className="w-4 h-4 text-muted-foreground" />
      </a>
    </div>
  );
}
function formatDuration(ts: number) {
  if (isNaN(ts)) return "00:00";
  const m = Math.floor(ts / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(ts % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}
function VoiceNotePlayer({ fileUrl, fileName }: { fileUrl: string; fileName?: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [curTime, setCurTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const [sliderDragging, setSliderDragging] = useState(false);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleLoaded = () => {
      setDuration(audio.duration || 0);
      setCurTime(audio.currentTime || 0);
      setSliderValue(audio.currentTime || 0);
    };
    audio.addEventListener("loadedmetadata", handleLoaded);
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded);
    };
  }, [fileUrl]);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTimeUpdate = () => {
      setCurTime(audio.currentTime);
      if (!sliderDragging) setSliderValue(audio.currentTime);
    };
    const handleEnded = () => setPlaying(false);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [sliderDragging]);
  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [playing]);
  useEffect(() => {
    setCurTime(0);
    setSliderValue(0);
    setPlaying(false);
  }, [fileUrl]);
  const handleSliderChange = (value: number[]) => {
    const seekTime = value[0];
    setSliderValue(seekTime);
  };
  const handleSliderCommit = (value: number[]) => {
    const seekTime = value[0];
    if (!audioRef.current || !Number.isFinite(seekTime)) return;
    audioRef.current.currentTime = Math.min(Math.max(0, seekTime), duration || 0);
    setCurTime(audioRef.current.currentTime);
    setSliderValue(audioRef.current.currentTime);
    setSliderDragging(false);
  };
  return (
    <div
      className="flex items-center pl-2 pr-3 py-2 rounded-lg bg-background/80 dark:bg-background/60 gap-3 min-w-[210px] max-w-xs shadow-inner border border-border"
      style={{
        background: "linear-gradient(120deg, #e9eefb 60%, #f9fafb 100%)",
      }}
    >
      <button
        className="rounded-full bg-white p-2 shadow hover:scale-110 transition"
        aria-label={playing ? "Pause" : "Play"}
        onClick={() => setPlaying((p) => !p)}
      >
        {playing ? (
          <Pause className="w-6 h-6" style={{ color: "#111" }} />
        ) : (
          <Play className="w-6 h-6" style={{ color: "#111" }} />
        )}
      </button>
      <div className="flex flex-col flex-1 justify-center min-w-0">
        <span className="text-xs font-mono text-muted-foreground truncate max-w-[100px]">
          {fileName || "Voice Note"}
        </span>
        <div className="flex items-center gap-2 w-full">
          <Slider
            value={[sliderDragging ? sliderValue : curTime]}
            min={0}
            max={duration || 1}
            step={0.1}
            onValueChange={(value: number[]) => {
              setSliderDragging(true);
              setSliderValue(value[0]);
            }}
            onValueCommit={handleSliderCommit}
            className="flex-1 h-2"
            aria-label="Seek slider"
            style={{ maxWidth: "92px" }}
          />
          <span className="text-[11px] font-mono text-muted-foreground tabular-nums w-12 text-right">
            {formatDuration(sliderDragging ? sliderValue : curTime)} / {formatDuration(duration)}
          </span>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={fileUrl}
        style={{ display: "none" }}
      />
    </div>
  );
}