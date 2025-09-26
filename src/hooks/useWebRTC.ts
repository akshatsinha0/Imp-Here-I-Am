import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
export type RemoteParticipant = {
  id: string;
  stream: MediaStream;
};

type SignalPayload = {
  type: 'join' | 'offer' | 'answer' | 'ice' | 'leave';
  from: string;
  to?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};

const DEFAULT_STUN: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
];

async function fetchIceServers() {
  try {
    const { data, error } = await supabase.functions.invoke('webrtc-ice', {
      body: { t: Date.now() },
    });
    if (!error && data?.iceServers?.length) return data.iceServers as RTCIceServer[];
  } catch {}
  return DEFAULT_STUN;
}

function streamFromTracks(tracks: MediaStreamTrack[]) {
  const ms = new MediaStream();
  tracks.forEach(t => ms.addTrack(t));
  return ms;
}

export function useWebRTC(roomId: string, currentUserId?: string) {
  const [inCall, setInCall] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remotes, setRemotes] = useState<RemoteParticipant[]>([]);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const iceServersRef = useRef<RTCIceServer[]>(DEFAULT_STUN);
  const joiningRef = useRef(false);

  const channelName = useMemo(() => `webrtc:room:${roomId}`, [roomId]);

  const updateRemotes = useCallback(() => {
    const arr: RemoteParticipant[] = [];
    remoteStreamsRef.current.forEach((stream, id) => arr.push({ id, stream }));
    setRemotes(arr);
  }, []);

  const makePC = useCallback((peerId: string) => {
    let pc = pcsRef.current.get(peerId);
    if (pc) return pc;
    pc = new RTCPeerConnection({ iceServers: iceServersRef.current });

    pc.onicecandidate = (e) => {
      if (e.candidate && currentUserId) {
        channelRef.current?.send({
          type: 'broadcast',
          event: 'webrtc',
          payload: <SignalPayload>{
            type: 'ice',
            from: currentUserId,
            to: peerId,
            candidate: e.candidate.toJSON(),
          },
        });
      }
    };

    pc.ontrack = (e) => {
      const [track] = e.streams?.[0]?.getTracks() ?? [];
      const streams = e.streams && e.streams.length > 0
        ? e.streams[0]
        : streamFromTracks(e.streams?.[0]?.getTracks() ?? (track ? [track] : []));
      remoteStreamsRef.current.set(peerId, streams);
      updateRemotes();
    };

    // Add our local tracks to this PC
    if (localStream) {
      localStream.getTracks().forEach(t => {
        try { pc!.addTrack(t, localStream); } catch {}
      });
    }

    pcsRef.current.set(peerId, pc);
    return pc;
  }, [currentUserId, localStream, updateRemotes]);

  const closePC = useCallback((peerId: string) => {
    const pc = pcsRef.current.get(peerId);
    if (pc) {
      try { pc.onicecandidate = null; pc.ontrack = null; pc.close(); } catch {}
      pcsRef.current.delete(peerId);
    }
    if (remoteStreamsRef.current.has(peerId)) {
      remoteStreamsRef.current.delete(peerId);
      updateRemotes();
    }
  }, [updateRemotes]);

  const leaveChannel = useCallback(async () => {
    if (channelRef.current) {
      try { await supabase.removeChannel(channelRef.current); } catch {}
      channelRef.current = null;
    }
  }, []);

  const endCall = useCallback(async () => {
    pcsRef.current.forEach((_, id) => closePC(id));
    pcsRef.current.clear();
    remoteStreamsRef.current.clear();
    updateRemotes();
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      setLocalStream(null);
    }
    await leaveChannel();
    setInCall(false);
  }, [closePC, leaveChannel, localStream, updateRemotes]);

  const toggleMute = useCallback(() => {
    if (!localStream) return;
    const enabled = !muted;
    localStream.getAudioTracks().forEach(t => t.enabled = enabled);
    setMuted(!enabled);
  }, [localStream, muted]);

  const toggleCamera = useCallback(() => {
    if (!localStream) return;
    const enabled = !cameraOff;
    localStream.getVideoTracks().forEach(t => t.enabled = enabled);
    setCameraOff(!enabled);
  }, [localStream, cameraOff]);

  const startCall = useCallback(async () => {
    if (!currentUserId) { setError('No user'); return; }
    if (joiningRef.current) return;
    joiningRef.current = true;
    setError(null);
    try {
      // Get media and ICE
      iceServersRef.current = await fetchIceServers();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setLocalStream(stream);

      // Create signaling channel with presence
      const ch = supabase.channel(channelName, {
        config: { presence: { key: currentUserId }, broadcast: { self: false } },
      });

      ch.on('presence', { event: 'sync' }, async () => {
        // Make offers to peers based on a simple ordering rule
        const state: any = ch.presenceState();
        const peerIds = Object.keys(state || {}).filter(id => id !== currentUserId);
        for (const pid of peerIds) {
          // Initiator rule: higher id calls lower id to avoid collisions
          if (currentUserId > pid) {
            const pc = makePC(pid);
            // Replace senders if local stream changed
            const senders = pc.getSenders();
            const haveTracks = senders.length > 0;
            if (!haveTracks && stream) {
              stream.getTracks().forEach(t => pc.addTrack(t, stream));
            }
            const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
            await pc.setLocalDescription(offer);
            ch.send({
              type: 'broadcast',
              event: 'webrtc',
              payload: <SignalPayload>{ type: 'offer', from: currentUserId, to: pid, sdp: offer },
            });
          }
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (key && key !== currentUserId) closePC(key);
      })
      .on('broadcast', { event: 'webrtc' }, async ({ payload }) => {
        const msg = payload as SignalPayload;
        if (!msg || msg.from === currentUserId) return;
        if (msg.to && msg.to !== currentUserId) return;
        const from = msg.from;
        if (msg.type === 'offer' && msg.sdp) {
          const pc = makePC(from);
          await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          ch.send({ type: 'broadcast', event: 'webrtc', payload: <SignalPayload>{ type: 'answer', from: currentUserId, to: from, sdp: answer } });
        } else if (msg.type === 'answer' && msg.sdp) {
          const pc = pcsRef.current.get(from);
          if (pc && !pc.currentRemoteDescription) {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          }
        } else if (msg.type === 'ice' && msg.candidate) {
          const pc = pcsRef.current.get(from);
          if (pc) {
            try { await pc.addIceCandidate(new RTCIceCandidate(msg.candidate)); } catch {}
          }
        } else if (msg.type === 'leave') {
          closePC(from);
        }
      });

      const status = await ch.subscribe(async (s) => {
        if (s === 'SUBSCRIBED') {
          try { await ch.track({ joinedAt: Date.now() }); } catch {}
        }
      });
      if (status !== 'SUBSCRIBED') throw new Error('Failed to subscribe');

      channelRef.current = ch;
      setInCall(true);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Failed to start call');
      await endCall();
    } finally {
      joiningRef.current = false;
    }
  }, [channelName, closePC, currentUserId, endCall, makePC]);

  useEffect(() => {
    return () => { endCall(); };
  }, [endCall]);

  return {
    inCall,
    localStream,
    remotes,
    muted,
    cameraOff,
    error,
    startCall,
    endCall,
    toggleMute,
    toggleCamera,
  };
}
