"use client";

import React from 'react';
import { Mic, Radio } from 'lucide-react';
import { useStudioStore } from '@/lib/store/useStudioStore';

export default function LiveFeedback() {
  const isRecording = useStudioStore(s => s.isRecording);
  const liveTranscript = useStudioStore(s => s.liveTranscript);
  const transcriptWords = useStudioStore(s => s.transcriptWords);
  const activeSong = useStudioStore(s => s.activeSong);

  // Compare latest heard words against lyrics for live coloring
  const lyricWordsNorm = activeSong 
    ? activeSong.lyrics.map(w => w.word.toLowerCase().replace(/[^a-z']/g, ''))
    : [];
  
  const displayWords = liveTranscript.split(/\s+/).filter(w => w.length > 0);

  const matchedCount = transcriptWords.filter(w => {
    const norm = w.word.toLowerCase().replace(/[^a-z']/g, '');
    return lyricWordsNorm.includes(norm);
  }).length;

  const currentAccuracy = lyricWordsNorm.length > 0 
    ? Math.min(100, Math.round((matchedCount / lyricWordsNorm.length) * 100)) 
    : 0;

  return (
    <div className="bg-[#11141D] border border-dojo-border rounded-2xl p-5 space-y-4 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-dojo-alert/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-dojo-alert animate-ping absolute inset-0 opacity-40" />
            <div className="w-3 h-3 rounded-full bg-dojo-alert relative" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-black text-dojo-alert uppercase tracking-[0.3em]">
              LIVE DOJO FEEDBACK
            </span>
            <p className="text-[9px] text-dojo-text/30 font-mono tracking-wider">AI FLOW DETECTION ACTIVE</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono bg-black/40 px-2 py-1 rounded border border-white/5">
          <Radio size={10} className="text-dojo-alert animate-pulse" />
          {transcriptWords.length} WORDS CAPTURED
        </div>
      </div>

      {/* Accuracy Meter */}
      <div className="space-y-1 relative z-10">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-mono font-bold text-dojo-text/40 uppercase tracking-widest">Mastery Level</span>
          <span className={`text-2xl font-black italic tracking-tighter ${
            currentAccuracy > 80 ? 'text-dojo-neon' : currentAccuracy > 50 ? 'text-dojo-cyber' : 'text-dojo-alert'
          }`}>
            {currentAccuracy}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div 
            className={`h-full transition-all duration-500 ease-out ${
              currentAccuracy > 80 ? 'bg-dojo-neon' : currentAccuracy > 50 ? 'bg-dojo-cyber' : 'bg-dojo-alert'
            }`}
            style={{ width: `${currentAccuracy}%`, boxShadow: '0 0 10px currentColor' }}
          />
        </div>
      </div>

      {/* Live Transcript Bubble */}
      <div className="bg-[#0D1017] border border-white/5 rounded-xl p-4 min-h-[80px] max-h-[140px] overflow-y-auto scrollbar-none relative group">
        {displayWords.length > 0 ? (
          <p className="text-sm leading-loose flex flex-wrap gap-x-2 gap-y-1">
            {displayWords.map((word, i) => {
              const norm = word.toLowerCase().replace(/[^a-z']/g, '');
              const isLyricMatch = lyricWordsNorm.includes(norm);
              
              return (
                <span 
                  key={i}
                  className={`inline-block px-1.5 py-0.5 rounded-md font-medium transition-all duration-300 ${
                    isLyricMatch 
                      ? 'text-[#00FF85] bg-[#00FF85]/10 border border-[#00FF85]/20 shadow-[0_0_8px_rgba(0,255,133,0.2)]' 
                      : 'text-white/40 italic'
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </p>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-[10px] text-dojo-text/20 font-mono uppercase tracking-[0.2em] flex items-center gap-2 animate-pulse">
              <Mic size={12} className="text-dojo-alert" /> Waiting for your vocals...
            </p>
          </div>
        )}
      </div>

      {/* Mini Stats Footer */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-black/30 border border-white/5 rounded-lg py-2 px-3 flex items-center justify-between">
          <span className="text-[9px] font-mono text-dojo-text/40 font-bold uppercase tracking-widest">Matched</span>
          <span className="text-xs font-bold text-dojo-neon">{matchedCount}</span>
        </div>
        <div className="bg-black/30 border border-white/5 rounded-lg py-2 px-3 flex items-center justify-between">
          <span className="text-[9px] font-mono text-dojo-text/40 font-bold uppercase tracking-widest">Missing</span>
          <span className="text-xs font-bold text-dojo-alert">{lyricWordsNorm.length - matchedCount}</span>
        </div>
      </div>
    </div>
  );
}
