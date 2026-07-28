/*
 * Copyright 2026 kazutoto
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { MidiOutputDevice, MidiState } from '../types';

class MidiEngine {
  private midiAccess: MIDIAccess | null = null;
  private selectedOutput: MIDIOutput | null = null;
  private midiMessageListeners: ((message: any) => void)[] = [];

  private state: MidiState = {
    isSupported: false,
    isEnabled: false,
    outputs: [],
    selectedOutputId: null,
    channel: 1,
    velocity: 100,
    log: [],
    error: null,
  };

  private stateChangeListeners: ((state: MidiState) => void)[] = [];
  private activeMidiNotes: Set<number> = new Set();

  constructor() {
    this.checkSupport();
    this.handleMidiMessage = this.handleMidiMessage.bind(this);
  }

  public checkSupport(): boolean {
    this.state.isSupported = typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;
    return this.state.isSupported;
  }

  public async initMidi(): Promise<boolean> {
    if (!this.checkSupport()) {
      this.state.error = 'お使いのブラウザは Web MIDI API をサポートしていません。(Chrome/Edge/Braveなどを推奨します)';
      this.notifyListeners();
      return false;
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess({ sysex: false });
      this.state.isEnabled = true;
      this.state.error = null;

      this.updateOutputList();

      this.midiAccess.onstatechange = () => {
        this.updateOutputList();
      };

      this.addLog('Web MIDI API に接続しました');
      this.notifyListeners();
      return true;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.state.error = `MIDIアクセス権限エラー: ${errorMsg}`;
      this.state.isEnabled = false;
      this.notifyListeners();
      return false;
    }
  }

  private updateOutputList() {
    if (!this.midiAccess) return;

    // Attach listeners to all inputs
    const inputs = this.midiAccess.inputs.values();
    for (const input of inputs) {
      input.onmidimessage = this.handleMidiMessage;
    }

    const devices: MidiOutputDevice[] = [];
    const outputs = this.midiAccess.outputs.values();

    for (const output of outputs) {
      devices.push({
        id: output.id,
        name: output.name || `MIDI Out (${output.id})`,
        manufacturer: output.manufacturer || '汎用',
        state: output.state || 'connected',
      });
    }

    this.state.outputs = devices;

    // Auto-select first device if none selected or if previous device lost
    if (devices.length > 0) {
      if (!this.state.selectedOutputId || !devices.some((d) => d.id === this.state.selectedOutputId)) {
        this.selectOutput(devices[0].id);
      }
    } else {
      this.selectedOutput = null;
      this.state.selectedOutputId = null;
    }

    this.notifyListeners();
  }

  private handleMidiMessage(event: any) {
    this.midiMessageListeners.forEach((listener) => listener(event));
  }

  public subscribeMidiMessage(listener: (message: any) => void) {
    this.midiMessageListeners.push(listener);
    return () => {
      this.midiMessageListeners = this.midiMessageListeners.filter((l) => l !== listener);
    };
  }

  public selectOutput(outputId: string) {
    if (!this.midiAccess) return;

    const output = this.midiAccess.outputs.get(outputId);
    if (output) {
      this.selectedOutput = output;
      this.state.selectedOutputId = outputId;
      this.addLog(`MIDI出力ポート選択: [${output.name}]`);
    } else {
      this.selectedOutput = null;
      this.state.selectedOutputId = null;
    }
    this.notifyListeners();
  }

  public setChannel(channel: number) {
    this.state.channel = Math.max(1, Math.min(16, channel));
    this.notifyListeners();
  }

  public setVelocity(velocity: number) {
    this.state.velocity = Math.max(1, Math.min(127, velocity));
    this.notifyListeners();
  }

  // Send Note On for chord with optional strum delay
  public sendChordNoteOn(midiNotes: number[], isStrum: boolean = false, velocity?: number, strumDelayMs: number = 35) {
    // Release active notes not in current chord
    this.stopNotesExcept(midiNotes);

    const sortedNotes = [...midiNotes].sort((a, b) => a - b);

    sortedNotes.forEach((note, index) => {
      const delayMs = isStrum ? index * strumDelayMs : 0;
      if (!this.activeMidiNotes.has(note)) {
        if (delayMs > 0) {
          setTimeout(() => {
            this.sendNoteOn(note, velocity);
          }, delayMs);
        } else {
          this.sendNoteOn(note, velocity);
        }
      }
    });
  }

  // Stop all active MIDI notes
  public sendAllNotesOff() {
    this.activeMidiNotes.forEach((note) => {
      this.sendNoteOff(note);
    });
    this.activeMidiNotes.clear();
  }

  // Send Sustain CC (CC#64)
  public sendSustainControl(isSustainOn: boolean) {
    if (!this.selectedOutput) return;

    const channelByte = 0xb0 | (this.state.channel - 1); // Control Change channel
    const ccNumber = 64; // Sustain pedal (Hold 1)
    const value = isSustainOn ? 127 : 0;

    try {
      this.selectedOutput.send([channelByte, ccNumber, value]);
      this.addLog(`CC#64 (Sustain): Val=${value} Ch=${this.state.channel}`);
    } catch (e: unknown) {
      console.error('MIDI CC send error:', e);
    }
  }

  private stopNotesExcept(keepNotes: number[]) {
    const keepSet = new Set(keepNotes);
    this.activeMidiNotes.forEach((note) => {
      if (!keepSet.has(note)) {
        this.sendNoteOff(note);
        this.activeMidiNotes.delete(note);
      }
    });
  }

  public sendNoteOn(midiNote: number, velocity?: number) {
    if (!this.selectedOutput) return;

    const vel = velocity !== undefined ? velocity : this.state.velocity;
    const channelByte = 0x90 | (this.state.channel - 1); // Note On channel

    try {
      this.selectedOutput.send([channelByte, midiNote, vel]);
      this.activeMidiNotes.add(midiNote);
      this.addLog(`Note On: Note=${midiNote} Vel=${vel} Ch=${this.state.channel}`);
    } catch (e: unknown) {
      console.error('MIDI Note On send error:', e);
    }
  }

  public sendNoteOff(midiNote: number) {
    if (!this.selectedOutput) return;

    const channelByte = 0x80 | (this.state.channel - 1); // Note Off channel

    try {
      this.selectedOutput.send([channelByte, midiNote, 0]);
      this.activeMidiNotes.delete(midiNote);
      this.addLog(`Note Off: Note=${midiNote} Ch=${this.state.channel}`);
    } catch (e: unknown) {
      console.error('MIDI Note Off send error:', e);
    }
  }

  private addLog(message: string) {
    const time = new Date().toLocaleTimeString('ja-JP', { hour12: false });
    const logEntry = `[${time}] ${message}`;
    this.state.log = [logEntry, ...this.state.log.slice(0, 49)];
    this.notifyListeners();
  }

  public subscribe(listener: (state: MidiState) => void) {
    this.stateChangeListeners.push(listener);
    listener(this.getState());
    return () => {
      this.stateChangeListeners = this.stateChangeListeners.filter((l) => l !== listener);
    };
  }

  public getState(): MidiState {
    return { ...this.state };
  }

  public clearLog() {
    this.state.log = [];
    this.notifyListeners();
  }

  private notifyListeners() {
    const currentState = this.getState();
    this.stateChangeListeners.forEach((listener) => listener(currentState));
  }
}

export const midiEngine = new MidiEngine();
