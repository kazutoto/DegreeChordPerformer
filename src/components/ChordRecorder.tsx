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
import React, { useState, useRef, useEffect } from 'react';
import { NoteName, RecordedChord, ScaleType } from '../types';
import { synthEngine } from '../lib/synthEngine';
import { midiEngine } from '../lib/midiEngine';
import { Trash2, Copy, Check, Disc, ArrowRight, X, Volume2 } from 'lucide-react';

interface ChordRecorderProps {
  recordedChords: RecordedChord[];
  onClearHistory: () => void;
  onRemoveChord?: (id: string) => void;
  selectedKey?: NoteName;
  scaleType?: ScaleType;
}

export const ChordRecorder: React.FC<ChordRecorderProps> = ({
  recordedChords,
  onClearHistory,
  onRemoveChord,
  selectedKey = 'C',
  scaleType = 'major',
}) => {
  const [copiedType, setCopiedType] = useState<'chord' | 'degree' | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest recorded chord
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: scrollContainerRef.current.scrollWidth,
        behavior: 'smooth',
      });
    }
  }, [recordedChords.length]);

  // Single chord preview
  const handlePreviewChord = (chord: RecordedChord) => {
    const midiOutId = midiEngine.getState().selectedOutputId;
    const isMidiActive = midiOutId && midiOutId !== 'none';
    if (!isMidiActive) {
      synthEngine.playChord(chord.midiNotes);
    }
    midiEngine.sendChordNoteOn(chord.midiNotes);
    setTimeout(() => {
      synthEngine.stopAllNotes();
      midiEngine.sendAllNotesOff();
    }, 600);
  };

  // Copy chord progression text
  const handleCopyChords = (type: 'chord' | 'degree') => {
    const text =
      type === 'chord'
        ? recordedChords.map((c) => c.chordName).join(' - ')
        : recordedChords.map((c) => c.degreeRoman).join(' - ');

    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl text-slate-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Disc className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            直近のコード進行
            <span className="text-[10px] font-normal normal-case text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
              Chord Progression
            </span>
          </h2>
          <span className="text-xs font-medium text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80">
            コード数: <strong className="text-indigo-400 font-mono">{recordedChords.length}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Copy Chord Names Button */}
          <button
            disabled={recordedChords.length === 0}
            onClick={() => handleCopyChords('chord')}
            className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors font-medium"
          >
            {copiedType === 'chord' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copiedType === 'chord' ? 'コード名をコピー完了' : 'コード名をコピー'}
          </button>

          {/* Copy Degrees Button */}
          <button
            disabled={recordedChords.length === 0}
            onClick={() => handleCopyChords('degree')}
            className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-amber-300 hover:text-amber-200 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors font-medium"
          >
            {copiedType === 'degree' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copiedType === 'degree' ? 'ディグリーをコピー完了' : 'ディグリーをコピー'}
          </button>

          {/* Clear */}
          <button
            disabled={recordedChords.length === 0}
            onClick={onClearHistory}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 disabled:opacity-40 rounded-lg transition-colors text-xs font-mono"
            title="コード進行をクリア [Qキー]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="text-[10px] opacity-80 font-semibold">[Q]</span>
          </button>
        </div>
      </div>

      {/* Recorded Progression Timeline */}
      <div className="space-y-3">
        {recordedChords.length === 0 ? (
          <div className="min-h-[108px] text-center text-xs text-slate-500 italic bg-slate-950/40 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1 p-4">
            <span>キーボードや画面のボタンを押すと、入力したコード進行がここにリアルタイム表示されます</span>
            <span className="text-[11px] text-slate-600">例: C → Am → F → G</span>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 px-1 min-h-[108px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900"
          >
            {recordedChords.map((chord, idx) => {
              return (
                <React.Fragment key={chord.id}>
                  {idx > 0 && <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />}

                  <div
                    className="group relative border rounded-xl p-2.5 shrink-0 flex flex-col items-center min-w-[90px] transition-all cursor-pointer bg-slate-800/90 hover:bg-slate-700/90 border-slate-700 hover:border-slate-500"
                    onClick={() => handlePreviewChord(chord)}
                    title="クリックして試聴"
                  >
                    {/* Delete single chord button */}
                    {onRemoveChord && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveChord(chord.id);
                        }}
                        className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 bg-slate-900 hover:bg-red-600 text-slate-400 hover:text-white p-1 rounded-full border border-slate-700 transition-all shadow"
                        title="このコードを削除"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}

                    <div className="flex items-center justify-between w-full text-[10px] text-slate-400 font-mono mb-1">
                      <span>#{idx + 1}</span>
                      <Volume2 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-indigo-400 transition-opacity" />
                    </div>

                    <span className="text-base sm:text-lg font-black text-indigo-300 font-mono leading-tight">
                      {chord.chordName}
                    </span>

                    <span className="text-xs font-bold text-amber-400 font-mono mt-0.5">
                      {chord.degreeRoman}
                    </span>

                    <span className="text-[9px] text-slate-400 font-mono mt-1 opacity-80">
                      {chord.notes.join(' ')}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
