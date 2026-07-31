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
import React from 'react';
import { AccidentalPreference, DegreeInfo, NoteName, ScaleType } from '../types';
import { getDegreesForScale } from '../lib/musicTheory';

interface DegreeChordGridProps {
  selectedKey: NoteName;
  scaleType: ScaleType;
  accidentalPref: AccidentalPreference;
  activeDegreeNumber: number | null;
  hasSeventhModifier: boolean;
  hasNinthModifier: boolean;
  hasSwapModifier?: boolean;
  hasDimModifier?: boolean;
  hasAugModifier?: boolean;
  hasSus4Modifier?: boolean;
  hasM7Modifier?: boolean;
  hasFlatModifier?: boolean;
  hasSixthModifier?: boolean;
  hasHalfDimModifier?: boolean;
  slashBassDegree?: number | null;
  voicingStyle?: string;
  isInstaChordMode?: boolean;
  onToggleInstaChordMode?: () => void;
  onPlayDegreeStart: (degreeNumber: number) => void;
  onPlayDegreeEnd: () => void;
}

export const DegreeChordGrid: React.FC<DegreeChordGridProps> = ({
  selectedKey,
  scaleType,
  accidentalPref,
  activeDegreeNumber,
  hasSeventhModifier,
  hasNinthModifier,
  hasSwapModifier = false,
  hasDimModifier = false,
  hasAugModifier = false,
  hasSus4Modifier = false,
  hasM7Modifier = false,
  hasFlatModifier = false,
  hasSixthModifier = false,
  hasHalfDimModifier = false,
  slashBassDegree = null,
  voicingStyle = 'voiceLeading',
  isInstaChordMode = true,
  onToggleInstaChordMode,
  onPlayDegreeStart,
  onPlayDegreeEnd,
}) => {
  const degrees: DegreeInfo[] = getDegreesForScale(
    selectedKey,
    scaleType,
    accidentalPref,
    hasSwapModifier,
    hasDimModifier,
    hasSus4Modifier,
    hasM7Modifier,
    hasAugModifier,
    hasFlatModifier,
    hasSixthModifier,
    hasHalfDimModifier,
    voicingStyle as any,
    isInstaChordMode
  );

  // Map degrees by number for numpad layout
  const degMap = new Map<number, DegreeInfo>();
  degrees.forEach((d) => degMap.set(d.degreeNumber, d));

  const renderDegreeCard = (degree: DegreeInfo) => {
    const isActive = activeDegreeNumber === degree.degreeNumber;

    let currentDisplayChord = degree.triadChordName;
    const useSeventh = hasSeventhModifier || hasM7Modifier || hasSixthModifier || hasHalfDimModifier;
    if (hasNinthModifier) {
      currentDisplayChord = useSeventh ? degree.ninthChordName : degree.add9ChordName;
    } else if (useSeventh) {
      currentDisplayChord = degree.seventhChordName;
    }

    if (slashBassDegree !== null) {
      const bassDegreeInfo = degMap.get(slashBassDegree);
      if (bassDegreeInfo) {
        currentDisplayChord = `${currentDisplayChord}/${bassDegreeInfo.rootNote}`;
      }
    }

    const chordLen = currentDisplayChord.length;
    let chordSizeClass = 'text-2xl sm:text-3xl tracking-tight';
    if (chordLen > 11) {
      chordSizeClass = 'text-sm sm:text-base tracking-tighter';
    } else if (chordLen > 8) {
      chordSizeClass = 'text-base sm:text-lg tracking-tight';
    } else if (chordLen > 5) {
      chordSizeClass = 'text-xl sm:text-2xl tracking-tight';
    }

    return (
      <button
        key={degree.degreeNumber}
        onMouseDown={() => onPlayDegreeStart(degree.degreeNumber)}
        onMouseUp={onPlayDegreeEnd}
        onMouseLeave={() => {
          if (isActive) onPlayDegreeEnd();
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          onPlayDegreeStart(degree.degreeNumber);
        }}
        onTouchEnd={onPlayDegreeEnd}
        className={`relative group flex flex-col justify-between p-3.5 sm:p-4 rounded-xl border transition-all text-left select-none outline-none h-[110px] sm:h-[130px] ${
          isActive
            ? 'bg-gradient-to-b from-indigo-600 to-indigo-800 border-indigo-400 text-white shadow-xl shadow-indigo-600/40 scale-[0.98]'
            : 'bg-slate-800/90 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600 text-slate-200'
        }`}
      >
        {/* Header: Roman numeral & Keypad badge */}
        <div className="flex items-center justify-between gap-1 w-full mb-1">
          <span
            className={`text-sm sm:text-base font-black font-mono px-2 py-0.5 rounded ${
              isActive
                ? 'bg-white/20 text-white'
                : 'bg-slate-900/80 text-indigo-400 border border-slate-700'
            }`}
          >
            {degree.romanNumeral}
          </span>

          <span
            className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
              isActive
                ? 'bg-white/30 text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-700'
            }`}
          >
            Num {degree.numPadKey}
          </span>
        </div>

        {/* Main Chord Name Display */}
        <div className="my-auto py-2 text-center w-full overflow-hidden">
          <div
            className={`${chordSizeClass} font-black font-mono whitespace-nowrap ${
              isActive
                ? 'text-white'
                : hasFlatModifier
                ? 'text-pink-300'
                : hasAugModifier
                ? 'text-orange-300'
                : hasSus4Modifier
                ? 'text-amber-300'
                : hasM7Modifier
                ? 'text-sky-300'
                : hasDimModifier
                ? 'text-rose-300'
                : hasHalfDimModifier
                ? 'text-yellow-400'
                : hasSixthModifier
                ? 'text-blue-300'
                : hasSwapModifier
                ? 'text-emerald-300'
                : hasNinthModifier
                ? 'text-purple-300'
                : hasSeventhModifier
                ? 'text-indigo-300'
                : 'text-white'
            }`}
          >
            {currentDisplayChord}
          </div>
        </div>

        {/* Active glow indicator */}
        {isActive && (
          <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        )}
      </button>
    );
  };

  const renderDummySlot = (keyNum: number, label: string) => (
    <div
      key={`slot-${keyNum}`}
      className="flex flex-col justify-between p-3.5 sm:p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 text-slate-600 select-none h-[110px] sm:h-[130px]"
    >
      <div className="flex items-center justify-between gap-1 w-full mb-1">
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-700 border border-slate-800">
          -
        </span>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded font-bold bg-slate-950 text-slate-600 border border-slate-800">
          Num {keyNum}
        </span>
      </div>
      <div className="my-auto text-center py-1">
        <div className="text-xs font-bold text-slate-600">{label}</div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300">Chord PAD</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs font-semibold text-slate-400">InstaChord Mode(Auto Minor)</span>
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={isInstaChordMode}
              onChange={onToggleInstaChordMode}
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${isInstaChordMode ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isInstaChordMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </div>
        </label>
      </div>

      {/* Numpad 3x3 Grid Layout */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto w-full flex-1">
        {/* Top Row: Num 7 (VII), Num 8 (Unused), Num 9 (Unused) */}
        {degMap.has(7) ? renderDegreeCard(degMap.get(7)!) : null}
        {renderDummySlot(8, '未使用')}
        {renderDummySlot(9, '未使用')}

        {/* Middle Row: Num 4 (IV), Num 5 (V), Num 6 (VI) */}
        {degMap.has(4) ? renderDegreeCard(degMap.get(4)!) : null}
        {degMap.has(5) ? renderDegreeCard(degMap.get(5)!) : null}
        {degMap.has(6) ? renderDegreeCard(degMap.get(6)!) : null}

        {/* Bottom Row: Num 1 (I), Num 2 (II), Num 3 (III) */}
        {degMap.has(1) ? renderDegreeCard(degMap.get(1)!) : null}
        {degMap.has(2) ? renderDegreeCard(degMap.get(2)!) : null}
        {degMap.has(3) ? renderDegreeCard(degMap.get(3)!) : null}
      </div>
    </div>
  );
};
