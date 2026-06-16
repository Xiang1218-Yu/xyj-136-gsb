import { BuildingType, DisasterType } from '../types/game';

export type MusicStyle = 'barren' | 'sprout' | 'growth' | 'prosperity' | 'civilization' | 'perfection';

export interface AudioSettings {
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

interface MusicLayer {
  oscillators: OscillatorNode[];
  gains: GainNode[];
  active: boolean;
}

export class AudioSystem {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private currentStyle: MusicStyle = 'barren';
  private musicLayers: Map<MusicStyle, MusicLayer> = new Map();
  private melodyInterval: number | null = null;
  private ambientNoise: AudioBufferSourceNode | null = null;
  private ambientGain: GainNode | null = null;

  private settings: AudioSettings = {
    musicVolume: 0.5,
    sfxVolume: 0.6,
    muted: false,
  };

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem('audio_settings');
      if (saved) {
        this.settings = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load audio settings');
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem('audio_settings', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save audio settings');
    }
  }

  private ensureContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.settings.muted ? 0 : 1;
      this.masterGain.connect(this.audioContext.destination);

      this.musicGain = this.audioContext.createGain();
      this.musicGain.gain.value = this.settings.musicVolume;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.audioContext.createGain();
      this.sfxGain.gain.value = this.settings.sfxVolume;
      this.sfxGain.connect(this.masterGain);
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  setMusicVolume(volume: number) {
    this.settings.musicVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
    if (this.musicGain && this.audioContext) {
      this.musicGain.gain.linearRampToValueAtTime(
        this.settings.musicVolume,
        this.audioContext.currentTime + 0.1
      );
    }
  }

  setSfxVolume(volume: number) {
    this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
    if (this.sfxGain && this.audioContext) {
      this.sfxGain.gain.linearRampToValueAtTime(
        this.settings.sfxVolume,
        this.audioContext.currentTime + 0.1
      );
    }
  }

  setMuted(muted: boolean) {
    this.settings.muted = muted;
    this.saveSettings();
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.linearRampToValueAtTime(
        muted ? 0 : 1,
        this.audioContext.currentTime + 0.1
      );
    }
  }

  toggleMute(): boolean {
    this.setMuted(!this.settings.muted);
    return this.settings.muted;
  }

  getMusicStyleForLifeIndex(lifeIndex: number): MusicStyle {
    if (lifeIndex >= 90) return 'perfection';
    if (lifeIndex >= 70) return 'civilization';
    if (lifeIndex >= 50) return 'prosperity';
    if (lifeIndex >= 30) return 'growth';
    if (lifeIndex >= 10) return 'sprout';
    return 'barren';
  }

  startMusic(lifeIndex: number, buildingCounts: {
    forestCount: number;
    glacierCount: number;
    cityCount: number;
    grasslandCount: number;
  }) {
    const ctx = this.ensureContext();
    const targetStyle = this.getMusicStyleForLifeIndex(lifeIndex);

    if (targetStyle !== this.currentStyle || !this.musicLayers.size) {
      this.transitionToStyle(targetStyle, buildingCounts);
    }

    this.startAmbientNoise(buildingCounts);
    this.startMelody(targetStyle);
  }

  updateMusic(lifeIndex: number, buildingCounts: {
    forestCount: number;
    glacierCount: number;
    cityCount: number;
    grasslandCount: number;
  }) {
    const targetStyle = this.getMusicStyleForLifeIndex(lifeIndex);
    if (targetStyle !== this.currentStyle) {
      this.transitionToStyle(targetStyle, buildingCounts);
    }
    this.updateAmbientNoise(buildingCounts);
  }

  stopMusic() {
    if (this.melodyInterval) {
      clearInterval(this.melodyInterval);
      this.melodyInterval = null;
    }

    this.musicLayers.forEach((layer) => {
      layer.oscillators.forEach((osc) => {
        try { osc.stop(); } catch (e) {}
      });
      layer.active = false;
    });
    this.musicLayers.clear();

    if (this.ambientNoise) {
      try { this.ambientNoise.stop(); } catch (e) {}
      this.ambientNoise = null;
    }
    this.currentStyle = 'barren';
  }

  private transitionToStyle(style: MusicStyle, buildingCounts: {
    forestCount: number;
    glacierCount: number;
    cityCount: number;
    grasslandCount: number;
  }) {
    const ctx = this.ensureContext();
    const oldStyle = this.currentStyle;

    this.fadeOutStyle(oldStyle);
    this.createStyleLayer(style, buildingCounts);
    this.fadeInStyle(style);

    this.currentStyle = style;
    this.restartMelody(style);
  }

  private fadeOutStyle(style: MusicStyle) {
    const layer = this.musicLayers.get(style);
    if (!layer || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    layer.gains.forEach((gain) => {
      gain.gain.cancelScheduledValues(now);
      gain.gain.linearRampToValueAtTime(0, now + 2);
    });

    setTimeout(() => {
      layer.oscillators.forEach((osc) => {
        try { osc.stop(); } catch (e) {}
      });
      this.musicLayers.delete(style);
    }, 2100);
  }

  private fadeInStyle(style: MusicStyle) {
    const layer = this.musicLayers.get(style);
    if (!layer || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const targetGain = this.getStyleTargetGain(style);
    layer.gains.forEach((gain, i) => {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(targetGain / (i + 1), now + 2);
    });
  }

  private getStyleTargetGain(style: MusicStyle): number {
    const gains: Record<MusicStyle, number> = {
      barren: 0.08,
      sprout: 0.12,
      growth: 0.15,
      prosperity: 0.18,
      civilization: 0.2,
      perfection: 0.22,
    };
    return gains[style];
  }

  private createStyleLayer(style: MusicStyle, buildingCounts: {
    forestCount: number;
    glacierCount: number;
    cityCount: number;
    grasslandCount: number;
  }) {
    const ctx = this.ensureContext();
    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    const configs = this.getStyleConfig(style, buildingCounts);

    configs.forEach((config) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = config.type;
      osc.frequency.value = config.frequency;
      gain.gain.value = 0;

      if (config.detune) {
        osc.detune.value = config.detune;
      }

      osc.connect(gain);
      gain.connect(this.musicGain!);

      osc.start();
      oscillators.push(osc);
      gains.push(gain);
    });

    this.musicLayers.set(style, { oscillators, gains, active: true });
  }

  private getStyleConfig(style: MusicStyle, buildingCounts: {
    forestCount: number;
    glacierCount: number;
    cityCount: number;
    grasslandCount: number;
  }): { type: OscillatorType; frequency: number; detune?: number }[] {
    const baseFreq = 110;

    switch (style) {
      case 'barren':
        return [
          { type: 'sine', frequency: baseFreq },
          { type: 'sine', frequency: baseFreq * 1.5, detune: -5 },
        ];
      case 'sprout':
        return [
          { type: 'sine', frequency: baseFreq },
          { type: 'triangle', frequency: baseFreq * 1.25 },
          { type: 'sine', frequency: baseFreq * 2 },
        ];
      case 'growth':
        return [
          { type: 'triangle', frequency: baseFreq },
          { type: 'triangle', frequency: baseFreq * 1.5 },
          { type: 'sine', frequency: baseFreq * 2.5 },
          { type: 'sine', frequency: baseFreq * 3 },
        ];
      case 'prosperity':
        return [
          { type: 'triangle', frequency: baseFreq },
          { type: 'sawtooth', frequency: baseFreq * 1.25, detune: -3 },
          { type: 'triangle', frequency: baseFreq * 1.5 },
          { type: 'sine', frequency: baseFreq * 2 },
          { type: 'sine', frequency: baseFreq * 2.5 },
        ];
      case 'civilization':
        return [
          { type: 'triangle', frequency: baseFreq },
          { type: 'sawtooth', frequency: baseFreq * 1.25, detune: -5 },
          { type: 'sawtooth', frequency: baseFreq * 1.5, detune: 3 },
          { type: 'triangle', frequency: baseFreq * 2 },
          { type: 'sine', frequency: baseFreq * 2.5 },
          { type: 'sine', frequency: baseFreq * 3 },
        ];
      case 'perfection':
        return [
          { type: 'triangle', frequency: baseFreq },
          { type: 'sawtooth', frequency: baseFreq * 1.25, detune: -5 },
          { type: 'sawtooth', frequency: baseFreq * 1.5, detune: 3 },
          { type: 'sawtooth', frequency: baseFreq * 1.75, detune: -2 },
          { type: 'triangle', frequency: baseFreq * 2 },
          { type: 'sine', frequency: baseFreq * 2.5 },
          { type: 'sine', frequency: baseFreq * 3 },
          { type: 'sine', frequency: baseFreq * 4 },
        ];
      default:
        return [{ type: 'sine', frequency: baseFreq }];
    }
  }

  private startMelody(style: MusicStyle) {
    if (this.melodyInterval) return;
    this.scheduleMelodyNotes(style);
  }

  private restartMelody(style: MusicStyle) {
    if (this.melodyInterval) {
      clearInterval(this.melodyInterval);
      this.melodyInterval = null;
    }
    this.scheduleMelodyNotes(style);
  }

  private scheduleMelodyNotes(style: MusicStyle) {
    const scales = this.getMelodyScale(style);
    const bpm = this.getStyleBPM(style);
    const noteInterval = (60 / bpm) * 1000 / 2;

    let noteIndex = 0;

    this.melodyInterval = window.setInterval(() => {
      if (!this.audioContext || !this.musicGain) return;

      const note = scales[noteIndex % scales.length];
      this.playMelodyNote(note, style);
      noteIndex++;

      if (Math.random() < 0.3) {
        noteIndex++;
      }
    }, noteInterval);
  }

  private getMelodyScale(style: MusicStyle): number[] {
    const baseFreq = 523.25;
    const scales: Record<MusicStyle, number[]> = {
      barren: [baseFreq * 0.5, baseFreq * 0.75],
      sprout: [baseFreq * 0.75, baseFreq, baseFreq * 1.25],
      growth: [baseFreq, baseFreq * 1.125, baseFreq * 1.25, baseFreq * 1.5],
      prosperity: [baseFreq, baseFreq * 1.125, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 1.75],
      civilization: [baseFreq, baseFreq * 1.125, baseFreq * 1.25, baseFreq * 1.333, baseFreq * 1.5, baseFreq * 1.75, baseFreq * 2],
      perfection: [baseFreq, baseFreq * 1.125, baseFreq * 1.25, baseFreq * 1.333, baseFreq * 1.5, baseFreq * 1.667, baseFreq * 1.75, baseFreq * 2],
    };
    return scales[style];
  }

  private getStyleBPM(style: MusicStyle): number {
    const bpms: Record<MusicStyle, number> = {
      barren: 40,
      sprout: 60,
      growth: 80,
      prosperity: 100,
      civilization: 110,
      perfection: 120,
    };
    return bpms[style];
  }

  private playMelodyNote(frequency: number, style: MusicStyle) {
    if (!this.audioContext || !this.musicGain) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = style === 'barren' ? 'sine' : style === 'sprout' || style === 'growth' ? 'triangle' : 'sawtooth';
    osc.frequency.value = frequency;

    const noteDuration = style === 'barren' ? 1.5 : style === 'sprout' ? 0.8 : 0.4;
    const peakGain = this.getStyleTargetGain(style) * 0.4;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + noteDuration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + noteDuration);
  }

  private startAmbientNoise(buildingCounts: {
    forestCount: number;
    glacierCount: number;
    cityCount: number;
    grasslandCount: number;
  }) {
    if (!this.audioContext || this.ambientNoise) return;

    const ctx = this.audioContext;
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.ambientNoise = ctx.createBufferSource();
    this.ambientNoise.buffer = noiseBuffer;
    this.ambientNoise.loop = true;

    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.value = 0;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    this.ambientNoise.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.musicGain!);

    this.ambientNoise.start();
    this.updateAmbientNoise(buildingCounts);
  }

  private updateAmbientNoise(buildingCounts: {
    forestCount: number;
    glacierCount: number;
    cityCount: number;
    grasslandCount: number;
  }) {
    if (!this.ambientGain || !this.audioContext) return;

    const totalBuildings = buildingCounts.forestCount + buildingCounts.glacierCount +
      buildingCounts.cityCount + buildingCounts.grasslandCount;

    const targetGain = Math.min(0.04, totalBuildings * 0.003);
    const now = this.audioContext.currentTime;

    this.ambientGain.gain.linearRampToValueAtTime(targetGain, now + 1);
  }

  playToolSelect() {
    if (!this.audioContext || !this.sfxGain) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  playBuildingPlace(type: BuildingType) {
    if (!this.audioContext || !this.sfxGain) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    const baseFreqs: Record<BuildingType, number> = {
      forest: 330,
      glacier: 440,
      city: 220,
      grassland: 392,
    };

    const baseFreq = baseFreqs[type] || 330;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.value = baseFreq;

    osc2.type = 'triangle';
    osc2.frequency.value = baseFreq * 1.5;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  }

  playCreaturePlace() {
    if (!this.audioContext || !this.sfxGain) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.linearRampToValueAtTime(990, now + 0.1);
    osc.frequency.linearRampToValueAtTime(770, now + 0.2);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  playDelete() {
    if (!this.audioContext || !this.sfxGain) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  playReset() {
    if (!this.audioContext || !this.sfxGain) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    const freqs = [440, 330, 220, 165];

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + i * 0.1;

      osc.type = 'triangle';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  playDisaster(type: DisasterType) {
    if (!this.audioContext || !this.sfxGain) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 1.5;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';

    const filterFreqs: Record<DisasterType, number> = {
      earthquake: 200,
      volcano: 500,
      flood: 800,
      meteor: 300,
    };
    filter.frequency.value = filterFreqs[type] || 300;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 1);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.3, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 1.5);
    osc.start(now);
    osc.stop(now + 1.2);
  }

  playDisasterWarning() {
    if (!this.audioContext || !this.sfxGain) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + i * 0.3;

      osc.type = 'square';
      osc.frequency.value = 880;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    }
  }

  playMilestone() {
    if (!this.audioContext || !this.sfxGain) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    const arpeggio = [523.25, 659.25, 783.99, 1046.50, 1318.51];

    arpeggio.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + i * 0.08;

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  destroy() {
    this.stopMusic();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const audioSystem = new AudioSystem();
