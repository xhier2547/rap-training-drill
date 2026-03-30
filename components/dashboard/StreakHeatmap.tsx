"use client";

import React, { useEffect, useState } from 'react';
import { persistence } from '@/lib/utils/persistence';

export default function StreakHeatmap() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    setStats(persistence.getStats());
  }, []);

  // Use useMemo to avoid regenerating on every render
  const grid = React.useMemo(() => {
    const weeks = 52;
    const days = 7;
    const g: number[][] = [];
    
    // We'll generate mock data for most of it, but use real data for the last few weeks
    const today = new Date();
    
    for (let w = 0; w < weeks; w++) {
      const week: number[] = [];
      for (let d = 0; d < days; d++) {
        // Calculate the date for this cell
        const cellDate = new Date(today);
        const daysAgo = ((weeks - 1 - w) * 7) + (6 - d);
        cellDate.setDate(today.getDate() - daysAgo);
        const dateStr = cellDate.toDateString();

        // If it's a real activity day, level 4
        if (stats?.activityDays?.has(dateStr)) {
          week.push(4);
        } else if (w < 48) {
          // Mock data for older weeks to keep the UI "full" as requested
          week.push(Math.random() > 0.9 ? Math.floor(Math.random() * 2) + 1 : 0);
        } else {
          // Recent weeks without activity are empty
          week.push(0);
        }
      }
      g.push(week);
    }
    return g;
  }, [stats]);

  const getColorClass = (level: number) => {
    switch (level) {
      case 1: return 'bg-dojo-neon/20';
      case 2: return 'bg-dojo-neon/40';
      case 3: return 'bg-dojo-neon/70 neon-glow-green';
      case 4: return 'bg-dojo-neon neon-glow-green shadow-[0_0_12px_#00FF85]';
      default: return 'bg-dojo-border/50';
    }
  };

  return (
    <div className="bg-dojo-surface p-6 rounded-2xl border border-dojo-border w-full flex flex-col h-full shadow-2xl transition-all hover:border-dojo-neon/20">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight">Dojo Attendance</h2>
          <p className="text-[10px] text-dojo-text/40 font-mono font-black uppercase mt-1 tracking-widest">Practice Daily • Build Your Streak</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-display font-black text-dojo-neon neon-text-green flex items-center justify-end gap-2 italic">
            {stats?.streak || 0} <span className="text-2xl not-italic">🔥</span>
          </div>
          <div className="text-[9px] text-dojo-text/40 font-mono font-black uppercase tracking-[0.3em]">Day Streak</div>
        </div>
      </div>
      
      <div className="flex gap-1 overflow-x-auto pb-4 scrollbar-thin">
        {mounted ? grid.map((week, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-1">
            {week.map((level, dIdx) => (
              <div 
                key={`${wIdx}-${dIdx}`}
                className={`w-3.5 h-3.5 rounded-sm transition-colors duration-300 ${getColorClass(level)}`}
              />
            ))}
          </div>
        )) : (
          <div className="flex-1 h-32 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-dojo-neon border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      <div className="flex justify-end items-center mt-auto text-xs text-dojo-text/50 font-medium gap-2 pt-2">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-dojo-border" />
        <div className="w-3 h-3 rounded-sm bg-dojo-neon/20" />
        <div className="w-3 h-3 rounded-sm bg-dojo-neon/40" />
        <div className="w-3 h-3 rounded-sm bg-dojo-neon/70" />
        <div className="w-3 h-3 rounded-sm bg-dojo-neon" />
        <span>More</span>
      </div>
    </div>
  );
}
