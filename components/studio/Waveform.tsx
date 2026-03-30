"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useStudioStore } from '@/lib/store/useStudioStore';
import { Song } from '@/data/songs';

interface WaveformProps {
  song?: Song;
}

export default function Waveform({ song }: WaveformProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [dur, setDur] = useState(0);
  const [cur, setCur] = useState(0);
  const [bars, setBars] = useState<number[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const isPlaying = useStudioStore(s => s.isPlaying);
  const playbackRate = useStudioStore(s => s.playbackRate);
  const musicVolume = useStudioStore(s => s.musicVolume);
  const seekTo = useStudioStore(s => s.seekTo);
  const loopRegion = useStudioStore(s => s.loopRegion);
  const setLyricOffset = useStudioStore(s => s.setLyricOffset);

  // REAL AUDIO ANALYSIS & AUTO-SYNC
  useEffect(() => {
    if (!song) return;

    const analyzeAudio = async () => {
      setIsAnalyzing(true);
      setError('');

      try {
        const response = await fetch(song.audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const buffer = await audioContext.decodeAudioData(arrayBuffer);

        // 1. Generate real waveform points
        const rawData = buffer.getChannelData(0);
        const points = 150;
        const blockSize = Math.floor(rawData.length / points);
        const newBars: number[] = [];

        for (let i = 0; i < points; i++) {
          let max = 0;
          for (let j = 0; j < blockSize; j++) {
            const val = Math.abs(rawData[i * blockSize + j]);
            if (val > max) max = val;
          }
          newBars.push(0.15 + max * 0.85); // Normalize for visibility
        }
        setBars(newBars);

        // 2. Detect first sustained VOCAL peak for Auto-Sync (Speech-Aware)
        const threshold = 0.08; // Slightly higher to ignore soft instrumentals
        const minSustainedWindow = Math.floor(buffer.sampleRate * 0.15); // 150ms sustained vocal
        let firstVocalSample = 0;
        
        // Scan first 15 seconds for the FIRST SUSTAINED vocal burst
        const scanSamples = Math.min(buffer.sampleRate * 15, rawData.length);
        for (let i = 0; i < scanSamples - minSustainedWindow; i += 100) { // Step to speed up
          if (Math.abs(rawData[i]) > threshold) {
            // Confirm it's sustained (vocal energy isn't just one spike)
            let isSustained = true;
            for (let k = 1; k < minSustainedWindow; k += 50) {
              if (Math.abs(rawData[i + k]) < threshold * 0.4) {
                isSustained = false;
                break;
              }
            }
            if (isSustained) {
              firstVocalSample = i;
              break;
            }
          }
        }
        
        const firstVocalTime = firstVocalSample / buffer.sampleRate;
        const firstLyricTime = song.lines[0]?.startTime || 0;
        
        // Offset Calculation: 
        // If vocal starts at 8.0s (Audio), and LRC says 1.9s (First word)
        // We need the "0s" of LRC to actually be at "6.1s" in Audio.
        // So lyricOffset = 8.0 - 1.9 = 6.1s.
        const calculatedOffset = Math.max(0, firstVocalTime - firstLyricTime);
        
        setLyricOffset(song.id, calculatedOffset);
        console.log(`[Vocal-Smart Auto-Sync] Detected ${song.id} vocals at ${firstVocalTime.toFixed(2)}s. Anchoring LRC(0) to ${calculatedOffset.toFixed(2)}s.`);

      } catch (err) {
        console.error('Waveform analysis failed:', err);
        // Fallback to random bars if analysis fails
        const fallback: number[] = [];
        for (let i = 0; i < 150; i++) fallback.push(0.2 + Math.random() * 0.8);
        setBars(fallback);
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeAudio();
  }, [song, setLyricOffset]);

  // Play/pause sync
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !ready) return;
    if (isPlaying) {
      a.play().catch(() => useStudioStore.setState({ isPlaying: false }));
    } else {
      a.pause();
    }
  }, [isPlaying, ready]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);

  const getTimeFromX = (clientX: number, target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return pct * dur;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ready) return;
    const time = getTimeFromX(e.clientX, e.currentTarget);
    setDragStart(time);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || dragStart === null || !ready) return;
    const time = getTimeFromX(e.clientX, e.currentTarget);
    const start = Math.min(dragStart, time);
    const end = Math.max(dragStart, time);
    if (end - start > 0.1) {
      useStudioStore.setState({ loopRegion: [start, end] });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || dragStart === null || !ready || !song) return;
    const time = getTimeFromX(e.clientX, e.currentTarget);
    
    // If it's just a click (very small range), treat as seek
    if (Math.abs(time - dragStart) < 0.2) {
      const a = audioRef.current;
      if (a) a.currentTime = time;
      useStudioStore.setState({ loopRegion: null }); // Clear loop on simple seek
    } else {
      // SNAP TO LINES LOGIC
      const start = Math.min(dragStart, time);
      const end = Math.max(dragStart, time);
      
      // Find closest line start and end
      let snappedStart = start;
      let snappedEnd = end;
      let minStartDist = Infinity;
      let minEndDist = Infinity;

      song.lines.forEach(line => {
        const dStart = Math.abs(line.startTime - start);
        if (dStart < minStartDist && dStart < 2) { // 2s tolerance
          minStartDist = dStart;
          snappedStart = line.startTime;
        }
        const dEnd = Math.abs(line.endTime - end);
        if (dEnd < minEndDist && dEnd < 2) {
          minEndDist = dEnd;
          snappedEnd = line.endTime;
        }
      });

      useStudioStore.setState({ loopRegion: [snappedStart, snappedEnd] });
    }

    setIsDragging(false);
    setDragStart(null);
  };

  // Playback rate sync
  useEffect(() => {
    const a = audioRef.current;
    if (a) a.playbackRate = playbackRate;
  }, [playbackRate]);
  
  // Music Volume sync
  useEffect(() => {
    const a = audioRef.current;
    if (a) a.volume = musicVolume / 100;
  }, [musicVolume]);

  // Seek command from store
  useEffect(() => {
    const a = audioRef.current;
    if (a && seekTo !== null && ready) {
      a.currentTime = seekTo;
      setCur(seekTo);
      if (a.duration > 0) setProgress((seekTo / a.duration) * 100);
      useStudioStore.setState({ seekTo: null }); // Clear the command
    }
  }, [seekTo, ready]);

  // Loop region — when audio passes end of loop, jump back to start
  useEffect(() => {
    if (!loopRegion || !ready) return;
    const a = audioRef.current;
    if (!a) return;

    const checkLoop = () => {
      if (a.currentTime >= loopRegion[1]) {
        a.currentTime = loopRegion[0];
      }
    };

    a.addEventListener('timeupdate', checkLoop);
    return () => a.removeEventListener('timeupdate', checkLoop);
  }, [loopRegion, ready]);

  if (!song) return null;

  const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  // Calculate loop region visual overlay
  const loopStart = loopRegion && dur > 0 ? (loopRegion[0] / dur) * 100 : 0;
  const loopWidth = loopRegion && dur > 0 ? ((loopRegion[1] - loopRegion[0]) / dur) * 100 : 0;

  return (
    <div className="bg-[#11141D] border border-dojo-border rounded-xl p-6 shadow-xl space-y-3 select-none">
      <audio
        ref={audioRef}
        src={song.audioUrl}
        preload="auto"
        onLoadedMetadata={(e) => {
          const a = e.currentTarget;
          setReady(true);
          setDur(a.duration);
          useStudioStore.setState({ duration: a.duration });
        }}
        onTimeUpdate={(e) => {
          const a = e.currentTarget;
          setCur(a.currentTime);
          useStudioStore.setState({ currentTime: a.currentTime });
          if (a.duration > 0) setProgress((a.currentTime / a.duration) * 100);
        }}
        onEnded={() => { useStudioStore.setState({ isPlaying: false }); setProgress(0); setCur(0); }}
        onError={() => setError('ไม่สามารถโหลดไฟล์เสียงได้')}
      />

      <div className="flex justify-between items-center text-xs font-mono font-bold text-dojo-text/60">
        <div className="flex items-center gap-2">
          <span className="text-dojo-cyber uppercase tracking-widest">Mastering Flow</span>
          {loopRegion && (
            <span className="bg-dojo-cyber/10 text-dojo-cyber px-2 py-0.5 rounded border border-dojo-cyber/30 animate-pulse">
              LOOP ACTIVE
            </span>
          )}
        </div>
        <span>
          {ready ? <span className="text-dojo-neon opacity-80">{fmt(cur)} / {fmt(dur)}</span>
           : error ? <span className="text-dojo-alert">{error}</span>
           : <span className="text-dojo-cyber animate-pulse">PREPARING AUDIO...</span>}
        </span>
      </div>
      
      <div 
        className="relative h-20 cursor-pointer rounded-lg overflow-hidden bg-dojo-bg/20 border border-white/5 active:cursor-grabbing group"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* Loop region overlay */}
        {loopRegion && (
          <div 
            className="absolute top-0 bottom-0 bg-dojo-cyber/20 border-l-2 border-r-2 border-dojo-cyber/60 z-5 pointer-events-none"
            style={{ left: `${loopStart}%`, width: `${loopWidth}%` }}
          >
            {/* Range Handles visuals */}
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-dojo-cyber/40" />
            <div className="absolute top-0 bottom-0 right-0 w-1 bg-dojo-cyber/40" />
          </div>
        )}

        {/* Bars */}
        {bars.length > 0 && (
          <div className="absolute inset-0 flex items-center gap-[1px] px-1 py-3 transition-opacity">
            {bars.map((h, i) => {
              const barPct = (i / bars.length) * 100;
              const isPast = barPct < progress;
              const isNear = Math.abs(barPct - progress) < 1.5;
              const isInLoop = loopRegion && (barPct >= loopStart && barPct <= (loopStart + loopWidth));
              
              return (
                <div key={i} className="flex-1 rounded-full" style={{
                  height: `${h * 100}%`, minWidth: 2,
                  backgroundColor: isNear ? '#00FF85' : isInLoop ? '#00C8FF' : isPast ? '#00C8FF44' : 'rgba(255,255,255,0.08)',
                  boxShadow: isNear ? '0 0 10px #00FF85' : 'none',
                  transition: 'background-color 0.1s, height 0.3s',
                }} />
              );
            })}
          </div>
        )}

        {/* Playhead Cursor */}
        {progress > 0 && (
          <div className="absolute top-0 bottom-0 w-0.5 bg-dojo-neon z-10 pointer-events-none"
            style={{ left: `${progress}%`, boxShadow: '0 0 12px #00FF85' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-dojo-neon shadow-[0_0_8px_#00FF85]" />
          </div>
        )}

        {/* Waveform Selection Hint */}
        {!loopRegion && !isDragging && ready && (
          <div className="absolute inset-x-0 bottom-1 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span className="text-[10px] text-dojo-text/30 font-mono uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded">
              Drag to select loop section
            </span>
          </div>
        )}

        {/* Loading overlay */}
        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#11141D]/80 backdrop-blur-sm rounded-lg z-20">
            <div className="text-dojo-cyber font-mono text-sm animate-pulse flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-dojo-cyber border-t-transparent rounded-full animate-spin" />
              ANALYZING AUDIO...
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#11141D]/90 rounded-lg z-20 px-8 text-center">
            <div className="text-dojo-alert font-mono text-sm border border-dojo-alert/30 bg-dojo-alert/5 p-4 rounded-xl">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
