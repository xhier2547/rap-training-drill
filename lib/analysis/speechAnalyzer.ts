/**
 * Real-time Speech Analyzer using Web Speech API
 * Listens to microphone input and transcribes to text with timestamps
 */

import { useStudioStore, TranscriptWord } from '@/lib/store/useStudioStore';

// Type declaration for Web Speech API (not in all TS libs)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

let recognition: any = null;
let recordingStartTime = 0;

export function startSpeechRecognition(): boolean {
  // Check browser support
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.error('[SpeechAnalyzer] Web Speech API not supported');
    alert('เบราว์เซอร์นี้ไม่รองรับ Speech Recognition กรุณาใช้ Chrome');
    return false;
  }

  // Reset state
  useStudioStore.setState({
    liveTranscript: '',
    transcriptWords: [],
    analysisResult: null,
  });

  recognition = new SpeechRecognition();
  recognition.continuous = true;        // Keep listening until stopped
  recognition.interimResults = true;    // Show partial results for live feedback
  recognition.lang = 'en-US';          // English for rap lyrics
  recognition.maxAlternatives = 1;

  recordingStartTime = Date.now();

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let interimTranscript = '';
    const words: TranscriptWord[] = [...useStudioStore.getState().transcriptWords];

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;

      if (result.isFinal) {
        // Split final transcript into individual words with timestamps
        const elapsedMs = Date.now() - recordingStartTime;
        const elapsedSec = elapsedMs / 1000;
        const resultWords = transcript.trim().split(/\s+/);
        
        // Distribute timestamp evenly across words in this result
        const timePerWord = resultWords.length > 1 ? 0.3 : 0; // ~300ms per word estimate
        
        resultWords.forEach((word, idx) => {
          if (word.length > 0) {
            words.push({
              word: word.toLowerCase().replace(/[^a-z']/g, ''),
              timestamp: elapsedSec - (resultWords.length - 1 - idx) * timePerWord,
              confidence: confidence || 0.8,
            });
          }
        });

        useStudioStore.setState({ transcriptWords: words });
      } else {
        interimTranscript += transcript;
      }
    }

    // Build full transcript for live display
    const finalText = words.map(w => w.word).join(' ');
    const displayText = finalText + (interimTranscript ? ` ${interimTranscript}` : '');
    useStudioStore.setState({ liveTranscript: displayText });
  };

  recognition.onerror = (event: any) => {
    console.warn('[SpeechAnalyzer] Error:', event.error);
    // Restart on non-fatal errors
    if (event.error === 'no-speech' || event.error === 'aborted') {
      try { recognition?.start(); } catch { /* already running */ }
    }
  };

  recognition.onend = () => {
    // Auto-restart if still recording
    const { isRecording } = useStudioStore.getState();
    if (isRecording) {
      try { recognition?.start(); } catch { /* already running */ }
    }
  };

  try {
    recognition.start();
    return true;
  } catch (err) {
    console.error('[SpeechAnalyzer] Failed to start:', err);
    return false;
  }
}

export function stopSpeechRecognition(): void {
  if (recognition) {
    recognition.onend = null; // Prevent auto-restart
    try { recognition.stop(); } catch { /* already stopped */ }
    recognition = null;
  }
}

export function getRecordingDuration(): number {
  return recordingStartTime > 0 ? (Date.now() - recordingStartTime) / 1000 : 0;
}
