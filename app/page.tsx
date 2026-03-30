"use client";

import React, { useEffect, useState } from 'react';
import StreakHeatmap from "@/components/dashboard/StreakHeatmap";
import SkillRadar from "@/components/dashboard/SkillRadar";
import SongCard from "@/components/dashboard/SongCard";
import { CENTRAL_CEE_SONGS } from "@/data/songs";
import { persistence } from "@/lib/utils/persistence";

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStats(persistence.getStats());
  }, []);

  return (
    <main className="min-h-screen bg-dojo-bg text-dojo-text p-6 md:p-10 max-w-7xl mx-auto">
      <header className="mb-12 flex justify-between items-end border-b border-dojo-border pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter uppercase flex items-center gap-3">
            <span className="text-dojo-neon neon-text-green">Rap</span> Dojo
          </h1>
          <p className="text-dojo-text/60 font-medium mt-1">Master the UK Drill Flow.</p>
        </div>
        
        {/* Real User Profile Avatar */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="font-bold text-sm text-white">Central Wator</p>
            <p className="text-xs text-dojo-cyber font-medium neon-text-cyber">
              {mounted && stats ? stats.levelName : "Newbie (Lvl 1)"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-dojo-cyber bg-dojo-surface overflow-hidden neon-glow-cyber shadow-[0_0_15px_rgba(0,200,255,0.3)]">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=080A0F" alt="Avatar" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <StreakHeatmap />
        </div>
        <div className="lg:col-span-1">
          <SkillRadar />
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <span className="w-2 h-6 bg-dojo-neon rounded-full inline-block"></span>
            THE STUDIO
          </h2>
          <div className="px-3 py-1 bg-dojo-surface border border-dojo-border rounded-full text-xs font-semibold text-dojo-text/60">
            {CENTRAL_CEE_SONGS.length} TRACKS AVAILABLE
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {CENTRAL_CEE_SONGS.map(song => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      </section>
    </main>
  );
}
