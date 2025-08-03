import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseSupabaseChannelOptions {
  channelName: string;
  onSubscribe?: (channel: RealtimeChannel) => void;
  enabled?: boolean;
}

export function useSupabaseChannel({ 
  channelName, 
  onSubscribe, 
  enabled = true 
}: UseSupabaseChannelOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isCleaningUp = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const setupChannel = async () => {
      // Wait for any ongoing cleanup to complete
      while (isCleaningUp.current) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Create new channel
      const channel = supabase.channel(channelName);
      channelRef.current = channel;

      if (onSubscribe) {
        onSubscribe(channel);
      }
    };

    const cleanup = async () => {
      isCleaningUp.current = true;
      
      if (channelRef.current) {
        try {
          await supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.warn(`Error removing channel ${channelName}:`, error);
        }
        channelRef.current = null;
      }
      
      isCleaningUp.current = false;
    };

    // Initial setup
    setupChannel();

    // Cleanup function
    return () => {
      cleanup();
    };
  }, [channelName, enabled]);

  return channelRef.current;
}
