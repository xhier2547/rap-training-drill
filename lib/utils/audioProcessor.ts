/**
 * Audio Processor to handle real-time waveform analysis and vocal start detection.
 */

export async function getAudioBuffer(url: string): Promise<AudioBuffer | null> {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    return await audioContext.decodeAudioData(arrayBuffer);
  } catch (err) {
    console.error('Failed to decode audio buffer:', err);
    return null;
  }
}

/**
 * Calculates raw amplitude peaks for a specified number of buckets.
 */
export function getWaveformPoints(buffer: AudioBuffer, points: number): number[] {
  const rawData = buffer.getChannelData(0); // Use mono channel 0
  const blockSize = Math.floor(rawData.length / points);
  const peaks: number[] = [];

  for (let i = 0; i < points; i++) {
    const start = i * blockSize;
    let max = 0;
    for (let j = 0; j < blockSize; j++) {
      const val = Math.abs(rawData[start + j]);
      if (val > max) max = val;
    }
    // Normalize and add some minimum height for visibility
    peaks.push(0.1 + max * 0.9);
  }

  return peaks;
}

/**
 * Detects the first significant audio peak (vocal or beat entry).
 * Returns the time in seconds.
 */
export function detectFirstPeakTime(buffer: AudioBuffer, threshold = 0.05): number {
  const rawData = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  
  // Find lead-in silence (first 10 seconds only to avoid issues)
  const maxSamplesToCheck = 10 * sampleRate; 
  
  for (let i = 0; i < Math.min(rawData.length, maxSamplesToCheck); i++) {
    if (Math.abs(rawData[i]) > threshold) {
      return i / sampleRate;
    }
  }
  
  return 0; // Default to 0 if no peak found
}
