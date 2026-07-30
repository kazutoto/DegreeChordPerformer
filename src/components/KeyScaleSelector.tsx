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
import { AccidentalPreference, NoteName, ScaleType, VoicingStyle } from '../types';
import { ALL_ROOT_KEYS, SCALE_LABELS } from '../lib/musicTheory';
import { ChevronRight } from 'lucide-react';

interface KeyScaleSelectorProps {
  selectedKey: NoteName;
  onKeyChange: (key: NoteName) => void;
  scaleType: ScaleType;
  onScaleChange: (scale: ScaleType) => void;
  accidentalPref: AccidentalPreference;
  onAccidentalChange: (pref: AccidentalPreference) => void;
  baseOctave: number;
  onOctaveChange: (oct: number) => void;
  voicingStyle: VoicingStyle;
  onVoicingChange: (voicing: VoicingStyle) => void;
}

export const KeyScaleSelector: React.FC<KeyScaleSelectorProps> = ({
  selectedKey,
  onKeyChange,
  scaleType,
  onScaleChange,
  accidentalPref,
  onAccidentalChange,
  baseOctave,
  onOctaveChange,
  voicingStyle,
  onVoicingChange,
}) => {
  const getAvailableKeys = (): NoteName[] => {
    const isMinor = scaleType.includes('minor') || scaleType === 'dorian' || scaleType === 'phrygian';
    const isMajor = scaleType === 'major' || scaleType === 'lydian' || scaleType === 'mixolydian';

    return ALL_ROOT_KEYS.filter((k) => {
      if (isMajor && (k === 'D#' || k === 'G#' || k === 'A#')) return false;
      if (isMinor && (k === 'Db' || k === 'Gb' || k === 'Ab' || k === 'A#')) return false;
      return true;
    });
  };

  const availableKeys = getAvailableKeys();

  return (
    <div className="text-slate-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Key Root Selection */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
            <span>主音キー (Key)</span>
            {/* Sharp/Flat Toggle */}
            <span className="flex items-center bg-slate-800 rounded p-0.5 border border-slate-700 text-[10px]">
              <button
                onClick={() => onAccidentalChange('sharp')}
                className={`px-1.5 py-0.5 rounded font-bold transition-colors ${
                  accidentalPref === 'sharp'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ♯
              </button>
              <button
                onClick={() => onAccidentalChange('flat')}
                className={`px-1.5 py-0.5 rounded font-bold transition-colors ${
                  accidentalPref === 'flat'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ♭
              </button>
            </span>
          </label>
          <div className="relative">
            <select
              value={selectedKey}
              onChange={(e) => onKeyChange(e.target.value as NoteName)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 font-bold text-xs sm:text-sm rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer appearance-none"
            >
              {availableKeys.map((k) => (
                <option key={k} value={k} className="bg-slate-800 text-slate-100">
                  {k} キー
                </option>
              ))}
            </select>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 rotate-90 pointer-events-none" />
          </div>
        </div>

        {/* Scale Type Selection */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-slate-400">スケール (Scale)</label>
          <div className="relative">
            <select
              value={scaleType}
              onChange={(e) => onScaleChange(e.target.value as ScaleType)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 font-bold text-xs sm:text-sm rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer appearance-none"
            >
              {(Object.keys(SCALE_LABELS) as ScaleType[]).map((st) => (
                <option key={st} value={st} className="bg-slate-800 text-slate-100">
                  {SCALE_LABELS[st]}
                </option>
              ))}
            </select>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 rotate-90 pointer-events-none" />
          </div>
        </div>

        {/* Base Octave */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-slate-400">オクターブ (Oct: C{baseOctave})</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            {[2, 3, 4].map((oct) => (
              <button
                key={oct}
                onClick={() => onOctaveChange(oct)}
                className={`py-1 rounded-lg text-xs font-bold transition-all ${
                  baseOctave === oct
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                C{oct}
              </button>
            ))}
          </div>
        </div>

        {/* Voicing Style */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-slate-400">ボイシング配置</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            {[
              { id: 'close', label: 'Close' },
              { id: 'open', label: 'Open' },
              { id: 'drop2', label: 'Drop 2' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => onVoicingChange(v.id as VoicingStyle)}
                className={`py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                  voicingStyle === v.id
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
