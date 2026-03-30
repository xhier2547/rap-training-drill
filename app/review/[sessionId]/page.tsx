"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Target, Zap, CheckCircle, Trophy, RotateCcw, TrendingUp } from 'lucide-react';
import { useStudioStore, AnalysisResult } from '@/lib/store/useStudioStore';
import { CENTRAL_CEE_SONGS } from '@/data/songs';
import SyllableFeedback from '@/components/review/SyllableFeedback';

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-display font-black text-white">{score}<span className="text-sm" style={{ color }}>%</span></span>
        </div>
      </div>
      <span className="text-xs font-mono font-bold text-dojo-text/50 uppercase tracking-widest">{label}</span>
    </div>
  );
}

export default function ReviewPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const analysisResult = useStudioStore(s => s.analysisResult);
  const activeSong = useStudioStore(s => s.activeSong);

  useEffect(() => { setMounted(true); }, []);

  // Find song from params or store
  const song = activeSong || CENTRAL_CEE_SONGS.find(s => s.id === params?.sessionId) || null;

  if (!mounted) return null;

  // If no analysis result, show a message
  if (!analysisResult) {
    return (
      <main className="min-h-screen bg-dojo-bg text-dojo-text flex flex-col items-center justify-center gap-6 p-8">
        <Trophy size={64} className="text-dojo-text/20" />
        <h1 className="text-2xl font-display font-black text-white">ยังไม่มีผลวิเคราะห์</h1>
        <p className="text-dojo-text/60 text-center max-w-md">
          กลับไปที่ Studio แล้วกดปุ่ม 🎤 REC เพื่ออัดเสียงร้อง เมื่อหยุดอัด ระบบจะวิเคราะห์และแสดงผลที่นี่
        </p>
        <Link href="/">
          <button className="px-6 py-3 bg-dojo-cyber text-black font-bold rounded-xl hover:scale-105 transition-transform">
            กลับไป Studio
          </button>
        </Link>
      </main>
    );
  }

  const r = analysisResult;
  const gradeColor = r.overallScore >= 80 ? '#00FF85' : r.overallScore >= 60 ? '#00C8FF' : r.overallScore >= 40 ? '#FFA500' : '#FF3D5A';
  const gradeLabel = r.overallScore >= 80 ? 'EXCELLENT' : r.overallScore >= 60 ? 'GOOD' : r.overallScore >= 40 ? 'KEEP GOING' : 'NEEDS PRACTICE';

  return (
    <main className="min-h-screen bg-dojo-bg text-dojo-text p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-8">
      
      {/* Header */}
      <header className="flex justify-between items-center">
        <Link href={song ? `/studio/${song.id}` : '/'}>
          <button className="flex items-center gap-2 text-dojo-text/60 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span className="font-display font-bold uppercase tracking-widest text-sm">Back to Studio</span>
          </button>
        </Link>
        <div className="text-right">
          <h1 className="text-2xl font-display font-black text-white">Session Review</h1>
          <p className="text-xs text-dojo-text/50 font-mono">{song?.title} — {song?.artist}</p>
        </div>
      </header>

      {/* Overall Grade Banner */}
      <div className="bg-dojo-surface border rounded-2xl p-8 text-center relative overflow-hidden"
        style={{ borderColor: gradeColor + '40' }}>
        <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at center, ${gradeColor}, transparent 70%)` }} />
        <div className="relative z-10">
          <div className="text-7xl font-display font-black text-white mb-2">
            {r.overallScore}<span className="text-3xl" style={{ color: gradeColor }}>%</span>
          </div>
          <div className="text-sm font-mono font-bold tracking-[0.3em] uppercase" style={{ color: gradeColor }}>
            {gradeLabel}
          </div>
          <div className="text-xs text-dojo-text/40 mt-2 font-mono">
            {r.correctWords}/{r.totalWords} words • avg offset {r.avgTimingOffset}ms
          </div>
        </div>
      </div>

      {/* Score Rings */}
      <section className="flex justify-center gap-8 md:gap-16 flex-wrap">
        <ScoreRing score={r.wordAccuracy} label="Word Accuracy" color="#00C8FF" />
        <ScoreRing score={r.timingScore} label="Timing" color="#00FF85" />
        <ScoreRing score={r.slangHitRate} label="Slang Hit Rate" color="#FF3D5A" />
      </section>

      {/* Detailed Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dojo-surface rounded-2xl p-6 border border-dojo-border flex items-center justify-between">
          <div>
            <div className="text-dojo-text/60 font-bold text-sm mb-1 uppercase tracking-widest">Accuracy</div>
            <div className="text-4xl font-display font-black text-white">{r.wordAccuracy}<span className="text-xl text-dojo-cyber">%</span></div>
            <div className="text-xs text-dojo-text/40 mt-1">{r.correctWords} of {r.totalWords} words</div>
          </div>
          <Target className="w-12 h-12 text-dojo-cyber/50" />
        </div>
        
        <div className="bg-dojo-surface rounded-2xl p-6 border border-dojo-border flex items-center justify-between">
          <div>
            <div className="text-dojo-text/60 font-bold text-sm mb-1 uppercase tracking-widest">Avg Timing</div>
            <div className="text-4xl font-display font-black text-white">
              {r.avgTimingOffset > 0 ? '+' : ''}{r.avgTimingOffset}<span className="text-xl text-dojo-text/40">ms</span>
            </div>
            <div className="text-xs text-dojo-text/40 mt-1">{r.avgTimingOffset < 300 ? '🔥 On beat!' : r.avgTimingOffset < 600 ? 'Close enough' : 'Practice timing'}</div>
          </div>
          <Zap className="w-12 h-12 text-dojo-neon/50" />
        </div>

        <div className="bg-dojo-surface rounded-2xl p-6 border border-dojo-border flex items-center justify-between">
          <div>
            <div className="text-dojo-text/60 font-bold text-sm mb-1 uppercase tracking-widest">Slang Hit Rate</div>
            <div className="text-4xl font-display font-black text-white">{r.correctSlang}/{r.totalSlang}</div>
            <div className="text-xs text-dojo-text/40 mt-1">{r.slangHitRate >= 80 ? '🔥 Slang master!' : 'Keep practicing slang'}</div>
          </div>
          <CheckCircle className="w-12 h-12 text-dojo-alert/50" />
        </div>
      </section>

      {/* What was heard */}
      <section className="bg-dojo-surface rounded-2xl p-6 border border-dojo-border">
        <h2 className="text-sm font-display font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-dojo-cyber" /> What We Heard
        </h2>
        <div className="bg-[#11141D] rounded-xl p-4 min-h-[60px]">
          <p className="text-sm text-dojo-text/70 leading-relaxed font-mono">
            {r.transcript || 'No transcript available'}
          </p>
        </div>
      </section>

      {/* Word-by-word breakdown */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-dojo-surface rounded-2xl p-6 border border-dojo-border">
            <h2 className="text-sm font-display font-bold text-white uppercase tracking-widest mb-4">
              Word-by-Word Analysis
            </h2>
            <div className="flex flex-wrap gap-2">
              {r.wordResults.map((wr, i) => (
                <span key={i} className={`inline-block px-2 py-1 rounded text-sm font-mono transition-all ${
                  wr.isCorrect
                    ? wr.reason === 'late' || wr.reason === 'early'
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      : 'bg-dojo-neon/10 text-dojo-neon border border-dojo-neon/20'
                    : 'bg-dojo-alert/10 text-dojo-alert border border-dojo-alert/20 line-through'
                }`}
                  title={wr.isCorrect 
                    ? `✓ Heard: "${wr.heard}" (${wr.timingOffset > 0 ? '+' : ''}${Math.round(wr.timingOffset)}ms)` 
                    : `✗ Missed: "${wr.expected}"`}
                >
                  {wr.expected}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="col-span-1">
          <SyllableFeedback wordResults={r.wordResults} />
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pb-8">
        <Link href={song ? `/studio/${song.id}` : '/'}>
          <button className="px-8 py-4 bg-dojo-cyber text-black font-bold rounded-xl hover:scale-105 transition-transform flex items-center gap-2">
            <RotateCcw size={18} /> ลองอีกครั้ง
          </button>
        </Link>
        <Link href="/">
          <button className="px-8 py-4 bg-dojo-surface border border-dojo-border text-white font-bold rounded-xl hover:border-dojo-cyber transition-colors">
            กลับหน้าหลัก
          </button>
        </Link>
      </div>
    </main>
  );
}
