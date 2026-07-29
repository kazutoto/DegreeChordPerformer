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
import {
  AccidentalPreference,
  ActiveChord,
  DegreeInfo,
  NoteName,
  PitchClass,
  ScaleType,
  VoicingStyle,
} from '../types';

export const PITCH_NAMES_SHARP: NoteName[] = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

export const PITCH_NAMES_FLAT: NoteName[] = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
];

export const ALL_ROOT_KEYS: NoteName[] = [
  'C',
  'C#',
  'Db',
  'D',
  'D#',
  'Eb',
  'E',
  'F',
  'F#',
  'Gb',
  'G',
  'G#',
  'Ab',
  'A',
  'A#',
  'Bb',
  'B',
];

// Scale interval formulas in semitones
export const SCALE_INTERVALS: Record<ScaleType, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10], // natural minor
  harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
  melodic_minor: [0, 2, 3, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
};

export const SCALE_LABELS: Record<ScaleType, string> = {
  major: 'メジャー (Major / Ionian)',
  minor: 'ナチュラルマイナー (Natural Minor)',
  harmonic_minor: 'ハーモニックマイナー (Harmonic Minor)',
  melodic_minor: 'メロディックマイナー (Melodic Minor)',
  dorian: 'ドリアン (Dorian)',
  mixolydian: 'ミクソリディアン (Mixolydian)',
  lydian: 'リディアン (Lydian)',
  phrygian: 'フリジアン (Phrygian)',
};

// Base pitch lookup
export function noteToPitchClass(note: NoteName): PitchClass {
  const cleanNote = note.trim();
  switch (cleanNote) {
    case 'C':
      return 0;
    case 'C#':
    case 'Db':
      return 1;
    case 'D':
      return 2;
    case 'D#':
    case 'Eb':
      return 3;
    case 'E':
      return 4;
    case 'F':
      return 5;
    case 'F#':
    case 'Gb':
      return 6;
    case 'G':
      return 7;
    case 'G#':
    case 'Ab':
      return 8;
    case 'A':
      return 9;
    case 'A#':
    case 'Bb':
      return 10;
    case 'B':
      return 11;
    default:
      return 0;
  }
}

export function pitchClassToNoteName(
  pitchClass: number,
  accidentalPref: AccidentalPreference = 'sharp'
): NoteName {
  const norm = ((pitchClass % 12) + 12) % 12;
  return accidentalPref === 'flat' ? PITCH_NAMES_FLAT[norm] : PITCH_NAMES_SHARP[norm];
}

export function transposeKey(
  currentKey: NoteName,
  deltaSemitones: number,
  accidentalPref: AccidentalPreference = 'sharp'
): NoteName {
  const currentPitch = noteToPitchClass(currentKey);
  const newPitch = ((currentPitch + deltaSemitones) % 12 + 12) % 12;
  return pitchClassToNoteName(newPitch, accidentalPref);
}

// Convert MIDI pitch to Note Name (e.g., 60 -> C)
export function midiToNoteName(
  midiNote: number,
  accidentalPref: AccidentalPreference = 'sharp'
): NoteName {
  return pitchClassToNoteName(midiNote % 12, accidentalPref);
}

// Convert MIDI pitch to frequency (Hz)
export function midiToFrequency(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

// Roman numeral generator for scale degree
function getRomanNumeral(degree: number, quality: 'maj' | 'min' | 'dim' | 'aug'): string {
  const romanMaj = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  const romanMin = ['', 'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];
  switch (quality) {
    case 'maj':
      return romanMaj[degree] || `${degree}`;
    case 'min':
      return romanMin[degree] || `${degree}`;
    case 'dim':
      return `${romanMin[degree]}°`;
    case 'aug':
      return `${romanMaj[degree]}+`;
  }
}

// Determine triad intervals relative to degree root in scale
function analyzeTriadQuality(r: number, m3: number, m5: number): 'maj' | 'min' | 'dim' | 'aug' {
  const thirdInterval = (m3 - r + 12) % 12;
  const fifthInterval = (m5 - r + 12) % 12;

  if (thirdInterval === 4 && fifthInterval === 7) return 'maj';
  if (thirdInterval === 3 && fifthInterval === 7) return 'min';
  if (thirdInterval === 3 && fifthInterval === 6) return 'dim';
  if (thirdInterval === 4 && fifthInterval === 8) return 'aug';
  return 'maj';
}

// Get degree infos for a given Root Key and Scale
export function getDegreesForScale(
  keyRoot: NoteName,
  scaleType: ScaleType,
  accidentalPref: AccidentalPreference = 'sharp',
  hasSwapModifier: boolean = false,
  hasDimModifier: boolean = false,
  hasSus4Modifier: boolean = false,
  hasM7Modifier: boolean = false,
  hasAugModifier: boolean = false,
  hasFlatModifier: boolean = false,
  hasSixthModifier: boolean = false,
  hasHalfDimModifier: boolean = false
): DegreeInfo[] {
  let rootPitch = noteToPitchClass(keyRoot);
  if (hasFlatModifier) {
    rootPitch = (rootPitch + 11) % 12;
  }
  const scalePitches = SCALE_INTERVALS[scaleType].map((i) => (rootPitch + i) % 12);

  const result: DegreeInfo[] = [];

  for (let d = 1; d <= 7; d++) {
    const idx = d - 1;
    const degRootPitch = scalePitches[idx];
    let deg3rdPitch = scalePitches[(idx + 2) % 7];
    let deg5thPitch = scalePitches[(idx + 4) % 7];
    let deg7thPitch = scalePitches[(idx + 6) % 7];
    let deg9thPitch = scalePitches[(idx + 1) % 7];

    if (hasSixthModifier) {
      deg7thPitch = (degRootPitch + 9) % 12; // 長6度 (M6)
    } else if (hasM7Modifier) {
      deg7thPitch = (degRootPitch + 11) % 12; // 長7度 (M7)
    }

    if (hasSus4Modifier) {
      deg3rdPitch = (degRootPitch + 5) % 12; // 完全4度 (sus4)
    } else if (hasHalfDimModifier) {
      deg3rdPitch = (degRootPitch + 3) % 12;
      deg5thPitch = (degRootPitch + 6) % 12;
      deg7thPitch = (degRootPitch + 10) % 12; // 短7度 (m7(b5))
    } else if (hasDimModifier) {
      deg3rdPitch = (degRootPitch + 3) % 12;
      deg5thPitch = (degRootPitch + 6) % 12;
      deg7thPitch = (degRootPitch + 9) % 12;
    } else if (hasAugModifier) {
      deg3rdPitch = (degRootPitch + 4) % 12; // 長3度
      deg5thPitch = (degRootPitch + 8) % 12; // 増5度
    } else if (hasSwapModifier) {
      const thirdInterval = (deg3rdPitch - degRootPitch + 12) % 12;
      if (thirdInterval === 4) {
        deg3rdPitch = (deg3rdPitch - 1 + 12) % 12;
      } else if (thirdInterval === 3) {
        deg3rdPitch = (deg3rdPitch + 1) % 12;
      }
    }

    const quality = analyzeTriadQuality(degRootPitch, deg3rdPitch, deg5thPitch);
    let roman = getRomanNumeral(d, quality);
    if (hasHalfDimModifier) {
      roman = roman.replace('°', 'ø');
    }
    const rootName = pitchClassToNoteName(degRootPitch, accidentalPref);

    // Compute Chord Names
    const triadName = formatChordName(degRootPitch, deg3rdPitch, deg5thPitch, null, null, accidentalPref);
    const seventhName = formatChordName(degRootPitch, deg3rdPitch, deg5thPitch, deg7thPitch, null, accidentalPref);
    const ninthName = formatChordName(degRootPitch, deg3rdPitch, deg5thPitch, deg7thPitch, deg9thPitch, accidentalPref);

    result.push({
      degreeNumber: d,
      romanNumeral: roman,
      numPadKey: `${d}`,
      topRowKey: `${d}`,
      rootNote: rootName,
      triadChordName: triadName,
      seventhChordName: seventhName,
      ninthChordName: ninthName,
      triadQuality: quality,
    });
  }

  return result;
}

// Format detailed chord name with proper extensions (maj7, m7, dom7, m7b5, dim7, 9, maj9, m9, etc.)
export function formatChordName(
  rootP: number,
  thirdP: number,
  fifthP: number,
  seventhP: number | null,
  ninthP: number | null,
  accidentalPref: AccidentalPreference = 'sharp'
): string {
  const rootStr = pitchClassToNoteName(rootP, accidentalPref);

  const thirdInterval = (thirdP - rootP + 12) % 12;
  const fifthInterval = (fifthP - rootP + 12) % 12;

  // Triad base
  let isMin = thirdInterval === 3;
  let isMaj = thirdInterval === 4;
  let isDim = thirdInterval === 3 && fifthInterval === 6;
  let isAug = thirdInterval === 4 && fifthInterval === 8;
  let isSus4 = thirdInterval === 5;
  let isSus2 = thirdInterval === 2;

  if (!seventhP && !ninthP) {
    if (isDim) return `${rootStr}dim`;
    if (isAug) return `${rootStr}aug`;
    if (isMin) return `${rootStr}m`;
    if (isSus4) return `${rootStr}sus4`;
    if (isSus2) return `${rootStr}sus2`;
    return rootStr; // Major
  }

  // With 7th
  const seventhInterval = seventhP !== null ? (seventhP - rootP + 12) % 12 : null;
  const ninthInterval = ninthP !== null ? (ninthP - rootP + 12) % 12 : null;

  let baseChord: string = rootStr;

  if (seventhInterval !== null) {
    if (isSus4) {
      if (seventhInterval === 11) {
        baseChord = `${rootStr}maj7sus4`;
      } else if (seventhInterval === 10) {
        baseChord = `${rootStr}7sus4`;
      } else {
        baseChord = `${rootStr}7sus4`;
      }
    } else if (isDim) {
      if (seventhInterval === 9) {
        baseChord = `${rootStr}dim7`; // Fully diminished
      } else if (seventhInterval === 10) {
        baseChord = `${rootStr}m7♭5`; // Half-diminished
      } else {
        baseChord = `${rootStr}dim(7)`;
      }
    } else if (isMin) {
      if (seventhInterval === 11) {
        baseChord = `${rootStr}m(maj7)`;
      } else if (seventhInterval === 10) {
        baseChord = `${rootStr}m7`;
      } else if (seventhInterval === 9) {
        baseChord = `${rootStr}m6`;
      } else {
        baseChord = `${rootStr}m7`;
      }
    } else if (isMaj) {
      if (seventhInterval === 11) {
        baseChord = `${rootStr}maj7`;
      } else if (seventhInterval === 10) {
        baseChord = `${rootStr}7`; // Dominant 7th
      } else if (seventhInterval === 9) {
        baseChord = `${rootStr}6`;
      } else {
        baseChord = `${rootStr}7`;
      }
    } else if (isAug) {
      if (seventhInterval === 11) {
        baseChord = `${rootStr}aug(maj7)`;
      } else {
        baseChord = `${rootStr}aug7`;
      }
    }
  }

  if (ninthP !== null && ninthInterval !== null) {
    // Modify suffix for 9th
    if (ninthInterval === 2) { // Major 9th
      if (baseChord.endsWith('maj7')) {
        baseChord = baseChord.replace('maj7', 'maj9');
      } else if (baseChord.endsWith('m7')) {
        baseChord = baseChord.replace('m7', 'm9');
      } else if (baseChord.endsWith('7')) {
        baseChord = baseChord.replace(/7$/, '9');
      } else {
        baseChord = `${baseChord}(add9)`;
      }
    } else if (ninthInterval === 1) { // Minor 9th / b9
      baseChord = `${baseChord}(♭9)`;
    } else if (ninthInterval === 3) { // #9
      baseChord = `${baseChord}(♯9)`;
    }
  }

  return baseChord;
}

// Build exact MIDI note sequence for a chord given key, scale, degree, 7th/9th flags, octave offset & voicing
export function constructChordMidiNotes(
  keyRoot: NoteName,
  scaleType: ScaleType,
  degreeNumber: number, // 1 to 7
  hasSeventh: boolean,
  hasNinth: boolean,
  baseOctave: number = 3,
  inversion: number = 0,
  voicing: VoicingStyle = 'close',
  accidentalPref: AccidentalPreference = 'sharp',
  hasSwapModifier: boolean = false,
  hasDimModifier: boolean = false,
  hasSus4Modifier: boolean = false,
  hasM7Modifier: boolean = false,
  hasAugModifier: boolean = false,
  hasFlatModifier: boolean = false,
  hasSixthModifier: boolean = false,
  hasHalfDimModifier: boolean = false,
  customBassDegree?: number | null
): ActiveChord {
  const baseRootPitch = noteToPitchClass(keyRoot);
  let rootPitch = baseRootPitch;
  let midiOffset = 0;
  if (hasFlatModifier) {
    rootPitch = (rootPitch + 11) % 12;
    midiOffset = -1;
  }
  const scaleIntervals = SCALE_INTERVALS[scaleType];
  const scalePitches = scaleIntervals.map((i) => (rootPitch + i) % 12);

  const idx = (degreeNumber - 1) % 7;

  // Root pitch in MIDI number
  // C4 = 60
  const degRootPitchClass = scalePitches[idx];
  
  // Calculate relative semitones from scale root
  const rootIntervalFromKey = scaleIntervals[idx];
  let rootMidi = 12 * (baseOctave + 1) + baseRootPitch + midiOffset + rootIntervalFromKey;

  // Find 3rd, 5th, 7th, 9th in MIDI scale steps relative to root
  // We calculate exact octave jumps for scale steps
  const getMidiForScaleOffset = (stepOffset: number): number => {
    const targetIdx = idx + stepOffset;
    const octaveOffset = Math.floor(targetIdx / 7);
    const normalizedIdx = targetIdx % 7;
    const intervalFromKey = scaleIntervals[normalizedIdx];
    return 12 * (baseOctave + 1 + octaveOffset) + baseRootPitch + midiOffset + intervalFromKey;
  };

  const useSeventh = hasSeventh || hasNinth || hasM7Modifier || hasSixthModifier || hasHalfDimModifier;

  let thirdMidi = getMidiForScaleOffset(2);
  let fifthMidi = getMidiForScaleOffset(4);
  let seventhMidi = useSeventh ? getMidiForScaleOffset(6) : null;
  let ninthMidi = hasNinth ? getMidiForScaleOffset(8) : null;

  if (hasSus4Modifier) {
    thirdMidi = rootMidi + 5; // 完全4度 (sus4)
    fifthMidi = rootMidi + 7; // 完全5度
  } else if (hasHalfDimModifier) {
    thirdMidi = rootMidi + 3; // 短3度
    fifthMidi = rootMidi + 6; // 減5度
    if (useSeventh) {
      seventhMidi = rootMidi + 10; // 短7度 (m7(b5))
    }
  } else if (hasDimModifier) {
    thirdMidi = rootMidi + 3; // 短3度
    fifthMidi = rootMidi + 6; // 減5度
    if (useSeventh) {
      seventhMidi = rootMidi + 9; // 減7度 (dim7)
    }
  } else if (hasAugModifier) {
    thirdMidi = rootMidi + 4; // 長3度
    fifthMidi = rootMidi + 8; // 増5度
  } else if (hasSwapModifier) {
    const thirdInterval = ((thirdMidi - rootMidi) % 12 + 12) % 12;
    if (thirdInterval === 4) {
      thirdMidi -= 1; // Major -> Minor
    } else if (thirdInterval === 3) {
      thirdMidi += 1; // Minor -> Major
    }
  }

  if (hasSixthModifier) {
    seventhMidi = rootMidi + 9; // 長6度 (M6)
  } else if (hasM7Modifier) {
    seventhMidi = rootMidi + 11; // 長7度 (M7)
  }

  let rawNotes: number[] = [rootMidi, thirdMidi, fifthMidi];
  if (seventhMidi !== null) rawNotes.push(seventhMidi);
  if (ninthMidi !== null) rawNotes.push(ninthMidi);

  // Apply Voicing
  let voicedNotes = [...rawNotes];
  if (voicing === 'open') {
    // Raise 2nd note (3rd) or 3rd note (5th) by 1 octave
    if (voicedNotes.length >= 3) {
      voicedNotes[1] += 12;
    }
  } else if (voicing === 'drop2' && voicedNotes.length >= 4) {
    // Drop 2nd highest note down an octave
    voicedNotes.sort((a, b) => a - b);
    const secondHighestIdx = voicedNotes.length - 2;
    voicedNotes[secondHighestIdx] -= 12;
  }

  // Sort notes after voicing
  voicedNotes.sort((a, b) => a - b);

  // Apply Inversion (0: Root, 1: First, 2: Second, 3: Third)
  const actualInversion = inversion % voicedNotes.length;
  for (let i = 0; i < actualInversion; i++) {
    const lowestNote = voicedNotes.shift()!;
    voicedNotes.push(lowestNote + 12);
  }

  // Ensure notes are sorted
  voicedNotes.sort((a, b) => a - b);

  // Determine chord name & roman numeral
  const degInfos = getDegreesForScale(keyRoot, scaleType, accidentalPref, hasSwapModifier, hasDimModifier, hasSus4Modifier, hasM7Modifier, hasAugModifier, hasFlatModifier, hasSixthModifier, hasHalfDimModifier);
  const degInfo = degInfos[idx];

  let displayChordName = degInfo.triadChordName;
  if (hasNinth) {
    displayChordName = degInfo.ninthChordName;
  } else if (useSeventh) {
    displayChordName = degInfo.seventhChordName;
  }

  let displayDegreeRoman = degInfo.romanNumeral;

  // Custom Bass Degree (Slash chord)
  if (customBassDegree && customBassDegree >= 1 && customBassDegree <= 7) {
    const bassIdx = (customBassDegree - 1) % 7;
    const bassIntervalFromKey = scaleIntervals[bassIdx];
    let bassMidi = 12 * (baseOctave + 1) + baseRootPitch + midiOffset + bassIntervalFromKey;
    while (bassMidi >= voicedNotes[0]) {
      bassMidi -= 12;
    }
    while (bassMidi < 24) {
      bassMidi += 12;
    }
    voicedNotes.unshift(bassMidi);

    const bassPitchClass = scalePitches[bassIdx];
    const bassNoteName = pitchClassToNoteName(bassPitchClass, accidentalPref);

    if (customBassDegree !== degreeNumber) {
      displayChordName = `${displayChordName}/${bassNoteName}`;
      const bassRoman = getRomanNumeral(customBassDegree, 'maj');
      displayDegreeRoman = `${degInfo.romanNumeral}/${bassRoman}`;
    }
  } else if (actualInversion > 0) {
    // Add inversion suffix to chord name if applicable
    const bassNote = pitchClassToNoteName(voicedNotes[0] % 12, accidentalPref);
    displayChordName = `${displayChordName}/${bassNote}`;
  }

  // Get note names for UI
  const noteNames = voicedNotes.map((m) => midiToNoteName(m, accidentalPref));

  return {
    degreeNumber,
    degreeRoman: displayDegreeRoman,
    chordName: displayChordName,
    notes: noteNames,
    midiNotes: voicedNotes,
    hasSeventh: useSeventh,
    hasNinth,
    hasSwapModifier,
    hasDimModifier,
    hasAugModifier,
    hasSus4Modifier,
    hasM7Modifier,
    hasFlatModifier,
    hasSixthModifier,
    hasHalfDimModifier,
    bassDegreeNumber: customBassDegree,
    inversion: actualInversion,
  };
}
