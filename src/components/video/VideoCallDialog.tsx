import React, { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWebRTC } from '@/hooks/useWebRTC';
import VideoTile from './VideoTile';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  currentUserId?: string;
  title?: string;
}

const VideoCallDialog: React.FC<Props> = ({ open, onOpenChange, roomId, currentUserId, title }) => {
  const { inCall, localStream, remotes, startCall, endCall, toggleMute, toggleCamera, muted, cameraOff, error } = useWebRTC(roomId, currentUserId);

  useEffect(() => {
    if (open) startCall();
    // end call on close
    return () => { if (inCall) endCall(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) endCall(); onOpenChange(o); }}>
      <DialogContent className="p-0 max-w-[100vw] w-[100vw] h-[100vh] sm:h-[90vh] sm:w-[90vw] overflow-hidden bg-black text-white">
        <div className="flex flex-col h-full w-full">
          <div className="px-4 py-3 text-base sm:text-lg font-medium bg-black/60 border-b border-white/10">
            {title || 'Video Call'} {error && <span className="text-red-400 text-sm ml-2">{error}</span>}
          </div>

          <div className="flex-1 grid gap-2 p-2 sm:p-4 auto-rows-[minmax(120px,1fr)]" style={{ gridTemplateColumns: `repeat(${Math.min(3, Math.max(1, remotes.length))}, minmax(0, 1fr))` }}>
            {remotes.length === 0 && (
              <div className="flex items-center justify-center text-white/70 col-span-full">Waiting for others to join…</div>
            )}
            {remotes.map(r => (
              <div key={r.id} className="rounded overflow-hidden bg-black">
                <VideoTile stream={r.stream} muted={false} />
              </div>
            ))}
          </div>

          <div className="absolute right-3 bottom-20 sm:bottom-24 w-32 h-48 sm:w-56 sm:h-36 rounded overflow-hidden shadow-lg border border-white/10">
            <VideoTile stream={localStream} muted={true} />
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-4 p-3 sm:p-4 bg-black/60 border-t border-white/10">
            <Button onClick={toggleMute} variant="secondary" className="rounded-full w-12 h-12 p-0">
              {muted ? <MicOff className="w-5 h-5"/> : <Mic className="w-5 h-5"/>}
            </Button>
            <Button onClick={toggleCamera} variant="secondary" className="rounded-full w-12 h-12 p-0">
              {cameraOff ? <VideoOff className="w-5 h-5"/> : <VideoIcon className="w-5 h-5"/>}
            </Button>
            <Button onClick={() => { endCall(); onOpenChange(false); }} variant="destructive" className="rounded-full w-12 h-12 p-0">
              <PhoneOff className="w-5 h-5"/>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default VideoCallDialog;
