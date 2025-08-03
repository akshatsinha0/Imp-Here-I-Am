import { useCallback, useRef } from 'react';

const createAudioContext = () => {
  return new (window.AudioContext || (window as any).webkitAudioContext)();
};

export const useSoundEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = createAudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playSendSound = useCallback(() => {
    try {
      const audioContext = getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      console.log('Audio not supported or blocked');
    }
  }, [getAudioContext]);

  const playReceiveSound = useCallback(() => {
    try {
      const audioContext = getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);

      oscillator.type = 'triangle';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.25);
    } catch (error) {
      console.log('Audio not supported or blocked');
    }
  }, [getAudioContext]);

  const playAudioFile = useCallback((audioUrl: string, volume: number = 0.5) => {
    try {
      const audio = new Audio(audioUrl);
      audio.volume = volume;
      audio.play().catch(error => {
        console.log('Audio playback failed:', error);
      });
    } catch (error) {
      console.log('Audio file not supported');
    }
  }, []);

  return {
    playSendSound,
    playReceiveSound,
    playAudioFile,
  };
};