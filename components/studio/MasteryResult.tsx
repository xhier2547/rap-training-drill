"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Zap, 
  X,
  Share2,
  RotateCcw,
  Award,
  Play,
  Square
} from 'lucide-react';
import { useStudioStore } from '@/lib/store/useStudioStore';

export default function MasteryResult() {
  const activeSong = useStudioStore(s => s.activeSong);
  const transcriptWords = useStudioStore(s => s.transcriptWords);
  const isRecording = useStudioStore(s => s.isRecording);
  const [show, setShow] = useState(false);
  
  // Audio Review State (MOVED ABOVE EARLY RETURN)
  const sessionRecording = useStudioStore(s => s.sessionRecording);
  const [isPlayingReview, setIsPlayingReview] = useState(false);
  const audioReviewRef = React.useRef<HTMLAudioElement | null>(null);

  const reviewUrl = React.useMemo(() => {
    if (!sessionRecording) return null;
    return URL.createObjectURL(sessionRecording);
  }, [sessionRecording]);

  useEffect(() => {
    return () => {
      if (reviewUrl) URL.revokeObjectURL(reviewUrl);
    };
  }, [reviewUrl]);

  useEffect(() => {
    // Show report when recording ends and user has actually rapped some words
    if (!isRecording && transcriptWords.length > 5) {
      setShow(true);
    }
  }, [isRecording, transcriptWords]);

  if (!show || !activeSong) return null;

  const lyricWordsNorm = activeSong.lyrics.map(w => w.word.toLowerCase().replace(/[^a-z']/g, ''));
  const matchedCount = transcriptWords.filter(w => {
    const norm = w.word.toLowerCase().replace(/[^a-z']/g, '');
    return lyricWordsNorm.includes(norm);
  }).length;

  const accuracy = lyricWordsNorm.length > 0 
    ? Math.min(100, Math.round((matchedCount / lyricWordsNorm.length) * 100)) 
    : 0;

  const getRank = (acc: number) => {
    if (acc > 90) return { title: "DOJO MASTER", color: "text-[#00FF85]", bg: "bg-[#00FF85]/10", glow: "shadow-[0_0_50px_rgba(0,255,133,0.3)]" };
    if (acc > 70) return { title: "ELITE NINJA", color: "text-[#00C8FF]", bg: "bg-[#00C8FF]/10", glow: "shadow-[0_0_50px_rgba(0,200,255,0.3)]" };
    if (acc > 40) return { title: "ADEPT", color: "text-white", bg: "bg-white/10", glow: "none" };
    return { title: "WHITE BELT", color: "text-[#FF3D5A]", bg: "bg-[#FF3D5A]/10", glow: "shadow-[0_0_50px_rgba(255,61,90,0.3)]" };
  };

  const rank = getRank(accuracy);

  const toggleReview = () => {
    if (!audioReviewRef.current) return;
    if (isPlayingReview) {
      audioReviewRef.current.pause();
    } else {
      audioReviewRef.current.play();
    }
    setIsPlayingReview(!isPlayingReview);
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-xl"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className={`w-full max-w-xl bg-[#0D1017] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] relative ${rank.glow}`}
        >
          {/* Audio for review */}
          {reviewUrl && (
            <audio 
              ref={audioReviewRef} 
              src={reviewUrl} 
              onEnded={() => setIsPlayingReview(false)}
            />
          )}

          {/* Close Button */}
          <button 
            onClick={() => setShow(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors z-20"
          >
            <X size={20} className="text-white/40" />
          </button>

          {/* Top Banner */}
          <div className={`py-12 flex flex-col items-center gap-4 relative overflow-hidden ${rank.bg}`}>
             <div className="absolute inset-0 opacity-20 pointer-events-none">
               {[...Array(8)].map((_, i) => (
                 <motion.div 
                   key={i}
                   animate={{ 
                     opacity: [0.1, 0.4, 0.1],
                     scale: [1, 2, 1],
                     x: [Math.random() * 400 - 200, Math.random() * 400 - 200],
                     y: [Math.random() * 200 - 100, Math.random() * 200 - 100]
                   }}
                   transition={{ duration: 5, repeat: Infinity, delay: i * 0.5 }}
                   className={`absolute w-40 h-40 blur-3xl rounded-full ${rank.color.replace('text-', 'bg-')}`}
                 />
               ))}
             </div>

             <motion.div
               animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] }}
               transition={{ duration: 4, repeat: Infinity }}
               className="relative z-10"
             >
               <Award size={96} className={`${rank.color} drop-shadow-[0_0_30px_currentColor]`} />
             </motion.div>
             <div className="text-center relative z-10">
               <h2 className={`text-5xl font-black italic tracking-tighter ${rank.color}`}>{rank.title}</h2>
               <p className="text-[10px] font-mono text-white/40 tracking-[0.6em] uppercase mt-2">Dojo Session Mastery</p>
             </div>
          </div>

          {/* Review Player Section */}
          <div className="px-10 pt-8 pb-2">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
               <button 
                onClick={toggleReview}
                className="w-12 h-12 rounded-full bg-dojo-neon flex items-center justify-center shadow-[0_0_15px_rgba(0,255,133,0.3)] active:scale-95 transition-all text-black"
               >
                 {isPlayingReview ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
               </button>
               <div className="flex-1">
                 <div className="flex justify-between items-center mb-1">
                   <p className="text-[10px] font-mono font-bold text-dojo-neon uppercase tracking-widest leading-none">Review Your Take</p>
                   <span className="text-[9px] text-white/30 italic">Vocals Layered with FX</span>
                 </div>
                 <div className="h-1.5 w-full bg-white/10 rounded-full relative overflow-hidden">
                   <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: isPlayingReview ? "100%" : "0%" }}
                    transition={{ duration: 10, ease: "linear" }} // Mock progress for intro, actual uses ref
                    className="absolute inset-y-0 left-0 bg-dojo-neon" 
                   />
                 </div>
               </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="p-10 pt-6 space-y-10 border-t border-white/5">
            <div className="grid grid-cols-3 gap-4 md:gap-5">
              <div className="bg-white/5 rounded-[2rem] p-6 flex flex-col items-center gap-2 border border-white/5">
                <Target size={24} className="text-[#00C8FF] mb-1" />
                <span className="text-2xl md:text-3xl font-black italic text-white tracking-tighter">{accuracy}%</span>
                <span className="text-[9px] text-white/30 font-mono tracking-widest uppercase text-center leading-tight font-black">Accuracy</span>
              </div>
              <div className="bg-white/5 rounded-[2rem] p-6 flex flex-col items-center gap-2 border border-white/5">
                <Zap size={24} className="text-[#00FF85] mb-1" />
                <span className="text-2xl md:text-3xl font-black italic text-white tracking-tighter">{matchedCount}</span>
                <span className="text-[9px] text-white/30 font-mono tracking-widest uppercase text-center leading-tight font-black">Matched</span>
              </div>
              <div className="bg-white/5 rounded-[2rem] p-6 flex flex-col items-center gap-2 border border-white/5">
                <RotateCcw size={24} className="text-[#FF3D5A] mb-1" />
                <span className="text-2xl md:text-3xl font-black italic text-white tracking-tighter">{Math.round(activeSong.bpm)}</span>
                <span className="text-[9px] text-white/30 font-mono tracking-widest uppercase text-center leading-tight font-black">BPM</span>
              </div>
            </div>

            {/* Performance Text */}
            <div className="text-center space-y-3">
              <h3 className="text-xl font-black text-white italic tracking-tight">คุณแร็พได้ทรงพลังมาก Ninja!</h3>
              <p className="text-sm text-dojo-text/40 max-w-sm mx-auto leading-relaxed font-medium">
                Flow ของคุณในเพลง &quot;{activeSong.title}&quot; แข็งแกร่งมาก ฝึกฝนต่อไปเพื่อก้าวสู่ระดับ Dojo Master ในตำนาน!
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => { setShow(false); }}
                className="flex-[2] bg-white hover:bg-dojo-neon text-black font-black uppercase py-5 rounded-[1.5rem] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl"
              >
                Train Again
              </button>
              <button className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold uppercase py-5 rounded-[1.5rem] flex items-center justify-center gap-2 transition-all active:scale-95 border border-white/10">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
