import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, Loader2, Send, Trash2, Play, Pause } from "lucide-react";
import AnimatedWaveform from "./AnimatedWaveform";
interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onReset?: () => void;
  conversationId?: string;
}
const SILENCE_MS = 40000;
const MIN_RECORD_MS = 500;
const AUDIO_TYPE = "audio/webm";
function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}
export default function VoiceRecorder({
  onRecordingComplete,
  onReset,
  conversationId,
}: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [donePrompt, setDonePrompt] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioBlobTimestamp, setAudioBlobTimestamp] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const vadTimeout = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  useEffect(() => {
    setRecording(false);
    setLoading(false);
    setDonePrompt(false);
    setAudioBlob(null);
    if (onReset) onReset();
  }, [conversationId]);
  const MicPulse = () => (
    <span className="relative flex items-center justify-center">
      <span
        className="absolute inline-block rounded-full bg-red-500/20 animate-pulse"
        style={{
          width: 40,
          height: 40,
          zIndex: 0,
        }}
      />
      <Mic className="text-red-500 relative z-10" />
    </span>
  );
  function detectVoice(analyser: AnalyserNode, dataArray: Uint8Array) {
    analyser.getByteTimeDomainData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const val = dataArray[i] - 128;
      sum += val * val;
    }
    const rms = Math.sqrt(sum / dataArray.length);
    return rms > 8;
  }
  function startVAD(analyser: AnalyserNode, dataArray: Uint8Array) {
    let silenceStart = Date.now();
    let stopped = false;
    const check = () => {
      if (!recording || stopped) return;
      const speaking = detectVoice(analyser, dataArray);
      if (speaking) {
        silenceStart = Date.now();
      } else {
        if (Date.now() - silenceStart > SILENCE_MS) {
          stopped = true;
          setDonePrompt(true);
          stopRecording();
          return;
        }
      }
      requestAnimationFrame(check);
    };
    check();
  }
  const startRecording = async () => {
    setLoading(true);
    setAudioBlob(null);
    setDonePrompt(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      const recorder = new MediaRecorder(stream, { mimeType: AUDIO_TYPE });
      chunks.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        audioCtx.close();
        let blob = null;
        if (chunks.current.length) {
          blob = new Blob(chunks.current, { type: AUDIO_TYPE });
        }
        setAudioBlob(blob);
        setAudioBlobTimestamp(Date.now());
        setRecording(false);
        setLoading(false);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setLoading(false);
      startVAD(analyser, dataArray);
    } catch (err) {
      alert("Failed to start audio recording: " + err);
      setRecording(false);
      setLoading(false);
    }
  };
  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
  };
  useEffect(() => {
    return () => {
      stopRecording();
      setAudioBlob(null);
    };
  }, []);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (!audioPlayerRef.current) return;
    const audio = audioPlayerRef.current;
    const timeListener = () => setAudioCurrentTime(audio.currentTime);
    audio.addEventListener("timeupdate", timeListener);
    const endedListener = () => setAudioPlaying(false);
    audio.addEventListener("ended", endedListener);
    return () => {
      audio.removeEventListener("timeupdate", timeListener);
      audio.removeEventListener("ended", endedListener);
    };
  }, [audioBlob, audioPlayerRef.current]);
  useEffect(() => {
    if (audioBlob && audioPlayerRef.current) {
      audioPlayerRef.current.onloadedmetadata = () =>
        setAudioDuration(audioPlayerRef.current?.duration || 0);
      setAudioCurrentTime(0);
      setAudioPlaying(false);
    }
  }, [audioBlob]);
  const handleSend = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
      setAudioBlob(null);
      setDonePrompt(false);
      setAudioPlaying(false);
      setAudioCurrentTime(0);
    }
  };
  const handleDiscard = () => {
    setAudioBlob(null);
    setDonePrompt(false);
    setAudioPlaying(false);
    setAudioCurrentTime(0);
    if (onReset) onReset();
  };
  function VoicePreviewBar() {
    return (
      <div
        className="flex items-center min-w-[240px] max-w-[420px] p-2 gap-2 rounded-lg border border-border shadow-[0_2px_12px_0_rgba(0,0,0,0.03),0_1.5px_8px_0_rgba(60,60,170,0.03)]"
        style={{
          background:
            "linear-gradient(96deg, hsl(var(--background)) 90%, hsl(var(--input)) 100%)",
          zIndex: 10,
        }}
      >
        {}
        <button
          className="flex items-center justify-center rounded bg-transparent px-2 hover:bg-destructive/15 transition"
          title="Discard"
          onClick={handleDiscard}
          tabIndex={0}
          type="button"
          style={{ minWidth: 40, minHeight: 38 }}
        >
          <Trash2 className="w-5 h-5 text-destructive" />
        </button>
        {}
        <button
          className="flex items-center justify-center rounded-full bg-white/90 shadow px-2 py-2 hover:scale-105 transition"
          style={{
            minWidth: 46,
            minHeight: 44,
            border: "2.5px solid #ddd",
            boxShadow: "0 1px 7px 0 rgba(89,89,180,0.07)",
          }}
          aria-label={audioPlaying ? "Pause" : "Play"}
          onClick={() => {
            if (!audioPlayerRef.current) return;
            if (audioPlaying) {
              audioPlayerRef.current.pause();
              setAudioPlaying(false);
            } else {
              audioPlayerRef.current.play();
              setAudioPlaying(true);
            }
          }}
          tabIndex={0}
          type="button"
        >
          {audioPlaying ? (
            <Pause className="w-8 h-8 text-primary" />
          ) : (
            <Play className="w-8 h-8 text-primary" />
          )}
        </button>
        <div className="flex flex-1 items-center px-2 w-[72px]">
          <AnimatedWaveform isPlaying={audioPlaying} />
        </div>
        <span className="text-xs font-mono text-muted-foreground truncate max-w-[70px] ml-1 mr-2 select-none">
          Voice Note
        </span>
        <span className="text-xs font-mono text-primary pr-2 tabular-nums w-[37px] text-right select-none">
          {formatDuration(audioCurrentTime || audioDuration || 0)}
        </span>
        {}
        <button
          title="Send voice note"
          className="rounded bg-green-600 hover:bg-green-700 text-white ml-1 px-4 py-2 transition flex items-center justify-center shadow"
          style={{
            minWidth: 48,
            minHeight: 44,
            borderRadius: "0.55rem",
            boxShadow: "0 1px 8px 0 rgba(20,150,60,0.13)",
            fontWeight: 600,
            fontSize: "1.10rem",
          }}
          onClick={handleSend}
          tabIndex={0}
          type="button"
        >
          <Send className="w-6 h-6" />
        </button>
        <audio
          key={
            audioBlob
              ? audioBlob.size + "-" + audioBlob.type + "-" + (audioBlobTimestamp ?? "none")
              : "none"
          }
          ref={audioPlayerRef}
          src={audioBlob ? URL.createObjectURL(audioBlob) : undefined}
          style={{ display: "none" }}
          onEnded={() => setAudioPlaying(false)}
        />
      </div>
    );
  }
  if (loading) {
    return (
      <Button size="icon" variant="secondary" disabled>
        <Loader2 className="animate-spin" />
      </Button>
    );
  }
  if ((donePrompt && audioBlob) || (audioBlob && !recording)) {
    return <VoicePreviewBar />;
  }
  if (recording) {
    return (
      <Button
        onClick={stopRecording}
        size="icon"
        variant="destructive"
        aria-label="Stop and finish recording"
        className="animate-pulse"
      >
        <MicPulse />
      </Button>
    );
  }
  return (
    <Button
      onClick={startRecording}
      size="icon"
      variant="secondary"
      aria-label="Start voice recording"
      className="hover:scale-110 transition"
    >
      <Mic className="text-red-500" />
    </Button>
  );
}