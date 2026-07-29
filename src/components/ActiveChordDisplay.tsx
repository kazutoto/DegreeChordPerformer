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
import { ActiveChord } from '../types';
import { Volume2, Layers, Hash } from 'lucide-react';

interface ActiveChordDisplayProps {
  activeChord: ActiveChord | null;
  hasSeventhModifier: boolean;
  hasNinthModifier: boolean;
  hasSwapModifier: boolean;
  hasDimModifier?: boolean;
  hasAugModifier?: boolean;
  hasSus4Modifier?: boolean;
  hasM7Modifier?: boolean;
  hasFlatModifier?: boolean;
  hasSixthModifier?: boolean;
  hasHalfDimModifier?: boolean;
  onToggleSeventh: () => void;
  onToggleNinth: () => void;
  onToggleSixth: () => void;
  onToggleSwap: () => void;
  onToggleDim?: () => void;
  onToggleAug?: () => void;
  onToggleSus4?: () => void;
  onToggleM7?: () => void;
  onToggleHalfDim?: () => void;
  inversion: number;
  onCycleInversion: () => void;
  sustainActive: boolean;
}

export const ActiveChordDisplay: React.FC<ActiveChordDisplayProps> = ({
  activeChord,
  hasSeventhModifier,
  hasNinthModifier,
  hasSwapModifier,
  hasDimModifier = false,
  hasAugModifier = false,
  hasSus4Modifier = false,
  hasM7Modifier = false,
  hasFlatModifier = false,
  hasSixthModifier = false,
  hasHalfDimModifier = false,
  onToggleSeventh,
  onToggleNinth,
  onToggleSixth,
  onToggleSwap,
  onToggleDim,
  onToggleAug,
  onToggleSus4,
  onToggleM7,
  onToggleHalfDim,
  inversion,
  onCycleInversion,
  sustainActive,
}) => {
  const inversionShortLabels = ['Root (基本形)', '1st Inv (第1)', '2nd Inv (第2)', '3rd Inv (第3)'];

  return (
    <div className="relative overflow-hidden flex flex-col justify-between space-y-3">
      {/* Subtle glowing accent backdrop */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-3">
        {/* Main Active Chord Display */}
        <div className={`p-3 rounded-xl border flex flex-col justify-center h-[96px] relative transition-colors ${activeChord ? 'bg-slate-950/60 border-indigo-500/20' : 'bg-slate-950/40 border-slate-800'}`}>
          {/* Sustain Badge */}
          <div className="absolute top-2 right-3 h-4">
            {sustainActive && (
              <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded-full border border-amber-500/30 animate-pulse whitespace-nowrap">
                サステイン保持中
              </span>
            )}
          </div>

          {activeChord ? (
            <div className="flex items-baseline justify-between gap-2 w-full mt-4">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono drop-shadow-md">
                {activeChord.chordName}
              </h2>
              <span className="text-xs sm:text-sm font-bold text-indigo-300 bg-indigo-900/60 px-2.5 py-1 rounded-lg border border-indigo-500/40">
                {activeChord.degreeRoman} ({activeChord.degreeNumber}度)
              </span>
            </div>
          ) : (
            <div className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-400 text-center mt-4">
              テンキー (1〜7) を押して演奏
            </div>
          )}
        </div>

        {/* Left-Hand Modifiers Controls */}
        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/90 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between px-1">
            <span>左手修飾キー</span>
            <span className="text-[10px] text-slate-500">Shift/Ctrl/A/S/D/Z/X/C/V</span>
          </div>

          <div className="space-y-1.5">
            {/* Row 1: Shift, Ctrl */}
            <div className="grid grid-cols-4 gap-1.5">
              {/* Shift Key Swap Modifier */}
              <button
                onClick={onToggleSwap}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-bold border transition-all ${
                  hasSwapModifier
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={`text-[10px] font-mono px-1 rounded mb-0.5 ${hasSwapModifier ? 'bg-black/30 text-slate-100' : 'bg-emerald-600 text-white'}`}>[Shift / 0]</span>
                <span>{hasSwapModifier ? 'Maj ⇄ Min' : 'OFF'}</span>
              </button>

              {/* Ctrl Key Flat Modifier */}
              <div
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-bold border transition-all ${
                  hasFlatModifier
                    ? 'bg-pink-600 border-pink-400 text-white shadow'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <span className={`text-[10px] font-mono px-1 rounded mb-0.5 ${hasFlatModifier ? 'bg-black/30 text-slate-100' : 'bg-pink-600 text-white'}`}>[Ctrl]</span>
                <span>♭ (Flat) {hasFlatModifier ? 'ON' : 'OFF'}</span>
              </div>
            </div>

            {/* Row 2: A, S, D */}
            <div className="grid grid-cols-4 gap-1.5">
              {/* A Key Aug Modifier */}
              <button
                onClick={onToggleAug}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-bold border transition-all ${
                  hasAugModifier
                    ? 'bg-orange-600 border-orange-400 text-white shadow'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={`text-[10px] font-mono px-1 rounded mb-0.5 ${hasAugModifier ? 'bg-black/30 text-slate-100' : 'bg-orange-600 text-white'}`}>[A]</span>
                <span>aug {hasAugModifier ? 'ON' : 'OFF'}</span>
              </button>

              {/* S Key Sus4 Modifier */}
              <button
                onClick={onToggleSus4}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-bold border transition-all ${
                  hasSus4Modifier
                    ? 'bg-amber-600 border-amber-400 text-white shadow'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={`text-[10px] font-mono px-1 rounded mb-0.5 ${hasSus4Modifier ? 'bg-black/30 text-slate-100' : 'bg-amber-600 text-white'}`}>[S]</span>
                <span>sus4 {hasSus4Modifier ? 'ON' : 'OFF'}</span>
              </button>

              {/* D Key Diminished Modifier */}
              <button
                onClick={onToggleDim}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-bold border transition-all ${
                  hasDimModifier
                    ? 'bg-rose-600 border-rose-400 text-white shadow'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={`text-[10px] font-mono px-1 rounded mb-0.5 ${hasDimModifier ? 'bg-black/30 text-slate-100' : 'bg-rose-600 text-white'}`}>[D]</span>
                <span>dim {hasDimModifier ? 'ON' : 'OFF'}</span>
              </button>

              {/* F Key HalfDim Modifier */}
              <button
                onClick={onToggleHalfDim}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-bold border transition-all ${
                  hasHalfDimModifier
                    ? 'bg-yellow-500 border-yellow-300 text-white shadow'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={`text-[10px] font-mono px-1 rounded mb-0.5 ${hasHalfDimModifier ? 'bg-black/30 text-slate-100' : 'bg-yellow-500 text-white'}`}>[F]</span>
                <span>m7(♭5) {hasHalfDimModifier ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Row 3: Z, X, C, V */}
            <div className="grid grid-cols-4 gap-1.5">
              {/* Z Key 9th Modifier */}
              <button
                onClick={onToggleNinth}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-bold border transition-all ${
                  hasNinthModifier
                    ? 'bg-purple-600 border-purple-400 text-white shadow'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={`text-[10px] font-mono px-1 rounded mb-0.5 ${hasNinthModifier ? 'bg-black/30 text-slate-100' : 'bg-purple-600 text-white'}`}>[Z]</span>
                <span>9th {hasNinthModifier ? 'ON' : 'OFF'}</span>
              </button>

              {/* X Key 7th Modifier */}
              <button
                onClick={onToggleSeventh}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-bold border transition-all ${
                  hasSeventhModifier
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={`text-[10px] font-mono px-1 rounded mb-0.5 ${hasSeventhModifier ? 'bg-black/30 text-slate-100' : 'bg-indigo-600 text-white'}`}>[X]</span>
                <span>7th {hasSeventhModifier ? 'ON' : 'OFF'}</span>
              </button>

              {/* C Key M7 Modifier */}
              <button
                onClick={onToggleM7}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-bold border transition-all ${
                  hasM7Modifier
                    ? 'bg-sky-600 border-sky-400 text-white shadow'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={`text-[10px] font-mono px-1 rounded mb-0.5 ${hasM7Modifier ? 'bg-black/30 text-slate-100' : 'bg-sky-600 text-white'}`}>[C]</span>
                <span>M7 {hasM7Modifier ? 'ON' : 'OFF'}</span>
              </button>

              {/* V Key 6th Modifier */}
              <button
                onClick={onToggleSixth}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-bold border transition-all ${
                  hasSixthModifier
                    ? 'bg-blue-600 border-blue-400 text-white shadow'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={`text-[10px] font-mono px-1 rounded mb-0.5 ${hasSixthModifier ? 'bg-black/30 text-slate-100' : 'bg-blue-600 text-white'}`}>[V]</span>
                <span>6th {hasSixthModifier ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
