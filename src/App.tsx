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
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AccidentalPreference,
  ActiveChord,
  MidiState,
  NoteName,
  RecordedChord,
  ScaleType,
  SoundPreset,
  VoicingStyle,
} from './types';
import { constructChordMidiNotes, transposeKey } from './lib/musicTheory';
import { synthEngine } from './lib/synthEngine';
import { midiEngine } from './lib/midiEngine';
import { Header } from './components/Header';
import { KeyScaleSelector } from './components/KeyScaleSelector';
import { ActiveChordDisplay } from './components/ActiveChordDisplay';
import { DegreeChordGrid } from './components/DegreeChordGrid';
import { PianoRollVisualizer } from './components/PianoRollVisualizer';
import { KeyboardGuide } from './components/KeyboardGuide';
import { ChordRecorder } from './components/ChordRecorder';
import { MidiSettingsModal } from './components/MidiSettingsModal';
import { HelpModal } from './components/HelpModal';

export default function App() {
  // Key & Scale Settings
  const [selectedKey, setSelectedKey] = useState<NoteName>('C');
  const [scaleType, setScaleType] = useState<ScaleType>('major');
  const [accidentalPref, setAccidentalPref] = useState<AccidentalPreference>('sharp');
  const [baseOctave, setBaseOctave] = useState<number>(3);
  const [voicingStyle, setVoicingStyle] = useState<VoicingStyle>('close');

  // Sound Engine
  const [soundPreset, setSoundPreset] = useState<SoundPreset>('piano');
  const [masterVolume, setMasterVolume] = useState<number>(0.8);

  // Left-Hand Modifiers State
  const [hasSeventhModifier, setHasSeventhModifier] = useState<boolean>(false);
  const [hasNinthModifier, setHasNinthModifier] = useState<boolean>(false);
  const [hasSwapModifier, setHasSwapModifier] = useState<boolean>(false);
  const [hasDimModifier, setHasDimModifier] = useState<boolean>(false);
  const [hasAugModifier, setHasAugModifier] = useState<boolean>(false);
  const [hasSus4Modifier, setHasSus4Modifier] = useState<boolean>(false);
  const [hasM7Modifier, setHasM7Modifier] = useState<boolean>(false);
  const [hasFlatModifier, setHasFlatModifier] = useState<boolean>(false);
  const [hasSixthModifier, setHasSixthModifier] = useState<boolean>(false);
  const [hasHalfDimModifier, setHasHalfDimModifier] = useState<boolean>(false);
  const [isStrumEnabled, setIsStrumEnabled] = useState<boolean>(false);
  const [inversion, setInversion] = useState<number>(0);
  const [sustainActive, setSustainActive] = useState<boolean>(false);

  // Active playing chord state
  const [activeDegreeNumber, setActiveDegreeNumber] = useState<number | null>(null);
  const [activeChord, setActiveChord] = useState<ActiveChord | null>(null);
  const [slashBassDegree, setSlashBassDegree] = useState<number | null>(null);

  // Recording State
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [recordedChords, setRecordedChords] = useState<RecordedChord[]>([]);
  const chordStartTimeRef = useRef<number | null>(null);

  const handleRemoveChord = useCallback((id: string) => {
    setRecordedChords((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Modals
  const [isMidiModalOpen, setIsMidiModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);

  // MIDI Engine state listener
  const [midiState, setMidiState] = useState<MidiState>(midiEngine.getState());

  const getAutoAccidentalPref = (key: NoteName, scale: ScaleType): AccidentalPreference => {
    if (key.includes('b')) return 'flat';
    if (key.includes('#')) return 'sharp';
    
    const isMinor = scale.includes('minor') || scale === 'dorian' || scale === 'phrygian';
    
    if (isMinor) {
      if (['D', 'G', 'C', 'F'].includes(key)) return 'flat';
    } else {
      if (['F'].includes(key)) return 'flat';
    }
    
    return 'sharp';
  };

  const handleKeyChange = (newKey: NoteName) => {
    setSelectedKey(newKey);
    setAccidentalPref(getAutoAccidentalPref(newKey, scaleType));
  };

  const handleScaleChange = (newScale: ScaleType) => {
    setScaleType(newScale);

    const isMinor = newScale.includes('minor') || newScale === 'dorian' || newScale === 'phrygian';
    const isMajor = newScale === 'major' || newScale === 'lydian' || newScale === 'mixolydian';

    let newKey = selectedKey;

    if (isMajor && (selectedKey === 'D#' || selectedKey === 'G#' || selectedKey === 'A#')) {
      newKey = selectedKey === 'D#' ? 'Eb' : selectedKey === 'G#' ? 'Ab' : 'Bb';
    } else if (isMinor && (selectedKey === 'Db' || selectedKey === 'Gb' || selectedKey === 'Ab' || selectedKey === 'A#')) {
      newKey = selectedKey === 'Db' ? 'C#' : selectedKey === 'Gb' ? 'F#' : selectedKey === 'Ab' ? 'G#' : 'Bb';
    }

    if (newKey !== selectedKey) {
      setSelectedKey(newKey);
    }
    
    setAccidentalPref(getAutoAccidentalPref(newKey, newScale));
  };

  useEffect(() => {
    const unsubscribe = midiEngine.subscribe((state) => {
      setMidiState(state);
    });
    return unsubscribe;
  }, []);

  // Update Synth Preset & Volume
  useEffect(() => {
    synthEngine.setPreset(soundPreset);
  }, [soundPreset]);

  useEffect(() => {
    synthEngine.setVolume(masterVolume);
  }, [masterVolume]);

  // Ref to hold current state values inside window keyboard listeners
  const stateRef = useRef({
    selectedKey,
    scaleType,
    accidentalPref,
    baseOctave,
    voicingStyle,
    hasSeventhModifier,
    hasNinthModifier,
    hasSwapModifier,
    hasDimModifier,
    hasAugModifier,
    hasSus4Modifier,
    hasM7Modifier,
    hasFlatModifier,
    hasSixthModifier,
    hasHalfDimModifier,
    isStrumEnabled,
    inversion,
    sustainActive,
    activeDegreeNumber,
    slashBassDegree,
    activeSlashBassKeys: [] as number[],
    isRecording,
  });

  useEffect(() => {
    stateRef.current = {
      ...stateRef.current,
      selectedKey,
      scaleType,
      accidentalPref,
      baseOctave,
      voicingStyle,
      hasSeventhModifier,
      hasNinthModifier,
      hasSwapModifier,
      hasDimModifier,
      hasAugModifier,
      hasSus4Modifier,
      hasM7Modifier,
      hasFlatModifier,
      hasSixthModifier,
      hasHalfDimModifier,
      isStrumEnabled,
      inversion,
      sustainActive,
      activeDegreeNumber,
      slashBassDegree,
      isRecording,
    };
  }, [
    selectedKey,
    scaleType,
    accidentalPref,
    baseOctave,
    voicingStyle,
    hasSeventhModifier,
    hasNinthModifier,
    hasSwapModifier,
    hasDimModifier,
    hasAugModifier,
    hasSus4Modifier,
    hasM7Modifier,
    hasFlatModifier,
    hasSixthModifier,
    hasHalfDimModifier,
    isStrumEnabled,
    inversion,
    sustainActive,
    activeDegreeNumber,
    slashBassDegree,
    isRecording,
  ]);

  // Core Play Chord Function
  const triggerPlayDegree = useCallback(
    (
      degreeNum: number,
      overrideSeven?: boolean,
      overrideNine?: boolean,
      overrideSwap?: boolean,
      overrideDim?: boolean,
      overrideSus4?: boolean,
      overrideM7?: boolean,
      overrideAug?: boolean,
      overrideFlat?: boolean,
      overrideSixth?: boolean,
      overrideHalfDim?: boolean,
      velocity?: number
    ) => {
      const s = stateRef.current;

      const useSeventh = overrideSeven !== undefined ? overrideSeven : s.hasSeventhModifier;
      const useNinth = overrideNine !== undefined ? overrideNine : s.hasNinthModifier;
      const useSwap = overrideSwap !== undefined ? overrideSwap : s.hasSwapModifier;
      const useDim = overrideDim !== undefined ? overrideDim : s.hasDimModifier;
      const useSus4 = overrideSus4 !== undefined ? overrideSus4 : s.hasSus4Modifier;
      const useM7 = overrideM7 !== undefined ? overrideM7 : s.hasM7Modifier;
      const useAug = overrideAug !== undefined ? overrideAug : s.hasAugModifier;
      const useFlat = overrideFlat !== undefined ? overrideFlat : s.hasFlatModifier;
      const useSixth = overrideSixth !== undefined ? overrideSixth : s.hasSixthModifier;
      const useHalfDim = overrideHalfDim !== undefined ? overrideHalfDim : s.hasHalfDimModifier;
      
      const playVelocity = velocity !== undefined ? velocity : midiEngine.getState().velocity;

      const chord = constructChordMidiNotes(
        s.selectedKey,
        s.scaleType,
        degreeNum,
        useSeventh,
        useNinth,
        s.baseOctave,
        s.inversion,
        s.voicingStyle,
        s.accidentalPref,
        useSwap,
        useDim,
        useSus4,
        useM7,
        useAug,
        useFlat,
        useSixth,
        useHalfDim,
        s.slashBassDegree
      );

      setActiveDegreeNumber(degreeNum);
      setActiveChord(chord);

      // Immediately update ref to prevent race condition during rapid key mash
      s.activeDegreeNumber = degreeNum;

      // Play Sound & Send MIDI with Strum option
      const midiOutId = midiEngine.getState().selectedOutputId;
      const isMidiActive = midiOutId && midiOutId !== 'none';
      
      if (!isMidiActive) {
        synthEngine.playChord(chord.midiNotes, s.isStrumEnabled, playVelocity, 35);
      }
      midiEngine.sendChordNoteOn(chord.midiNotes, s.isStrumEnabled, playVelocity, 35);

      chordStartTimeRef.current = Date.now();

      // Record if enabled
      if (s.isRecording) {
        const newRecorded: RecordedChord = {
          id: `${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          degreeRoman: chord.degreeRoman,
          chordName: chord.chordName,
          notes: chord.notes,
          midiNotes: chord.midiNotes,
        };
        setRecordedChords((prev) => [...prev, newRecorded]);
      }
    },
    []
  );

  // Core Stop Chord Function
  const triggerStopChord = useCallback(() => {
    setActiveDegreeNumber(null);
    stateRef.current.activeDegreeNumber = null;
    synthEngine.stopAllNotes();
    midiEngine.sendAllNotesOff();

    // Update duration on recorded chord
    if (chordStartTimeRef.current) {
      const duration = Date.now() - chordStartTimeRef.current;
      setRecordedChords((prev) => {
        if (prev.length === 0) return prev;
        const copy = [...prev];
        const lastIdx = copy.length - 1;
        copy[lastIdx] = { ...copy[lastIdx], durationMs: duration };
        return copy;
      });
      chordStartTimeRef.current = null;
    }
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const activeKeysSet = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore typing inside input/select fields
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'select' || targetTag === 'textarea') {
        return;
      }

      // Ignore if Meta (Command) is pressed, to allow OS/browser shortcuts
      if (e.metaKey) {
        return;
      }

      if (e.repeat) return; // Ignore key repeat to prevent re-triggering audio stutter

      const code = e.code;
      const key = e.key;

      if (code === 'Escape') {
        resetKeys();
        return;
      }

      if (e.altKey || code === 'AltLeft' || code === 'AltRight' || key === 'Alt') {
        e.preventDefault(); // Prevent browser shortcuts
        if (!stateRef.current.hasFlatModifier) {
          setHasFlatModifier(true);
          activeKeysSet.add('Alt');
          if (stateRef.current.activeDegreeNumber !== null) {
            triggerPlayDegree(
              stateRef.current.activeDegreeNumber,
              stateRef.current.hasSeventhModifier,
              stateRef.current.hasNinthModifier,
              stateRef.current.hasSwapModifier,
              stateRef.current.hasDimModifier,
              stateRef.current.hasSus4Modifier,
              stateRef.current.hasM7Modifier,
              stateRef.current.hasAugModifier,
              true
            );
          }
        }
        if (code === 'AltLeft' || code === 'AltRight' || key === 'Alt') {
          return;
        }
      }

      // Handle Left-Hand Modifiers (Z, X)
      if (code === 'KeyZ' || key === 'z' || key === 'Z') {
        setHasNinthModifier(true);
        activeKeysSet.add('Z');
        // If chord currently sounding, update with 9th
        if (stateRef.current.activeDegreeNumber !== null) {
          triggerPlayDegree(
            stateRef.current.activeDegreeNumber,
            stateRef.current.hasSeventhModifier,
            true,
            stateRef.current.hasSwapModifier
          );
        }
        return;
      }

      if (code === 'KeyX' || key === 'x' || key === 'X') {
        setHasSeventhModifier(true);
        activeKeysSet.add('X');
        // If chord currently sounding, update with 7th
        if (stateRef.current.activeDegreeNumber !== null) {
          triggerPlayDegree(
            stateRef.current.activeDegreeNumber,
            true,
            stateRef.current.hasNinthModifier,
            stateRef.current.hasSwapModifier
          );
        }
        return;
      }

      if (
        e.ctrlKey ||
        code === 'ControlLeft' ||
        code === 'ControlRight' ||
        key === 'Control' ||
        code === 'Numpad0' ||
        code === 'Digit0' ||
        key === '0'
      ) {
        if (code === 'ControlLeft' || code === 'ControlRight' || key === 'Control') {
          e.preventDefault();
        }
        if (!stateRef.current.hasSwapModifier) {
          setHasSwapModifier(true);
          activeKeysSet.add('Swap');
          // If chord currently sounding, update with Major/Minor Swap
          if (stateRef.current.activeDegreeNumber !== null) {
            triggerPlayDegree(
              stateRef.current.activeDegreeNumber,
              stateRef.current.hasSeventhModifier,
              stateRef.current.hasNinthModifier,
              true,
              stateRef.current.hasDimModifier
            );
          }
        }
        if (code === 'ControlLeft' || code === 'ControlRight' || key === 'Control' || code === 'Numpad0' || code === 'Digit0' || key === '0') {
          return;
        }
      }

      if (code === 'KeyD' || key === 'd' || key === 'D') {
        setHasDimModifier(true);
        activeKeysSet.add('D');
        // If chord currently sounding, update with Diminished
        if (stateRef.current.activeDegreeNumber !== null) {
          triggerPlayDegree(
            stateRef.current.activeDegreeNumber,
            stateRef.current.hasSeventhModifier,
            stateRef.current.hasNinthModifier,
            stateRef.current.hasSwapModifier,
            true,
            stateRef.current.hasSus4Modifier,
            stateRef.current.hasM7Modifier
          );
        }
        return;
      }

      if (code === 'KeyA' || key === 'a' || key === 'A') {
        setHasAugModifier(true);
        activeKeysSet.add('A');
        // If chord currently sounding, update with Augmented
        if (stateRef.current.activeDegreeNumber !== null) {
          triggerPlayDegree(
            stateRef.current.activeDegreeNumber,
            stateRef.current.hasSeventhModifier,
            stateRef.current.hasNinthModifier,
            stateRef.current.hasSwapModifier,
            stateRef.current.hasDimModifier,
            stateRef.current.hasSus4Modifier,
            stateRef.current.hasM7Modifier,
            true
          );
        }
        return;
      }

      if (code === 'KeyS' || key === 's' || key === 'S') {
        setHasSus4Modifier(true);
        activeKeysSet.add('S');
        // If chord currently sounding, update with sus4
        if (stateRef.current.activeDegreeNumber !== null) {
          triggerPlayDegree(
            stateRef.current.activeDegreeNumber,
            stateRef.current.hasSeventhModifier,
            stateRef.current.hasNinthModifier,
            stateRef.current.hasSwapModifier,
            stateRef.current.hasDimModifier,
            true,
            stateRef.current.hasM7Modifier
          );
        }
        return;
      }

      if (code === 'KeyC' || key === 'c' || key === 'C') {
        setHasM7Modifier(true);
        activeKeysSet.add('C');
        // If chord currently sounding, update with M7
        if (stateRef.current.activeDegreeNumber !== null) {
          triggerPlayDegree(
            stateRef.current.activeDegreeNumber,
            stateRef.current.hasSeventhModifier,
            stateRef.current.hasNinthModifier,
            stateRef.current.hasSwapModifier,
            stateRef.current.hasDimModifier,
            stateRef.current.hasSus4Modifier,
            true
          );
        }
        return;
      }

      if (code === 'KeyV' || key === 'v' || key === 'V') {
        setHasSixthModifier(true);
        activeKeysSet.add('V');
        // If chord currently sounding, update with 6th
        if (stateRef.current.activeDegreeNumber !== null) {
          triggerPlayDegree(
            stateRef.current.activeDegreeNumber,
            stateRef.current.hasSeventhModifier,
            stateRef.current.hasNinthModifier,
            stateRef.current.hasSwapModifier,
            stateRef.current.hasDimModifier,
            stateRef.current.hasSus4Modifier,
            stateRef.current.hasM7Modifier,
            stateRef.current.hasAugModifier,
            stateRef.current.hasFlatModifier,
            true
          );
        }
        return;
      }

      if (code === 'KeyF' || key === 'f' || key === 'F') {
        setHasHalfDimModifier(true);
        activeKeysSet.add('F');
        // If chord currently sounding, update with m7(b5)
        if (stateRef.current.activeDegreeNumber !== null) {
          triggerPlayDegree(
            stateRef.current.activeDegreeNumber,
            stateRef.current.hasSeventhModifier,
            stateRef.current.hasNinthModifier,
            stateRef.current.hasSwapModifier,
            stateRef.current.hasDimModifier,
            stateRef.current.hasSus4Modifier,
            stateRef.current.hasM7Modifier,
            stateRef.current.hasAugModifier,
            stateRef.current.hasFlatModifier,
            stateRef.current.hasSixthModifier,
            true
          );
        }
        return;
      }

      // Handle W key for Strum (arpeggiated guitar strumming) toggle
      if (code === 'KeyW' || key === 'w' || key === 'W') {
        setIsStrumEnabled((prev) => !prev);
        return;
      }

      // Handle Q key to clear chord history
      if (code === 'KeyQ' || key === 'q' || key === 'Q') {
        setRecordedChords([]);
        return;
      }

      // Handle E key for Inversion Cycle
      if (code === 'KeyE' || key === 'e' || key === 'E') {
        setInversion((prev) => (prev + 1) % 4);
        return;
      }

      // Handle + / - keys (Numpad or Keyboard) for Key Semitone Down/Up
      if (code === 'NumpadSubtract' || code === 'Minus' || key === '-') {
        setSelectedKey((prev) => transposeKey(prev, -1, stateRef.current.accidentalPref));
        return;
      }
      if (code === 'NumpadAdd' || code === 'Equal' || key === '+' || key === ';') {
        setSelectedKey((prev) => transposeKey(prev, 1, stateRef.current.accidentalPref));
        return;
      }

      // Handle * / / keys (Numpad or Keyboard) for Key 5 Semitones Down/Up
      if (code === 'NumpadMultiply' || key === '*') {
        setSelectedKey((prev) => transposeKey(prev, 5, stateRef.current.accidentalPref));
        return;
      }
      if (code === 'NumpadDivide' || key === '/') {
        setSelectedKey((prev) => transposeKey(prev, -5, stateRef.current.accidentalPref));
        return;
      }

      // Handle Space for Sustain (CC#64)
      if (code === 'Space') {
        e.preventDefault();
        const newState = !stateRef.current.sustainActive;
        setSustainActive(newState);
        synthEngine.setSustain(newState);
        midiEngine.sendSustainControl(newState);
        return;
      }

      // Slash chord bass (Top-row 1-7)
      if (code.startsWith('Digit') && code !== 'Digit0') {
        const num = parseInt(code.replace('Digit', ''), 10);
        if (num >= 1 && num <= 7) {
          e.preventDefault();
          if (!stateRef.current.activeSlashBassKeys.includes(num)) {
            stateRef.current.activeSlashBassKeys.push(num);
          }
          const currentBass = stateRef.current.activeSlashBassKeys[stateRef.current.activeSlashBassKeys.length - 1];
          setSlashBassDegree(currentBass);
          stateRef.current.slashBassDegree = currentBass; // Synchronous update
          // If a chord is already playing, update it immediately with the new bass note
          if (stateRef.current.activeDegreeNumber !== null) {
            triggerPlayDegree(stateRef.current.activeDegreeNumber);
          }
          return;
        }
      }

      // Degree keys: Numpad 1-7
      let degreeToPlay: number | null = null;

      if (code.startsWith('Numpad') && code !== 'Numpad0') {
        const num = parseInt(code.replace('Numpad', ''), 10);
        if (num >= 1 && num <= 7) degreeToPlay = num;
      }

      if (degreeToPlay !== null) {
        e.preventDefault();
        triggerPlayDegree(degreeToPlay);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      const key = e.key;

      if (code === 'AltLeft' || code === 'AltRight' || key === 'Alt') {
        setHasFlatModifier(false);
        activeKeysSet.delete('Alt');
        if (stateRef.current.activeDegreeNumber !== null) {
          triggerPlayDegree(
            stateRef.current.activeDegreeNumber,
            stateRef.current.hasSeventhModifier,
            stateRef.current.hasNinthModifier,
            stateRef.current.hasSwapModifier,
            stateRef.current.hasDimModifier,
            stateRef.current.hasSus4Modifier,
            stateRef.current.hasM7Modifier,
            stateRef.current.hasAugModifier,
            false
          );
        }
        return;
      }

      if (code === 'KeyZ' || key === 'z' || key === 'Z') {
        setHasNinthModifier(false);
        activeKeysSet.delete('Z');
        if (stateRef.current.activeDegreeNumber !== null) {
          triggerPlayDegree(
            stateRef.current.activeDegreeNumber,
            stateRef.current.hasSeventhModifier,
            false,
            stateRef.current.hasSwapModifier
          );
        }
        return;
      }

      if (code === 'KeyX' || key === 'x' || key === 'X') {
        setHasSeventhModifier(false);
        activeKeysSet.delete('X');
        if (stateRef.current.activeDegreeNumber !== null) {
          triggerPlayDegree(
            stateRef.current.activeDegreeNumber,
            false,
            stateRef.current.hasNinthModifier,
            stateRef.current.hasSwapModifier
          );
        }
        return;
      }

      if (
        code === 'ControlLeft' ||
        code === 'ControlRight' ||
        key === 'Control' ||
        code === 'Numpad0' ||
        code === 'Digit0' ||
        key === '0'
      ) {
        setHasSwapModifier(false);
        activeKeysSet.delete('Swap');
        if (stateRef.current.activeDegreeNumber !== null) {
          triggerPlayDegree(
            stateRef.current.activeDegreeNumber,
            stateRef.current.hasSeventhModifier,
            stateRef.current.hasNinthModifier,
            false,
            stateRef.current.hasDimModifier
          );
        }
        return;
      }

      if (code === 'KeyD' || key === 'd' || key === 'D') {
        setHasDimModifier(false);
        activeKeysSet.delete('D');
        if (stateRef.current.activeDegreeNumber !== null) {
          triggerPlayDegree(
            stateRef.current.activeDegreeNumber,
            stateRef.current.hasSeventhModifier,
            stateRef.current.hasNinthModifier,
            stateRef.current.hasSwapModifier,
            false,
            stateRef.current.hasSus4Modifier,
            stateRef.current.hasM7Modifier,
            stateRef.current.hasAugModifier
          );
        }
        return;
      }

      if (code === 'KeyA' || key === 'a' || key === 'A') {
        setHasAugModifier(false);
        activeKeysSet.delete('A');
        if (stateRef.current.activeDegreeNumber !== null) {
          triggerPlayDegree(
            stateRef.current.activeDegreeNumber,
            stateRef.current.hasSeventhModifier,
            stateRef.current.hasNinthModifier,
            stateRef.current.hasSwapModifier,
            stateRef.current.hasDimModifier,
            stateRef.current.hasSus4Modifier,
            stateRef.current.hasM7Modifier,
            false
          );
        }
        return;
      }

      if (code === 'KeyS' || key === 's' || key === 'S') {
        setHasSus4Modifier(false);
        activeKeysSet.delete('S');
        if (stateRef.current.activeDegreeNumber !== null) {
          triggerPlayDegree(
            stateRef.current.activeDegreeNumber,
            stateRef.current.hasSeventhModifier,
            stateRef.current.hasNinthModifier,
            stateRef.current.hasSwapModifier,
            stateRef.current.hasDimModifier,
            false,
            stateRef.current.hasM7Modifier
          );
        }
        return;
      }

      if (code === 'KeyC' || key === 'c' || key === 'C') {
        setHasM7Modifier(false);
        activeKeysSet.delete('C');
        if (stateRef.current.activeDegreeNumber !== null) {
          triggerPlayDegree(
            stateRef.current.activeDegreeNumber,
            stateRef.current.hasSeventhModifier,
            stateRef.current.hasNinthModifier,
            stateRef.current.hasSwapModifier,
            stateRef.current.hasDimModifier,
            stateRef.current.hasSus4Modifier,
            false
          );
        }
        return;
      }

      if (code === 'KeyV' || key === 'v' || key === 'V') {
        setHasSixthModifier(false);
        activeKeysSet.delete('V');
        if (stateRef.current.activeDegreeNumber !== null) {
          triggerPlayDegree(
            stateRef.current.activeDegreeNumber,
            stateRef.current.hasSeventhModifier,
            stateRef.current.hasNinthModifier,
            stateRef.current.hasSwapModifier,
            stateRef.current.hasDimModifier,
            stateRef.current.hasSus4Modifier,
            stateRef.current.hasM7Modifier,
            stateRef.current.hasAugModifier,
            stateRef.current.hasFlatModifier,
            false
          );
        }
        return;
      }

      if (code === 'KeyF' || key === 'f' || key === 'F') {
        setHasHalfDimModifier(false);
        activeKeysSet.delete('F');
        if (stateRef.current.activeDegreeNumber !== null) {
          triggerPlayDegree(
            stateRef.current.activeDegreeNumber,
            stateRef.current.hasSeventhModifier,
            stateRef.current.hasNinthModifier,
            stateRef.current.hasSwapModifier,
            stateRef.current.hasDimModifier,
            stateRef.current.hasSus4Modifier,
            stateRef.current.hasM7Modifier,
            stateRef.current.hasAugModifier,
            stateRef.current.hasFlatModifier,
            stateRef.current.hasSixthModifier,
            false
          );
        }
        return;
      }

      // We no longer handle Space keyup for sustain because it's a toggle now

      // Slash bass release
      if (code.startsWith('Digit') && code !== 'Digit0') {
        const num = parseInt(code.replace('Digit', ''), 10);
        if (num >= 1 && num <= 7) {
          stateRef.current.activeSlashBassKeys = stateRef.current.activeSlashBassKeys.filter((k) => k !== num);
          const newBass =
            stateRef.current.activeSlashBassKeys.length > 0
              ? stateRef.current.activeSlashBassKeys[stateRef.current.activeSlashBassKeys.length - 1]
              : null;
              
          if (stateRef.current.slashBassDegree !== newBass) {
            setSlashBassDegree(newBass);
            stateRef.current.slashBassDegree = newBass; // Synchronous update
            // If chord is playing, update it
            if (stateRef.current.activeDegreeNumber !== null) {
              triggerPlayDegree(stateRef.current.activeDegreeNumber);
            }
          }
        }
        return;
      }

      // Degree key release (Numpad)
      let degreeReleased: number | null = null;
      if (code.startsWith('Numpad')) {
        const num = parseInt(code.replace('Numpad', ''), 10);
        if (num >= 1 && num <= 7) degreeReleased = num;
      }

      if (degreeReleased !== null && stateRef.current.activeDegreeNumber === degreeReleased) {
        triggerStopChord();
      }
    };

    const resetKeys = () => {
      setSlashBassDegree(null);
      stateRef.current.slashBassDegree = null;
      stateRef.current.activeSlashBassKeys = [];
      activeKeysSet.clear();

      setHasSeventhModifier(false);
      stateRef.current.hasSeventhModifier = false;
      setHasNinthModifier(false);
      stateRef.current.hasNinthModifier = false;
      setHasSwapModifier(false);
      stateRef.current.hasSwapModifier = false;
      setHasDimModifier(false);
      stateRef.current.hasDimModifier = false;
      setHasSus4Modifier(false);
      stateRef.current.hasSus4Modifier = false;
      setHasM7Modifier(false);
      stateRef.current.hasM7Modifier = false;
      setHasAugModifier(false);
      stateRef.current.hasAugModifier = false;
      setHasFlatModifier(false);
      stateRef.current.hasFlatModifier = false;
      setHasSixthModifier(false);
      stateRef.current.hasSixthModifier = false;
      setHasHalfDimModifier(false);
      stateRef.current.hasHalfDimModifier = false;

      triggerStopChord();
    };

    const focusIntervalId = setInterval(() => {
      if (!document.hasFocus()) {
        resetKeys();
      }
    }, 500);

    // Mouse enter can detect returning from Mission Control (window scales back up under cursor)
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', resetKeys);
    window.addEventListener('focus', resetKeys);
    document.addEventListener('visibilitychange', resetKeys);

    return () => {
      clearInterval(focusIntervalId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', resetKeys);
      window.removeEventListener('focus', resetKeys);
      document.removeEventListener('visibilitychange', resetKeys);
    };
  }, [triggerPlayDegree, triggerStopChord]);

  // Handle incoming MIDI messages from MIDI pads
  useEffect(() => {
    const handleMidiInput = (event: any) => {
      const [status, data1, data2] = event.data;
      const cmd = status >> 4;
      
      // We only care about Note On (9) and Note Off (8)
      if (cmd === 9 || cmd === 8) {
        const velocity = data2;
        const note = data1;
        const isNoteOn = cmd === 9 && velocity > 0;
        
        let degreeNumber: number | null = null;
        switch (note) {
          case 36: degreeNumber = 1; break; // C2
          case 37: degreeNumber = 2; break; // C#2
          case 38: degreeNumber = 3; break; // D2
          case 40: degreeNumber = 4; break; // E2
          case 41: degreeNumber = 5; break; // F2
          case 42: degreeNumber = 6; break; // F#2
          case 44: degreeNumber = 7; break; // G#2
        }

        if (degreeNumber !== null) {
          if (isNoteOn) {
            triggerPlayDegree(
              degreeNumber,
              stateRef.current.hasSeventhModifier,
              stateRef.current.hasNinthModifier,
              stateRef.current.hasSwapModifier,
              stateRef.current.hasDimModifier,
              stateRef.current.hasSus4Modifier,
              stateRef.current.hasM7Modifier,
              stateRef.current.hasAugModifier,
              stateRef.current.hasFlatModifier,
              stateRef.current.hasSixthModifier,
              stateRef.current.hasHalfDimModifier,
              velocity
            );
          } else {
            // Note off
            if (stateRef.current.activeDegreeNumber === degreeNumber) {
              triggerStopChord();
            }
          }
        }
      }
    };

    const unsubscribe = midiEngine.subscribeMidiMessage(handleMidiInput);
    return () => {
      unsubscribe();
    };
  }, [triggerPlayDegree, triggerStopChord]);

  // Single Note Preview on Piano Roll
  const handlePianoNotePreview = (midiNote: number) => {
    const midiOutId = midiEngine.getState().selectedOutputId;
    const isMidiActive = midiOutId && midiOutId !== 'none';
    if (!isMidiActive) {
      synthEngine.playNote(midiNote);
    }
    midiEngine.sendNoteOn(midiNote);
    setTimeout(() => {
      midiEngine.sendNoteOff(midiNote);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header Bar */}
      <Header
        volume={masterVolume}
        onVolumeChange={setMasterVolume}
        preset={soundPreset}
        onPresetChange={setSoundPreset}
        isStrumEnabled={isStrumEnabled}
        onToggleStrum={() => setIsStrumEnabled(!isStrumEnabled)}
        midiState={midiState}
        onOpenMidiModal={() => setIsMidiModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-5 space-y-4">
        {/* Top & Middle Section: 2 Column Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Left Column (5/12): リアルタイム演奏状態 & キー・スケール・ボイシング設定 (統合ブロック) */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md flex flex-col justify-between gap-3">
            {/* 1. リアルタイム演奏の状態 */}
            <ActiveChordDisplay
              activeChord={activeChord}
              hasSeventhModifier={hasSeventhModifier}
              hasNinthModifier={hasNinthModifier}
              hasSwapModifier={hasSwapModifier}
              hasDimModifier={hasDimModifier}
              hasAugModifier={hasAugModifier}
              hasSus4Modifier={hasSus4Modifier}
              hasM7Modifier={hasM7Modifier}
              hasFlatModifier={hasFlatModifier}
              hasSixthModifier={hasSixthModifier}
              hasHalfDimModifier={hasHalfDimModifier}
              onToggleSeventh={() => {
                const nextVal = !hasSeventhModifier;
                setHasSeventhModifier(nextVal);
                if (activeDegreeNumber !== null) {
                  triggerPlayDegree(activeDegreeNumber, nextVal, hasNinthModifier, hasSwapModifier, hasDimModifier, hasSus4Modifier, hasM7Modifier, hasAugModifier, hasFlatModifier, hasSixthModifier, hasHalfDimModifier);
                }
              }}
              onToggleNinth={() => {
                const nextVal = !hasNinthModifier;
                setHasNinthModifier(nextVal);
                if (activeDegreeNumber !== null) {
                  triggerPlayDegree(activeDegreeNumber, hasSeventhModifier, nextVal, hasSwapModifier, hasDimModifier, hasSus4Modifier, hasM7Modifier, hasAugModifier, hasFlatModifier, hasSixthModifier, hasHalfDimModifier);
                }
              }}
              onToggleSwap={() => {
                const nextVal = !hasSwapModifier;
                setHasSwapModifier(nextVal);
                if (activeDegreeNumber !== null) {
                  triggerPlayDegree(activeDegreeNumber, hasSeventhModifier, hasNinthModifier, nextVal, hasDimModifier, hasSus4Modifier, hasM7Modifier, hasAugModifier, hasFlatModifier, hasSixthModifier, hasHalfDimModifier);
                }
              }}
              onToggleDim={() => {
                const nextVal = !hasDimModifier;
                setHasDimModifier(nextVal);
                if (activeDegreeNumber !== null) {
                  triggerPlayDegree(activeDegreeNumber, hasSeventhModifier, hasNinthModifier, hasSwapModifier, nextVal, hasSus4Modifier, hasM7Modifier, hasAugModifier, hasFlatModifier, hasSixthModifier, hasHalfDimModifier);
                }
              }}
              onToggleAug={() => {
                const nextVal = !hasAugModifier;
                setHasAugModifier(nextVal);
                if (activeDegreeNumber !== null) {
                  triggerPlayDegree(activeDegreeNumber, hasSeventhModifier, hasNinthModifier, hasSwapModifier, hasDimModifier, hasSus4Modifier, hasM7Modifier, nextVal, hasFlatModifier, hasSixthModifier, hasHalfDimModifier);
                }
              }}
              onToggleSus4={() => {
                const nextVal = !hasSus4Modifier;
                setHasSus4Modifier(nextVal);
                if (activeDegreeNumber !== null) {
                  triggerPlayDegree(activeDegreeNumber, hasSeventhModifier, hasNinthModifier, hasSwapModifier, hasDimModifier, nextVal, hasM7Modifier, hasAugModifier, hasFlatModifier, hasSixthModifier, hasHalfDimModifier);
                }
              }}
              onToggleM7={() => {
                const nextVal = !hasM7Modifier;
                setHasM7Modifier(nextVal);
                if (activeDegreeNumber !== null) {
                  triggerPlayDegree(activeDegreeNumber, hasSeventhModifier, hasNinthModifier, hasSwapModifier, hasDimModifier, hasSus4Modifier, nextVal, hasAugModifier, hasFlatModifier, hasSixthModifier, hasHalfDimModifier);
                }
              }}
              onToggleSixth={() => {
                const nextVal = !hasSixthModifier;
                setHasSixthModifier(nextVal);
                if (activeDegreeNumber !== null) {
                  triggerPlayDegree(activeDegreeNumber, hasSeventhModifier, hasNinthModifier, hasSwapModifier, hasDimModifier, hasSus4Modifier, hasM7Modifier, hasAugModifier, hasFlatModifier, nextVal, hasHalfDimModifier);
                }
              }}
              onToggleHalfDim={() => {
                const nextVal = !hasHalfDimModifier;
                setHasHalfDimModifier(nextVal);
                if (activeDegreeNumber !== null) {
                  triggerPlayDegree(activeDegreeNumber, hasSeventhModifier, hasNinthModifier, hasSwapModifier, hasDimModifier, hasSus4Modifier, hasM7Modifier, hasAugModifier, hasFlatModifier, hasSixthModifier, nextVal);
                }
              }}
              inversion={inversion}
              onCycleInversion={() => {
                const nextInv = (inversion + 1) % 4;
                setInversion(nextInv);
                if (activeDegreeNumber !== null) {
                  triggerPlayDegree(activeDegreeNumber);
                }
              }}
              sustainActive={sustainActive}
            />

            {/* 区切り線 & キー・スケール・ボイシング設定 */}
            <div className="border-t border-slate-800/80 pt-3">
              <KeyScaleSelector
                selectedKey={selectedKey}
                onKeyChange={handleKeyChange}
                scaleType={scaleType}
                onScaleChange={handleScaleChange}
                accidentalPref={accidentalPref}
                onAccidentalChange={setAccidentalPref}
                baseOctave={baseOctave}
                onOctaveChange={setBaseOctave}
                voicingStyle={voicingStyle}
                onVoicingChange={setVoicingStyle}
              />
            </div>
          </div>

          {/* Right Column (7/12): テンキー配列のコードPAD */}
          <div className="lg:col-span-7 flex flex-col">
            <DegreeChordGrid
              selectedKey={selectedKey}
              scaleType={scaleType}
              accidentalPref={accidentalPref}
              activeDegreeNumber={activeDegreeNumber}
              hasSeventhModifier={hasSeventhModifier}
              hasNinthModifier={hasNinthModifier}
              hasSwapModifier={hasSwapModifier}
              hasDimModifier={hasDimModifier}
              hasAugModifier={hasAugModifier}
              hasSus4Modifier={hasSus4Modifier}
              hasM7Modifier={hasM7Modifier}
              hasFlatModifier={hasFlatModifier}
              hasSixthModifier={hasSixthModifier}
              hasHalfDimModifier={hasHalfDimModifier}
              slashBassDegree={slashBassDegree}
              onPlayDegreeStart={(degNum) => triggerPlayDegree(degNum)}
              onPlayDegreeEnd={() => triggerStopChord()}
            />
          </div>
        </div>

        {/* Chord Progression Section */}
        <div className="w-full">
          <ChordRecorder
            recordedChords={recordedChords}
            onClearHistory={() => setRecordedChords([])}
            onRemoveChord={handleRemoveChord}
            isRecording={isRecording}
            onToggleRecording={() => setIsRecording(!isRecording)}
            selectedKey={selectedKey}
            scaleType={scaleType}
          />
        </div>

        {/* Bottom Section: リアルタイム・ピアノ鍵盤ビジュアル & キーボードガイド */}
        <div className="space-y-4">
          <PianoRollVisualizer
            activeChord={activeChord}
            accidentalPref={accidentalPref}
            onPlayNote={handlePianoNotePreview}
          />
          <KeyboardGuide />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          Degree Chord Performer &copy; 2026 ｜ Web Audio Synth &amp; Web MIDI API DAW Integration
        </p>
      </footer>

      {/* Modals */}
      <MidiSettingsModal
        isOpen={isMidiModalOpen}
        onClose={() => setIsMidiModalOpen(false)}
        midiState={midiState}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
}
