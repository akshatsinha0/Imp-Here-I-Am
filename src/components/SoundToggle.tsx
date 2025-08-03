import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { useSoundManager } from '@/utils/SoundManager';

const SoundToggle: React.FC = () => {
  const { isEnabled, setEnabled, playSendSound } = useSoundManager();
  const [enabled, setEnabledState] = useState(isEnabled());

  const toggleSounds = () => {
    const newState = !enabled;
    setEnabled(newState);
    setEnabledState(newState);
    
    // Play a test sound when enabling
    if (newState) {
      setTimeout(() => playSendSound(), 100);
    }
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={toggleSounds}
      title={enabled ? "Disable sounds" : "Enable sounds"}
      className="touch-target shrink-0"
    >
      {enabled ? (
        <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
      ) : (
        <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />
      )}
    </Button>
  );
};

export default SoundToggle;