"use client";

import React, { useRef, useCallback } from 'react';
import { Play, Pause, Mic, RotateCcw, FastForward, Repeat, Square } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStudioStore } from '@/lib/store/useStudioStore';
import { startSpeechRecognition, stopSpeechRecognition } from '@/lib/analysis/speechAnalyzer';
import { calculateScore } from '@/lib/analysis/scoreCalculator';
import { persistence } from '@/lib/utils/persistence';
import { VocalProcessor } from '@/lib/utils/vocalProcessor';

export default function AudioControls() {
  const router = useRouter();
  const isPlaying = useStudioStore(s => s.isPlaying);
  const isRecording = useStudioStore(s => s.isRecording);
  const playbackRate = useStudioStore(s => s.playbackRate);
  const currentTime = useStudioStore(s => s.currentTime);
  const duration = useStudioStore(s => s.duration);
  const loopRegion = useStudioStore(s => s.loopRegion);
  const countdown = useStudioStore(s => s.countdown);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const vocalProcessorRef = useRef<VocalProcessor | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordStartTimeRef = useRef<number>(0);
  
  const vocalFX = useStudioStore(s => s.vocalFX);

  // Sync real-time FX changes
  React.useEffect(() => {
    const vp = vocalProcessorRef.current;
    if (vp) {
      vp.setBass(vocalFX.bass);
      vp.setTreble(vocalFX.treble);
      vp.setReverb(vocalFX.reverb);
      vp.setMonitor(vocalFX.monitor);
    }
  }, [vocalFX]);

  // ── Play / Pause ──
  const handlePlayPause = () => {
    if (countdown !== null) return;
    useStudioStore.setState({ isPlaying: !isPlaying });
  };

  // ── Restart ──
  const handleRestart = () => {
    useStudioStore.setState({ seekTo: 0, isPlaying: false, currentTime: 0, loopRegion: null });
  };

  // ── Start Recording After Countdown ──
  const startActualRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize Pro FX Engine
      const vp = new VocalProcessor(stream);
      vocalProcessorRef.current = vp;
      
      // Initial FX Sync
      vp.setBass(vocalFX.bass);
      vp.setTreble(vocalFX.treble);
      vp.setReverb(vocalFX.reverb);
      vp.setMonitor(vocalFX.monitor);

      const processedStream = vp.getProcessedStream();
      const recorder = new MediaRecorder(processedStream);
      chunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        useStudioStore.setState(s => ({
          sessionRecording: blob,
          userRecordings: [...s.userRecordings, blob],
        }));
        // Cleanup
        stream.getTracks().forEach(t => t.stop());
        vp.close();
        vocalProcessorRef.current = null;
      };

      mediaRecorderRef.current = recorder;
      recorder.start();

      // Reset session data
      useStudioStore.getState().resetSession();
      
      // Sync playback
      recordStartTimeRef.current = useStudioStore.getState().currentTime;
      useStudioStore.setState({ isRecording: true, isPlaying: true });

      // Start Speech Recognition
      startSpeechRecognition();

    } catch (err) {
      console.error("Recording failed:", err);
      alert("ไม่สามารถเข้าถึงไมโครโฟนได้ กรุณาอนุญาตในเบราว์เซอร์");
    }
  }, []);

  // ── Record Button Handler ──
  const handleRecord = useCallback(async () => {
    const state = useStudioStore.getState();

    if (state.isRecording) {
      // ═══ STOP RECORDING ═══
      stopSpeechRecognition();
      mediaRecorderRef.current?.stop();
      useStudioStore.setState({ isRecording: false, isPlaying: false, isAnalyzing: true });

      // Wait a moment for final speech results to come in
      setTimeout(() => {
        const finalState = useStudioStore.getState();
        const song = finalState.activeSong;
        
        if (song && finalState.transcriptWords.length > 0) {
          const result = calculateScore(song, finalState.transcriptWords, recordStartTimeRef.current, finalState.loopRegion);
          useStudioStore.setState({ analysisResult: result, isAnalyzing: false });
          persistence.saveSession(song.id, song.title, result);
          router.push(`/review/${song.id}`);
        } else {
          useStudioStore.setState({ isAnalyzing: false });
          if (finalState.transcriptWords.length === 0) {
            alert('ไม่ได้ยินเสียงร้อง ลองตรวจสอบไมค์และลองใหม่อีกครั้ง');
          }
        }
      }, 1500); 
      return;
    }

    if (state.countdown !== null) return; // Already counting down

    // ═══ START COUNTDOWN ═══
    // Seek to loop start if active
    if (state.loopRegion) {
      useStudioStore.setState({ seekTo: state.loopRegion[0], isPlaying: false });
    }

    let count = 3;
    useStudioStore.setState({ countdown: count });

    const timer = setInterval(() => {
      count--;
      useStudioStore.setState({ countdown: count });
      
      if (count === 0) {
        clearInterval(timer);
        useStudioStore.setState({ countdown: null });
        startActualRecording();
      }
    }, 1000);

  }, [router, startActualRecording]);

  // ── Loop ──
  const handleLoop = () => {
    if (loopRegion) {
      useStudioStore.setState({ loopRegion: null });
    } else {
      const start = Math.max(0, currentTime - 2);
      const end = Math.min(duration, currentTime + 8);
      useStudioStore.setState({ loopRegion: [start, end] });
    }
  };

  // ── Speed ──
  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    useStudioStore.setState({ playbackRate: parseFloat(e.target.value) });
  };

  const fmt = (t: number) => `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`;

  return (
    <div className="bg-dojo-surface border border-dojo-border rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 justify-between shadow-2xl">
      
      {/* Time Display */}
      <div className="flex flex-col items-center md:items-start min-w-[120px]">
        <span className="text-3xl font-display font-black text-white leading-none tracking-tight">
          {fmt(currentTime)}
        </span>
        <span className="text-sm font-mono text-dojo-text/50 font-bold tracking-widest mt-1">
          {fmt(duration)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button onClick={handleRestart}
          className="w-11 h-11 rounded-full flex items-center justify-center bg-dojo-bg border border-dojo-border hover:border-dojo-cyber hover:text-dojo-cyber text-white transition-all duration-200 active:scale-90"
          title="เริ่มใหม่">
          <RotateCcw size={18} />
        </button>

        <button onClick={handleLoop}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
            loopRegion 
              ? 'bg-dojo-cyber/20 border-2 border-dojo-cyber text-dojo-cyber shadow-[0_0_12px_rgba(0,200,255,0.3)]' 
              : 'bg-dojo-bg border border-dojo-border hover:border-dojo-cyber text-white hover:text-dojo-cyber'
          }`}
          title={loopRegion ? "ล้างการเลือก (Clear Loop)" : "สร้าง Loop 10 วินาที"}>
          <Repeat size={18} className={loopRegion ? "animate-spin-slow" : ""} />
        </button>

        <button onClick={handlePlayPause}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 ${
            isPlaying 
              ? 'bg-dojo-cyber/20 border-2 border-dojo-cyber text-dojo-cyber shadow-[0_0_20px_rgba(0,200,255,0.3)]' 
              : 'bg-white text-black hover:scale-105'
          }`}
          title={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? <Pause size={28} className="fill-current" /> : <Play size={28} className="fill-current ml-1" />}
        </button>

        <button onClick={handleRecord}
          disabled={countdown !== null}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 ${
            isRecording 
              ? 'bg-dojo-alert/30 border-2 border-dojo-alert text-dojo-alert shadow-[0_0_25px_rgba(255,61,90,0.5)] animate-pulse' 
              : countdown !== null
                ? 'bg-dojo-cyber/10 border-dojo-cyber/30 text-dojo-cyber animate-pulse'
                : 'bg-dojo-bg border border-dojo-border hover:border-dojo-alert text-dojo-alert/70 hover:text-dojo-alert hover:bg-dojo-alert/10'
          }`}
          title={isRecording ? "หยุดอัดและวิเคราะห์" : "อัดเสียงและวิเคราะห์"}>
          {isRecording ? <Square size={20} className="fill-current" /> : <Mic size={22} />}
        </button>
      </div>

      {/* Speed */}
      <div className="flex flex-col gap-3 min-w-[180px]">
        <div className="flex justify-between items-center text-xs font-bold font-mono text-dojo-text/60">
          <span className="flex items-center gap-1"><FastForward size={14} /> RATE</span>
          <span className="text-dojo-neon bg-dojo-neon/10 px-2 py-0.5 rounded border border-dojo-neon/20">
            {playbackRate.toFixed(1)}x
          </span>
        </div>
        <input type="range" min="0.5" max="1.5" step="0.1" value={playbackRate}
          onChange={handleRateChange}
          className="w-full h-1.5 bg-dojo-bg rounded-lg appearance-none cursor-pointer accent-dojo-neon" />
        <div className="flex justify-between text-[10px] text-dojo-text/40 font-mono">
          <span>50%</span><span>100%</span><span>150%</span>
        </div>
      </div>
    </div>
  );
}
