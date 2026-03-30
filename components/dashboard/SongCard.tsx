import React from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { Song } from '@/data/songs';

interface SongCardProps {
  song: Song;
}

export default function SongCard({ song }: SongCardProps) {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'text-dojo-neon border-dojo-neon bg-dojo-neon/10';
      case 'Medium': return 'text-dojo-cyber border-dojo-cyber bg-dojo-cyber/10';
      case 'Hard': return 'text-orange-400 border-orange-400 bg-orange-400/10';
      case 'Dojo Master': return 'text-dojo-alert border-dojo-alert bg-dojo-alert/10 neon-glow-alert';
      default: return 'text-dojo-text border-dojo-border bg-dojo-surface';
    }
  };

  const getSlangDensityColor = (density: string) => {
    switch (density) {
      case 'Low': return 'text-dojo-neon';
      case 'Medium': return 'text-dojo-cyber';
      case 'High': return 'text-dojo-alert';
      default: return 'text-dojo-text';
    }
  };

  return (
    <Link href={`/studio/${song.id}`}>
      <div className="group relative bg-[#13161f] border border-dojo-border rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:border-dojo-neon cursor-pointer neon-glow-green-hover shadow-lg">
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
          <div className="w-14 h-14 bg-dojo-neon rounded-full flex items-center justify-center pl-1 shadow-[0_0_20px_#00FF85]">
            <Play className="text-black fill-black w-6 h-6" />
          </div>
        </div>

        <div className="flex h-[140px] w-full">
          {/* Cover Art */}
          <div className="w-[140px] h-full shrink-0 relative bg-dojo-bg">
            <img 
              src={song.coverUrl} 
              alt={song.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#13161f]"></div>
          </div>
          
          {/* Details */}
          <div className="flex-1 p-4 flex flex-col justify-between z-0 relative">
            <div>
              <h3 className="text-lg font-display font-bold text-white group-hover:text-dojo-neon transition-colors line-clamp-1">{song.title}</h3>
              <p className="text-sm text-dojo-text/60 font-medium">{song.artist}</p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${getDifficultyColor(song.difficulty)}`}>
                {song.difficulty}
              </span>
              <div className="flex items-center gap-2 w-full mt-1.5">
                <span className="text-xs text-dojo-text/80 bg-dojo-bg px-2 py-1 rounded-md font-mono border border-dojo-border/50 flex-1 text-center whitespace-nowrap">
                  <span className="text-dojo-text/40">BPM</span> {song.bpm}
                </span>
                <span className="text-xs text-dojo-text/80 bg-dojo-bg px-2 py-1 rounded-md border border-dojo-border/50 flex-1 text-center whitespace-nowrap">
                  <span className="text-dojo-text/40 mr-1">Slang</span> 
                  <span className={getSlangDensityColor(song.slangDensity)}>{song.slangDensity}</span>
                </span>
                <span className="text-xs text-dojo-text/80 bg-dojo-bg px-2 py-1 rounded-md font-mono border border-dojo-border/50">
                  {song.duration}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
