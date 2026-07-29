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
export type NoteName = 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B';

export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type ScaleType =
  | 'major'
  | 'minor'
  | 'harmonic_minor'
  | 'melodic_minor'
  | 'dorian'
  | 'mixolydian'
  | 'lydian'
  | 'phrygian';

export type AccidentalPreference = 'sharp' | 'flat';

export type SoundPreset = 'piano' | 'epiano' | 'synth' | 'organ' | 'pad';

export type VoicingStyle = 'close' | 'open' | 'drop2';

export interface DegreeInfo {
  degreeNumber: number; // 1 to 7
  romanNumeral: string; // e.g. "I", "ii", "iii", "IV", "V", "vi", "vii°"
  numPadKey: string; // "1" to "7"
  topRowKey: string; // "1" to "7"
  rootNote: NoteName;
  triadChordName: string;
  seventhChordName: string;
  ninthChordName: string;
  triadQuality: 'maj' | 'min' | 'dim' | 'aug';
}

export interface ActiveChord {
  degreeNumber: number;
  degreeRoman: string;
  chordName: string;
  notes: NoteName[];
  midiNotes: number[]; // e.g. [60, 64, 67, 71]
  hasSeventh: boolean;
  hasNinth: boolean;
  hasSwapModifier?: boolean;
  hasDimModifier?: boolean;
  hasAugModifier?: boolean;
  hasSus4Modifier?: boolean;
  hasM7Modifier?: boolean;
  hasFlatModifier?: boolean;
  hasSixthModifier?: boolean;
  hasHalfDimModifier?: boolean;
  inversion: number; // 0: Root, 1: First, 2: Second, 3: Third
  slashBassDegree?: number | null; // Fractional chord bass note degree
}

export interface RecordedChord {
  id: string;
  timestamp: number;
  degreeRoman: string;
  chordName: string;
  notes: NoteName[];
  midiNotes: number[];
  durationMs?: number;
}

export interface MidiOutputDevice {
  id: string;
  name: string;
  manufacturer: string;
  state: string;
}

export interface MidiInputDevice {
  id: string;
  name: string;
  manufacturer: string;
  state: string;
}

export interface MidiState {
  isSupported: boolean;
  isEnabled: boolean;
  outputs: MidiOutputDevice[];
  inputs: MidiInputDevice[];
  selectedOutputId: string | 'none' | null;
  selectedInputId: string | 'all' | 'none';
  outputChannel: number; // 1-16
  inputChannel: number | 'all'; // 1-16 or 'all'
  velocity: number; // 1-127
  log: string[];
  error: string | null;
}
