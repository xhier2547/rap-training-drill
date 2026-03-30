"use client";

import React, { useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mic2, Activity } from 'lucide-react';
import Link from 'next/link';

import Waveform from '@/components/studio/Waveform';
import KineticLyrics from '@/components/studio/KineticLyrics';
import AudioControls from '@/components/studio/AudioControls';
import LiveFeedback from '@/components/studio/LiveFeedback';
import CountdownOverlay from '@/components/studio/CountdownOverlay';
import SyncControls from '@/components/studio/SyncControls';
import MasteryResult from '@/components/studio/MasteryResult';
import VocalFXRack from '@/components/studio/VocalFXRack';
import { useStudioStore } from '@/lib/store/useStudioStore';
import { CENTRAL_CEE_SONGS } from '@/data/songs';

export default function StudioPage() {
  const params = useParams<{ songId: string }>();
  const router = useRouter();
  const isRecording = useStudioStore(s => s.isRecording);
  const storeRef = useRef(useStudioStore.getState());

  const songId = params?.songId;

  // Find the song directly — no store dependency for rendering
  const song = useMemo(() => {
    if (!songId) return null;
    return CENTRAL_CEE_SONGS.find(s => s.id === songId) || null;
  }, [songId]);

  // Set active song in store for child components (Waveform, KineticLyrics)
  // Using a ref-based approach to avoid Strict Mode cleanup issues
  useEffect(() => {
    if (!song) return;
    
    useStudioStore.setState({ activeSong: song });
    
    return () => {
      // Use setTimeout to avoid Strict Mode's immediate cleanup-then-remount
      // In production, component truly unmounting will still clean up
      const currentSong = useStudioStore.getState().activeSong;
      if (currentSong?.id === song.id) {
        // Defer cleanup so strict mode remount can re-set before this fires
        setTimeout(() => {
          const stillSame = useStudioStore.getState().activeSong;
          if (stillSame?.id === song.id) {
            useStudioStore.setState({ activeSong: null });
          }
        }, 100);
      }
    };
  }, [song]);

  // Redirect if song not found
  useEffect(() => {
    if (songId && !song) {
      router.push('/');
    }
  }, [songId, song, router]);

  if (!song) {
    return (
      <div className="min-h-screen bg-dojo-bg flex items-center justify-center">
        <div className="text-dojo-neon animate-pulse font-display text-xl uppercase tracking-widest flex items-center gap-3">
          <Activity className="animate-spin" /> LOAD STEMS
        </div>
      </div>
    );
  }

  return (
    <main className={`min-h-screen bg-dojo-bg text-dojo-text p-4 md:p-8 flex flex-col gap-6 transition-all duration-700 ${isRecording ? 'shadow-[inset_0_0_150px_rgba(255,61,90,0.15)]' : ''}`}>
      
      {/* Header */}
      <header className="flex justify-between items-center bg-[#11141D]/80 backdrop-blur border border-dojo-border rounded-xl p-4 sticky top-4 z-50">
        <div className="flex items-center gap-6">
          <Link href="/">
            <button className="text-white hover:text-dojo-neon transition-colors p-2 bg-dojo-surface rounded-full">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div className="flex items-center gap-4">
            <img src={song.coverUrl} className="w-12 h-12 rounded-lg object-cover border border-dojo-border/50" alt="" />
            <div>
              <h1 className="text-xl font-display font-black text-white">{song.title}</h1>
              <p className="text-sm text-dojo-text/60 font-medium">{song.artist}</p>
            </div>
          </div>
        </div>

        {isRecording && (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-dojo-alert/20 border border-dojo-alert text-dojo-alert rounded-full mt-2 lg:mt-0 animate-pulse">
            <Mic2 size={16} />
            <span className="text-xs font-bold font-mono tracking-widest">RECORDING</span>
          </div>
        )}
      </header>

      {/* Main Studio Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Col: Song Info + AI */}
        <aside className="lg:col-span-3 hidden lg:flex flex-col gap-4 sticky top-28 self-start max-h-[calc(100vh-140px)] overflow-y-auto pr-2 custom-scrollbar">
          <div className="bg-[#11141D] border border-dojo-border rounded-xl p-5 shrink-0">
            <h3 className="text-sm font-display font-bold text-dojo-cyber uppercase tracking-widest mb-4">
              AI Speech Engine
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-dojo-text/60 font-mono">MODEL</span>
                <span className="text-xs bg-dojo-surface px-2 py-1 rounded text-white border border-dojo-border">Web Speech API</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-dojo-text/60 font-mono">STATUS</span>
                <span className="text-xs text-dojo-neon font-bold">READY</span>
              </div>
              
              <hr className="border-dojo-border/50 my-2" />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dojo-text/60 font-mono">BPM</span>
                  <span className="text-xs text-white font-bold">{song.bpm}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dojo-text/60 font-mono">DIFFICULTY</span>
                  <span className={`text-xs font-bold ${
                    song.difficulty === 'Hard' ? 'text-orange-400' :
                    song.difficulty === 'Medium' ? 'text-dojo-cyber' :
                    song.difficulty === 'Dojo Master' ? 'text-dojo-alert' : 'text-dojo-neon'
                  }`}>{song.difficulty}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dojo-text/60 font-mono">SLANG</span>
                  <span className={`text-xs font-bold ${
                    song.slangDensity === 'High' ? 'text-dojo-alert' :
                    song.slangDensity === 'Medium' ? 'text-dojo-cyber' : 'text-dojo-neon'
                  }`}>{song.slangDensity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dojo-text/60 font-mono">LINES</span>
                  <span className="text-xs text-white font-bold">{song.lines.length}</span>
                </div>
              </div>
              
              <hr className="border-dojo-border/50 my-2" />
              
              <div className="text-xs text-dojo-text/50 leading-relaxed">
                กด 🎤 REC เพื่อเริ่มอัดเสียง — ระบบจะฟังและวิเคราะห์แบบ real-time
              </div>
            </div>

            {/* Live Feedback — appears during recording */}
            <LiveFeedback />
          </div>

          {/* Pro Sync Calibration */}
          <div className="mt-4 shrink-0">
            <SyncControls />
          </div>

          {/* Vocal FX Rack */}
          <div className="mt-4 shrink-0">
            <VocalFXRack />
          </div>
        </aside>

        {/* Center/Right Col: Lyrics + Waveform */}
        <div className="lg:col-span-9 flex flex-col gap-6 w-full h-full min-h-[calc(100vh-140px)]">
          <div className="flex-1 min-h-[400px]">
            <KineticLyrics song={song} />
          </div>

          <div className="space-y-4 shrink-0">
            <Waveform song={song} />
            <AudioControls />
          </div>
        </div>
      </div>

      <CountdownOverlay />
      <MasteryResult />
    </main>
  );
}
