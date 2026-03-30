"use client";

import React from 'react';
import { useStudioStore } from '@/lib/store/useStudioStore';
import { 
  Sliders, 
  Settings2, 
  Volume2, 
  Headphones, 
  Waves, 
  Mic
} from 'lucide-react';

export default function VocalFXRack() {
  const vocalFX = useStudioStore(s => s.vocalFX);
  const setVocalFX = useStudioStore(s => s.setVocalFX);
  const musicVolume = useStudioStore(s => s.musicVolume);
  const setMusicVolume = useStudioStore(s => s.setMusicVolume);
  const isRecording = useStudioStore(s => s.isRecording);

  const updateFX = (fx: Partial<typeof vocalFX>) => {
    setVocalFX(fx);
  };

  return (
    <div className="bg-[#11141D] border border-dojo-border rounded-xl p-5 shadow-2xl space-y-5 animate-in slide-in-from-right duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-dojo-neon/10 flex items-center justify-center border border-dojo-neon/30">
            <Sliders className="w-4 h-4 text-dojo-neon" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-dojo-text uppercase tracking-widest">Mixing Desk</h3>
            <p className="text-[10px] text-dojo-text/40 font-mono">Pro Vocal FX Rack v2.1</p>
          </div>
        </div>
        <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
          isRecording ? 'bg-dojo-alert/10 text-dojo-alert border-dojo-alert/30 animate-pulse' : 'bg-white/5 text-dojo-text/30 border-white/10'
        }`}>
          {isRecording ? 'Live Processing' : 'Engine Ready'}
        </div>
      </div>

      <div className="space-y-6">
        {/* MASTER MUSIC VOLUME */}
        <div className="space-y-3 bg-dojo-cyber/5 p-4 rounded-xl border border-dojo-cyber/10">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-dojo-text/60">
            <div className="flex items-center gap-1.5">
              <Volume2 size={14} className="text-dojo-cyber" />
              MASTER MUSIC VOL
            </div>
            <span className="text-dojo-cyber">{musicVolume}%</span>
          </div>
          <input 
            type="range"
            min="0" max="100"
            value={musicVolume}
            onChange={(e) => setMusicVolume(parseInt(e.target.value))}
            className="w-full h-2 bg-dojo-bg rounded-lg appearance-none cursor-pointer accent-dojo-cyber border border-white/5"
          />
        </div>

        {/* EQ: BASS */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-dojo-text/60">
            <div className="flex items-center gap-1.5">
              <Settings2 size={12} className="text-dojo-cyber" />
              BASS BOOST
            </div>
            <span className="text-dojo-cyber">{vocalFX.bass}%</span>
          </div>
          <input 
            type="range"
            min="0" max="100"
            value={vocalFX.bass}
            onChange={(e) => updateFX({ bass: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-dojo-bg rounded-lg appearance-none cursor-pointer accent-dojo-cyber border border-white/5"
          />
        </div>

        {/* EQ: TREBLE */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-dojo-text/60">
            <div className="flex items-center gap-1.5">
              <Waves size={12} className="text-dojo-neon" />
              TREBLE CLARITY
            </div>
            <span className="text-dojo-neon">{vocalFX.treble}%</span>
          </div>
          <input 
            type="range"
            min="0" max="100"
            value={vocalFX.treble}
            onChange={(e) => updateFX({ treble: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-dojo-bg rounded-lg appearance-none cursor-pointer accent-dojo-neon border border-white/5"
          />
        </div>

        {/* REVERB */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-dojo-text/60">
            <div className="flex items-center gap-1.5">
              <Volume2 size={12} className="text-[#A855F7]" />
              STUDIO REVERB
            </div>
            <span className="text-[#A855F7]">{vocalFX.reverb}%</span>
          </div>
          <input 
            type="range"
            min="0" max="100"
            value={vocalFX.reverb}
            onChange={(e) => updateFX({ reverb: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-dojo-bg rounded-lg appearance-none cursor-pointer accent-[#A855F7] border border-white/5"
          />
        </div>

        {/* MONITORING TOGGLE */}
        <button 
          onClick={() => updateFX({ monitor: !vocalFX.monitor })}
          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group ${
            vocalFX.monitor 
              ? 'bg-dojo-neon/10 border-dojo-neon/40 shadow-[0_0_15px_rgba(0,255,133,0.1)] text-dojo-neon' 
              : 'bg-white/5 border-white/10 text-dojo-text/40 hover:border-white/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <Headphones size={18} className={vocalFX.monitor ? 'animate-bounce' : ''} />
            <div className="text-left">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest block leading-none">Vocal Monitor</span>
              <span className="text-[9px] opacity-40 italic">Hear yourself in Real-time</span>
            </div>
          </div>
          <div className={`w-8 h-4 rounded-full relative transition-colors ${vocalFX.monitor ? 'bg-dojo-neon' : 'bg-dojo-bg'}`}>
            <div className={`absolute top-0.5 bottom-0.5 w-3 h-3 rounded-full bg-white transition-all ${vocalFX.monitor ? 'right-0.5' : 'left-0.5'}`} />
          </div>
        </button>
      </div>

      {vocalFX.monitor && (
        <div className="px-3 py-2 bg-dojo-alert/10 border border-dojo-alert/30 rounded-lg flex items-center gap-2">
          <Mic size={12} className="text-dojo-alert" />
          <span className="text-[9px] text-dojo-alert font-mono font-bold uppercase tracking-tighter">
            Warning: Wear headphones to avoid feedback
          </span>
        </div>
      )}
    </div>
  );
}
