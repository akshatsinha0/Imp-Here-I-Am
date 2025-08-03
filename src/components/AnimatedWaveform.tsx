import React, { useEffect, useState } from "react";
interface AnimatedWaveformProps {
  isPlaying: boolean;
  barCount?: number;
  className?: string;
}
const PEAKS = [
  12, 16, 10, 20, 8, 18, 22, 15, 19, 12, 17, 9, 14, 13, 21, 10, 16, 8
];
export default function AnimatedWaveform({
  isPlaying,
  barCount = 18,
  className = ""
}: AnimatedWaveformProps) {
  const [barHeights, setBarHeights] = useState(() =>
    PEAKS.slice(0, barCount)
  );
  useEffect(() => {
    if (!isPlaying) {
      setBarHeights(PEAKS.slice(0, barCount));
      return;
    }
    let frame: number;
    const animate = () => {
      setBarHeights(prev => prev.map((h, idx) =>
        Math.max(
          6,
          PEAKS[idx] +
            Math.round(
              Math.sin(Date.now() / 120 + idx * 2) * (3 + (idx % 4))
            )
        )
      ));
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => frame && cancelAnimationFrame(frame);
  }, [isPlaying, barCount]);
  return (
    <div
      className={`flex gap-[2px] h-6 items-end w-full max-w-[80px] ${className}`}
    >
      {barHeights.map((h, i) => (
        <div
          key={i}
          className="bg-primary/80 rounded-sm transition-all duration-150 ease-out"
          style={{
            width: 3,
            height: h,
            opacity: isPlaying ? 0.85 : 0.5,
            transitionProperty: "height, opacity",
          }}
        />
      ))}
    </div>
  );
}