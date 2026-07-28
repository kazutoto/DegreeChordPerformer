import React from 'react';
import { AccidentalPreference, ActiveChord, NoteName } from '../types';
import { midiToNoteName } from '../lib/musicTheory';

interface PianoRollVisualizerProps {
  activeChord: ActiveChord | null;
  accidentalPref: AccidentalPreference;
  onPlayNote?: (midiNote: number) => void;
}

interface PianoKey {
  midiNote: number;
  noteName: NoteName;
  octave: number;
  isBlack: boolean;
}

export const PianoRollVisualizer: React.FC<PianoRollVisualizerProps> = ({
  activeChord,
  accidentalPref,
  onPlayNote,
}) => {
  // Generate 4 octaves of piano keys (C2=36 to B5=83)
  const startMidi = 36; // C2
  const endMidi = 83; // B5

  const keys: PianoKey[] = [];
  for (let m = startMidi; m <= endMidi; m++) {
    const pitch = m % 12;
    const octave = Math.floor(m / 12) - 1;
    const isBlack = [1, 3, 6, 8, 10].includes(pitch);
    const noteName = midiToNoteName(m, accidentalPref);
    keys.push({ midiNote: m, noteName, octave, isBlack });
  }

  const activeMidiSet = new Set(activeChord ? activeChord.midiNotes : []);

  // Filter white keys to build flex grid
  const whiteKeys = keys.filter((k) => !k.isBlack);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      {/* Piano Roll Container */}
      <div className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="relative flex min-w-[900px] h-36 bg-slate-950 p-2 rounded-xl border border-slate-800 select-none">
          {whiteKeys.map((wk) => {
            const isNoteActive = activeMidiSet.has(wk.midiNote);

            return (
              <div
                key={wk.midiNote}
                onClick={() => onPlayNote && onPlayNote(wk.midiNote)}
                className={`relative flex-1 h-full rounded-b-md border border-slate-400/30 transition-colors cursor-pointer flex flex-col justify-end items-center pb-2 ${
                  isNoteActive
                    ? 'bg-gradient-to-b from-indigo-400 to-indigo-600 text-white shadow-lg shadow-indigo-500/50'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {/* Note Label */}
                <span
                  className={`text-[10px] font-mono font-bold ${
                    isNoteActive ? 'text-white scale-110' : 'text-slate-500'
                  }`}
                >
                  {wk.noteName}
                  {wk.octave}
                </span>

                {/* Key active indicator dot */}
                {isNoteActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mb-1 shadow-sm animate-ping" />
                )}
              </div>
            );
          })}

          {/* Black Keys overlay */}
          {keys.map((k) => {
            if (!k.isBlack) return null;

            const isNoteActive = activeMidiSet.has(k.midiNote);

            // Calculate position percentage based on white keys before this black key
            const whiteKeysBefore = whiteKeys.filter((wk) => wk.midiNote < k.midiNote).length;
            const totalWhiteKeys = whiteKeys.length;
            const blackKeyWidthRatio = 0.58;

            const leftPercent = ((whiteKeysBefore - blackKeyWidthRatio / 2) / totalWhiteKeys) * 100;
            const widthPercent = (blackKeyWidthRatio / totalWhiteKeys) * 100;

            return (
              <div
                key={k.midiNote}
                onClick={() => onPlayNote && onPlayNote(k.midiNote)}
                style={{
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                }}
                className={`absolute top-2 h-20 rounded-b-md transition-colors cursor-pointer z-10 flex flex-col justify-end items-center pb-1 ${
                  isNoteActive
                    ? 'bg-gradient-to-b from-purple-500 to-purple-700 border-2 border-purple-300 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300'
                }`}
              >
                {isNoteActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mb-1 shadow-sm animate-ping" />
                )}
                <span
                  className={`text-[9px] font-mono font-bold ${
                    isNoteActive ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {k.noteName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer Area with MIDI Notes */}
      <div className="mt-3 flex justify-end h-8">
        {activeChord && activeChord.notes.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium">構成音 (MIDI):</span>
            <div className="flex items-center gap-1 flex-wrap">
              {activeChord.notes.map((note, idx) => {
                const midiNum = activeChord.midiNotes[idx];
                return (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-slate-800 text-indigo-200 border border-slate-700 font-mono font-bold text-xs rounded shadow-sm flex items-center gap-1"
                  >
                    <span>{midiNum !== undefined ? `${note}${Math.floor(midiNum / 12) - 1}` : note}</span>
                    {midiNum !== undefined && (
                      <span className="text-[10px] text-indigo-400 font-normal">({midiNum})</span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
