// Lofi Chill Web Audio Synthesizer: Warm Rhodes tines, tape wow & flutter, creamy keyboard thocks, and soft vinyl crackle
class SoundEffects {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private vinylNode: AudioBufferSourceNode | null = null;
  private vinylGain: GainNode | null = null;
  private isVinylPlaying: boolean = false;

  private clickNoiseBuffer: AudioBuffer | null = null;

  constructor() {}

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled && this.isVinylPlaying) {
      this.stopVinylCrackle();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private getClickNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (!this.clickNoiseBuffer || this.clickNoiseBuffer.sampleRate !== ctx.sampleRate) {
      const bufferSize = Math.floor(ctx.sampleRate * 0.03);
      this.clickNoiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = this.clickNoiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    }
    return this.clickNoiseBuffer;
  }

  // Creamy Lofi Mechanical Keyboard "Thock" / Velvet Tape Tap
  public playClick(pitchOffset: number = 0) {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Low warm body pop (sine wave with pitch drop)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const baseFreq = 160 + (pitchOffset % 80);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.07);

      oscGain.gain.setValueAtTime(0.18, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(oscGain);

      // 2. Soft cushioned tap (cached filtered noise click)
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = this.getClickNoiseBuffer(ctx);

      // Warm lowpass filter on the tap to remove harsh high frequencies
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(950, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.07, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      noiseSource.connect(filter);
      filter.connect(noiseGain);

      // Connect to master output
      oscGain.connect(ctx.destination);
      noiseGain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
      noiseSource.start(now);
      noiseSource.stop(now + 0.03);
    } catch {}
  }

  public playRadarPing(pitch?: number) {
    this.playClick(pitch ? pitch / 4 : 0);
  }

  // Lush Lofi Fender Rhodes Major 7th / 9th Chord with Tape Wow & Flutter
  public playSuccess(streakLevel: number = 1) {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Lofi chords: Fmaj9 / Cmaj9 / Abmaj7 progressions
      // Warm mellow frequencies
      const chordSets = [
        [261.63, 329.63, 392.0, 493.88, 587.33], // Cmaj9 (C4, E4, G4, B4, D5)
        [349.23, 440.0, 523.25, 659.25, 783.99], // Fmaj9 (F4, A4, C5, E5, G5)
        [220.0, 261.63, 329.63, 415.3, 493.88],  // Am9
        [293.66, 369.99, 440.0, 554.37, 659.25], // Dmaj9
      ];

      const chord = chordSets[(streakLevel - 1) % chordSets.length];

      chord.forEach((freq, idx) => {
        // Stagger note hits slightly like gentle jazz fingering
        const noteTime = now + idx * 0.045;

        // Rhodes body oscillator
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        // Subtle tape wow & flutter (gentle pitch wobble ~4.5Hz)
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(4.2, noteTime);
        lfoGain.gain.setValueAtTime(1.8, noteTime); // subtle detune depth
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        // Soft Rhodes bell tine overtone
        const tine = ctx.createOscillator();
        const tineGain = ctx.createGain();
        tine.type = 'triangle';
        tine.frequency.setValueAtTime(freq * 2.76, noteTime);

        tineGain.gain.setValueAtTime(0.02, noteTime);
        tineGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.12);

        // Cozy lowpass filter to create that warm lofi sound
        const lpf = ctx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.setValueAtTime(1100, noteTime);
        lpf.Q.setValueAtTime(1.2, noteTime);

        oscGain.gain.setValueAtTime(0.08, noteTime);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.85);

        osc.connect(lpf);
        tine.connect(lpf);
        lpf.connect(oscGain);
        oscGain.connect(ctx.destination);

        lfo.start(noteTime);
        osc.start(noteTime);
        tine.start(noteTime);

        lfo.stop(noteTime + 0.9);
        osc.stop(noteTime + 0.9);
        tine.stop(noteTime + 0.9);
      });
    } catch {}
  }

  // Soft Lofi Tape Wobble Down / Muted Vinyl Drop for Errors
  public playError() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Soft muted warm Rhodes tone that slides gently downward like a tape slowdown
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(196.0, now); // G3
      osc.frequency.exponentialRampToValueAtTime(130.81, now + 0.32); // C3 tape drop

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, now); // Very warm, zero harshness

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  // 3-chord Lofi Neo-Soul Progression for Celebrations
  public playFanfare() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Dm9 -> G13 -> Cmaj9 progression
      const chords = [
        { time: 0.0, notes: [293.66, 349.23, 440.0, 523.25] },
        { time: 0.35, notes: [246.94, 329.63, 392.0, 523.25] },
        { time: 0.75, notes: [261.63, 329.63, 392.0, 493.88, 587.33] },
      ];

      chords.forEach(({ time, notes }) => {
        notes.forEach((freq, idx) => {
          const noteTime = now + time + idx * 0.035;

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const lpf = ctx.createBiquadFilter();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);

          lpf.type = 'lowpass';
          lpf.frequency.setValueAtTime(1200, noteTime);

          gain.gain.setValueAtTime(0.07, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.75);

          osc.connect(lpf);
          lpf.connect(gain);
          gain.connect(ctx.destination);

          osc.start(noteTime);
          osc.stop(noteTime + 0.75);
        });
      });
    } catch {}
  }

  // Optional: Soft Vinyl Crackle Loop (Very subtle, warm ambiance)
  public startVinylCrackle() {
    if (!this.enabled || this.isVinylPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const bufferSize = ctx.sampleRate * 2.0; // 2s loop
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate quiet warm vinyl dust & occasional clicks
      for (let i = 0; i < bufferSize; i++) {
        // Soft pinkish background hiss
        let sample = (Math.random() * 2 - 1) * 0.015;
        // Random micro pops
        if (Math.random() < 0.0004) {
          sample += (Math.random() * 2 - 1) * 0.3;
        }
        data[i] = sample;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.Q.setValueAtTime(0.8, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.035, ctx.currentTime); // very subtle background warmth

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start();
      this.vinylNode = source;
      this.vinylGain = gain;
      this.isVinylPlaying = true;
    } catch {}
  }

  public stopVinylCrackle() {
    if (this.vinylNode) {
      try {
        this.vinylNode.stop();
        this.vinylNode.disconnect();
      } catch {}
      this.vinylNode = null;
    }
    this.isVinylPlaying = false;
  }
}

export const soundManager = new SoundEffects();
