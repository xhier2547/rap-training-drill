/**
 * Score Calculator — Compares user's speech against song lyrics
 * Produces accuracy %, timing score, and slang hit rate
 */

import { Song, LyricWord } from '@/data/songs';
import { TranscriptWord, WordResult, AnalysisResult } from '@/lib/store/useStudioStore';

/**
 * Normalize a word for comparison (lowercase, strip punctuation)
 */
function normalize(w: string): string {
  return w.toLowerCase().replace(/[^a-z']/g, '').trim();
}

/**
 * Check if two words match (with fuzzy tolerance for speech recognition errors)
 */
function wordsMatch(expected: string, heard: string): boolean {
  const a = normalize(expected);
  const b = normalize(heard);
  
  if (a === b) return true;
  if (a.length === 0 || b.length === 0) return false;
  
  // Allow slight differences (Levenshtein distance <= 1 for short words, <= 2 for longer)
  const maxDist = a.length <= 4 ? 1 : 2;
  return levenshtein(a, b) <= maxDist;
}

/**
 * Levenshtein distance between two strings
 */
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

/**
 * Main analysis function
 * Compares transcript words against song lyrics and calculates scores
 */
export function calculateScore(
  song: Song,
  transcriptWords: TranscriptWord[],
  recordingStartOffset: number = 0, // When the song was at when recording started
  loopRegion: [number, number] | null = null // Optional range to filter words
): AnalysisResult {
  // Get all expected words from lyrics
  let expectedWords: LyricWord[] = song.lyrics.filter(w => 
    w.type !== 'breath' && normalize(w.word).length > 0
  );

  // If a loop region is active, filter expected words to only those within the range
  if (loopRegion) {
    const [start, end] = loopRegion;
    expectedWords = expectedWords.filter(w => 
      w.startTime >= start && w.endTime <= end
    );
  }

  // Create a copy of transcript words to match against
  const heardWords = [...transcriptWords];
  const wordResults: WordResult[] = [];

  let correctWords = 0;
  let totalTimingOffset = 0;
  let timingCount = 0;
  let totalSlang = 0;
  let correctSlang = 0;

  // For each expected word, try to find a matching heard word
  for (const expected of expectedWords) {
    const expectedNorm = normalize(expected.word);
    if (expectedNorm.length === 0) continue;

    if (expected.type === 'slang') totalSlang++;

    // Find the best matching heard word within a reasonable time window
    const expectedTime = expected.startTime - recordingStartOffset;
    let bestMatch: { index: number; word: TranscriptWord; distance: number } | null = null;

    for (let i = 0; i < heardWords.length; i++) {
      const heard = heardWords[i];
      const heardNorm = normalize(heard.word);
      
      if (wordsMatch(expectedNorm, heardNorm)) {
        const timeDiff = Math.abs(heard.timestamp - expectedTime);
        if (!bestMatch || timeDiff < Math.abs(bestMatch.word.timestamp - expectedTime)) {
          bestMatch = { index: i, word: heard, distance: levenshtein(expectedNorm, heardNorm) };
        }
      }
    }

    if (bestMatch) {
      // Word was found
      const timingOffset = (bestMatch.word.timestamp - expectedTime) * 1000; // to ms
      const isExact = bestMatch.distance === 0;
      
      correctWords++;
      totalTimingOffset += Math.abs(timingOffset);
      timingCount++;

      if (expected.type === 'slang') correctSlang++;

      // Remove matched word to prevent double-matching
      heardWords.splice(bestMatch.index, 1);

      let reason: WordResult['reason'] = 'correct';
      if (!isExact) reason = 'mispronounced';
      if (timingOffset > 600) reason = 'late';
      if (timingOffset < -600) reason = 'early';

      wordResults.push({
        expected: expected.word,
        heard: bestMatch.word.word,
        expectedTime: expected.startTime,
        actualTime: bestMatch.word.timestamp + recordingStartOffset,
        isCorrect: true,
        timingOffset,
        type: expected.type,
        reason,
      });
    } else {
      // Word was missed
      wordResults.push({
        expected: expected.word,
        heard: null,
        expectedTime: expected.startTime,
        actualTime: null,
        isCorrect: false,
        timingOffset: 0,
        type: expected.type,
        reason: 'missed',
      });
    }
  }

  // Calculate scores
  const totalWords = expectedWords.length;
  const wordAccuracy = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 0;
  
  // Timing score: 100% if avg offset < 200ms, scales down
  const avgOffset = timingCount > 0 ? totalTimingOffset / timingCount : 1000;
  const timingScore = Math.max(0, Math.round(100 - (avgOffset / 10)));
  
  const slangHitRate = totalSlang > 0 ? Math.round((correctSlang / totalSlang) * 100) : 100;
  
  // Overall = weighted average
  const overallScore = Math.round(
    wordAccuracy * 0.5 + timingScore * 0.3 + slangHitRate * 0.2
  );

  const transcript = transcriptWords.map(w => w.word).join(' ');

  return {
    wordAccuracy,
    timingScore,
    slangHitRate,
    overallScore,
    totalWords,
    correctWords,
    totalSlang,
    correctSlang,
    avgTimingOffset: Math.round(avgOffset),
    wordResults,
    transcript,
  };
}
