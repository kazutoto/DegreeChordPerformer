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
  const [activeBassDegree, setActiveBassDegree] = useState<number | null>(null);
  const [isStrumEnabled, setIsStrumEnabled] = useState<boolean>(false);
  const [inversion, setInversion] = useState<number>(0);
  const [sustainActive, setSustainActive] = useState<boolean>(false);

  // Active playing chord state
  const [activeDegreeNumber, setActiveDegreeNumber] = useState<number | null>(null);
  const [activeChord, setActiveChord] = useState<ActiveChord | null>(null);

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
    activeBassDegree,
    isStrumEnabled,
    inversion,
    sustainActive,
    activeDegreeNumber,
    isRecording,
  });

  useEffect(() => {
    stateRef.current = {
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
      activeBassDegree,
      isStrumEnabled,
      inversion,
      sustainActive,
      activeDegreeNumber,
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
    activeBassDegree,
    isStrumEnabled,
    inversion,
    sustainActive,
    activeDegreeNumber,
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
      velocity?: number,
      customBassDegree?: number | null
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
      const useBassDegree = customBassDegree !== undefined ? customBassDegree : s.activeBassDegree;
      
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
        useBassDegree
      );

      setActiveDegreeNumber(degreeNum);
      setActiveChord(chord);

      // Immediately update ref to prevent race condition during rapid key mash
      s.activeDegreeNumber = degreeNum;

      // Play Sound & Send MIDI with Strum option
      synthEngine.playChord(chord.midiNotes, s.isStrumEnabled, playVelocity, 35);
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

      if (e.repeat) return; // Ignore key repeat to prevent re-triggering audio stutter

      const code = e.code;
      const key = e.key;

      if (e.ctrlKey || code === 'ControlLeft' || code === 'ControlRight' || key === 'Control') {
        e.preventDefault(); // Prevent browser shortcuts (like Ctrl+D, Ctrl+S, etc.)
        if (!stateRef.current.hasFlatModifier) {
          setHasFlatModifier(true);
          activeKeysSet.add('Ctrl');
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
        if (code === 'ControlLeft' || code === 'ControlRight' || key === 'Control') {
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
        code === 'ShiftLeft' ||
        code === 'ShiftRight' ||
        key === 'Shift' ||
        code === 'Numpad0' ||
        code === 'Digit0' ||
        key === '0'
      ) {
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
        return;
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

      // Bass Degree keys (Full keyboard Digit 1-7) & Chord Degree keys (Numpad 1-7)
      let isTopRowDigit = false;
      let topRowVal: number | null = null;

      if (code.startsWith('Digit') && code !== 'Digit0') {
        const num = parseInt(code.replace('Digit', ''), 10);
        if (num >= 1 && num <= 7) {
          isTopRowDigit = true;
          topRowVal = num;
        }
      } else if (!code.startsWith('Numpad') && ['1', '2', '3', '4', '5', '6', '7'].includes(key) && e.location !== 3) {
        isTopRowDigit = true;
        topRowVal = parseInt(key, 10);
      }

      if (isTopRowDigit && topRowVal !== null) {
        e.preventDefault();
        setActiveBassDegree(topRowVal);
        stateRef.current.activeBassDegree = topRowVal;
        activeKeysSet.add(`Digit_${topRowVal}`);
        return;
      }

      let isNumpadDigit = false;
      let numpadVal: number | null = null;

      if (code.startsWith('Numpad') && code !== 'Numpad0') {
        const num = parseInt(code.replace('Numpad', ''), 10);
        if (num >= 1 && num <= 7) {
          isNumpadDigit = true;
          numpadVal = num;
        }
      } else if (['1', '2', '3', '4', '5', '6', '7'].includes(key) && e.location === 3) {
        isNumpadDigit = true;
        numpadVal = parseInt(key, 10);
      }

      if (isNumpadDigit && numpadVal !== null) {
        e.preventDefault();
        triggerPlayDegree(numpadVal);
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      const key = e.key;

      if (code === 'ControlLeft' || code === 'ControlRight' || key === 'Control') {
        setHasFlatModifier(false);
        activeKeysSet.delete('Ctrl');
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
        code === 'ShiftLeft' ||
        code === 'ShiftRight' ||
        key === 'Shift' ||
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

      // Bass Degree key release (Top-row Digit 1-7)
      let isTopRowDigitUp = false;
      let topRowValUp: number | null = null;

      if (code.startsWith('Digit') && code !== 'Digit0') {
        const num = parseInt(code.replace('Digit', ''), 10);
        if (num >= 1 && num <= 7) {
          isTopRowDigitUp = true;
          topRowValUp = num;
        }
      } else if (!code.startsWith('Numpad') && ['1', '2', '3', '4', '5', '6', '7'].includes(key) && e.location !== 3) {
        isTopRowDigitUp = true;
        topRowValUp = parseInt(key, 10);
      }

      if (isTopRowDigitUp && topRowValUp !== null) {
        setActiveBassDegree(null);
        stateRef.current.activeBassDegree = null;
        activeKeysSet.delete(`Digit_${topRowValUp}`);
        return;
      }

      // Chord Degree key release (Numpad 1-7)
      let numpadReleased: number | null = null;
      if (code.startsWith('Numpad') && code !== 'Numpad0') {
        const num = parseInt(code.replace('Numpad', ''), 10);
        if (num >= 1 && num <= 7) numpadReleased = num;
      } else if (['1', '2', '3', '4', '5', '6', '7'].includes(key) && e.location === 3) {
        numpadReleased = parseInt(key, 10);
      }

      if (numpadReleased !== null && stateRef.current.activeDegreeNumber === numpadReleased) {
        triggerStopChord();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
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
    synthEngine.playNote(midiNote);
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
                onKeyChange={setSelectedKey}
                scaleType={scaleType}
                onScaleChange={setScaleType}
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
              activeBassDegree={activeBassDegree}
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
