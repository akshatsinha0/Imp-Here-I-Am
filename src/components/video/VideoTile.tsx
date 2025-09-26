import React, { useEffect, useRef } from 'react';

interface Props {
  stream: MediaStream | null;
  muted?: boolean;
  className?: string;
}

const VideoTile: React.FC<Props> = ({ stream, muted=false, className }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    if (stream) {
      ref.current.srcObject = stream;
      ref.current.play().catch(() => {});
    } else {
      ref.current.srcObject = null;
    }
  }, [stream]);
  return (
    <video ref={ref} muted={muted} autoPlay playsInline className={className || 'rounded bg-black w-full h-full object-cover'} />
  );
};
export default VideoTile;
