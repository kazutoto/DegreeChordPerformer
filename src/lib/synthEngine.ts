import { SoundPreset } from '../types';
import { midiToFrequency } from './musicTheory';

interface PlayingVoice {
  midiNote: number;
  oscillators: OscillatorNode[];
  gainNode: GainNode;
  filterNode?: BiquadFilterNode;
  stopTime?: number;
}

class SynthEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private limiterNode: DynamicsCompressorNode | null = null;
  private activeVoices: Map<number, PlayingVoice> = new Map();
  private sustainedVoices: Map<number, PlayingVoice> = new Map();
  private isSustainActive: boolean = false;

  private currentPreset: SoundPreset = 'piano';
  private masterVolume: number = 0.8;
  private reverbAmount: number = 0.3;
  private attackTime: number = 0.015;
  private releaseTime: number = 0.4;

  constructor() {
    // AudioContext created on demand / first interaction
  }

  public init(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Limiter
      this.limiterNode = this.ctx.createDynamicsCompressor();
      this.limiterNode.threshold.setValueAtTime(-1.0, this.ctx.currentTime);
      this.limiterNode.knee.setValueAtTime(0, this.ctx.currentTime);
      this.limiterNode.ratio.setValueAtTime(20, this.ctx.currentTime);
      this.limiterNode.attack.setValueAtTime(0.002, this.ctx.currentTime);
      this.limiterNode.release.setValueAtTime(0.1, this.ctx.currentTime);

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);

      this.masterGain.connect(this.limiterNode);
      this.limiterNode.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    return this.ctx;
  }

  public setPreset(preset: SoundPreset) {
    this.currentPreset = preset;
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.02);
    }
  }

  public setReverb(amount: number) {
    this.reverbAmount = Math.max(0, Math.min(1, amount));
  }

  public setSustain(active: boolean) {
    this.isSustainActive = active;
    if (!active) {
      // Release all sustained voices when sustain pedal is released
      this.sustainedVoices.forEach((voice) => {
        this.releaseVoice(voice);
      });
      this.sustainedVoices.clear();
    }
  }

  // Play a set of chord notes (MIDI numbers)
  public playChord(midiNotes: number[], isStrum: boolean = false, velocity: number = 64, strumDelayMs: number = 35) {
    this.init();
    // Release existing notes that are not in new chord
    this.stopAllNotesExcept(midiNotes);

    // Sort notes ascending for natural low-to-high guitar-style strumming
    const sortedNotes = [...midiNotes].sort((a, b) => a - b);

    // Play new notes with strum delay if enabled
    sortedNotes.forEach((midiNote, index) => {
      const delaySec = isStrum ? (index * strumDelayMs) / 1000 : 0;
      if (!this.activeVoices.has(midiNote)) {
        this.playNote(midiNote, delaySec, velocity);
      }
    });
  }

  // Stop all active chord notes
  public stopAllNotes() {
    if (!this.ctx) return;
    this.activeVoices.forEach((voice, midiNote) => {
      if (this.isSustainActive) {
        this.sustainedVoices.set(midiNote, voice);
      } else {
        this.releaseVoice(voice);
      }
    });
    this.activeVoices.clear();
  }

  private stopAllNotesExcept(keepNotes: number[]) {
    const keepSet = new Set(keepNotes);
    this.activeVoices.forEach((voice, midiNote) => {
      if (!keepSet.has(midiNote)) {
        this.releaseVoice(voice);
        this.activeVoices.delete(midiNote);
      }
    });
  }

  public playNote(midiNote: number, delaySec: number = 0, velocity: number = 64) {
    if (!this.ctx || !this.masterGain) return;

    const freq = midiToFrequency(midiNote);
    const now = this.ctx.currentTime + delaySec;

    const voiceGain = this.ctx.createGain();
    voiceGain.gain.setValueAtTime(0, now);

    const velocityGain = this.ctx.createGain();
    const velocityNorm = Math.max(0.01, velocity / 127);
    velocityGain.gain.setValueAtTime(velocityNorm, now);

    const oscillators: OscillatorNode[] = [];
    let filterNode: BiquadFilterNode | undefined = undefined;

    switch (this.currentPreset) {
      case 'piano': {
        // Multi-harmonics physical piano simulation
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        // Filter frequency tracks pitch
        filter.frequency.setValueAtTime(Math.min(12000, freq * 4), now);
        filter.frequency.exponentialRampToValueAtTime(Math.max(200, freq * 1.2), now + 1.2);

        // Fundamental
        const osc1 = this.ctx.createOscillator();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, now);

        // Sub/Octave detail
        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2, now);

        // Slight detuned hammer attack
        const osc3 = this.ctx.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(freq * 3, now);

        const oscGain1 = this.ctx.createGain();
        oscGain1.gain.setValueAtTime(0.7, now);

        const oscGain2 = this.ctx.createGain();
        oscGain2.gain.setValueAtTime(0.25, now);

        const oscGain3 = this.ctx.createGain();
        oscGain3.gain.setValueAtTime(0.1, now);

        osc1.connect(oscGain1);
        osc2.connect(oscGain2);
        osc3.connect(oscGain3);

        oscGain1.connect(filter);
        oscGain2.connect(filter);
        oscGain3.connect(filter);

        filter.connect(voiceGain);

        // Envelope
        voiceGain.gain.setValueAtTime(0, now);
        voiceGain.gain.linearRampToValueAtTime(0.8, now + 0.01);
        voiceGain.gain.exponentialRampToValueAtTime(0.2, now + 0.8);
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

        oscillators.push(osc1, osc2, osc3);
        filterNode = filter;
        break;
      }

      case 'epiano': {
        // Rhodes / DX7 FM Tine Electric Piano
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 3, now);

        const osc1 = this.ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);

        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 4, now); // Bell overtone

        const osc2Gain = this.ctx.createGain();
        osc2Gain.gain.setValueAtTime(0.3, now);
        osc2Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc1.connect(filter);
        osc2.connect(osc2Gain);
        osc2Gain.connect(filter);

        filter.connect(voiceGain);

        voiceGain.gain.setValueAtTime(0, now);
        voiceGain.gain.linearRampToValueAtTime(0.7, now + 0.008);
        voiceGain.gain.exponentialRampToValueAtTime(0.15, now + 0.6);
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

        oscillators.push(osc1, osc2);
        filterNode = filter;
        break;
      }

      case 'synth': {
        // Analog Warm Poly Synth
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.setValueAtTime(3, now);
        filter.frequency.setValueAtTime(freq * 1.5, now);
        filter.frequency.exponentialRampToValueAtTime(freq * 4, now + 0.1);
        filter.frequency.exponentialRampToValueAtTime(freq * 2, now + 0.5);

        const osc1 = this.ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, now);

        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(freq * 1.003, now); // Detuned

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(voiceGain);

        voiceGain.gain.setValueAtTime(0, now);
        voiceGain.gain.linearRampToValueAtTime(0.5, now + 0.02);
        voiceGain.gain.setValueAtTime(0.4, now + 0.2);

        oscillators.push(osc1, osc2);
        filterNode = filter;
        break;
      }

      case 'organ': {
        // Hammond Organ drawbars
        const harmonics = [1, 2, 3, 4, 6];
        const weights = [0.8, 0.5, 0.3, 0.2, 0.1];

        harmonics.forEach((h, i) => {
          const osc = this.ctx!.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq * h, now);

          const hGain = this.ctx!.createGain();
          hGain.gain.setValueAtTime(weights[i], now);

          osc.connect(hGain);
          hGain.connect(voiceGain);
          oscillators.push(osc);
        });

        voiceGain.gain.setValueAtTime(0, now);
        voiceGain.gain.linearRampToValueAtTime(0.5, now + 0.01);

        break;
      }

      case 'pad': {
        // Ethereal Soft Pad
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 2.5, now);

        const osc1 = this.ctx.createOscillator();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, now);

        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 1.002, now);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(voiceGain);

        voiceGain.gain.setValueAtTime(0, now);
        voiceGain.gain.linearRampToValueAtTime(0.4, now + 0.2); // Slow attack

        oscillators.push(osc1, osc2);
        filterNode = filter;
        break;
      }
    }

    voiceGain.connect(velocityGain);
    velocityGain.connect(this.masterGain);

    oscillators.forEach((osc) => osc.start(now));

    this.activeVoices.set(midiNote, {
      midiNote,
      oscillators,
      gainNode: voiceGain,
      filterNode,
    });
  }

  private releaseVoice(voice: PlayingVoice) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const releaseDuration = this.currentPreset === 'pad' ? 0.8 : 0.15;

    try {
      voice.gainNode.gain.cancelScheduledValues(now);
      const currentGain = voice.gainNode.gain.value;
      voice.gainNode.gain.setValueAtTime(Math.max(0.0001, currentGain), now);
      voice.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + releaseDuration);

      setTimeout(() => {
        voice.oscillators.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // Already stopped
          }
        });
        voice.gainNode.disconnect();
      }, releaseDuration * 1000 + 50);
    } catch {
      // Fallback
      voice.oscillators.forEach((osc) => {
        try {
          osc.stop();
        } catch {
          // ignore
        }
      });
    }
  }
}

export const synthEngine = new SynthEngine();
