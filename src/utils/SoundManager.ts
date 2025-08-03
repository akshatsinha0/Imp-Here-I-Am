class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.log('Web Audio API not supported');
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(volume * this.volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.log('Failed to play sound:', error);
    }
  }

  playSendSound() {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.08);
    
    gainNode.gain.setValueAtTime(0.3 * this.volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.12);

    oscillator.type = 'sine';
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.12);
  }

  playReceiveSound() {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.2 * this.volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);

    oscillator.type = 'triangle';
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.25);
  }

  playSuccessSound() {
    this.playTone(900, 0.1, 'sine', 0.15);
  }

  playErrorSound() {
    this.playTone(300, 0.2, 'square', 0.2);
  }

  playTypingSound() {
    this.playTone(1000, 0.03, 'square', 0.05);
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  isEnabled() {
    return this.enabled;
  }

  getVolume() {
    return this.volume;
  }
}

export const soundManager = new SoundManager();

export const useSoundManager = () => {
  return {
    playSendSound: () => soundManager.playSendSound(),
    playReceiveSound: () => soundManager.playReceiveSound(),
    playSuccessSound: () => soundManager.playSuccessSound(),
    playErrorSound: () => soundManager.playErrorSound(),
    playTypingSound: () => soundManager.playTypingSound(),
    setEnabled: (enabled: boolean) => soundManager.setEnabled(enabled),
    setVolume: (volume: number) => soundManager.setVolume(volume),
    isEnabled: () => soundManager.isEnabled(),
    getVolume: () => soundManager.getVolume(),
  };
};