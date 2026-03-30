"use client";

import React from 'react';
import { WordResult } from '@/lib/store/useStudioStore';

interface SyllableFeedbackProps {
  wordResults?: WordResult[];
}

export default function SyllableFeedback({ wordResults }: SyllableFeedbackProps) {
  // Filter to only missed/mispronounced words
  const issues = wordResults?.filter(w => !w.isCorrect || w.reason === 'mispronounced' || w.reason === 'late' || w.reason === 'early') || [];

  // Show top 10 issues, prioritize slang misses first
  const sorted = [...issues].sort((a, b) => {
    if (a.type === 'slang' && b.type !== 'slang') return -1;
    if (b.type === 'slang' && a.type !== 'slang') return 1;
    if (!a.isCorrect && b.isCorrect) return -1;
    if (a.isCorrect && !b.isCorrect) return 1;
    return 0;
  }).slice(0, 10);

  if (sorted.length === 0) {
    return (
      <div className="bg-dojo-surface border border-dojo-neon/30 rounded-xl p-6 shadow-xl w-full text-center">
        <div className="text-4xl mb-3">🔥</div>
        <h3 className="text-lg font-display font-bold text-dojo-neon mb-2">Perfect Flow!</h3>
        <p className="text-sm text-dojo-text/60">ไม่มีคำที่ต้องแก้ไข ร้องได้ดีมาก!</p>
      </div>
    );
  }

  const reasonLabel = (r: string) => {
    switch (r) {
      case 'missed': return { text: 'MISSED', color: 'text-dojo-alert bg-dojo-alert/10 border-dojo-alert/20' };
      case 'mispronounced': return { text: 'MISPRONOUNCED', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
      case 'late': return { text: 'LATE', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };
      case 'early': return { text: 'EARLY', color: 'text-dojo-cyber bg-dojo-cyber/10 border-dojo-cyber/20' };
      default: return { text: r.toUpperCase(), color: 'text-dojo-text/60 bg-dojo-bg border-dojo-border' };
    }
  };

  const getCoachTip = (item: WordResult): string | null => {
    if (item.reason === 'missed') {
      if (item.type === 'slang') return `คำ slang "${item.expected}" สำคัญ — ลองฟังเพลงส่วนนี้ซ้ำด้วย loop แล้วออกเสียงตาม`;
      return `ลองร้องช้าลงด้วย speed 0.7x แล้วเน้นคำนี้ให้ชัด`;
    }
    if (item.reason === 'mispronounced') {
      return `ได้ยิน "${item.heard}" แทน "${item.expected}" — ลองเน้นพยัญชนะท้ายให้ชัดขึ้น`;
    }
    if (item.reason === 'late') {
      return `ออกเสียงช้ากว่าจังหวะ ${Math.round(item.timingOffset)}ms — ลองฟังจังหวะ beat ให้มากขึ้น`;
    }
    if (item.reason === 'early') {
      return `ออกเสียงเร็วกว่าจังหวะ ${Math.abs(Math.round(item.timingOffset))}ms — อย่ารีบ ฟัง beat ก่อน`;
    }
    return null;
  };

  return (
    <div className="bg-dojo-surface border border-dojo-border rounded-xl p-6 shadow-xl w-full">
      <h3 className="text-sm font-display font-bold text-white uppercase tracking-widest mb-4">
        คำที่ต้องฝึก ({sorted.length} คำ)
      </h3>

      <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
        {sorted.map((item, idx) => {
          const label = reasonLabel(item.reason || 'missed');
          const tip = getCoachTip(item);

          return (
            <div key={idx} className="flex flex-col gap-2 p-3 bg-[#11141D] rounded-lg border border-dojo-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.type === 'slang' && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-dojo-alert/10 text-dojo-alert border border-dojo-alert/20">SLANG</span>
                  )}
                  <span className={`text-lg font-bold ${!item.isCorrect ? 'text-dojo-alert line-through decoration-dojo-alert/50 decoration-2' : 'text-orange-400'}`}>
                    {item.expected}
                  </span>
                </div>
                <span className={`text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full uppercase border ${label.color}`}>
                  {label.text}
                </span>
              </div>
              
              {item.heard && item.heard !== item.expected && (
                <div className="text-sm font-medium text-dojo-text/70 flex items-center gap-2">
                  <span className="text-dojo-text/40">Heard:</span> &quot;{item.heard}&quot;
                </div>
              )}

              {item.timingOffset !== 0 && item.isCorrect && (
                <div className="text-xs text-dojo-text/40 font-mono">
                  Offset: {item.timingOffset > 0 ? '+' : ''}{Math.round(item.timingOffset)}ms
                </div>
              )}
              
              {tip && (
                <div className="mt-1 text-xs text-dojo-cyber/80 leading-relaxed bg-dojo-cyber/5 p-2 rounded">
                  <span className="font-bold text-dojo-cyber">💡 Coach Tip:</span> {tip}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
