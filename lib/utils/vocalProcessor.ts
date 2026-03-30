/**
 * Pro Studio Vocal Processor Logic
 * Handles real-time Web Audio FX for vocals: EQ, Reverb, Compression
 */

export class VocalProcessor {
  private ctx: AudioContext;
  private source: MediaStreamAudioSourceNode;
  private compressor: DynamicsCompressorNode;
  private bassFilter: BiquadFilterNode;
  private trebleFilter: BiquadFilterNode;
  private reverbDelay: DelayNode;
  private reverbFeedback: GainNode;
  private reverbFilter: BiquadFilterNode;
  private dryGain: GainNode;
  private wetGain: GainNode;
  private monitorGain: GainNode;
  private output: MediaStreamAudioDestinationNode;

  constructor(stream: MediaStream) {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.source = this.ctx.createMediaStreamSource(stream);
    
    // 1. Dynamics Compression (The "Pro" sound)
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-24, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

    // 2. EQ: Bass (Lowshelf)
    this.bassFilter = this.ctx.createBiquadFilter();
    this.bassFilter.type = 'lowshelf';
    this.bassFilter.frequency.setValueAtTime(200, this.ctx.currentTime);
    this.bassFilter.gain.setValueAtTime(0, this.ctx.currentTime);

    // 3. EQ: Treble (Highshelf)
    this.trebleFilter = this.ctx.createBiquadFilter();
    this.trebleFilter.type = 'highshelf';
    this.trebleFilter.frequency.setValueAtTime(3000, this.ctx.currentTime);
    this.trebleFilter.gain.setValueAtTime(0, this.ctx.currentTime);

    // 4. Algorithmic Reverb (Digital Echo Style)
    // Dry Path
    this.dryGain = this.ctx.createGain();
    this.dryGain.gain.setValueAtTime(1, this.ctx.currentTime);

    // Wet Path (Reverb)
    this.reverbDelay = this.ctx.createDelay();
    this.reverbDelay.delayTime.setValueAtTime(0.04, this.ctx.currentTime); // Short pre-delay
    
    this.reverbFeedback = this.ctx.createGain();
    this.reverbFeedback.gain.setValueAtTime(0.4, this.ctx.currentTime);

    this.reverbFilter = this.ctx.createBiquadFilter(); // Soften the reverb
    this.reverbFilter.type = 'lowpass';
    this.reverbFilter.frequency.setValueAtTime(2000, this.ctx.currentTime);

    this.wetGain = this.ctx.createGain();
    this.wetGain.gain.setValueAtTime(0.2, this.ctx.currentTime); // Intensity

    // ── MAIN MIXER ──
    const masterMix = this.ctx.createGain();

    // Setup Reverb Feedback Loop (Simplistic Reverb Approximation)
    this.reverbDelay.connect(this.reverbFeedback);
    this.reverbFeedback.connect(this.reverbFilter);
    this.reverbFilter.connect(this.reverbDelay); // Feedback

    // 5. Monitoring (Hear yourself)
    this.monitorGain = this.ctx.createGain();
    this.monitorGain.gain.setValueAtTime(0, this.ctx.currentTime); // Default OFF
    this.monitorGain.connect(this.ctx.destination);

    // 6. Destination (For Recording)
    this.output = this.ctx.createMediaStreamDestination();

    // ── CHAIN ASSEMBLY ──
    // Source -> Compressor -> EQ -> Dry/Wet Split
    this.source.connect(this.compressor);
    this.compressor.connect(this.bassFilter);
    this.bassFilter.connect(this.trebleFilter);
    
    // Split to Dry and Reverb paths
    this.trebleFilter.connect(this.dryGain);
    this.trebleFilter.connect(this.reverbDelay);
    
    // Connect Paths to Master Mix
    this.dryGain.connect(masterMix);
    this.reverbDelay.connect(this.wetGain);
    this.wetGain.connect(masterMix);

    // Connect Master Mix to Output (Recording) and Monitor
    masterMix.connect(this.output);
    masterMix.connect(this.monitorGain);
  }

  // API for real-time control
  setBass(level: number) { // 0 - 100
    const gain = (level - 50) / 5; // -10 to +10 dB
    this.bassFilter.gain.setTargetAtTime(gain, this.ctx.currentTime, 0.1);
  }

  setTreble(level: number) { // 0 - 100
    const gain = (level - 50) / 5; // -10 to +10 dB
    this.trebleFilter.gain.setTargetAtTime(gain, this.ctx.currentTime, 0.1);
  }

  setReverb(intensity: number) { // 0 - 100
    const gain = (intensity / 100) * 0.8;
    this.wetGain.gain.setTargetAtTime(gain, this.ctx.currentTime, 0.1);
    this.reverbFeedback.gain.setTargetAtTime(0.2 + (intensity / 100) * 0.5, this.ctx.currentTime, 0.1);
  }

  setMonitor(active: boolean) {
    this.monitorGain.gain.setTargetAtTime(active ? 1 : 0, this.ctx.currentTime, 0.1);
  }

  getProcessedStream(): MediaStream {
    return this.output.stream;
  }

  close() {
    this.ctx.close();
  }
}
