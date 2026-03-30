/**
 * Gemini API Wrapper for Lyrics Parsing
 * Takes raw lyrics and returns JSON with timestamps, slang context, and breath marks.
 */

import { LyricWord } from '@/data/songs';

export interface LyricsParseResponse {
  songId: string;
  annotatedLyrics: LyricWord[];
  difficultyScore: number;
}

export const parseLyricsWithGemini = async (rawLyrics: string): Promise<LyricsParseResponse> => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "mock") {
    console.log("Using Gemini Mock Mode. Skipping external API call.");
    return mockGeminiResponse();
  }

  try {
    // Real implementation would POST to api.gemini.ai here
    // Ex: https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
    throw new Error("Real Gemini setup pending."); 
  } catch (error) {
    console.error("Gemini request failed:", error);
    return mockGeminiResponse(); // Fallback
  }
};

const mockGeminiResponse = (): Promise<LyricsParseResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        songId: "doja",
        difficultyScore: 78,
        annotatedLyrics: [
          // Using the same mock from our data/songs.ts for consistency
          { id: "1", word: "How", startTime: 0.1, endTime: 0.3, type: "normal" },
          { id: "2", word: "can", startTime: 0.3, endTime: 0.5, type: "normal" },
          { id: "3", word: "I", startTime: 0.5, endTime: 0.6, type: "linking" },
          { id: "4", word: "be", startTime: 0.6, endTime: 0.8, type: "normal" },
          { id: "5", word: "homophobic?", startTime: 0.8, endTime: 1.5, type: "normal" },
          { id: "br1", word: "[breath]", startTime: 1.5, endTime: 1.8, type: "breath" },
          { id: "6", word: "My", startTime: 1.8, endTime: 2.0, type: "normal" },
          { 
            id: "7", word: "bitch", 
            startTime: 2.0, endTime: 2.4, type: "slang", 
            slangMeaning: "แฟนสาว (Slang)", 
            slangContext: "บริบทนี้ใช้เจาะจงถึงผู้หญิงหรือแฟน", 
            pronunciation: "บิทชฺ" 
          },
        ]
      });
    }, 800);
  });
};
