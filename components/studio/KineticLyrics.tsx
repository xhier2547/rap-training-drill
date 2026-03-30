"use client";

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStudioStore } from '@/lib/store/useStudioStore';
import SlangTooltip from './SlangTooltip';
import { LyricWord, LyricLine, Song } from '@/data/songs';

interface KineticLyricsProps {
  song?: Song;
}

export default function KineticLyrics({ song: propSong }: KineticLyricsProps) {
  const storeSong = useStudioStore(s => s.activeSong);
  const currentTime = useStudioStore(s => s.currentTime);
  const lyricOffsets = useStudioStore(s => s.lyricOffsets);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use prop song or fallback to store
  const activeSong = propSong || storeSong;

  // Real-time synchronization adjusted by user offset
  const syncTime = currentTime - (activeSong ? (lyricOffsets[activeSong.id] || 0) : 0);
  
  // Auto-scroll to the active line
  useEffect(() => {
    if (!containerRef.current || !activeSong?.lines) return;
    
    const activeLineIdx = activeSong.lines.findIndex(
      (line: LyricLine) => syncTime >= line.startTime && syncTime < line.endTime
    );
    
    if (activeLineIdx !== -1) {
      const lineEl = containerRef.current.querySelector(`[data-line-id="${activeLineIdx}"]`);
      if (lineEl) {
        lineEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }, [currentTime, activeSong]);

  if (!activeSong) return null;
  if (!activeSong.lines || activeSong.lines.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-dojo-text/40 font-mono text-sm border border-dashed border-dojo-border/50 rounded-2xl">
        [ LYRICS_DATA_PENDING — No lyrics for this track ]
      </div>
    );
  }

  const getWordStyle = (word: LyricWord, isActive: boolean, isPast: boolean) => {
    let colorClass = "text-dojo-text/25";
    let textShadow = "none";
    let scale = 1;
    
    if (isPast) {
      colorClass = "text-dojo-text/55";
    }
    
    if (isActive) {
      scale = 1.1;
      switch (word.type) {
        case 'slang':
          colorClass = "text-dojo-alert font-black";
          textShadow = "0 0 15px rgba(255, 61, 90, 0.6)";
          break;
        case 'linking':
          colorClass = "text-dojo-cyber font-bold italic border-b-2 border-dojo-cyber pb-1";
          textShadow = "0 0 10px rgba(0, 200, 255, 0.5)";
          break;
        case 'breath':
          colorClass = "text-dojo-neon";
          textShadow = "0 0 10px rgba(0, 255, 133, 0.5)";
          break;
        default:
          colorClass = "text-white font-bold";
          textShadow = "0 0 10px rgba(255, 255, 255, 0.3)";
      }
    } else {
      if (word.type === 'slang' && !isPast) colorClass += " text-[#FF3D5A]/30 border-b border-dashed border-[#FF3D5A]/20";
    }

    return { colorClass, textShadow, scale };
  };

  return (
    <div 
      ref={containerRef}
      className="h-[400px] overflow-y-auto overflow-x-hidden p-6 md:p-8 bg-dojo-surface/50 border border-dojo-border rounded-3xl backdrop-blur-md scrollbar-thin space-y-3"
    >
      {activeSong.lines.map((line: LyricLine, lineIdx: number) => {
        const isActiveLine = syncTime >= line.startTime && syncTime < line.endTime;
        const isPastLine = syncTime >= line.endTime;

        return (
          <div
            key={line.id}
            data-line-id={lineIdx}
            className={`flex flex-wrap gap-x-3 gap-y-1 py-2 px-2 rounded-xl transition-all duration-300 ${
              isActiveLine 
                ? 'bg-white/5 border border-dojo-neon/20' 
                : 'border border-transparent'
            }`}
          >
            {/* Line timestamp indicator */}
            {isActiveLine && (
              <div className="w-full flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-dojo-neon animate-pulse" />
                <span className="text-[10px] font-mono text-dojo-neon/60">
                  {formatTime(line.startTime)}
                </span>
              </div>
            )}

            {line.words.map((wordObj) => {
              const isActiveWord = syncTime >= wordObj.startTime && syncTime < wordObj.endTime;
              const isPastWord = syncTime >= wordObj.endTime;
              
              const { colorClass, textShadow, scale } = getWordStyle(wordObj, isActiveWord, isPastWord);

              const WordComponent = (
                <motion.span
                  key={wordObj.id}
                  initial={false}
                  animate={{ 
                    scale: isActiveWord ? [1.1, 1.25, 1.1] : scale,
                    y: isActiveWord ? -3 : 0,
                    textShadow: isActiveWord ? [
                      "0 0 10px rgba(255,255,255,0.4)",
                      "0 0 25px rgba(0,255,133,0.8)",
                      "0 0 10px rgba(255,255,255,0.4)"
                    ] : textShadow
                  }}
                  transition={{ 
                    duration: isActiveWord ? 0.6 : 0.3,
                    repeat: isActiveWord ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                  className={`text-2xl md:text-3xl lg:text-4xl font-display transition-colors duration-200 inline-block cursor-default px-1 ${colorClass}`}
                >
                  {wordObj.word}
                </motion.span>
              );

              if (wordObj.type === 'slang') {
                return (
                  <SlangTooltip 
                    key={wordObj.id}
                    meaning={wordObj.slangMeaning}
                    context={wordObj.slangContext}
                    pronunciation={wordObj.pronunciation}
                  >
                    {WordComponent}
                  </SlangTooltip>
                );
              }

              return WordComponent;
            })}
          </div>
        );
      })}
      
      <div className="h-[200px]" />
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}
