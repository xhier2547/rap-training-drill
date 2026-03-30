import { create } from 'zustand';
import { Song } from '@/data/songs';

// ── Analysis Types ──
export interface TranscriptWord {
  word: string;
  timestamp: number;        // When this word was recognized (seconds from start)
  confidence: number;       // 0-1 confidence from Speech API
}

export interface WordResult {
  expected: string;
  heard: string | null;     // null = missed entirely
  expectedTime: number;     // When the word should have been said
  actualTime: number | null;// When the word was actually said
  isCorrect: boolean;
  timingOffset: number;     // ms difference (0 = perfect)
  type: 'normal' | 'slang' | 'linking' | 'breath';
  reason?: 'correct' | 'missed' | 'mispronounced' | 'late' | 'early';
}

export interface AnalysisResult {
  wordAccuracy: number;     // 0-100%
  timingScore: number;      // 0-100%
  slangHitRate: number;     // 0-100%
  overallScore: number;     // 0-100%
  totalWords: number;
  correctWords: number;
  totalSlang: number;
  correctSlang: number;
  avgTimingOffset: number;  // ms
  wordResults: WordResult[];
  transcript: string;       // Full transcript of what was heard
}

// ── Store State ──
interface StudioState {
  activeSong: Song | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isRecording: boolean;
  playbackRate: number;
  loopRegion: [number, number] | null;
  sessionRecording: Blob | null;
  seekTo: number | null;
  userRecordings: Blob[];
  
  // Speech Recognition
  liveTranscript: string;           // What Speech API hears right now
  transcriptWords: TranscriptWord[];// All recognized words with timestamps
  
  // Analysis
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
  countdown: number | null;
  lyricOffsets: Record<string, number>; // Per-song offset map
  
  // PRO: Vocal FX
  vocalFX: {
    bass: number;    // 0-100
    treble: number;  // 0-100
    reverb: number;  // 0-100
    monitor: boolean;
  };
  musicVolume: number; // 0-100

  // Actions
  setActiveSong: (song: Song | null) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsRecording: (recording: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  setLoopRegion: (region: [number, number] | null) => void;
  setSessionRecording: (blb: Blob | null) => void;
  setCountdown: (val: number | null) => void;
  setLyricOffset: (songId: string, val: number) => void;
  setVocalFX: (fx: Partial<{ bass: number, treble: number, reverb: number, monitor: boolean }>) => void;
  setMusicVolume: (vol: number) => void;
  resetSession: () => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  activeSong: null,
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  isRecording: false,
  playbackRate: 1.0,
  loopRegion: null,
  sessionRecording: null,
  seekTo: null,
  userRecordings: [],
  liveTranscript: '',
  transcriptWords: [],
  analysisResult: null,
  isAnalyzing: false,
  countdown: null,
  lyricOffsets: {}, // No manual offset needed by default now (Hard-Sync 8.5s baseline in data)

  setActiveSong: (song) => set({ activeSong: song }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setIsRecording: (recording) => set({ isRecording: recording }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  setLoopRegion: (region) => set({ loopRegion: region }),
  setSessionRecording: (blb) => set({ sessionRecording: blb }),
  setCountdown: (val) => set({ countdown: val }),
  setLyricOffset: (songId, val) => set((s) => ({
    lyricOffsets: { ...s.lyricOffsets, [songId]: val }
  })),
  musicVolume: 80, // Default to 80% to give vocal some room
  setMusicVolume: (vol: number) => set({ musicVolume: vol }),
  vocalFX: {
    bass: 50,
    treble: 50,
    reverb: 20,
    monitor: false
  },
  setVocalFX: (fx) => set((s) => ({
    vocalFX: { ...s.vocalFX, ...fx }
  })),
  resetSession: () => set({
    liveTranscript: '',
    transcriptWords: [],
    analysisResult: null,
    isAnalyzing: false,
    sessionRecording: null,
  }),
}));
