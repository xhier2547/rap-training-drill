"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface WaveformOverlayProps {
  originalAudioUrl: string;
  recordedAudioBlob?: Blob | null;
}

export default function WaveformOverlay({ originalAudioUrl, recordedAudioBlob }: WaveformOverlayProps) {
  const originalRef = useRef<HTMLAudioElement>(null);
  const recordedRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string>('');
  const [progress, setProgress] = useState(0);

  // Create URL for recorded blob
  useEffect(() => {
    if (recordedAudioBlob) {
      const url = URL.createObjectURL(recordedAudioBlob);
      setRecordedUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [recordedAudioBlob]);

  const togglePlay = () => {
    const orig = originalRef.current;
    const rec = recordedRef.current;
    if (!orig) return;

    if (isPlaying) {
      orig.pause();
      rec?.pause();
      setIsPlaying(false);
    } else {
      orig.play().catch(() => {});
      rec?.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-[#11141D] border border-dojo-border rounded-xl p-6 shadow-xl relative mt-4">
      <audio ref={originalRef} src={originalAudioUrl} preload="auto"
        onLoadedMetadata={() => setIsReady(true)}
        onTimeUpdate={(e) => {
          const a = e.currentTarget;
          if (a.duration > 0) setProgress((a.currentTime / a.duration) * 100);
        }}
        onEnded={() => { setIsPlaying(false); setProgress(0); }}
      />
      {recordedUrl && <audio ref={recordedRef} src={recordedUrl} preload="auto" />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-display font-bold text-white uppercase tracking-widest">Timing Overlay</h3>
          <p className="text-xs text-dojo-text/60 mt-1">
            <span className="text-dojo-cyber font-bold">Blue = Original</span> | <span className="text-dojo-neon font-bold">Green = You</span>
          </p>
        </div>
        
        <button onClick={togglePlay} disabled={!isReady}
          className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50">
          {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-1" />}
        </button>
      </div>

      <div className="relative h-[60px] w-full rounded-lg overflow-hidden bg-dojo-bg/50">
        {/* Progress bar */}
        <div className="absolute inset-0 bg-dojo-cyber/20 rounded-lg transition-all" style={{ width: `${progress}%` }} />
        <div className="absolute top-0 bottom-0 w-0.5 bg-white z-10" style={{ left: `${progress}%`, boxShadow: '0 0 8px white' }} />
        
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center text-dojo-text/40 text-sm font-mono">
            Loading audio...
          </div>
        )}
      </div>
    </div>
  );
}
