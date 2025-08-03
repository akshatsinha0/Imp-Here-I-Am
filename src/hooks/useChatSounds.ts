import { useCallback, useRef, useState } from 'react';

interface SoundSettings {
  enabled: boolean;
  volume: number;
}

export const useChatSounds = () => {
  const [settings, setSettings] = useState<SoundSettings>({
    enabled: true,
    volume: 0.5,
  });
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.log('Web Audio API not supported');
        return null;
      }
    }
    return audioContextRef.current;
  }, []);

  const playSendSound = useCallback(() => {
    if (!settings.enabled) return;

    const audioContext = getAudioContext();
    if (!audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.08);
      
      gainNode.gain.setValueAtTime(settings.volume * 0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12);

      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.12);
    } catch (error) {
      console.log('Failed to play send sound:', error);
    }
  }, [settings, getAudioContext]);

  const playReceiveSound = useCallback(() => {
    if (!settings.enabled) return;

    const audioContext = getAudioContext();
    if (!audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(settings.volume * 0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);

      oscillator.type = 'triangle';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.25);
    } catch (error) {
      console.log('Failed to play receive sound:', error);
    }
  }, [settings, getAudioContext]);

  const playTypingSound = useCallback(() => {
    if (!settings.enabled) return;

    const audioContext = getAudioContext();
    if (!audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 1000;
      gainNode.gain.setValueAtTime(settings.volume * 0.05, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

      oscillator.type = 'square';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    } catch (error) {
      console.log('Failed to play typing sound:', error);
    }
  }, [settings, getAudioContext]);

  const toggleSounds = useCallback(() => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  return {
    playSendSound,
    playReceiveSound,
    playTypingSound,
    toggleSounds,
    setVolume,
    settings,
  };
};