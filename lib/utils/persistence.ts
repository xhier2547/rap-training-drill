/**
 * Persistence Layer — Saves and loads session history from localStorage
 */

import { AnalysisResult } from '@/lib/store/useStudioStore';

export interface SessionRecord {
  id: string;
  songId: string;
  songTitle: string;
  timestamp: number;
  score: AnalysisResult;
}

const STORAGE_KEY = 'rap_dojo_history';

export const persistence = {
  /**
   * Save a new practice session to history
   */
  saveSession: (songId: string, songTitle: string, score: AnalysisResult) => {
    if (typeof window === 'undefined') return;

    try {
      const history: SessionRecord[] = persistence.getHistory();
      const newRecord: SessionRecord = {
        id: `session_${Date.now()}`,
        songId,
        songTitle,
        timestamp: Date.now(),
        score,
      };

      const updatedHistory = [newRecord, ...history].slice(0, 100); // Keep last 100
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      return newRecord;
    } catch (err) {
      console.error('[Persistence] Failed to save session:', err);
      return null;
    }
  },

  /**
   * Get full session history
   */
  getHistory: (): SessionRecord[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('[Persistence] Failed to load history:', err);
      return [];
    }
  },

  /**
   * Calculate aggregated stats from history
   */
  getStats: () => {
    const history = persistence.getHistory();
    if (history.length === 0) {
      return {
        level: 1,
        levelName: 'Newbie Driller',
        streak: 0,
        avgAccuracy: 0,
        avgTiming: 0,
        avgSlang: 0,
        avgOverall: 0,
        totalSessions: 0,
        activityDays: new Set<string>(),
      };
    }

    const total = history.length;
    const sums = history.reduce((acc, rec) => ({
      acc: acc.acc + rec.score.wordAccuracy,
      time: acc.time + rec.score.timingScore,
      slang: acc.slang + rec.score.slangHitRate,
      overall: acc.overall + rec.score.overallScore,
    }), { acc: 0, time: 0, slang: 0, overall: 0 });

    const activityDays = new Set(history.map(r => new Date(r.timestamp).toDateString()));
    
    // Simple level calculation based on session count
    const level = Math.floor(total / 5) + 1;
    const levelNames = ['Newbie', 'Street', 'Hustler', 'Driller', 'Dojo Master'];
    const levelName = `${levelNames[Math.min(level - 1, 4)]} (Lvl ${level})`;

    return {
      level,
      levelName,
      streak: activityDays.size, // Simplified streak
      avgAccuracy: Math.round(sums.acc / total),
      avgTiming: Math.round(sums.time / total),
      avgSlang: Math.round(sums.slang / total),
      avgOverall: Math.round(sums.overall / total),
      totalSessions: total,
      activityDays,
    };
  }
};
