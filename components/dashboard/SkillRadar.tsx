"use client";

import React, { useEffect, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { persistence } from '@/lib/utils/persistence';

export default function SkillRadar() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    // Get real stats from localStorage
    const s = persistence.getStats();
    setStats(s);
  }, []);

  // Use real stats if they exist, otherwise baseline
  const radarData = [
    { subject: 'Flow', A: stats?.avgOverall || 30, fullMark: 100 },
    { subject: 'Pronunciation', A: stats?.avgAccuracy || 30, fullMark: 100 },
    { subject: 'Vocab', A: stats?.avgSlang || 20, fullMark: 100 },
    { subject: 'Breath', A: 40, fullMark: 100 },
    { subject: 'Timing', A: stats?.avgTiming || 30, fullMark: 100 },
  ];

  return (
    <div className="bg-dojo-surface p-6 rounded-2xl border border-dojo-border w-full flex flex-col h-[350px] shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-display font-bold text-dojo-text uppercase tracking-tight">Rapper Stats</h2>
          <p className="text-[10px] text-dojo-text/40 font-mono font-black uppercase mt-1">
            {stats?.totalSessions > 0 
              ? `Based on ${stats.totalSessions} sessions` 
              : "No Performance Data Found"}
          </p>
        </div>
        <div className="px-3 py-1 rounded-md bg-dojo-cyber/10 border border-dojo-cyber/30 text-dojo-cyber text-[10px] font-black font-display uppercase tracking-[0.2em] neon-glow-cyber">
          {stats?.levelName || 'WHITE BELT (Lvl 1)'}
        </div>
      </div>
      
      <div className="flex-1 w-full relative min-h-[220px]">
        {mounted && stats ? (
          <div className="absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: 'rgba(224,224,224,0.7)', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)' }} 
                />
                <Radar
                  name="Performance"
                  dataKey="A"
                  stroke="#00FF85"
                  strokeWidth={3}
                  fill="#00FF85"
                  fillOpacity={0.2}
                  isAnimationActive={true}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D1017', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#00FF85', fontWeight: 'bold' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-1 h-full flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-dojo-cyber border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
}
