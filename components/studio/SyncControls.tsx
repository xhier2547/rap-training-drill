"use client";

import React, { useState, useEffect } from 'react';
import { useStudioStore } from '@/lib/store/useStudioStore';
import { 
  Timer, 
  ChevronLeft, 
  ChevronRight, 
  Target, 
  RotateCcw,
  Zap
} from 'lucide-react';

export default function SyncControls() {
  const activeSong = useStudioStore(s => s.activeSong);
  const currentTime = useStudioStore(s => s.currentTime);
  const lyricOffsets = useStudioStore(s => s.lyricOffsets);
  const setLyricOffset = useStudioStore(s => s.setLyricOffset);

  if (!activeSong) return null;

  const currentOffset = lyricOffsets[activeSong.id] || 0;

  const adjust = (val: number) => {
    setLyricOffset(activeSong.id, Math.max(0, currentOffset + val));
  };

  /**
   * Sync Now logic:
   * Sets the anchor point. When the user hears the FIRST word, they hit this.
   * It aligns the first LRC line to exactly the current playback time.
   */
  const handleSyncNow = () => {
    const firstLyricTime = activeSong.lines[0]?.startTime || 0;
    // Current Audio Time = firstLyricTime + offset
    // offset = currentTime - firstLyricTime
    const newOffset = Math.max(0, currentTime - firstLyricTime);
    setLyricOffset(activeSong.id, newOffset);
  };

  return (
    <div className="bg-[#11141D] border border-dojo-border rounded-xl p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-dojo-cyber/10 flex items-center justify-center border border-dojo-cyber/30">
            <Timer className="w-4 h-4 text-dojo-cyber" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-dojo-text uppercase tracking-widest">Calibration</h3>
            <p className="text-[10px] text-dojo-text/40 font-mono">Sync Engine v2 (Pro)</p>
          </div>
        </div>
        <div className="px-2 py-1 bg-black/40 rounded border border-white/5 font-mono text-[10px] text-dojo-cyber">
          {currentOffset.toFixed(2)}s
        </div>
      </div>

      {/* BIG SYNC TRIGGER */}
      <button
        onClick={handleSyncNow}
        className="w-full group relative overflow-hidden bg-gradient-to-br from-dojo-cyber to-dojo-neon p-[1px] rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(0,255,133,0.2)]"
      >
        <div className="bg-[#0D1017] rounded-[11px] py-4 px-4 flex flex-col items-center gap-1 group-hover:bg-transparent transition-colors">
          <div className="flex items-center gap-2 text-dojo-neon font-bold tracking-tighter text-lg uppercase italic">
            <Zap className="w-5 h-5 fill-current" />
            Sync Now
          </div>
          <span className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold">
            Tap when you hear word 1
          </span>
        </div>
        
        {/* Animated scanning line */}
        <div className="absolute inset-x-0 top-0 h-px bg-white/20 animate-scan pointer-events-none" />
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => adjust(-0.1)}
          className="flex items-center justify-center gap-1 py-3 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          title="Shift Lyrics Earlier"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">0.1s</span>
        </button>
        <button
          onClick={() => adjust(0.1)}
          className="flex items-center justify-center gap-1 py-3 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          title="Shift Lyrics Later"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest">0.1s</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
        <p className="text-[9px] text-dojo-text/30 italic flex items-center gap-1">
          <Target className="w-3 h-3" />
          Anchoring word 1 to current beat
        </p>
        <button 
          onClick={() => setLyricOffset(activeSong.id, 0)}
          className="p-1 hover:text-dojo-alert text-dojo-text/20 transition-colors"
          title="Reset Calibration"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      <style jsx>{`
        @keyframes scan {
          from { top: 0; opacity: 0; }
          50% { opacity: 1; }
          to { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
